import { MarkButtonProps, MarkFormat } from "@/types/editor-type"
import { useSlate } from "slate-react"
import { Button } from "../ui/button"
import { Editor } from "slate"

export const MarkButton = ({ format, icon }: MarkButtonProps) => {
    const editor = useSlate()

    const isMarkActive = (editor: Editor, format: MarkFormat) => {
        const marks = Editor.marks(editor)
        return marks ? marks[format] === true : false
    }

    const toggleMark = (editor: Editor, format: MarkFormat) => {
        const isActive = isMarkActive(editor, format)
        if (isActive) Editor.removeMark(editor, format)
        else Editor.addMark(editor, format, true)
    }

    return (
        <Button
            variant={isMarkActive(editor, format) ? "secondary" : "ghost"}
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                toggleMark(editor, format)
            }}
        >
            {icon}
        </Button>
    )
}