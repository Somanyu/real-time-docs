import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { WorkspacePageProps } from "@/types/workspace"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { RecentDocuments } from "@/components/workspace/recent-documents"
import { AllDocuments } from "@/components/workspace/all-documents"
import EmptyDocumentState from "@/components/document/empty-document-state"

export default async function WorkspacePage({ params }: WorkspacePageProps) {

    const { slug } = await params;

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Get workspace
    const workspace = await prisma.workspace.findUnique({
        where: { slug },
    })

    // Fetch documents
    const documents = await prisma.document.findMany({
        where: {
            workspaceId: workspace?.id,
            isArchived: false,
        },
        orderBy: {
            updatedAt: "desc",
        },
    })

    const recentDocuments = documents.slice(0, 4)


    return (

        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    </div>
                </header>

                {documents.length > 0 ? (
                    <div className="p-6 space-y-10">

                        {/* Recent Documents */}
                        <RecentDocuments documents={recentDocuments} />

                        {/* All Documents */}
                        <AllDocuments documents={documents} workspaceSlug={workspace!.slug} />

                    </div>

                ) : (
                    <EmptyDocumentState />
                )}

            </SidebarInset>
        </SidebarProvider>
    )
}
