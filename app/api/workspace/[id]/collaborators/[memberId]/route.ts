import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { RemoveWorkspaceCollaboratorResponse } from "@/types/workspace"

export async function DELETE(
    _: Request,
    context: { params: Promise<{ id: string, memberId: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: workspaceId, memberId } = await context.params

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: session.user.id,
                workspaceId,
            },
        },
    })

    if (!membership) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    if (membership.role !== "OWNER") {
        return NextResponse.json({ error: "Only workspace owners can remove collaborators" }, { status: 403 })
    }

    const memberToRemove = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    })

    if (!memberToRemove || memberToRemove.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
    }

    if (memberToRemove.role === "OWNER") {
        return NextResponse.json({ error: "Workspace owner cannot be removed" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
        await tx.workspaceMember.delete({
            where: { id: memberId },
        })

        await tx.activityLog.create({
            data: {
                type: "MEMBER_REMOVED",
                workspaceId,
                userId: session.user.id,
                metadata: {
                    collaboratorEmail: memberToRemove.user.email,
                },
            },
        })
    })

    const response: RemoveWorkspaceCollaboratorResponse = {
        removedCollaboratorId: memberId,
    }

    return NextResponse.json(response)
}
