import { LIST_TYPES } from "@/constants/editor"
import type { CollaborationUser, RealtimeSocket } from "@/lib/websocket-client"
import { Descendant } from "slate"

export type AlignType = "left" | "center" | "right" | "justify"

export type MarkFormat = "bold" | "italic" | "underline" | "code" | "fontSize" | "color"

export type BlockFormat =
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "bulleted-list"
    | "numbered-list"
    | "list-item"

export interface SlateEditorProps {
    initialValue: Descendant[],
    documentId: string,
    socket?: RealtimeSocket | null
    currentUser?: CollaborationUser
}

export interface MarkButtonProps {
    format: MarkFormat
    icon: React.ReactNode
}

export type ListType = (typeof LIST_TYPES)[number]

export type SlateText = {
    text: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    code?: boolean
}

export type SlateElement = {
    type?: string
    children: SlateText[]
}

export type Option = {
    title: string
    text: string
}

export interface RewriteModalProps {
    title?: string
    open: boolean
    setOpen: (v: boolean) => void
    options: Option[]
    notes: string
    loading: boolean
    onChoose: (text: string) => void
    onRetry: () => void
}
