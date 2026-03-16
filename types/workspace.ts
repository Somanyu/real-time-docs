import type { WorkspaceRole } from "@/app/generated/prisma/enums"
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

export type WorkspaceSummary = {
    id: string
    name: string
    slug: string
    role: WorkspaceRole
}

export type WorkspaceContextWorkspace = {
    id: string
    name: string
    slug: string
}

export type WorkspaceContextMembership = {
    id: string
    role: WorkspaceRole
    userId: string
    workspaceId: string
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
    member: WorkspaceMemberListItem
}

export type RemoveWorkspaceCollaboratorResponse = {
    removedCollaboratorId: string
}

export type UpdateWorkspaceCollaboratorRoleResponse = {
    member: WorkspaceMemberListItem
}

export type AISummaryModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentId: string | null
}

export type WorkspaceFilter = (typeof WORKSPACE_FILTERS)[number] | "all"

export interface WorkspaceContextValue {
    workspace: WorkspaceContextWorkspace
    membership: WorkspaceContextMembership
}