"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createEditor, Descendant, Editor, Node, NodeEntry, Operation, Range, Transforms } from "slate"
import { Editable, ReactEditor, RenderElementProps, RenderLeafProps, Slate, withReact } from "slate-react"
import { withHistory } from "slate-history"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, Code, AlignCenter, AlignJustify, AlignLeft, AlignRight, List, ListOrdered, SpellCheck, PencilLine } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { SlateEditorProps } from "@/types/editor-type"
import { BASE_HEIGHT, BASE_WIDTH, ZOOM_LEVELS } from "@/constants/editor"
import { AlignButton } from "./align-button"
import { FontColorPicker } from "./font-color-picker"
import { FontSizeSelect } from "./font-size-select"
import { HeadingSelect } from "./heading-select"
import { UndoButton } from "./undo-button"
import { RedoButton } from "./redo-button"
import { BlockButton } from "./block-button"
import { MarkButton } from "./mark-button"
import { useDocumentSaveStore } from "@/store/document-save-store"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useDocumentAutosave } from "@/hooks/use-document-autosave"
import { BlockElement } from "./block-element"
import { Leaf } from "./leaf-element"
import { Button } from "../ui/button"
import { RewriteModal } from "./rewrite-modal"
import { useAIRewrite } from "@/hooks/use-ai-rewrite"
import { useAIGrammar } from "@/hooks/use-ai-grammar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { RemoteCursor } from "@/lib/websocket-client"

type CursorOverlay = {
    socketId: string
    name: string
    color: string
    left: number
    top: number
    height: number
}

const CURSOR_IDLE_MS = Number(process.env.NEXT_PUBLIC_CURSOR_IDLE_MS ?? 3000)

/* ======================== */
/* MAIN EDITOR */
/* ======================== */

