import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { DocumentCollaborationShell } from "@/components/document/document-collaboration-shell"
import { Descendant } from "slate"

export default async function DocumentPage({ params }: { params: Promise<{ documentId: string }> }) {
    const { documentId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        notFound()
    }

    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            documentStars: {
                where: {
                    user: { email: session.user.email },
                },
            },
        },
    })

    const isStarred = document?.documentStars && document.documentStars.length > 0

    if (!document) {
        notFound()
    }

    const initialValue: Descendant[] =
        Array.isArray(document.content) &&
            document.content.length > 0
            ? (document.content as Descendant[])
            : [
                {
                    type: "paragraph",
                    children: [{ text: "" }],
                },
            ]

    return (
        <DocumentCollaborationShell
            documentId={document.id}
            initialValue={initialValue}
            initialTitle={document.title}
            updatedAt={document.updatedAt}
            isStarred={Boolean(isStarred)}
            currentUser={{
                email: session.user.email,
                name: session.user.name,
            }}
        />
    )
}
