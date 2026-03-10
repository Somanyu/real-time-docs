"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"
import { AISummaryModalProps } from "@/types/workspace"

export function AISummaryModal({ open, onOpenChange, documentId }: Readonly<AISummaryModalProps>) {
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState("")
    const [displayedText, setDisplayedText] = useState("")

    const fetchSummary = async () => {
        if (!documentId) return

        try {
            setLoading(true)
            setSummary("")
            setDisplayedText("")

            const res = await fetch("/api/ai/summarise", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ documentId, }),
            })

            const data = await res.json()

            setSummary(data.summary)
        } finally {
            setLoading(false)
        }
    }

    /* Fetch when modal opens */
    useEffect(() => {
        if (open) {
            fetchSummary()
        }
    }, [open])

    /* Typing effect */
    useEffect(() => {
        if (!summary) return

        let index = 0

        const interval = setInterval(() => {
            setDisplayedText(summary.slice(0, index + 1))
            index++

            if (index >= summary.length) {
                clearInterval(interval)
            }
        }, 15)

        return () => clearInterval(interval)
    }, [summary])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>AI Summary</DialogTitle></DialogHeader>

                <div className="min-h-30 space-y-3">

                    {loading && (
                        <div className="flex w-full max-w-xs flex-col gap-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[80%]" />
                            <Skeleton className="h-4 w-[75%]" />
                        </div>
                    )}

                    {!loading && (
                        <ReactMarkdown>{displayedText}</ReactMarkdown>
                    )}
                </div>

                <DialogFooter className="flex gap-2">

                    <Button variant="outline" onClick={fetchSummary} disabled={loading}>Retry</Button>

                    <Button onClick={() => onOpenChange(false)}>Close</Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}