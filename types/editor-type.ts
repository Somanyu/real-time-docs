import { LIST_TYPES } from "@/constants/editor"
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
}

export interface MarkButtonProps {
    format: MarkFormat
    icon: React.ReactNode
}

export type ListType = (typeof LIST_TYPES)[number]
