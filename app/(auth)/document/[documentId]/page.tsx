import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Star } from "lucide-react"
import { SlateEditor } from "@/components/editor/slate-editor"
import { Descendant } from "slate"

export default async function DocumentPage({ params }: { params: Promise<{ documentId: string }> }) {
    const { documentId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        notFound()
    }

    const document = await prisma.document.findUnique({
        where: { id: documentId },
    })

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
        <div className="flex h-screen w-screen overflow-hidden bg-muted/40">
            {/* MAIN CONTENT */}
            <div className="flex flex-col flex-1 relative">

                {/* ===================== */}
                {/* TOP NAVBAR */}
                {/* ===================== */}
                <div className="h-14 px-4 md:px-6 border-b bg-background flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            D
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate flex items-center gap-x-1.5">
                                <span>
                                    {document.title}
                                </span>
                                <button><Star size={13} /></button>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Last edited 2 mins ago
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-stretch gap-3">

                        {/* Presence Avatars */}
                        <div className="hidden sm:flex -space-x-2">
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback>MK</AvatarFallback>
                            </Avatar>
                            <div className="w-8 h-8 rounded-full bg-muted text-xs flex items-center justify-center border">
                                +3
                            </div>
                        </div>

                        <Button size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* ===================== */}
                {/* DOCUMENT BODY */}
                {/* ===================== */}
                <div className="flex-1 relative overflow-auto">
                    <div className="absolute inset-0 overflow-auto">
                        <div className="w-full mx-auto px-4 md:px-8 pb-32">
                            <SlateEditor
                                initialValue={initialValue}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}