import { useSlate } from "slate-react"
import { Button } from "../ui/button"
import { Redo2 } from "lucide-react"

export const RedoButton = () => {
    const editor = useSlate()

    return (
        <Button
            variant="ghost"
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                editor.redo()
            }}
        >
            <Redo2 className="w-4 h-4" />
        </Button>
    )
}