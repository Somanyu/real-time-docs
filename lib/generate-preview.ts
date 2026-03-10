import { Descendant, Element, Text } from "slate"

const MAX_BLOCKS = 4
const MAX_TEXT_LENGTH = 180

export function generatePreview(content: Descendant[]): Descendant[] {
    const preview: Descendant[] = []

    let totalLength = 0

    for (const node of content) {
        if (preview.length >= MAX_BLOCKS) break

        if (!Element.isElement(node)) continue

        const trimmedChildren: Text[] = []

        for (const child of node.children) {
            if (!Text.isText(child)) continue

            const remaining = MAX_TEXT_LENGTH - totalLength
            if (remaining <= 0) break

            const text = child.text.slice(0, remaining)

            trimmedChildren.push({
                ...child,
                text
            })

            totalLength += text.length
        }

        preview.push({
            ...node,
            children: trimmedChildren
        })

        if (totalLength >= MAX_TEXT_LENGTH) break
    }

    return preview
}