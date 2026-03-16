import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateWorkspaceCollaboratorRoleSchema } from "@/lib/validations/workspace-settings"
import { RemoveWorkspaceCollaboratorResponse, UpdateWorkspaceCollaboratorRoleResponse } from "@/types/workspace"

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

export async function PATCH(
    req: Request,
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
        return NextResponse.json({ error: "Only workspace owners can update collaborator roles" }, { status: 403 })
    }

    const body = await req.json()
    const parsedInput = updateWorkspaceCollaboratorRoleSchema.safeParse(body)

    if (!parsedInput.success) {
        return NextResponse.json(
            {
                error: "Invalid collaborator role",
                details: parsedInput.error.flatten(),
            },
            { status: 400 }
        )
    }

    const memberToUpdate = await prisma.workspaceMember.findUnique({
        where: { id: memberId },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    })

    if (!memberToUpdate || memberToUpdate.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
    }

    if (memberToUpdate.role === "OWNER") {
        return NextResponse.json({ error: "Workspace owner role cannot be changed" }, { status: 400 })
    }

    if (memberToUpdate.role === parsedInput.data.role) {
        const response: UpdateWorkspaceCollaboratorRoleResponse = {
            member: {
                id: memberToUpdate.id,
                role: memberToUpdate.role,
                userId: memberToUpdate.userId,
                user: memberToUpdate.user,
            },
        }

        return NextResponse.json(response)
    }

    const updatedMember = await prisma.$transaction(async (tx) => {
        const member = await tx.workspaceMember.update({
            where: { id: memberId },
            data: {
                role: parsedInput.data.role,
            },
            select: {
                id: true,
                role: true,
                userId: true,
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
            },
        })

        await tx.activityLog.create({
            data: {
                type: "ROLE_UPDATED",
                workspaceId,
                userId: session.user.id,
                metadata: {
                    collaboratorEmail: member.user.email,
                    previousRole: memberToUpdate.role,
                    nextRole: parsedInput.data.role,
                },
            },
        })

        return member
    })

    const response: UpdateWorkspaceCollaboratorRoleResponse = {
        member: updatedMember,
    }

    return NextResponse.json(response)
}
