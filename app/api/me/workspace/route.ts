import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const membership = await prisma.workspaceMember.findFirst({
        where: {
            user: { email: session.user.email }
        },
        include: {
            workspace: true
        }
    })

    if (!membership) {
        return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    return NextResponse.json({
        slug: membership.workspace.slug
    })
}