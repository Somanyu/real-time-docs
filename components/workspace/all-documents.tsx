// import Link from "next/link"
// import { FileText } from "lucide-react"
// import { DocumentWithAuthor } from "@/types/document"

// export function AllDocuments({ documents, workspaceSlug }: Readonly<{ documents: DocumentWithAuthor[], workspaceSlug: string }>) {
//     return (
//         <div className="space-y-4">

//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-semibold">All Documents</h2>
//             </div>

//             <div className="rounded-lg border">

//                 <table className="w-full text-sm">
//                     <thead className="text-muted-foreground border-b">
//                         <tr>
//                             <th className="text-left p-4">Name</th>
//                             <th className="text-left p-4">Last Modified</th>
//                             <th className="text-left p-4">Author</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {documents.map((doc: DocumentWithAuthor) => (
//                             <tr key={doc.id} className="border-b hover:bg-muted/40">

//                                 <td className="p-4">
//                                     <Link
//                                         href={`/workspace/${workspaceSlug}/document/${doc.id}`}
//                                         className="flex items-center gap-2 font-medium"
//                                     >
//                                         <FileText className="h-4 w-4 text-muted-foreground" />
//                                         {doc.title}
//                                     </Link>
//                                 </td>

//                                 <td className="p-4 text-muted-foreground">
//                                     {doc.updatedAt.toDateString()}
//                                 </td>

//                                 <td className="p-4 text-muted-foreground">
//                                     {doc.createdBy.email}
//                                 </td>

//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//             </div>
//         </div>
//     )
// }


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
