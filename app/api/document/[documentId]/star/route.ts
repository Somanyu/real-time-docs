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

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existing = await prisma.documentStar.findUnique({
        where: {
            userId_documentId: {
                userId: user.id,
                documentId: documentId,
            },
        },
    })

    if (existing) {
        await prisma.documentStar.delete({
            where: { id: existing.id },
        })
        return NextResponse.json({ starred: false })
    } else {
        await prisma.documentStar.create({
            data: {
                userId: user.id,
                documentId: documentId,
            },
        })
        return NextResponse.json({ starred: true })
    }
}