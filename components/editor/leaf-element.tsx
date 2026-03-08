import React from "react"
import { RenderLeafProps } from "slate-react"

export const Leaf = React.memo((props: RenderLeafProps) => {
    let { children } = props

    if (props.leaf.bold) children = <strong>{children}</strong>
    if (props.leaf.italic) children = <em>{children}</em>
    if (props.leaf.underline) children = <u>{children}</u>
    if (props.leaf.code) children = <code>{children}</code>

    return (
        <span
            {...props.attributes}
            style={{
                fontSize: props.leaf.fontSize
                    ? `${props.leaf.fontSize}px`
                    : undefined,
                color: props.leaf.color || undefined,
            }}
        >
            {children}
        </span>
    )
})

Leaf.displayName = "Leaf"