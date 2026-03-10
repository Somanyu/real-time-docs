"use client"

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

import { Trash2Icon } from "lucide-react"
import { useDeleteDocument } from "@/hooks/use-delete-document"
import { DeleteDocumentDialogProps } from "@/types/document"

export function DeleteDocumentDialog({ document, onClose }: Readonly<DeleteDocumentDialogProps>) {
    const { handleDelete, isDeleting } = useDeleteDocument()

    if (!document) return null

    const onDelete = async () => {
        await handleDelete(document.id)
        onClose()
    }

    return (
        <AlertDialog open={!!document} onOpenChange={onClose}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <div className="bg-destructive/10 text-destructive p-2 rounded-md w-fit">
                        <Trash2Icon className="h-5 w-5" />
                    </div>
                    <AlertDialogTitle>Delete {document.title}?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this document. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={onDelete}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}