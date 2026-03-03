"use client"

import { useCallback, useMemo, useState } from "react"
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement } from "slate"
import { Slate, Editable, withReact, useSlate, RenderElementProps, RenderLeafProps } from "slate-react"
import { withHistory } from "slate-history"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, Code, Undo2, Redo2, CaseUpper, AlignCenter, AlignJustify, AlignLeft, AlignRight, List, ListOrdered } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { AlignType, BlockFormat, ListType, MarkButtonProps, MarkFormat, SlateEditorProps } from "@/types/editor-type"
import { BASE_HEIGHT, BASE_WIDTH, FONT_COLORS, FONT_SIZES, LIST_TYPES, ZOOM_LEVELS } from "@/constants/editor"


/* ======================== */
/* MARK HELPERS */
/* ======================== */

const BlockButton = ({ format, icon }: { format: BlockFormat, icon: React.ReactNode }) => {
    const editor = useSlate()

    const active = isBlockActive(editor, format)

    return (
        <Button variant={active ? "secondary" : "ghost"} size="icon" onMouseDown={(event) => { event.preventDefault(); toggleBlock(editor, format) }}>
            {icon}
        </Button>
    )
}

const isMarkActive = (editor: Editor, format: MarkFormat) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

const toggleMark = (editor: Editor, format: MarkFormat) => {
    const isActive = isMarkActive(editor, format)
    if (isActive) Editor.removeMark(editor, format)
    else Editor.addMark(editor, format, true)
}

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

/* ======================== */
/* BLOCK HELPERS */
/* ======================== */

const isBlockActive = (editor: Editor, format: BlockFormat) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
    })
    return !!match
}

const setBlockType = (editor: Editor, format: BlockFormat) => {
    Transforms.setNodes(
        editor,
        { type: format },
        {
            match: n =>
                !Editor.isEditor(n) && SlateElement.isElement(n),
        }
    )
}

const getCurrentBlock = (editor: Editor) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n),
    })

    return match ? (match[0] as SlateElement).type : "paragraph"
}

const isAlignActive = (editor: Editor, format: AlignType) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.align === format,
    })

    return !!match
}

const setAlignment = (editor: Editor, format: AlignType) => {
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

const setFontSize = (editor: Editor, size: string) => {
    Editor.addMark(editor, "fontSize", size)
}

const getActiveFontSize = (editor: Editor) => {
    const marks = Editor.marks(editor)
    return marks?.fontSize || "16"
}

const setFontColor = (editor: Editor, color: string) => {
    Editor.addMark(editor, "color", color)
}

const getActiveFontColor = (editor: Editor) => {
    const marks = Editor.marks(editor)
    return marks?.color || "#000000"
}

const UndoButton = () => {
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

const RedoButton = () => {
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

const HeadingSelect = () => {
    const editor = useSlate()

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

const FontSizeSelect = () => {
    const editor = useSlate()

    const currentSize = getActiveFontSize(editor)

    return (
        <Select
            value={String(currentSize)}
            onValueChange={(value) => {
                setFontSize(editor, value)
            }}
        >
            <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper">
                {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                        {size}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

const FontColorPicker = () => {
    const editor = useSlate()
    const activeColor = getActiveFontColor(editor)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex flex-col items-center justify-center gap-0.5 h-8 w-8"
                >
                    {/* Aa icon */}
                    <span className="text-base font-semibold leading-none">
                        <CaseUpper size={10} />
                    </span>

                    {/* Color indicator line */}
                    <span
                        className="w-4 h-0.5 rounded-sm"
                        style={{ backgroundColor: activeColor }}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-40 p-2">
                <div className="grid grid-cols-5 gap-2">
                    {FONT_COLORS.map((color) => (
                        <button
                            key={color}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                setFontColor(editor, color)
                            }}
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

const AlignButton = ({ format, icon }: { format: AlignType, icon: React.ReactNode }) => {
    const editor = useSlate()

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