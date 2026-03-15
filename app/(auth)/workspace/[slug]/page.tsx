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
import { DocumentWithAuthor } from "@/types/document"
import { getWorkspaceOrThrow } from "@/lib/server/get-workspace"

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {

    const { slug } = await params;
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        redirect("/login")
    }

    const resolvedSearchParams = searchParams ? await searchParams : undefined
    const rawFilter = resolvedSearchParams?.filter
    const filter = rawFilter === "favorites" || rawFilter === "recent" ? rawFilter : "all"

    const { workspace } = await getWorkspaceOrThrow(slug)

    const documents: DocumentWithAuthor[] = await prisma.document.findMany({
        where: {
            workspaceId: workspace.id,
            isArchived: false,
            ...(filter === "favorites" ? {
                documentStars: {
                    some: {
                        userId: session.user.id,
                    }
                }
            } : {}),
        },
        orderBy: {
            updatedAt: "desc",
        },
        ...(filter === "recent" ? {
            take: 10,
        } : {}),
        include: {
            createdBy: {
                select: {
                    email: true,
                }
            }
        }
    })

    const recentDocuments = documents.slice(0, 4)
    const isFilteredView = filter !== "all"
    const documentListTitle = filter === "favorites" ? "Favorite Documents" : filter === "recent" ? "Recent Documents" : "All Documents"


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

                {!isFilteredView && documents.length > 0 ? (
                    <div className="p-6 space-y-10">

                        {/* Recent Documents */}
                        <RecentDocuments documents={recentDocuments} />

                        {/* All Documents */}
                        <AllDocuments documents={documents} />

                    </div>

                ) : isFilteredView ? (
                    <div className="p-6">
                        <AllDocuments documents={documents} title={documentListTitle} />
                    </div>
                ) : (
                    <EmptyDocumentState />
                )}

            </SidebarInset>
        </SidebarProvider>
    )
}
