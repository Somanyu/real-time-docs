import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { updateWorkspaceNameSchema } from "@/lib/validations/workspace-settings"
import { WorkspaceSettingsResponse } from "@/types/workspace"

async function getAuthorizedWorkspace(workspaceId: string, userId: string) {
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
    })

    if (!membership) {
        return null
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
            id: true,
            name: true,
            slug: true,
            members: {
                orderBy: [
                    { role: "asc" },
                    { joinedAt: "asc" },
                ],
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
            },
        },
    })

    if (!workspace) {
        return null
    }

    return {
        membership,
        workspace,
    }
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: workspaceId } = await context.params
    const result = await getAuthorizedWorkspace(workspaceId, session.user.id)

    if (!result) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const response: WorkspaceSettingsResponse = {
        currentUserRole: result.membership.role,
        members: result.workspace.members,
        workspace: {
            id: result.workspace.id,
            name: result.workspace.name,
            slug: result.workspace.slug,
        },
    }

    return NextResponse.json(response)
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: workspaceId } = await context.params
    const result = await getAuthorizedWorkspace(workspaceId, session.user.id)

    if (!result) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    if (result.membership.role !== "OWNER") {
        return NextResponse.json({ error: "Only workspace owners can update the workspace" }, { status: 403 })
    }

    const body = await req.json()
    const parsedInput = updateWorkspaceNameSchema.safeParse(body)

    if (!parsedInput.success) {
        return NextResponse.json(
            {
                error: "Invalid workspace data",
                details: parsedInput.error.flatten(),
            },
            { status: 400 }
        )
    }

    const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            name: parsedInput.data.name,
        },
        select: {
            name: true,
        },
    })

    return NextResponse.json(updatedWorkspace)
}
