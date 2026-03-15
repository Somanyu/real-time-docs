"use client"

import { useState } from "react"
import { deleteDocument } from "@/server/document/delete-document"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function useDeleteDocument() {
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    const router = useRouter()

    const handleDelete = async (documentId: string) => {
        try {
            setIsDeleting(true)

            const res = await deleteDocument(documentId)

            if (res.success) {
                toast.success("Document deleted")
                router.refresh()
            }

        } catch {
            toast.error("Failed to delete document")
        } finally {
            setIsDeleting(false)
        }
    }

    return { handleDelete, isDeleting }
}