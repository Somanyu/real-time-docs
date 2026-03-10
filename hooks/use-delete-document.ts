"use client"

import { useState } from "react"
import { toast } from "sonner"
import { deleteDocument } from "@/server/document/delete-document"

export function useDeleteDocument() {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (documentId: string) => {
        try {
            setIsDeleting(true)

            const res = await deleteDocument(documentId)

            if (!res.success) {
                toast.warning("Cannot delete document.")
            }

            toast.success("Document deleted")
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete document")
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        handleDelete,
        isDeleting
    }
}