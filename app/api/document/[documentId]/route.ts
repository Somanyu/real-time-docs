import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, context: { params: Promise<{ documentId: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { documentId } = await context.params

    const { title } = await req.json()

    if (!title || typeof title !== "string") {
        return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }

    const document = await prisma.document.findFirst({
        where: {
            id: documentId,
            workspace: {
                members: {
                    some: {
                        user: { email: session.user.email },
                        role: { in: ["OWNER", "EDITOR"] }, // VIEWER cannot edit
                    },
                },
            },
        },
    })

    if (!document) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.document.update({
        where: { id: document.id },
        data: { title },
    })

    await prisma.activityLog.create({
        data: {
            type: "TITLE_UPDATED",
            documentId: document.id,
            workspaceId: document.workspaceId,
            userId: document.createdById,
            metadata: { title },
        },
    })

    return NextResponse.json(updated)
}