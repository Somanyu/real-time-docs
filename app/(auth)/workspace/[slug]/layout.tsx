import { WorkspaceLayoutProps } from "@/types/workspace";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";
import { getWorkspaceOrThrow } from "@/lib/server/get-workspace";
import WorkspaceTracker from "@/components/workspace/workspace-tracker";

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {

    const { slug } = await params;

    const { workspace, membership } = await getWorkspaceOrThrow(slug)

    // Render children
    return (
        <WorkspaceProvider value={{ workspace, membership }}>
            <WorkspaceTracker slug={workspace.slug} />
            <div className="min-h-screen">
                {children}
            </div>
        </WorkspaceProvider>
    )
}
