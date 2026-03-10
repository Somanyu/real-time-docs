import { SlateElement, SlateText } from "@/types/editor-type"

function renderLeaf(leaf: SlateText, key: number) {
    let el: React.ReactNode = leaf.text

    if (leaf.bold) el = <strong>{el}</strong>
    if (leaf.italic) el = <em>{el}</em>
    if (leaf.underline) el = <u>{el}</u>
    if (leaf.code) el = <code className="bg-muted px-1 rounded">{el}</code>

    return <span key={key}>{el}</span>
}

function renderChildren(children: SlateText[]) {
    return children.map((leaf, i) => renderLeaf(leaf, i))
}

export function DocumentPreview({ content }: Readonly<{ content: SlateElement[] }>) {
    if (!content) return null

    return (
        <div className="text-[11px] leading-relaxed text-muted-foreground pointer-events-none scale-50">
            {content.slice(0, 6).map((node, i) => {
                const children = renderChildren(node.children)

                switch (node.type) {

                    case "heading-one":
                        return (
                            <h1 key={i + 1} className="text-4xl font-bold my-6">
                                {children}
                            </h1>
                        )

                    case "heading-two":
                        return (
                            <h2 key={i + 1} className="text-3xl font-semibold my-5">
                                {children}
                            </h2>
                        )

                    case "heading-three":
                        return (
                            <h3 key={i + 1} className="text-2xl font-semibold my-4">
                                {children}
                            </h3>
                        )


                    case "list-item":
                        return (
                            <li key={i + 1} className="ml-4 list-disc">
                                {children}
                            </li>
                        )

                    case "code":
                        return (
                            <pre key={i + 1} className="bg-muted p-2 rounded font-mono">
                                {children}
                            </pre>
                        )

                    default:
                        return (
                            <p key={i + 1} className="line-clamp-2">
                                {children}
                            </p>
                        )
                }
            })}
        </div>
    )
}