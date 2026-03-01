import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateWorkspaceSlug } from "@/lib/slug";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, collaborators } = body

    if (!name) {
        return NextResponse.json({ error: "Workspace name required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate slug
    const slug = generateWorkspaceSlug(name)

    const workspace = await prisma.workspace.create({
        data: {
            name,
            slug,
            members: {
                create: [
                    {
                        userId: user.id,
                        role: "OWNER"
                    }
                ]
            }
        }
    })

    // Add collaborators if user has added
    if (collaborators?.length) {
        for (const collaborator of collaborators) {
            const existingUser = await prisma.user.findUnique({
                where: { email: collaborator.email }
            })

            if (existingUser) {
                await prisma.workspaceMember.create({
                    data: {
                        userId: existingUser.id,
                        workspaceId: workspace.id,
                        role: "EDITOR"
                    }
                })
            }
        }
    }

    return NextResponse.json(workspace)
}
