import { BaseEditor } from "slate"
import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"

export type CustomText = {
    text: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    code?: boolean
    fontSize?: string
    color?: string
}

export type CustomElement = {
    type:
    | "paragraph"
    | "heading-one"
    | "heading-two"
    | "heading-three"
    | "bulleted-list"
    | "numbered-list"
    | "list-item"
    // | "link"
    align?: "left" | "center" | "right" | "justify"
    url?: string
    children: CustomText[]
}

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor
        Element: CustomElement
        Text: CustomText
    }
}