import { AlignType } from "@/types/editor-type"
import { useSlate } from "slate-react"
import { Button } from "../ui/button"
import { Editor, Transforms, Element as SlateElement } from "slate"

export const AlignButton = ({ format, icon }: { format: AlignType, icon: React.ReactNode }) => {
    const editor = useSlate()

    /**
     * Checks whether the current selection contains a block
     * with the given alignment format.
     *
     * It searches through the editor nodes at the current selection
     * and returns true if any element node has `align === format`.
     *
     * @param {Editor} editor - The Slate editor instance.
     * @param {AlignType} format - The alignment to check ("left" | "center" | "right" | "justify").
     * @returns {boolean} True if the alignment is active in the current selection, otherwise false.
     */
    const isAlignActive = (editor: Editor, format: AlignType): boolean => {
        const [match] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.align === format,
        })

        return !!match
    }

    /**
     * Sets the alignment of all selected block-level elements
     * in the editor to the specified format.
     *
     * This updates the `align` property of matching element nodes
     * without affecting text nodes.
     *
     * @param {Editor} editor - The Slate editor instance.
     * @param {AlignType} format - The alignment to apply ("left" | "center" | "right" | "justify").
     * @returns {void}
     */
    const setAlignment = (editor: Editor, format: AlignType): void => {
        Transforms.setNodes(
            editor,
            { align: format },
            {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n),
            }
        )
    }

    return (
        <Button
            variant={isAlignActive(editor, format) ? "secondary" : "ghost"}
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                setAlignment(editor, format)
            }}
        >
            {icon}
        </Button>
    )
}
