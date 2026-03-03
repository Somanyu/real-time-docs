"use client"

import { useCallback, useMemo, useState } from "react"
import { createEditor, Descendant, Editor } from "slate"
import { Slate, Editable, withReact, useSlate, RenderElementProps, RenderLeafProps } from "slate-react"
import { withHistory } from "slate-history"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, Code, AlignCenter, AlignJustify, AlignLeft, AlignRight, List, ListOrdered } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { MarkButtonProps, MarkFormat, SlateEditorProps } from "@/types/editor-type"
import { BASE_HEIGHT, BASE_WIDTH, ZOOM_LEVELS } from "@/constants/editor"
import { AlignButton } from "./align-button"
import { FontColorPicker } from "./font-color-picker"
import { FontSizeSelect } from "./font-size-select"
import { HeadingSelect } from "./heading-select"
import { UndoButton } from "./undo-button"
import { RedoButton } from "./redo-button"
import { BlockButton } from "./block-button"


/* ======================== */
/* MARK HELPERS */
/* ======================== */



const isMarkActive = (editor: Editor, format: MarkFormat) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const toggleMark = (editor: Editor, format: MarkFormat) => {
    const isActive = isMarkActive(editor, format)
    if (isActive) Editor.removeMark(editor, format)
    else Editor.addMark(editor, format, true)
}

/* ======================== */
/* BLOCK HELPERS */
/* ======================== */



/* ======================== */
/* TOOLBAR BUTTONS */
/* ======================== */

const MarkButton = ({ format, icon }: MarkButtonProps) => {
    const editor = useSlate()

    return (
        <Button
            variant={isMarkActive(editor, format) ? "secondary" : "ghost"}
            size="icon"
            onMouseDown={(e) => {
                e.preventDefault()
                toggleMark(editor, format)
            }}
        >
            {icon}
        </Button>
    )
}


/* ======================== */
/* MAIN EDITOR */
/* ======================== */

export function SlateEditor({ initialValue }: Readonly<SlateEditorProps>) {
    const editor = useMemo(
        () => withHistory(withReact(createEditor())),
        []
    )

    const [value, setValue] = useState<Descendant[]>(initialValue)
    const [zoom, setZoom] = useState<number>(100)

    const renderElement = useCallback((props: RenderElementProps) => {
        const { element } = props
        const style = {
            textAlign: element.align || "left",
        }
        switch (props.element.type) {
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
    }, [])

    const renderLeaf = useCallback((props: RenderLeafProps) => {
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
    }, [])

    return (
        <Slate editor={editor} initialValue={value} onChange={setValue}>

            {/* TOOLBAR */}
            <div className="flex justify-center pt-6 pb-4">
                <div className="bg-background border shadow-md rounded-xl px-3 py-2 flex items-center gap-2">

                    <Select value={String(zoom)} onValueChange={(val) => setZoom(Number(val))}>
                        <SelectTrigger className="w-22.5 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {ZOOM_LEVELS.map((level) => (
                                <SelectItem key={level} value={String(level)}>{level}%</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <HeadingSelect />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <FontSizeSelect />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} />
                    <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} />
                    <MarkButton format="underline" icon={<Underline className="w-4 h-4" />} />
                    <FontColorPicker />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <AlignButton format="left" icon={<AlignLeft className="w-4 h-4" />} />
                    <AlignButton format="center" icon={<AlignCenter className="w-4 h-4" />} />
                    <AlignButton format="right" icon={<AlignRight className="w-4 h-4" />} />
                    <AlignButton format="justify" icon={<AlignJustify className="w-4 h-4" />} />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <BlockButton format="bulleted-list" icon={<List className="w-4 h-4" />} />
                    <BlockButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <MarkButton format="code" icon={<Code className="w-4 h-4" />} />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <UndoButton />
                    <RedoButton />

                </div>
            </div>


            {/* PAGE BACKGROUND */}
            <div className="flex justify-center pb-24">
                <div
                    style={{
                        height: `${(BASE_HEIGHT * zoom) / 100}px`,
                    }}
                    className="relative w-full"
                >
                    <div
                        style={{
                            width: BASE_WIDTH,
                            minHeight: BASE_HEIGHT,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: "top center",
                        }}
                        className="absolute left-1/2 -translate-x-1/2 bg-white shadow border px-20 py-24"
                    >
                        <Editable
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            placeholder="Start writing..."
                            className="outline-none text-[16px] leading-7 w-full"
                        />
                    </div>
                </div>
            </div>

        </Slate>
    )
}
