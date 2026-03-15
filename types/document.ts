import { Prisma } from "@/app/generated/prisma/client"
import { ColumnDef } from "@tanstack/react-table"

export interface DocumentTitleProps {
    documentId: string,
    initialTitle: string,
    updatedAt: Date,
    isStarred: boolean
}

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline"

export interface DocumentSaveState {
    status: SaveStatus
    isOnline: boolean
    setStatus: (status: SaveStatus) => void
    setOnline: (value: boolean) => void
}

export type DeleteDocumentDialogProps = {
    document: {
        id: string
        title: string
    } | null
    onClose: () => void
}

export type DocumentWithAuthor = Prisma.DocumentGetPayload<{
    include: {
        createdBy: {
            select: { email: true }
        }
    }
}>

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}