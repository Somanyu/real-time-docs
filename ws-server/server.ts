import "dotenv/config"

import { createServer } from "node:http"
import { Server } from "socket.io"
import type { ClientToServerEvents, CollaborationUser, CollaboratorPresence, RemoteCursor, ServerToClientEvents } from "../lib/websocket-client"

const port = Number(process.env.PORT ?? 4001)
const host = process.env.HOST ?? "0.0.0.0"

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const httpServer = createServer((req, res) => {
    if (req.url === "/" || req.url === "/healthz") {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ ok: true }))
        return
    }

    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Not found" }))
})

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
        methods: ["GET", "POST"],
    },
})

type SocketData = {
    documentId?: string
    user?: CollaborationUser
    color?: string
}

const presenceByRoom = new Map<string, Map<string, CollaboratorPresence>>()
const avatarPalette = ["#f59e0b", "#10b981", "#0ea5e9", "#f43f5e", "#f97316", "#06b6d4"]

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U"
}

function getColor(seed: string) {
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return avatarPalette[hash % avatarPalette.length]
}

function broadcastPresence(documentId: string) {
    const users = Array.from(presenceByRoom.get(documentId)?.values() ?? [])
    io.to(documentId).emit("room-users", users)
}

function leaveDocument(socketId: string, data: SocketData) {
    if (!data.documentId) return

    const roomUsers = presenceByRoom.get(data.documentId)
    roomUsers?.delete(socketId)

    if (roomUsers?.size === 0) {
        presenceByRoom.delete(data.documentId)
    }

    broadcastPresence(data.documentId)
    io.to(data.documentId).emit("cursor-remove", {
        documentId: data.documentId,
        socketId,
    })
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    const data: SocketData = {}

    socket.on("join-document", ({ documentId, user }) => {
        if (data.documentId && data.documentId !== documentId) {
            socket.leave(data.documentId)
            leaveDocument(socket.id, data)
        }

        data.documentId = documentId
        data.user = user

        socket.join(documentId)

        const roomUsers = presenceByRoom.get(documentId) ?? new Map<string, CollaboratorPresence>()

        const name = user.name?.trim() || user.email?.split("@")[0] || "Anonymous"

        roomUsers.set(socket.id, {
            socketId: socket.id,
            email: user.email,
            name,
            initials: getInitials(name),
            color: getColor(user.email ?? socket.id),
            isCurrentUser: false,
        })

        data.color = roomUsers.get(socket.id)?.color

        presenceByRoom.set(documentId, roomUsers)
        broadcastPresence(documentId)

        const peers = Array.from(roomUsers.keys()).filter((peerSocketId) => peerSocketId !== socket.id)
        const syncSourceSocketId = peers[0]

        if (syncSourceSocketId) {
            io.to(syncSourceSocketId).emit("request-document-state", {
                documentId,
                targetSocketId: socket.id,
            })
        }
    })

    socket.on("leave-document", ({ documentId }) => {
        if (data.documentId === documentId) {
            socket.leave(documentId)
            leaveDocument(socket.id, data)
            data.documentId = undefined
            data.user = undefined
            data.color = undefined
        }
    })

    socket.on("document-operation", ({ documentId, operation }) => {
        socket.to(documentId).emit("remote-operation", {
            documentId,
            operation,
        })
    })

    socket.on("document-state", ({ documentId, targetSocketId, content }) => {
        io.to(targetSocketId).emit("sync-document", {
            documentId,
            content,
        })
    })

    socket.on("cursor-update", ({ documentId, selection }) => {
        if (!data.documentId || data.documentId !== documentId || !data.user) return

        const name = data.user.name?.trim() || data.user.email?.split("@")[0] || "Anonymous"
        const cursor: RemoteCursor = {
            socketId: socket.id,
            email: data.user.email,
            name,
            color: data.color ?? getColor(data.user.email ?? socket.id),
            selection,
        }

        socket.to(documentId).emit("remote-cursor", {
            documentId,
            cursor,
        })
    })

    socket.on("disconnect", () => {
        leaveDocument(socket.id, data)
        console.log("User disconnected:", socket.id)
    })
})

httpServer.listen(port, host, () => {
    console.log(`Realtime server listening on http://${host}:${port}`)
})
