import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { WorkspaceLayoutProps } from "@/types/workspace";

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {

    const { slug } = await params;

    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
        where: { slug }
    })

    if (!workspace) {
        notFound()
    }

    // Check membership
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspace.id,
            user: {
                email: session.user.email
            }
        }
    })

    if (!membership) {
        redirect("/dashboard")
    }

    // Render children
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}
