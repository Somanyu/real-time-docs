import { FONT_SIZES } from "@/constants/editor"
import { useSlate } from "slate-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Editor } from "slate"

export const FontSizeSelect = () => {
    const editor = useSlate()

    const getActiveFontSize = (editor: Editor) => {
        const marks = Editor.marks(editor)
        return marks?.fontSize || "16"
    }

    const setFontSize = (editor: Editor, size: string) => {
        Editor.addMark(editor, "fontSize", size)
    }

    const currentSize = getActiveFontSize(editor)

    return (
        <Select
            value={String(currentSize)}
            onValueChange={(value) => {
                setFontSize(editor, value)
            }}
        >
            <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
                {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                        {size}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}