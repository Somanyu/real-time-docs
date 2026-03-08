import React from "react"
import { RenderElementProps } from "slate-react"

export const BlockElement = React.memo((props: RenderElementProps) => {
    const { element } = props

    const style = {
        textAlign: element.align || "left",
    }

    switch (element.type) {
        case "heading-one":
            return (
                <h1 {...props.attributes} style={style} className="text-4xl font-bold my-6">
                    {props.children}
                </h1>
            )

        case "heading-two":
            return (
                <h2 {...props.attributes} style={style} className="text-3xl font-semibold my-5">
                    {props.children}
                </h2>
            )

        case "heading-three":
            return (
                <h3 {...props.attributes} style={style} className="text-2xl font-semibold my-4">
                    {props.children}
                </h3>
            )

        case "bulleted-list":
            return (
                <ul {...props.attributes} className="list-disc pl-6 my-2">
                    {props.children}
                </ul>
            )

        case "numbered-list":
            return (
                <ol {...props.attributes} className="list-decimal pl-6 my-2">
                    {props.children}
                </ol>
            )

        case "list-item":
            return (
                <li {...props.attributes} className="my-1">
                    {props.children}
                </li>
            )

        default:
            return (
                <p {...props.attributes} style={style} className="text-base my-2">
                    {props.children}
                </p>
            )
    }
})

BlockElement.displayName = "BlockElement"