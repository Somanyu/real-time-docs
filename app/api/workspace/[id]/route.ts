import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id: workspaceId } = await context.params

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        // the user must be the owner of the workspace
        const membership = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId
                }
            }
        })

        if (membership?.role !== "OWNER") {
            return NextResponse.json(
                { message: "Only workspace owner can delete" },
                { status: 403 }
            )
        }

        let newWorkspaceIdForCurrentUser: string | null = null

        await prisma.$transaction(async (tx) => {
            // find another workspace for this user

            const otherWorkspace = await tx.workspaceMember.findFirst({
                where: {
                    userId: user.id,
                    workspaceId: { not: workspaceId }
                },
                orderBy: { joinedAt: "asc" },
                select: {
                    workspace: {
                        select: {
                            slug: true
                        }
                    }
                }
            })

            newWorkspaceIdForCurrentUser = otherWorkspace?.workspace.slug ?? null

            // reset last visited workspace for affected users
            await tx.user.updateMany({
                where: {
                    lastVisitedWorkspaceId: workspaceId
                },
                data: {
                    lastVisitedWorkspaceId: newWorkspaceIdForCurrentUser
                }
            })

            // delete workspace (cascade)
            await tx.workspace.delete({
                where: { id: workspaceId }
            })

        })

        return NextResponse.json(
            {
                message: "Workspace deleted successfully",
                redirectWorkspaceId: newWorkspaceIdForCurrentUser
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error in deleting workspace", error)

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}