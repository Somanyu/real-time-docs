"use client"

import { useEffect, useMemo, useState } from "react"
import { Descendant } from "slate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SlateEditor } from "@/components/editor/slate-editor"
import { DocumentIcon } from "@/components/document/document-icon"
import { DocumentTitleEditor } from "@/components/document/document-title-editor"
import { ShareButton } from "@/components/document/share-button"
import { CollaboratorPresence, CollaborationUser, getSocket, RealtimeSocket } from "@/lib/websocket-client"

type DocumentCollaborationShellProps = {
    documentId: string
    initialValue: Descendant[]
    initialTitle: string
    updatedAt: Date
    isStarred: boolean
    currentUser: CollaborationUser
}

function getFallbackInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U"
}

export function DocumentCollaborationShell({
    documentId,
    initialValue,
    initialTitle,
    updatedAt,
    isStarred,
    currentUser,
}: Readonly<DocumentCollaborationShellProps>) {
    const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])
    const socket = useMemo<RealtimeSocket | null>(() => {
        if (typeof window === "undefined") {
            return null
        }

        return getSocket()
    }, [])

    useEffect(() => {
        if (!socket) return

        if (!socket.connected) {
            socket.connect()
        }

        const handleRoomUsers = (users: CollaboratorPresence[]) => {
            setCollaborators(
                users.map((user) => ({
                    ...user,
                    isCurrentUser: Boolean(currentUser.email && user.email === currentUser.email),
                }))
            )
        }

        socket.on("room-users", handleRoomUsers)

        return () => {
            socket.emit("leave-document", { documentId })
            socket.off("room-users", handleRoomUsers)
        }
    }, [currentUser.email, documentId, socket])

    const visibleCollaborators = useMemo(() => collaborators.slice(0, 3), [collaborators])
    const extraCollaboratorCount = Math.max(collaborators.length - visibleCollaborators.length, 0)

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-muted/40">
            <div className="relative flex flex-1 flex-col">
                <div className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <DocumentIcon iconSeed={documentId} size={40} withBackground containerClassName="size-10 rounded-md" />
                        <DocumentTitleEditor
                            documentId={documentId}
                            initialTitle={initialTitle}
                            updatedAt={updatedAt}
                            isStarred={isStarred}
                        />
                    </div>

                    <div className="flex items-stretch gap-3">
                        <div className="hidden -space-x-2 sm:flex">
                            {visibleCollaborators.map((collaborator) => (
                                <Avatar key={collaborator.socketId} className="h-8 w-8 border">
                                    <AvatarFallback
                                        className={collaborator.isCurrentUser ? "text-primary-foreground" : "text-white"}
                                        style={{ backgroundColor: collaborator.isCurrentUser ? undefined : collaborator.color }}
                                    >
                                        {collaborator.initials || getFallbackInitials(collaborator.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {extraCollaboratorCount > 0 ? (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs">
                                    +{extraCollaboratorCount}
                                </div>
                            ) : null}
                        </div>

                        <ShareButton documentId={documentId} />
                    </div>
                </div>

                <div className="relative flex-1 overflow-auto">
                    <div className="absolute inset-0 overflow-auto">
                        <div className="mx-auto w-full px-4 pb-32 md:px-8">
                            <SlateEditor
                                documentId={documentId}
                                initialValue={initialValue}
                                socket={socket}
                                currentUser={currentUser}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
