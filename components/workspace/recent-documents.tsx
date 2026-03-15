"use client"

import { FileText, Trash, Archive, MoreVertical } from "lucide-react"
import getRelativeTime from "@/lib/get-relative-time"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { useState } from "react"
import { AISummaryModal } from "./ai-summary-modal"
import { DocumentPreview } from "../editor/document-preview"
import { DeleteDocumentDialog } from "../document/delete-document-dialog"
import { SlateElement } from "@/types/editor-type"
import { DocumentWithAuthor } from "@/types/document"
import { useToggleDocumentArchive } from "@/hooks/use-toggle-document-archive"
import { MenuActionLabel } from "../document/menu-action-label"
import { SummariseActionLabel } from "../document/summarise-action-label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

export function RecentDocuments({ documents }: Readonly<{ documents: DocumentWithAuthor[] }>) {

    const [summaryOpen, setSummaryOpen] = useState<boolean>(false)
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<{ id: string, title: string } | null>(null)
    const { isUpdating, toggleArchive } = useToggleDocumentArchive()

    /**
     * Opens the AI summary modal for the selected recent document.
     */
    const handleSummarize = (docId: string) => {
        setSelectedDocId(docId)
        setSummaryOpen(true)
    }

    /**
     * Opens the selected document in a new tab from the recent documents grid.
     */
    const handleOpenDocument = (documentId: string) => {
        window.open(`/document/${documentId}`, "_blank", "noopener,noreferrer")
    }

    /**
     * Opens the selected document when the user presses Enter or Space on the card.
     */
    const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, documentId: string) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return
        }

        event.preventDefault()
        handleOpenDocument(documentId)
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
                {documents.map((doc: DocumentWithAuthor) => (
                    <div
                        key={doc.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => handleOpenDocument(doc.id)}
                        onKeyDown={(event) => handleCardKeyDown(event, doc.id)}
                        className="group block cursor-pointer rounded-xl border transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >

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
                                        <AvatarFallback>{doc.createdBy.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    <p className="text-xs text-muted-foreground">
                                        Edited {getRelativeTime(doc.updatedAt)}
                                    </p>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                                        <DropdownMenuItem onClick={() => handleSummarize(doc.id)}>
                                            <SummariseActionLabel className="flex items-center gap-2" />
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            disabled={isUpdating}
                                            onClick={async () => {
                                                await toggleArchive({
                                                    documentId: doc.id,
                                                    archived: true,
                                                })
                                            }}
                                        >
                                            <MenuActionLabel
                                                className="flex items-center gap-2"
                                                icon={Archive}
                                                iconClassName="h-4 w-4 text-muted-foreground"
                                                label={isUpdating ? "Archiving..." : "Archive"}
                                            />
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="text-red-500"
                                            onClick={() => {
                                                setDocumentToDelete({
                                                    id: doc.id,
                                                    title: doc.title
                                                })
                                            }}
                                        >
                                            <MenuActionLabel
                                                className="flex items-center gap-2"
                                                icon={Trash}
                                                iconClassName="h-4 w-4 text-red-500"
                                                label="Delete"
                                            />
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AISummaryModal open={summaryOpen} onOpenChange={setSummaryOpen} documentId={selectedDocId} />
            <DeleteDocumentDialog document={documentToDelete} onClose={() => setDocumentToDelete(null)} />
        </div>
    )
}