export function SlateEditor({ initialValue, documentId, socket, currentUser }: Readonly<SlateEditorProps>) {
    const editor = useMemo(
        () => withHistory(withReact(createEditor())),
        []
    )

    const [value, setValue] = useState<Descendant[]>(initialValue)
    const [zoom, setZoom] = useState<number>(100)
    const [stats, setStats] = useState({ words: 0, characters: 0 })
    const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({})
    const [cursorOverlays, setCursorOverlays] = useState<CursorOverlay[]>([])
    const isApplyingRemoteRef = useRef(false)
    const latestValueRef = useRef<Descendant[]>(initialValue)
    const skipAutosaveRef = useRef(false)
    const remoteCursorsRef = useRef<Record<string, RemoteCursor>>({})
    const selectionBroadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastBroadcastSelectionRef = useRef<Range | null>(null)
    const editableContainerRef = useRef<HTMLDivElement | null>(null)

    const { rewriteOpen, setRewriteOpen, options, notes, loading, openRewrite, retryRewrite, applyRewrite } = useAIRewrite(editor)
    const {
        grammarOpen,
        setGrammarOpen,
        options: grammarOptions,
        notes: grammarNotes,
        loading: grammarLoading,
        openGrammar,
        retryGrammar,
        applyGrammar,
    } = useAIGrammar(editor)

    const calculateStats = (value: Descendant[]) => {
        const text = value
            .map(node => Node.string(node))
            .join(" ")

        const words = text.trim().length > 0
            ? text.trim().split(/\s+/).length
            : 0

        const characters = text.length

        return { words, characters }
    }

    useEffect(() => {
        const id = setTimeout(() => {
            setStats(calculateStats(value))
        }, 500)

        return () => clearTimeout(id)
    }, [value])

    useDocumentAutosave(documentId, value, skipAutosaveRef)

    const documentStatus = useDocumentSaveStore((s) => s.status)

    useOnlineStatus()

    const renderElement = useCallback(
        (props: RenderElementProps) => <BlockElement {...props} />,
        []
    )

    const renderLeaf = useCallback(
        (props: RenderLeafProps) => <Leaf {...props} />,
        []
    )

    const decorate = useCallback(([, path]: NodeEntry<Node>) => {
        const ranges: (Range & { remoteSelectionColor?: string })[] = []

        Object.values(remoteCursorsRef.current).forEach((cursor) => {
            if (!cursor.selection || Range.isCollapsed(cursor.selection)) return

            const intersection = Range.intersection(cursor.selection, Editor.range(editor, path))

            if (!intersection) return

            ranges.push({
                ...intersection,
                remoteSelectionColor: `${cursor.color}33`,
            })
        })

        return ranges
    }, [editor])

    const handleRewrite = () => {
        if (!editor.selection) return

        const text = Editor.string(editor, editor.selection)

        openRewrite(text, editor.selection)
    }

    const handleGrammar = () => {
        if (!editor.selection) return

        const text = Editor.string(editor, editor.selection)

        openGrammar(text, editor.selection)
    }

    const syncRemoteCursors = useCallback((nextCursors: Record<string, RemoteCursor>) => {
        remoteCursorsRef.current = nextCursors
        setRemoteCursors(nextCursors)
    }, [])

    const pruneInactiveCursors = useCallback(() => {
        const now = Date.now()
        const nextCursors = Object.fromEntries(
            Object.entries(remoteCursorsRef.current).filter(([, cursor]) => {
                return now - (cursor.lastActiveAt ?? now) < CURSOR_IDLE_MS
            })
        )

        if (Object.keys(nextCursors).length !== Object.keys(remoteCursorsRef.current).length) {
            syncRemoteCursors(nextCursors)
        }
    }, [syncRemoteCursors])

    const updateCursorOverlays = useCallback(() => {
        const container = editableContainerRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        const overlays = Object.values(remoteCursorsRef.current)
            .filter((cursor) => Date.now() - (cursor.lastActiveAt ?? Date.now()) < CURSOR_IDLE_MS)
            .filter((cursor) => cursor.selection && Range.isCollapsed(cursor.selection))
            .flatMap((cursor) => {
                try {
                    const domRange = ReactEditor.toDOMRange(editor, cursor.selection!)
                    const rect = domRange.getBoundingClientRect()
                    const fallbackRect = domRange.getClientRects()[0]
                    const targetRect = rect.height > 0 ? rect : fallbackRect

                    if (!targetRect) return []

                    return [{
                        socketId: cursor.socketId,
                        name: cursor.name,
                        color: cursor.color,
                        left: targetRect.left - containerRect.left,
                        top: targetRect.top - containerRect.top,
                        height: Math.max(targetRect.height, 18),
                    }]
                } catch {
                    return []
                }
            })

        setCursorOverlays(overlays)
    }, [editor])

    const broadcastSelection = useCallback((selection: Range | null) => {
        if (!socket || !currentUser) return

        const hasChanged = selection === null
            ? lastBroadcastSelectionRef.current !== null
            : !lastBroadcastSelectionRef.current || !Range.equals(lastBroadcastSelectionRef.current, selection)

        if (!hasChanged) return

        lastBroadcastSelectionRef.current = selection
        socket.emit("cursor-update", {
            documentId,
            selection,
        })
    }, [currentUser, documentId, socket])

    useEffect(() => {
        latestValueRef.current = value
    }, [value])

    useEffect(() => {
        updateCursorOverlays()
    }, [remoteCursors, value, updateCursorOverlays])

    useEffect(() => {
        const handleViewportChange = () => updateCursorOverlays()

        globalThis.addEventListener("resize", handleViewportChange)
        globalThis.addEventListener("scroll", handleViewportChange, true)

        return () => {
            globalThis.removeEventListener("resize", handleViewportChange)
            globalThis.removeEventListener("scroll", handleViewportChange, true)
        }
    }, [updateCursorOverlays])

    useEffect(() => {
        const interval = setInterval(() => {
            pruneInactiveCursors()
        }, 500)

        return () => clearInterval(interval)
    }, [pruneInactiveCursors])

    useEffect(() => {
        if (!socket || !currentUser) return

        const applyOperation = (operation: Operation) => {
            isApplyingRemoteRef.current = true
            skipAutosaveRef.current = true

            try {
                editor.apply(operation)
                setValue(editor.children as Descendant[])
            } finally {
                isApplyingRemoteRef.current = false
            }
        }

        const replaceContent = (content: Descendant[]) => {
            isApplyingRemoteRef.current = true
            skipAutosaveRef.current = true

            try {
                const fallbackContent: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }]

                const nextContent: Descendant[] = content.length > 0
                    ? content
                    : fallbackContent

                Editor.withoutNormalizing(editor, () => {
                    const size = editor.children.length

                    if (size > 0) {
                        Transforms.delete(editor, {
                            at: {
                                anchor: Editor.start(editor, []),
                                focus: Editor.end(editor, []),
                            },
                        })
                    }

                    Transforms.insertNodes(editor, nextContent, { at: [0] })
                })

                setValue(editor.children as Descendant[])
            } finally {
                isApplyingRemoteRef.current = false
            }
        }

        const transformRemoteSelections = (operation: Operation) => {
            if (operation.type === "set_selection") return

            const nextCursors = Object.fromEntries(
                Object.entries(remoteCursorsRef.current).flatMap(([socketId, cursor]) => {
                    if (!cursor.selection) return [[socketId, cursor]]

                    const nextSelection = Range.transform(cursor.selection, operation)

                    if (!nextSelection) return []

                    return [[socketId, { ...cursor, selection: nextSelection }]]
                })
            )

            syncRemoteCursors(nextCursors)
        }

        const previousApply = editor.apply
        editor.apply = (operation: Operation) => {
            previousApply(operation)
            transformRemoteSelections(operation)

            if (isApplyingRemoteRef.current || operation.type === "set_selection") {
                return
            }

            socket.emit("document-operation", {
                documentId,
                operation,
            })
        }

        const handleRemoteOperation = ({
            documentId: remoteDocumentId,
            operation,
        }: {
            documentId: string
            operation: Operation
        }) => {
            if (remoteDocumentId !== documentId) return
            applyOperation(operation)
        }

        const handleDocumentSync = ({
            documentId: remoteDocumentId,
            content,
        }: {
            documentId: string
            content: Descendant[]
        }) => {
            if (remoteDocumentId !== documentId) return
            replaceContent(content)
        }

        const handleStateRequest = ({
            documentId: remoteDocumentId,
            targetSocketId,
        }: {
            documentId: string
            targetSocketId: string
        }) => {
            if (remoteDocumentId !== documentId) return

            socket.emit("document-state", {
                documentId,
                targetSocketId,
                content: latestValueRef.current,
            })
        }

        const handleRemoteCursor = ({
            documentId: remoteDocumentId,
            cursor,
        }: {
            documentId: string
            cursor: RemoteCursor
        }) => {
            if (remoteDocumentId !== documentId) return

            syncRemoteCursors({
                ...remoteCursorsRef.current,
                [cursor.socketId]: {
                    ...cursor,
                    lastActiveAt: Date.now(),
                },
            })
        }

        const handleCursorRemove = ({
            documentId: remoteDocumentId,
            socketId,
        }: {
            documentId: string
            socketId: string
        }) => {
            if (remoteDocumentId !== documentId) return

            const nextCursors = { ...remoteCursorsRef.current }
            delete nextCursors[socketId]
            syncRemoteCursors(nextCursors)
        }

        const handleRoomUsers = (users: { socketId: string }[]) => {
            const activeSocketIds = new Set(users.map((user) => user.socketId))
            const nextCursors = Object.fromEntries(
                Object.entries(remoteCursorsRef.current).filter(([socketId]) => activeSocketIds.has(socketId))
            )

            syncRemoteCursors(nextCursors)
        }

        if (!socket.connected) {
            socket.connect()
        }

        socket.emit("join-document", {
            documentId,
            user: currentUser,
        })

        socket.on("remote-operation", handleRemoteOperation)
        socket.on("sync-document", handleDocumentSync)
        socket.on("request-document-state", handleStateRequest)
        socket.on("remote-cursor", handleRemoteCursor)
        socket.on("cursor-remove", handleCursorRemove)
        socket.on("room-users", handleRoomUsers)

        return () => {
            editor.apply = previousApply
            if (selectionBroadcastTimeoutRef.current) {
                clearTimeout(selectionBroadcastTimeoutRef.current)
            }
            broadcastSelection(null)
            socket.off("remote-operation", handleRemoteOperation)
            socket.off("sync-document", handleDocumentSync)
            socket.off("request-document-state", handleStateRequest)
            socket.off("remote-cursor", handleRemoteCursor)
            socket.off("cursor-remove", handleCursorRemove)
            socket.off("room-users", handleRoomUsers)
        }
    }, [broadcastSelection, currentUser, documentId, editor, socket, syncRemoteCursors])

    return (
        <Slate
            editor={editor}
            initialValue={value}
            onChange={(newValue) => {
                setValue(newValue)

                if (isApplyingRemoteRef.current || !socket || !currentUser) return

                if (selectionBroadcastTimeoutRef.current) {
                    clearTimeout(selectionBroadcastTimeoutRef.current)
                }

                selectionBroadcastTimeoutRef.current = setTimeout(() => {
                    broadcastSelection(editor.selection)
                }, 50)
            }}
        >

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
                    <MarkButton format="code" icon={<Code className="w-4 h-4" />} />

                    <Separator orientation="vertical" className="h-5 w-px" />

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

                    <UndoButton />
                    <RedoButton />

                    <Separator orientation="vertical" className="h-5 w-px" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handleRewrite}><PencilLine /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Rewrite using AI</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={handleGrammar}><SpellCheck /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Grammar suggestion using AI</p>
                        </TooltipContent>
                    </Tooltip>

                </div>
            </div>


            {/* PAGE BACKGROUND */}
            <div className="flex justify-center pb-24">
                <div style={{ height: `${(BASE_HEIGHT * zoom) / 100}px`, }} className="relative w-full">
                    <div style={{ width: BASE_WIDTH, minHeight: BASE_HEIGHT, transform: `scale(${zoom / 100})`, transformOrigin: "top center", }} className="absolute left-1/2 -translate-x-1/2 bg-white shadow border px-20 py-24">
                        <div ref={editableContainerRef} className="relative">
                            <Editable
                                decorate={decorate}
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                                placeholder="Start writing..."
                                className="outline-none text-[16px] leading-7 w-full"
                            />

                            <div className="pointer-events-none absolute inset-0">
                                {cursorOverlays.map((cursor) => (
                                    <div
                                        key={cursor.socketId}
                                        className="absolute"
                                        style={{
                                            left: cursor.left,
                                            top: cursor.top,
                                            height: cursor.height,
                                        }}
                                    >
                                        <div
                                            className="realtime-cursor-blink absolute left-0 top-0 w-0.5 rounded-full"
                                            style={{
                                                height: cursor.height,
                                                backgroundColor: cursor.color,
                                            }}
                                        />
                                        <div
                                            className="absolute left-0 top-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                                            style={{
                                                transform: "translateY(-115%)",
                                                backgroundColor: cursor.color,
                                            }}
                                        >
                                            {cursor.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* BOTTOM STATUS BAR */}
            <div className="bottom-6 right-6 fixed hidden md:flex items-center gap-3 bg-background border shadow-sm rounded-full px-4 py-2 text-xs text-muted-foreground">
                <span>{stats.words} Words</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{stats.characters} Characters</span>
                <Separator orientation="vertical" className="h-4" />
                <span className={`${documentStatus === "offline" ? "text-red-500" : "text-primary"} font-medium`}>
                    {documentStatus === "offline" && "Offline"}
                    {documentStatus === "saving" && "Saving..."}
                    {documentStatus === "saved" && "Saved"}
                    {documentStatus === "error" && "Error saving"}
                    {documentStatus === "idle" && "Saved"}
                </span>
            </div>

            <RewriteModal
                open={rewriteOpen}
                setOpen={setRewriteOpen}
                options={options}
                notes={notes}
                loading={loading}
                onChoose={applyRewrite}
                onRetry={retryRewrite}
            />

            <RewriteModal
                title="Grammar Suggestions"
                open={grammarOpen}
                setOpen={setGrammarOpen}
                options={grammarOptions}
                notes={grammarNotes}
                loading={grammarLoading}
                onChoose={applyGrammar}
                onRetry={retryGrammar}
            />

        </Slate >
    )
}
