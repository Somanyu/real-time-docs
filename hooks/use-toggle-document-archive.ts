"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ToggleArchiveOptions } from "@/types/document"

export function useToggleDocumentArchive() {
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const router = useRouter()

    const toggleArchive = async ({ documentId, archived }: ToggleArchiveOptions) => {
        try {
            setIsUpdating(true)

            const response = await fetch(`/api/document/${documentId}/archive`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ archived }),
            })

            if (!response.ok) {
                throw new Error("Failed to update archive state")
            }

            toast.success(archived ? "Document archived" : "Document restored")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error(archived ? "Failed to archive document" : "Failed to restore document")
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        isUpdating,
        toggleArchive,
    }
}
