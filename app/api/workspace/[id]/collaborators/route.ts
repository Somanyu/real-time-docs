import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { addWorkspaceCollaboratorSchema } from "@/lib/validations/workspace-settings"
import { AddWorkspaceCollaboratorResponse } from "@/types/workspace"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: workspaceId } = await context.params

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
        return NextResponse.json({ error: "Only workspace owners can add collaborators" }, { status: 403 })
    }

    const body = await req.json()
    const parsedInput = addWorkspaceCollaboratorSchema.safeParse(body)

    if (!parsedInput.success) {
        return NextResponse.json(
            {
                error: "Invalid collaborator data",
                details: parsedInput.error.flatten(),
            },
            { status: 400 }
        )
    }

    const email = parsedInput.data.email.trim().toLowerCase()
    const role = parsedInput.data.role

    if (email === session.user.email.toLowerCase()) {
        return NextResponse.json({ error: "You are already part of this workspace" }, { status: 400 })
    }

    const collaborator = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
    })

    if (!collaborator) {
        return NextResponse.json({ error: "No user found with that email" }, { status: 404 })
    }

    const existingMembership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: collaborator.id,
                workspaceId,
            },
        },
    })

    if (existingMembership) {
        return NextResponse.json({ error: "That user is already a collaborator" }, { status: 409 })
    }

    const createdMember = await prisma.$transaction(async (tx) => {
        const member = await tx.workspaceMember.create({
            data: {
                userId: collaborator.id,
                workspaceId,
                role,
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
                type: "MEMBER_INVITED",
                workspaceId,
                userId: session.user.id,
                metadata: {
                    collaboratorEmail: collaborator.email,
                    role,
                },
            },
        })

        return member
    })

    const response: AddWorkspaceCollaboratorResponse = {
        addedCollaborator: collaborator.email,
        member: createdMember,
    }

    return NextResponse.json(response)
}
