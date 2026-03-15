"use client"

import { useState } from "react"
import { Editor, Range, Transforms } from "slate"

type GrammarOption = {
    title: string
    text: string
}

export function useAIGrammar(editor: Editor) {
    const [grammarOpen, setGrammarOpen] = useState(false)
    const [options, setOptions] = useState<GrammarOption[]>([])
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    const [selectionRange, setSelectionRange] = useState<Range | null>(null)
    const [lastText, setLastText] = useState("")

    async function generate(text: string) {
        try {
            const res = await fetch("/api/ai/grammar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            })

            const data = await res.json()

            setOptions(data.options ?? [])
            setNotes(data.notes ?? "")
        } catch (err) {
            console.error("Grammar check failed", err)
            setOptions([])
            setNotes("")
        } finally {
            setLoading(false)
        }
    }

    async function openGrammar(text: string, range: Range) {
        setSelectionRange(range)
        setLastText(text)
        setGrammarOpen(true)
        setLoading(true)

        await generate(text)
    }

    async function retryGrammar() {
        if (!lastText) return
        await generate(lastText)
    }

    function applyGrammar(text: string) {
        if (!selectionRange) return

        Transforms.delete(editor, { at: selectionRange })
        Transforms.insertText(editor, text)

        setGrammarOpen(false)
    }

    return {
        grammarOpen,
        setGrammarOpen,
        options,
        notes,
        loading,
        openGrammar,
        retryGrammar,
        applyGrammar,
    }
}
