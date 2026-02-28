export interface WorkspacePageProps {
    params: Promise<{
        slug: string
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