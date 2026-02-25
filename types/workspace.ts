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