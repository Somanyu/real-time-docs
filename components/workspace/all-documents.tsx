"use client"

import { DocumentWithAuthor } from "@/types/document"
import { DataTable } from "../document/data-table"
import { columns } from "../document/columns"
import { Input } from "../ui/input"
import { useState } from "react"
import { DeleteDocumentDialog } from "../document/delete-document-dialog"

export function AllDocuments({
    documents,
    title = "All Documents",
}: Readonly<{ documents: DocumentWithAuthor[], title?: string }>) {

    const [search, setSearch] = useState<string>("")
    const [documentToDelete, setDocumentToDelete] = useState<DocumentWithAuthor | null>(null)

    const filteredDocs = documents.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase())
    )

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
                    <DataTable columns={columns(setDocumentToDelete)} data={filteredDocs} />
                </div>

            </div>

            {documentToDelete && (
                <DeleteDocumentDialog document={documentToDelete} onClose={() => setDocumentToDelete(null)} />
            )}
        </>
    )
}
