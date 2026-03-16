import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { addWorkspaceCollaboratorSchema } from "@/lib/validations/workspace-settings"
import { AddWorkspaceCollaboratorResponse, WorkspaceSettingsResponse } from "@/types/workspace"

async function getAuthorizedDocumentWorkspace(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
            id: true,
            workspaceId: true,
            workspace: {
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
            },
        },
    })

    if (!document) {
        return null
    }

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId: document.workspaceId,
            },
        },
    })

    if (!membership) {
        return null
    }

    return {
        document,
        membership,
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get("documentId")

    if (!documentId) {
        return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const result = await getAuthorizedDocumentWorkspace(documentId, session.user.id)

    if (!result) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const response: WorkspaceSettingsResponse = {
        currentUserRole: result.membership.role,
        members: result.document.workspace.members,
        workspace: {
            id: result.document.workspace.id,
            name: result.document.workspace.name,
            slug: result.document.workspace.slug,
        },
    }

    return NextResponse.json(response)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const documentId = typeof body.documentId === "string" ? body.documentId : ""
    const parsedInput = addWorkspaceCollaboratorSchema.safeParse(body)

    if (!documentId) {
        return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    if (!parsedInput.success) {
        return NextResponse.json(
            {
                error: "Invalid collaborator data",
                details: parsedInput.error.flatten(),
            },
            { status: 400 }
        )
    }

    const result = await getAuthorizedDocumentWorkspace(documentId, session.user.id)

    if (!result) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (result.membership.role !== "OWNER") {
        return NextResponse.json({ error: "Only workspace owners can invite collaborators" }, { status: 403 })
    }

    const email = parsedInput.data.email.trim().toLowerCase()
    const role = parsedInput.data.role

    if (email === session.user.email.toLowerCase()) {
        return NextResponse.json({ error: "You already have access to this document" }, { status: 400 })
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
                workspaceId: result.document.workspaceId,
            },
        },
    })

    if (existingMembership) {
        return NextResponse.json({ error: "That user already has access" }, { status: 409 })
    }

    const createdMember = await prisma.$transaction(async (tx) => {
        const member = await tx.workspaceMember.create({
            data: {
                userId: collaborator.id,
                workspaceId: result.document.workspaceId,
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
                workspaceId: result.document.workspaceId,
                documentId: result.document.id,
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
