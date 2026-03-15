import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateWorkspaceSlug } from "@/lib/slug"
import { createWorkspaceSchema } from "@/lib/validations/add-workspace"
import { CreateWorkspaceResponse } from "@/types/workspace"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const requestBody = await req.json()
        const parsedInput = createWorkspaceSchema.safeParse(requestBody)

        if (!parsedInput.success) {
            return NextResponse.json(
                {
                    error: "Invalid workspace data",
                    details: parsedInput.error.flatten(),
                },
                { status: 400 }
            )
        }

        const { name, collaborators } = parsedInput.data

        const owner = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, email: true },
        })

        if (!owner) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const collaboratorEmails = collaborators
            .map((collaborator) => collaborator.email.trim().toLowerCase())
            .filter((email) => email !== owner.email?.toLowerCase())

        const existingCollaborators = collaboratorEmails.length > 0
            ? await prisma.user.findMany({
                where: {
                    email: {
                        in: collaboratorEmails,
                    },
                },
                select: {
                    id: true,
                    email: true,
                },
            })
            : []

        const existingCollaboratorMap = new Map(
            existingCollaborators.map((collaborator) => [collaborator.email.toLowerCase(), collaborator])
        )

        const skippedCollaborators = collaboratorEmails.filter(
            (email) => !existingCollaboratorMap.has(email)
        )

        const slug = generateWorkspaceSlug(name)

        const workspace = await prisma.$transaction(async (tx) => {
            const createdWorkspace = await tx.workspace.create({
                data: {
                    name,
                    slug,
                    members: {
                        create: {
                            userId: owner.id,
                            role: "OWNER",
                        },
                    },
                },
                select: {
                    id: true,
                    slug: true,
                },
            })

            const addedCollaborators: string[] = []

            for (const email of collaboratorEmails) {
                const collaborator = existingCollaboratorMap.get(email)

                if (!collaborator) {
                    continue
                }

                await tx.workspaceMember.create({
                    data: {
                        userId: collaborator.id,
                        workspaceId: createdWorkspace.id,
                        role: "EDITOR",
                    },
                })

                await tx.activityLog.create({
                    data: {
                        type: "MEMBER_INVITED",
                        workspaceId: createdWorkspace.id,
                        userId: owner.id,
                        metadata: {
                            collaboratorEmail: collaborator.email,
                        },
                    },
                })

                addedCollaborators.push(collaborator.email)
            }

            return {
                ...createdWorkspace,
                addedCollaborators,
            }
        })

        const response: CreateWorkspaceResponse & { sendInvites: boolean } = {
            slug: workspace.slug,
            addedCollaborators: workspace.addedCollaborators,
            skippedCollaborators,
            sendInvites: parsedInput.data.sendInvites,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Create workspace failed:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
