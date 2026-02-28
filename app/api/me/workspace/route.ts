import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: {
                include: {
                    workspace: true,
                },
            },
            lastVisitedWorkspace: true,
        },
    })

    if (!user?.memberships.length) {
        return NextResponse.json(
            { error: "No workspace found" },
            { status: 404 }
        )
    }

    // priority 1: last visited workspace
    if (user.lastVisitedWorkspace) {
        return NextResponse.json({
            id: user.lastVisitedWorkspace.id,
            name: user.lastVisitedWorkspace.name,
            slug: user.lastVisitedWorkspace.slug,
        })
    }

    // priority 2: first membership workspace
    const firstWorkspace = user.memberships[0].workspace

    return NextResponse.json({
        id: firstWorkspace.id,
        name: firstWorkspace.name,
        slug: firstWorkspace.slug,
    })
}