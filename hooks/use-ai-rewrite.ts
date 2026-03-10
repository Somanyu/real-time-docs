"use client"

import { useState } from "react"
import { Editor, Range, Transforms } from "slate"

type RewriteOption = {
    title: string
    text: string
}

export function useAIRewrite(editor: Editor) {

    const [rewriteOpen, setRewriteOpen] = useState(false)
    const [options, setOptions] = useState<RewriteOption[]>([])
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const [selectionRange, setSelectionRange] = useState<Range | null>(null)
    const [lastText, setLastText] = useState("")

    async function generate(text: string) {
        try {

            const res = await fetch("/api/ai/rewrite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            })

            const data = await res.json()

            setOptions(data.options ?? [])
            setNotes(data.notes ?? "")

        } catch (err) {

            console.error("Rewrite failed", err)

            setOptions([])
            setNotes("")

        } finally {

            setLoading(false)

        }
    }

    async function openRewrite(text: string, range: Range) {
        setSelectionRange(range)
        setLastText(text)

        // open modal immediately
        setRewriteOpen(true)

        // show skeleton
        setLoading(true)

        await generate(text)
    }

    async function retryRewrite() {
        if (!lastText) return
        await generate(lastText)
    }

    function applyRewrite(text: string) {
        if (!selectionRange) return

        Transforms.delete(editor, { at: selectionRange })
        Transforms.insertText(editor, text)

        setRewriteOpen(false)
    }

    return {
        rewriteOpen,
        setRewriteOpen,
        options,
        notes,
        loading,
        openRewrite,
        retryRewrite,
        applyRewrite,
    }
}