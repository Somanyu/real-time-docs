import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { requireAuth } from "./require-auth"

export async function getWorkspaceOrThrow(slug: string) {
    const session = await requireAuth()

    const workspace = await prisma.workspace.findUnique({
        where: { slug },
    })

    if (!workspace) {
        notFound()
    }

    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspace.id,
            user: {
                email: session.user.email!,
            },
        },
    })

    if (!membership) {
        redirect("/")
    }

    // update the last visited workspace
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            lastVisitedWorkspaceId: workspace.id,
        },
    })

    return {
        workspace,
        membership,
        session,
    }
}
