import { Undo2 } from "lucide-react"
import { useSlate } from "slate-react"
import { Button } from "../ui/button"

export const UndoButton = () => {
    const editor = useSlate()

    return (
        <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                editor.undo()
            }}
        >
            <Undo2 className="w-4 h-4" />
        </Button>
    )
}