import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import LogoutButton from "@/components/ui/logout-button"
import { WorkspacePageProps } from "@/types/workspace"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

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

    if (!workspace) {
        redirect("/dashboard")
    }

    // Fetch documents
    const documents = await prisma.document.findMany({
        where: {
            workspaceId: workspace.id,
            isArchived: false,
        },
        orderBy: {
            updatedAt: "desc",
        },
    })

    return (
        <>
            {/* <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{workspace.name}</h1>

                <Link href={`/workspace/${workspace.slug}/new`} className="px-4 py-2 bg-black text-white rounded-md">+ New Document</Link>
                <LogoutButton />
            </div>

            {documents.length === 0 ? (
                <div className="border rounded-lg p-10 text-center text-muted-foreground">
                    No documents yet.
                    <br />
                    Create your first document 🚀
                </div>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <Link key={doc.id} href={`/workspace/${workspace.slug}/document/${doc.id}`} className="border rounded-md p-4 hover:bg-muted transition">
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-muted-foreground">Updated {doc.updatedAt.toDateString()}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div> */}

            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Build Your Application
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="bg-muted/50 aspect-video rounded-xl" />
                            <div className="bg-muted/50 aspect-video rounded-xl" />
                            <div className="bg-muted/50 aspect-video rounded-xl" />
                        </div>
                        <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}
