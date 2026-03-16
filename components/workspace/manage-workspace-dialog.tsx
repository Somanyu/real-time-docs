"use client"

import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Settings2, UserPlus, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { addWorkspaceCollaboratorSchema, updateWorkspaceNameSchema } from "@/lib/validations/workspace-settings"
import {
    AddWorkspaceCollaboratorResponse,
    ManageWorkspaceDialogProps,
    RemoveWorkspaceCollaboratorResponse,
    UpdateWorkspaceNameResponse,
    WorkspaceMemberListItem,
    WorkspaceSettingsResponse,
} from "@/types/workspace"

type ApiErrorResponse = {
    error: string
}

const getErrorMessage = (fallbackMessage: string, error: unknown) => {
    if (error instanceof Error && error.message) {
        return `${fallbackMessage}: ${error.message}`
    }

    return fallbackMessage
}

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
            const data: WorkspaceSettingsResponse | ApiErrorResponse = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to load workspace settings")
            } else {
                workspaceNameForm.reset({ name: data.workspace.name })
                collaboratorForm.reset({ email: "" })
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

            const data: UpdateWorkspaceNameResponse | ApiErrorResponse = await response.json()

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
    const handleAddCollaborator = collaboratorForm.handleSubmit(async ({ email }) => {
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
                body: JSON.stringify({ email }),
            })

            const data: AddWorkspaceCollaboratorResponse | ApiErrorResponse = await response.json()

            if (!response.ok || "error" in data) {
                toast.error("error" in data ? data.error : "Unable to add collaborator")
            } else {
                collaboratorForm.reset({ email: "" })
                toast.success(`Added ${data.addedCollaborator} to the workspace`)
                await loadWorkspaceSettings()
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

            const data: RemoveWorkspaceCollaboratorResponse | ApiErrorResponse = await response.json()

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
                                        <FieldLabel htmlFor="collaborator-email">Add Collaborator</FieldLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                {...field}
                                                id="collaborator-email"
                                                placeholder="name@example.com"
                                                aria-invalid={fieldState.invalid}
                                                disabled={!isOwner || isAddingCollaborator}
                                                onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                                            />
                                            <Button type="submit" disabled={!isOwner || isAddingCollaborator}>
                                                <UserPlus className="h-4 w-4" />
                                                {isAddingCollaborator ? "Adding..." : "Add"}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        {!isOwner && (
                                            <FieldDescription>Only workspace owners can add collaborators.</FieldDescription>
                                        )}
                                    </Field>
                                )}
                            />
                        </form>

                        <Field>
                            <FieldLabel>Collaborators</FieldLabel>
                            <div className="space-y-3 rounded-lg p-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between gap-3 rounded-md p-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{member.user.email}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                                                {member.role}
                                            </Badge>

                                            {member.role !== "OWNER" && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    disabled={!isOwner || removingMemberId === member.id}
                                                    onClick={() => void handleRemoveCollaborator(member.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
