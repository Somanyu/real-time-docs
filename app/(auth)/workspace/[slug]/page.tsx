import prisma from "@/lib/prisma"
import { WorkspaceFilter, WorkspacePageProps } from "@/types/workspace"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { RecentDocuments } from "@/components/workspace/recent-documents"
import { AllDocuments } from "@/components/workspace/all-documents"
import EmptyDocumentState from "@/components/document/empty-document-state"
import { DocumentWithAuthor } from "@/types/document"
import { getWorkspaceOrThrow } from "@/lib/server/get-workspace"
import { WORKSPACE_FILTERS } from "@/constants/workspace"

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
    const { slug } = await params
    const resolvedSearchParams = searchParams ? await searchParams : undefined
    const rawFilter = resolvedSearchParams?.filter
    const filter: WorkspaceFilter = WORKSPACE_FILTERS.includes(rawFilter as (typeof WORKSPACE_FILTERS)[number])
        ? rawFilter as WorkspaceFilter
        : "all"

    const { workspace, session } = await getWorkspaceOrThrow(slug)
    const showArchivedDocuments = filter === "archived"

    const documents: DocumentWithAuthor[] = await prisma.document.findMany({
        where: {
            workspaceId: workspace.id,
            isArchived: showArchivedDocuments,
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
    let documentListTitle = "All Documents"

    if (filter === "favorites") {
        documentListTitle = "Favorite Documents"
    } else if (filter === "recent") {
        documentListTitle = "Recent Documents"
    } else if (filter === "archived") {
        documentListTitle = "Archived Documents"
    }

    let pageContent: React.ReactNode

    if (isFilteredView) {
        pageContent = (
            <div className="p-6">
                <AllDocuments
                    documents={documents}
                    title={documentListTitle}
                    archiveActionLabel={showArchivedDocuments ? "Restore" : "Archive"}
                />
            </div>
        )
    } else if (documents.length > 0) {
        pageContent = (
            <div className="p-6 space-y-10">
                <RecentDocuments documents={recentDocuments} />
                <AllDocuments documents={documents} />
            </div>
        )
    } else {
        pageContent = <EmptyDocumentState />
    }

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
                {pageContent}
            </SidebarInset>
        </SidebarProvider>
    )
}
