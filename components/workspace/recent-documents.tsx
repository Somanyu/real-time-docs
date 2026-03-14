"use client"

import { FileText, Trash, Archive, MoreVertical } from "lucide-react"
import { Document } from "@/app/generated/prisma/client"
import getRelativeTime from "@/lib/get-relative-time"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { SparklesIcon, SparklesIconHandle } from "../ui/sparkles-icon"
import { useRef, useState } from "react"
import { AISummaryModal } from "./ai-summary-modal"
import { DocumentPreview } from "../editor/document-preview"
import { DeleteDocumentDialog } from "../document/delete-document-dialog"
import { SlateElement } from "@/types/editor-type"

export function RecentDocuments({ documents }: Readonly<{ documents: Document[] }>) {

    const [summaryOpen, setSummaryOpen] = useState<boolean>(false)
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<{ id: string, title: string } | null>(null)

    const sparkleRef = useRef<SparklesIconHandle>(null)

    const handleSummarize = (docId: string) => {
        setSelectedDocId(docId)
        setSummaryOpen(true)
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Recent Documents</h2>
                <p className="text-sm text-muted-foreground">
                    Pick up where you left off
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {documents.map((doc: Document) => (
                    <a key={doc.id} href={`/document/${doc.id}`} target="_blank" rel="noopener noreferrer" className="group rounded-xl border hover:shadow-sm transition block">

                        {doc.preview && (doc.preview as SlateElement[]).length > 0 ? (
                            <div className="aspect-4/3 flex items-center justify-center p-2 overflow-hidden scale-[0.75]!" style={{ scale: "0.75" }}>
                                <div className="h-full w-full origin-top-left">
                                    <DocumentPreview content={doc.preview as SlateElement[]} />
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-4/3 bg-orange-100 rounded-t-xl flex items-center justify-center p-2">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}

                        <div className="p-4 space-y-4 border-t">
                            <p className="font-medium line-clamp-1">{doc.title}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-x-2">
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback>{doc.createdById.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    <p className="text-xs text-muted-foreground">
                                        Edited {getRelativeTime(doc.updatedAt)}
                                    </p>
                                </div>

                                <HoverCard openDelay={100}>
                                    <HoverCardTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </HoverCardTrigger>

                                    <HoverCardContent className="w-40 p-2" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex flex-col gap-1">
                                            <Button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSummarize(doc.id) }} variant="ghost" className="justify-start gap-2" onMouseEnter={() => sparkleRef.current?.startAnimation()} onMouseLeave={() => sparkleRef.current?.stopAnimation()}>
                                                <SparklesIcon ref={sparkleRef} className="h-4 w-4 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
                                                Summarise
                                            </Button>

                                            <Button variant="ghost" className="justify-start gap-2">
                                                <Archive className="h-4 w-4" />
                                                Archive
                                            </Button>

                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDocumentToDelete({
                                                        id: doc.id,
                                                        title: doc.title
                                                    })
                                                }}
                                                variant="ghost" className="justify-start gap-2 text-red-500">
                                                <Trash className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <AISummaryModal open={summaryOpen} onOpenChange={setSummaryOpen} documentId={selectedDocId} />
            <DeleteDocumentDialog document={documentToDelete} onClose={() => setDocumentToDelete(null)} />
        </div>
    )
}