import { BlockFormat } from "@/types/editor-type"
import { useSlate } from "slate-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Editor, Transforms, Element as SlateElement } from "slate"

export const HeadingSelect = () => {
    const editor = useSlate()

    /**
     * Sets the block type (e.g., paragraph, heading, list-item)
     * for all block-level elements within the current selection.
     *
     * This updates the `type` property of matching element nodes.
     * Commonly used for heading toggles or converting paragraphs
     * into list items.
     *
     * @param {Editor} editor - The Slate editor instance.
     * @param {BlockFormat} format - The block type to apply.
     * @returns {void}
     */
    const setBlockType = (editor: Editor, format: BlockFormat): void => {
        Transforms.setNodes(
            editor,
            { type: format },
            {
                match: n =>
                    !Editor.isEditor(n) && SlateElement.isElement(n),
            }
        )
    }

    /**
     * Retrieves the block type of the first block-level element
     * within the current selection.
     *
     * If no matching element is found, it defaults to "paragraph".
     * Typically used to determine the active block type for
     * toolbar UI state (e.g., highlighting the active heading button).
     *
     * @param {Editor} editor - The Slate editor instance.
     * @returns {BlockFormat} The current block type, or "paragraph" if none is found.
     */
    const getCurrentBlock = (editor: Editor): BlockFormat => {
        const [match] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n),
        })

        return match ? (match[0] as SlateElement).type : "paragraph"
    }

    const currentType = getCurrentBlock(editor)

    const handleChange = (value: BlockFormat) => {
        setBlockType(editor, value)
    }

    return (
        <Select value={currentType} onValueChange={handleChange}>
            <SelectTrigger className="w-35 h-8 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
                <SelectItem value="paragraph">Normal text</SelectItem>
                <SelectItem value="heading-one">Heading 1</SelectItem>
                <SelectItem value="heading-two">Heading 2</SelectItem>
                <SelectItem value="heading-three">Heading 3</SelectItem>
            </SelectContent>
        </Select>
    )
}