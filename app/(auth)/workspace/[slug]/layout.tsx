import { WorkspaceLayoutProps } from "@/types/workspace";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { getWorkspaceOrThrow } from "@/lib/server/get-workspace";

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {

    const { slug } = await params;

    const { workspace, membership } = await getWorkspaceOrThrow(slug)

    // Render children
    return (
        <WorkspaceProvider value={{ workspace, membership }}>
            <div className="min-h-screen">
                {children}
            </div>
        </WorkspaceProvider>
    )
}
