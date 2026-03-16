"use client"

import { useCallback, useEffect, useState } from "react"
import { WorkspaceRole } from "@/app/generated/prisma/enums"
import { zodResolver } from "@hookform/resolvers/zod"
import { Settings2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addWorkspaceCollaboratorSchema, updateWorkspaceNameSchema } from "@/lib/validations/workspace-settings"
import { cn } from "@/lib/utils"
import {
    AddWorkspaceCollaboratorResponse,
    ManageWorkspaceDialogProps,
    RemoveWorkspaceCollaboratorResponse,
    UpdateWorkspaceCollaboratorRoleResponse,
    UpdateWorkspaceNameResponse,
    WorkspaceMemberListItem,
    WorkspaceSettingsResponse,
} from "@/types/workspace"
import { COLLABORATOR_ROLE_OPTIONS } from "@/constants/workspace"

const sortMembersByRoleAndJoinedOrder = (memberList: WorkspaceMemberListItem[]) =>
    [...memberList].sort((left, right) => {
        const roleRank: Record<WorkspaceRole, number> = {
            OWNER: 0,
            EDITOR: 1,
            VIEWER: 2,
        }

        return roleRank[left.role] - roleRank[right.role]
    })

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

export function ManageWorkspaceDialog({
    onSaved,
    open,
    onOpenChange,
    workspaceId,
}: Readonly<ManageWorkspaceDialogProps>) {
    const [members, setMembers] = useState<WorkspaceMemberListItem[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<WorkspaceSettingsResponse["currentUserRole"] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSavingName, setIsSavingName] = useState<boolean>(false)
    const [isAddingCollaborator, setIsAddingCollaborator] = useState<boolean>(false)
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)

    const isOwner = currentUserRole === "OWNER"
    const workspaceNameForm = useForm<z.infer<typeof updateWorkspaceNameSchema>>({
        resolver: zodResolver(updateWorkspaceNameSchema),
        defaultValues: {
            name: "",
        },
    })
    const collaboratorForm = useForm<z.infer<typeof addWorkspaceCollaboratorSchema>>({
        resolver: zodResolver(addWorkspaceCollaboratorSchema),
        defaultValues: {
            email: "",
            role: WorkspaceRole.EDITOR,
        },
    })

    /**
     * Loads the current workspace details and collaborator list for editing.
     */
    const loadWorkspaceSettings = useCallback(async () => {
        if (!workspaceId) {
            return
        }

        try {
            setIsLoading(true)

            const response = await fetch(`/api/workspace/${workspaceId}/settings`)
            const data: WorkspaceSettingsResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to load workspace settings")
            } else {
                workspaceNameForm.reset({ name: data.workspace.name })
                collaboratorForm.reset({ email: "", role: WorkspaceRole.EDITOR })
                setMembers(data.members)
                setCurrentUserRole(data.currentUserRole)
            }

        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to load workspace settings", error))
            onOpenChange(false)
        } finally {
            setIsLoading(false)
        }
    }, [collaboratorForm, onOpenChange, workspaceId, workspaceNameForm])

    useEffect(() => {
        if (!open || !workspaceId) {
            return
        }

        void loadWorkspaceSettings()
    }, [loadWorkspaceSettings, open, workspaceId])

    /**
     * Updates the current workspace name.
     */
    const handleSaveWorkspaceName = workspaceNameForm.handleSubmit(async ({ name }) => {
        if (!workspaceId) {
            return
        }

        try {
            setIsSavingName(true)

            const response = await fetch(`/api/workspace/${workspaceId}/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                }),
            })

            const data: UpdateWorkspaceNameResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to update workspace name")
            } else {
                workspaceNameForm.reset({ name: data.name })
                toast.success("Workspace name updated")
                await onSaved()
            }
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to update workspace name", error))
        } finally {
            setIsSavingName(false)
        }
    })

    /**
     * Validates the entered collaborator email and adds the user to the workspace.
     */
    const handleAddCollaborator = collaboratorForm.handleSubmit(async ({ email, role }) => {
        if (!workspaceId) {
            return
        }

        try {
            setIsAddingCollaborator(true)

            const response = await fetch(`/api/workspace/${workspaceId}/collaborators`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, role }),
            })

            const data: AddWorkspaceCollaboratorResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to add collaborator")
            } else {
                collaboratorForm.reset({ email: "", role: WorkspaceRole.EDITOR })
                setMembers((currentMembers) => sortMembersByRoleAndJoinedOrder([...currentMembers, data.member]))
                toast.success(`Added ${data.addedCollaborator} as ${data.member.role.toLowerCase()}`)
                await onSaved()
            }
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to add collaborator", error))
        } finally {
            setIsAddingCollaborator(false)
        }
    })

    /**
     * Removes a collaborator from the workspace.
     */
    const handleRemoveCollaborator = async (memberId: string) => {
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
                toast.error("error" in data ? data.error : "Unable to remove collaborator")
            } else {
                setMembers((currentMembers) => currentMembers.filter((member) => member.id !== data.removedCollaboratorId))
                toast.success("Collaborator removed")
                await onSaved()
            }
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to remove collaborator", error))
        } finally {
            setRemovingMemberId(null)
        }
    }

    /**
     * Updates an existing collaborator role without requiring remove + re-add.
     */
    const handleUpdateCollaboratorRole = async (memberId: string, role: WorkspaceRole) => {
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
                body: JSON.stringify({ role }),
            })

            const data: UpdateWorkspaceCollaboratorRoleResponse | { error: string } = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to update collaborator role")
            } else {
                setMembers((currentMembers) =>
                    sortMembersByRoleAndJoinedOrder(
                        currentMembers.map((member) => (member.id === data.member.id ? data.member : member))
                    )
                )
                toast.success(`Updated ${data.member.user.email} to ${data.member.role.toLowerCase()}`)
                await onSaved()
            }
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage("Failed to update collaborator role", error))
        } finally {
            setUpdatingMemberId(null)
        }
    }

    const getMemberActionLabel = (
        isBusy: boolean,
        removingMemberId: string | null,
        memberId: string,
        role: WorkspaceRole
    ) => {
        if (!isBusy) return getRoleLabel(role)
        return removingMemberId === memberId ? "Removing..." : "Saving..."
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        Manage Workspace
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-10 text-sm text-muted-foreground">Loading workspace settings...</div>
                ) : (
                    <div className="space-y-6">
                        <form onSubmit={handleSaveWorkspaceName}>
                            <Controller
                                name="name"
                                control={workspaceNameForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="workspace-name">Workspace Name</FieldLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                {...field}
                                                id="workspace-name"
                                                aria-invalid={fieldState.invalid}
                                                disabled={!isOwner || isSavingName}
                                            />
                                            <Button type="submit" disabled={!isOwner || isSavingName}>
                                                {isSavingName ? "Saving..." : "Save"}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        {!isOwner && (
                                            <FieldDescription>Only workspace owners can rename the workspace.</FieldDescription>
                                        )}
                                    </Field>
                                )}
                            />
                        </form>

                        <form onSubmit={handleAddCollaborator}>
                            <Controller
                                name="email"
                                control={collaboratorForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Add collaborator</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Input
                                                    {...field}
                                                    id="collaborator-email"
                                                    placeholder="Add people by email..."
                                                    aria-invalid={fieldState.invalid}
                                                    disabled={!isOwner || isAddingCollaborator}
                                                    onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                                                />
                                                <Controller
                                                    name="role"
                                                    control={collaboratorForm.control}
                                                    render={({ field: roleField }) => (
                                                        <Select
                                                            value={roleField.value}
                                                            onValueChange={roleField.onChange}
                                                            disabled={!isOwner || isAddingCollaborator}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {COLLABORATOR_ROLE_OPTIONS.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                <Button type="submit" disabled={!isOwner || isAddingCollaborator || !field.value.trim()}>
                                                    {isAddingCollaborator ? "Adding..." : "Add"}
                                                </Button>
                                            </div>

                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            {!isOwner && (
                                                <FieldDescription>Only workspace owners can add collaborators.</FieldDescription>
                                            )}
                                        </div>
                                    </Field>
                                )}
                            />
                        </form>

                        <Field>
                            <FieldLabel>Collaborators</FieldLabel>
                            <div className="space-y-4 rounded-lg p-3">
                                {members.filter((member) => member.role !== "OWNER").length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No collaborators added yet.</p>
                                ) : (
                                    members
                                        .filter((member) => member.role !== "OWNER")
                                        .map((member) => {
                                            const displayName = member.user.name?.trim() || member.user.email
                                            const isBusy = removingMemberId === member.id || updatingMemberId === member.id

                                            return (
                                                <div key={member.id} className="flex items-center justify-between gap-3 rounded-md p-3">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                                                        </Avatar>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium">{displayName}</p>
                                                            {member.user.name ? (
                                                                <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {isOwner ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" disabled={isBusy} className={cn("min-w-24 justify-between rounded-full px-3 text-xs")}>
                                                                    {getMemberActionLabel(isBusy, removingMemberId, member.id, member.role)}
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end" className="w-40">
                                                                {COLLABORATOR_ROLE_OPTIONS.map((option) => (
                                                                    <DropdownMenuItem
                                                                        key={option.value}
                                                                        disabled={option.value === member.role}
                                                                        onClick={() =>
                                                                            void handleUpdateCollaboratorRole(member.id, option.value)
                                                                        }
                                                                    >
                                                                        {option.label}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => void handleRemoveCollaborator(member.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    Remove access
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : (
                                                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                            {getRoleLabel(member.role)}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })
                                )}
                            </div>
                        </Field>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
