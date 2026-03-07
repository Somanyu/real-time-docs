import Link from "next/link"
import { FileText } from "lucide-react"
import { Document } from "@/app/generated/prisma/client"

export function AllDocuments({ documents, workspaceSlug }: Readonly<{ documents: Document[], workspaceSlug: string }>) {
    return (
        <div className="space-y-4">

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All Documents</h2>
            </div>

            <div className="rounded-lg border">

                <table className="w-full text-sm">
                    <thead className="text-muted-foreground border-b">
                        <tr>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Last Modified</th>
                            <th className="text-left p-4">Author</th>
                        </tr>
                    </thead>

                    <tbody>
                        {documents.map((doc: Document) => (
                            <tr key={doc.id} className="border-b hover:bg-muted/40">

                                <td className="p-4">
                                    <Link
                                        href={`/workspace/${workspaceSlug}/document/${doc.id}`}
                                        className="flex items-center gap-2 font-medium"
                                    >
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {doc.title}
                                    </Link>
                                </td>

                                <td className="p-4 text-muted-foreground">
                                    {doc.updatedAt.toDateString()}
                                </td>

                                <td className="p-4 text-muted-foreground">
                                    {doc.createdById}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}