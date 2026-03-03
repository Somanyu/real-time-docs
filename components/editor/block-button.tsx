import { BlockFormat, ListType } from "@/types/editor-type";
import { useSlate } from "slate-react";
import { Button } from "../ui/button";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { LIST_TYPES } from "@/constants/editor";

export const BlockButton = ({ format, icon }: { format: BlockFormat, icon: React.ReactNode }) => {
    const editor = useSlate()

    const isBlockActive = (editor: Editor, format: BlockFormat) => {
        const [match] = Editor.nodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === format,
        })
        return !!match
    }

    const active = isBlockActive(editor, format)

    const toggleBlock = (editor: Editor, format: BlockFormat) => {
        const isList = (LIST_TYPES as readonly string[]).includes(format)

        const isActive = isBlockActive(editor, format)

        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type as ListType),
            split: true,
        })

        let newType: BlockFormat

        if (isActive) {
            newType = "paragraph"
        } else if (isList) {
            newType = "list-item"
        } else {
            newType = format
        }

        Transforms.setNodes(editor, {
            type: newType,
        })

        if (!isActive && isList) {
            const block = {
                type: format,
                children: [],
            }

            Transforms.wrapNodes(editor, block)
        }
    }

    return (
        <Button variant={active ? "secondary" : "ghost"} size="icon" onMouseDown={(event) => { event.preventDefault(); toggleBlock(editor, format) }}>
            {icon}
        </Button>
    )
}