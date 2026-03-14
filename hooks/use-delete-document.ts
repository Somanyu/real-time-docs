"use client"

import { useState } from "react"
import { deleteDocument } from "@/server/document/delete-document"
import { toast } from "sonner"

export function useDeleteDocument() {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (documentId: string) => {
        try {
            setIsDeleting(true)

            const res = await deleteDocument(documentId)

            if (res.success) {
                toast.success("Document deleted")
            }

        } catch {
            toast.error("Failed to delete document")
        } finally {
            setIsDeleting(false)
        }
    }

    return { handleDelete, isDeleting }
}