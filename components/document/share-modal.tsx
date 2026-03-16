"use client"

import { useCallback, useEffect, useState } from "react"
import { WorkspaceRole } from "@/app/generated/prisma/enums"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COLLABORATOR_ROLE_OPTIONS } from "@/constants/workspace"
import { cn } from "@/lib/utils"
import {
    AddWorkspaceCollaboratorResponse,
    RemoveWorkspaceCollaboratorResponse,
    UpdateWorkspaceCollaboratorRoleResponse,
    WorkspaceMemberListItem,
    WorkspaceSettingsResponse,
} from "@/types/workspace"

interface Props {
    documentId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

const getErrorMessage = (fallbackMessage: string, error: unknown) => {
    if (error instanceof Error && error.message) {
        return `${fallbackMessage}: ${error.message}`
    }

    return fallbackMessage
}

const getInitials = (value: string) =>
    value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")

const getRoleLabel = (role: WorkspaceRole) => role.charAt(0) + role.slice(1).toLowerCase()

const sortMembersByRoleAndJoinedOrder = (memberList: WorkspaceMemberListItem[]) =>
    [...memberList].sort((left, right) => {
        const roleRank: Record<WorkspaceRole, number> = {
            OWNER: 0,
            EDITOR: 1,
            VIEWER: 2,
        }

        return roleRank[left.role] - roleRank[right.role]
    })

const getMemberActionLabel = (isRemoving: boolean, isUpdating: boolean, role: WorkspaceRole) => {
    if (isRemoving) {
        return "Removing..."
    }

    if (isUpdating) {
        return "Saving..."
    }

    return getRoleLabel(role)
}

const getRoleBadgeClassName = (role: WorkspaceRole) => {
    let roleClassName = "bg-muted text-muted-foreground"

    if (role === WorkspaceRole.OWNER) {
        roleClassName = "bg-primary/10 text-primary"
    }

    return cn("rounded-full px-2 py-1 text-xs", roleClassName)
}

export function ShareModal({ documentId, open, onOpenChange }: Readonly<Props>) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<WorkspaceRole>(WorkspaceRole.EDITOR)
    const [members, setMembers] = useState<WorkspaceMemberListItem[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<WorkspaceSettingsResponse["currentUserRole"] | null>(null)
    const [workspaceId, setWorkspaceId] = useState("")
    const [workspaceName, setWorkspaceName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

    const isOwner = currentUserRole === WorkspaceRole.OWNER

    const loadAccessList = useCallback(async () => {
        try {
            setIsLoading(true)

            const response = await fetch(`/api/share?documentId=${documentId}`)
            const data: WorkspaceSettingsResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to load document access")
                onOpenChange(false)
                return
            }

            setMembers(data.members)
            setCurrentUserRole(data.currentUserRole)
            setWorkspaceId(data.workspace.id)
            setWorkspaceName(data.workspace.name)
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to load document access", error))
            onOpenChange(false)
        } finally {
            setIsLoading(false)
        }
    }, [documentId, onOpenChange])

    useEffect(() => {
        if (!open) {
            return
        }

        void loadAccessList()
    }, [loadAccessList, open])

    async function inviteUser() {
        try {
            setIsInviting(true)

            const response = await fetch("/api/share", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId,
                    email,
                    role,
                }),
            })

            const data: AddWorkspaceCollaboratorResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to send invite")
                return
            }

            setMembers((currentMembers) => sortMembersByRoleAndJoinedOrder([...currentMembers, data.member]))
            setEmail("")
            setRole(WorkspaceRole.EDITOR)
            toast.success(`Added ${data.addedCollaborator} to ${workspaceName || "the workspace"}`)
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to send invite", error))
        } finally {
            setIsInviting(false)
        }
    }

    async function updateMemberRole(memberId: string, nextRole: WorkspaceRole) {
        if (!workspaceId) {
            return
        }

        try {
            setUpdatingMemberId(memberId)

            const response = await fetch(`/api/workspace/${workspaceId}/collaborators/${memberId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: nextRole }),
            })

            const data: UpdateWorkspaceCollaboratorRoleResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to update access")
                return
            }

            setMembers((currentMembers) =>
                sortMembersByRoleAndJoinedOrder(
                    currentMembers.map((member) => (member.id === data.member.id ? data.member : member))
                )
            )
            toast.success(`Updated ${data.member.user.email} to ${getRoleLabel(data.member.role)}`)
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to update access", error))
        } finally {
            setUpdatingMemberId(null)
        }
    }

    async function removeMember(memberId: string) {
        if (!workspaceId) {
            return
        }

        try {
            setRemovingMemberId(memberId)

            const response = await fetch(`/api/workspace/${workspaceId}/collaborators/${memberId}`, {
                method: "DELETE",
            })

            const data: RemoveWorkspaceCollaboratorResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to remove access")
                return
            }

            setMembers((currentMembers) => currentMembers.filter((member) => member.id !== data.removedCollaboratorId))
            toast.success("Access removed")
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to remove access", error))
        } finally {
            setRemovingMemberId(null)
        }
    }


    let accessListContent: React.ReactNode

    if (isLoading) {
        accessListContent = (
            <p className="text-sm text-muted-foreground">Loading access list...</p>
        )
    } else if (members.length === 0) {
        accessListContent = (
            <p className="text-sm text-muted-foreground">No one has access yet.</p>
        )
    } else {
        accessListContent = (
            <div className="space-y-4">
                {members.map((member) => {
                    const displayName = member.user.name?.trim() || member.user.email
                    const isOwnerMember = member.role === WorkspaceRole.OWNER
                    const isUpdating = updatingMemberId === member.id
                    const isRemoving = removingMemberId === member.id
                    const isBusy = isUpdating || isRemoving

                    return (
                        <div key={member.id} className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-1">
                                <Avatar>
                                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{displayName}</p>
                                    {member.user.name && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            {member.user.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isOwnerMember || !isOwner ? (
                                <span className={getRoleBadgeClassName(member.role)}>
                                    {getRoleLabel(member.role)}
                                </span>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={isBusy} className="min-w-24 justify-between rounded-full px-3 text-xs">
                                            {getMemberActionLabel(isRemoving, isUpdating, member.role)}
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-40">
                                        {COLLABORATOR_ROLE_OPTIONS.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                disabled={option.value === member.role}
                                                onClick={() =>
                                                    void updateMemberRole(member.id, option.value)
                                                }
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => void removeMember(member.id)} className="text-destructive focus:text-destructive">Remove access</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share Document</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add people by email..."
                            value={email}
                            disabled={!isOwner || isInviting}
                            onChange={(event) => setEmail(event.target.value.toLowerCase())}
                        />

                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as WorkspaceRole)}
                            disabled={!isOwner || isInviting}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {COLLABORATOR_ROLE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={() => void inviteUser()} disabled={!isOwner || isInviting || !email.trim()}>
                            {isInviting ? "Sending..." : "Send"}
                        </Button>
                    </div>

                    {!isOwner && currentUserRole && (
                        <p className="text-xs text-muted-foreground">
                            Only workspace owners can invite new people to this document.
                        </p>
                    )}

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">People with access</p>
                            {workspaceName ? (
                                <p className="text-xs text-muted-foreground">Access is managed through the {workspaceName} workspace.</p>
                            ) : null}
                        </div>

                        {accessListContent}
                    </div>

                    <div className="flex items-center justify-between rounded-lg p-3">
                        <div>
                            <p className="text-sm font-medium">General Access</p>
                            <p className="text-xs text-muted-foreground">Anyone with link can view</p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(`${globalThis.location.origin}/share/${documentId}`)
                                toast.success("Share link copied")
                            }}
                        >
                            Copy Link
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
