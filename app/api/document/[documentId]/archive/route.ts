import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ArchiveRequestBody } from "@/types/document"

export async function POST(
    req: Request,
    context: { params: Promise<{ documentId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { documentId } = await context.params
        const { archived }: ArchiveRequestBody = await req.json()

        if (typeof archived !== "boolean") {
            return NextResponse.json({ error: "Invalid archive state" }, { status: 400 })
        }

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id,
                            role: { in: ["OWNER", "EDITOR"] },
                        },
                    },
                },
            },
            select: {
                id: true,
                title: true,
                isArchived: true,
                workspaceId: true,
            },
        })

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 })
        }

        if (document.isArchived === archived) {
            return NextResponse.json({
                archived: document.isArchived,
                message: archived ? "Document already archived" : "Document already active",
            })
        }

        const updatedDocument = await prisma.document.update({
            where: { id: document.id },
            data: {
                isArchived: archived,
            },
            select: {
                id: true,
                isArchived: true,
            },
        })

        await prisma.activityLog.create({
            data: {
                type: archived ? "DOCUMENT_ARCHIVED" : "DOCUMENT_RESTORED",
                documentId: document.id,
                workspaceId: document.workspaceId,
                userId: session.user.id,
                metadata: {
                    title: document.title,
                },
            },
        })

        return NextResponse.json({
            archived: updatedDocument.isArchived,
        })
    } catch (error) {
        console.error("Archive document failed:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
