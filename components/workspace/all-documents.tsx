"use client"

import { AISummaryModal } from "./ai-summary-modal"
import { DataTable } from "../document/data-table"
import { columns } from "../document/columns"
import { Input } from "../ui/input"
import { useState } from "react"
import { DeleteDocumentDialog } from "../document/delete-document-dialog"
import { useToggleDocumentArchive } from "@/hooks/use-toggle-document-archive"
import { AllDocumentsProps, DocumentWithAuthor } from "@/types/document"

export function AllDocuments({
    documents,
    title = "All Documents",
    archiveActionLabel = "Archive",
}: Readonly<AllDocumentsProps>) {

    const [search, setSearch] = useState<string>("")
    const [documentToDelete, setDocumentToDelete] = useState<DocumentWithAuthor | null>(null)
    const [summaryOpen, setSummaryOpen] = useState<boolean>(false)
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
    const { isUpdating, toggleArchive } = useToggleDocumentArchive()

    const filteredDocs = documents.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase())
    )

    /**
     * Opens the shared AI summary modal for the selected document.
     */
    const handleSummarize = (documentId: string) => {
        setSelectedDocId(documentId)
        setSummaryOpen(true)
    }

    return (
        <>
            <div className="space-y-4">

                {/* Header row */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-65 h-9" />
                </div>

                {/* Table */}
                <div className="">
                    <DataTable
                        columns={columns({
                            archiveActionLabel,
                            isArchiveUpdating: isUpdating,
                            onToggleArchive: async (doc) => {
                                await toggleArchive({
                                    documentId: doc.id,
                                    archived: !doc.isArchived,
                                })
                            },
                            onSummarize: handleSummarize,
                            setDocumentToDelete,
                        })}
                        data={filteredDocs}
                    />
                </div>

            </div>

            {documentToDelete && (
                <DeleteDocumentDialog document={documentToDelete} onClose={() => setDocumentToDelete(null)} />
            )}
            <AISummaryModal open={summaryOpen} onOpenChange={setSummaryOpen} documentId={selectedDocId} />
        </>
    )
}
