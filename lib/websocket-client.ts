import { Descendant, Operation, Range } from "slate"
import { io, Socket } from "socket.io-client"

export type CollaborationUser = {
    email?: string | null
    id?: string | null
    name?: string | null
}

export type CollaboratorPresence = {
    socketId: string
    email?: string | null
    name: string
    initials: string
    color: string
    isCurrentUser: boolean
}

export type RemoteCursor = {
    socketId: string
    email?: string | null
    name: string
    color: string
    selection: Range | null
    lastActiveAt?: number
}

export type JoinDocumentPayload = {
    documentId: string
    user: CollaborationUser
}

type DocumentOperationPayload = {
    documentId: string
    operation: Operation
}

type DocumentStatePayload = {
    documentId: string
    content: Descendant[]
}

type DocumentStateRequestPayload = {
    documentId: string
    targetSocketId: string
}

type CursorUpdatePayload = {
    documentId: string
    selection: Range | null
}

type RemoteCursorPayload = {
    documentId: string
    cursor: RemoteCursor
}

type CursorRemovePayload = {
    documentId: string
    socketId: string
}

export type ServerToClientEvents = {
    "remote-operation": (payload: DocumentOperationPayload) => void
    "room-users": (users: CollaboratorPresence[]) => void
    "request-document-state": (payload: DocumentStateRequestPayload) => void
    "sync-document": (payload: DocumentStatePayload) => void
    "remote-cursor": (payload: RemoteCursorPayload) => void
    "cursor-remove": (payload: CursorRemovePayload) => void
}

export type ClientToServerEvents = {
    "join-document": (payload: JoinDocumentPayload) => void
    "leave-document": (payload: { documentId: string }) => void
    "document-operation": (payload: DocumentOperationPayload) => void
    "document-state": (payload: DocumentStateRequestPayload & { content: Descendant[] }) => void
    "cursor-update": (payload: CursorUpdatePayload) => void
}

export type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "http://localhost:4001"

declare global {
    var __realtimeDocsSocket__: RealtimeSocket | undefined
}

export function getSocket(): RealtimeSocket {
    if (typeof window === "undefined") {
        throw new Error("Socket connections are only available in the browser.")
    }

    if (!globalThis.__realtimeDocsSocket__) {
        globalThis.__realtimeDocsSocket__ = io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket"],
        })
    }

    return globalThis.__realtimeDocsSocket__
}
