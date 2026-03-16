import { WorkspaceRole } from "@/app/generated/prisma/client"
import { WORKSPACE_FILTERS } from "@/constants/workspace"

export interface WorkspacePageProps {
    params: Promise<{
        slug: string
    }>
    searchParams?: Promise<{
        filter?: string
    }>
}

export interface WorkspaceLayoutProps {
    children: React.ReactNode
    params: Promise<{
        slug: string
    }>
}

export interface WorkspaceState {
    lastVisitedWorkspace: string | null
    setLastVisitedWorkspace: (slug: string) => void
}

export interface CreateWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export type ManageWorkspaceDialogProps = {
    onSaved: () => Promise<void> | void
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceId: string | null
}

export type CreateWorkspaceResponse = {
    addedCollaborators: string[]
    skippedCollaborators: string[]
    slug: string
}

export type WorkspaceMemberListItem = {
    id: string
    role: WorkspaceRole
    userId: string
    user: {
        email: string
        name: string | null
    }
}

export type WorkspaceSettingsResponse = {
    currentUserRole: WorkspaceRole
    members: WorkspaceMemberListItem[]
    workspace: {
        id: string
        name: string
        slug: string
    }
}

export type UpdateWorkspaceNameResponse = {
    name: string
}

export type AddWorkspaceCollaboratorResponse = {
    addedCollaborator: string
}

export type RemoveWorkspaceCollaboratorResponse = {
    removedCollaboratorId: string
}

export type AISummaryModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentId: string | null
}

export type WorkspaceFilter = (typeof WORKSPACE_FILTERS)[number] | "all"
