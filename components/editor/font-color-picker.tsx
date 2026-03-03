import { FONT_COLORS } from "@/constants/editor"
import { CaseUpper } from "lucide-react"
import { useSlate } from "slate-react"
import { Button } from "../ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Editor } from "slate"

export const FontColorPicker = () => {
    const editor = useSlate()

    const getActiveFontColor = (editor: Editor) => {
        const marks = Editor.marks(editor)
        return marks?.color || "#000000"
    }

    const activeColor = getActiveFontColor(editor)

    const setFontColor = (editor: Editor, color: string) => {
        Editor.addMark(editor, "color", color)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center gap-0.5 h-8 w-8">
                    {/* Aa icon */}
                    <span className="text-base font-semibold leading-none"><CaseUpper size={10} /></span>

                    {/* Color indicator line */}
                    <span className="w-4 h-0.5 rounded-sm" style={{ backgroundColor: activeColor }} />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-40 p-2">
                <div className="grid grid-cols-5 gap-2">
                    {FONT_COLORS.map((color) => (
                        <button
                            key={color}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                setFontColor(editor, color)
                            }}
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
