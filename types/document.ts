import { Prisma } from "@/app/generated/prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { LucideIcon } from "lucide-react"

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

export type ArchiveRequestBody = {
    archived?: boolean
}

export type ToggleArchiveOptions = {
    documentId: string
    archived: boolean
}

export type DocumentColumnsOptions = {
    archiveActionLabel: "Archive" | "Restore"
    isArchiveUpdating: boolean
    onToggleArchive: (doc: DocumentWithAuthor) => Promise<void>
    onSummarize: (documentId: string) => void
    setDocumentToDelete: (doc: DocumentWithAuthor) => void
}

export type AllDocumentsProps = {
    documents: DocumentWithAuthor[]
    title?: string
    archiveActionLabel?: "Archive" | "Restore"
}

export type MenuActionLabelProps = {
    className?: string
    icon: LucideIcon
    iconClassName?: string
    label: string
}

export type SummariseActionLabelProps = {
    className?: string
}
