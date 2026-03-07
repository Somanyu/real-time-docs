"use client"

import getRelativeTime from "@/lib/get-relative-time";
import { useDocumentSaveStore } from "@/store/document-save-store";
import { DocumentTitleProps } from "@/types/document";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function DocumentTitleEditor({ documentId, initialTitle, updatedAt, isStarred }: Readonly<DocumentTitleProps>) {
    const [title, setTitle] = useState<string>(initialTitle)
    const [baselineTitle, setBaselineTitle] = useState<string>(initialTitle)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [lastEditedText, setLastEditedText] = useState(getRelativeTime(new Date(updatedAt)))
    const [starred, setStarred] = useState<boolean>(isStarred)

    useEffect(() => {
        const interval = setInterval(() => {
            setLastEditedText(getRelativeTime(new Date(updatedAt)))
        }, 60000)

        return () => clearInterval(interval)
    }, [updatedAt])

    const setDocumentStatus = useDocumentSaveStore((s) => s.setStatus)
    const isOnline = useDocumentSaveStore((s) => s.isOnline)

    const saveIdRef = useRef<number>(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const saveTitle = async (value: string) => {
        const trimmed = value.trim() || "Untitled"

        if (trimmed === baselineTitle) return

        const currentSaveId = ++saveIdRef.current
        setDocumentStatus("saving")

        try {
            await fetch(`/api/document/${documentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmed }),
            })

            if (currentSaveId === saveIdRef.current) {
                setBaselineTitle(trimmed)
                setLastEditedText("just now")
                setDocumentStatus("saved")
            }
        } catch (error) {
            console.error(error)
            setDocumentStatus("error")
        }
    }

    useEffect(() => {
        if (!isEditing) return

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            saveTitle(title)
        }, 800)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [title, isEditing])

    const flushSave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        saveTitle(title)
    }

    if (!isOnline) {
        return null
    }

    return (
        <div className="flex-col items-center">
            <div className="flex items-center gap-x-1.5">
                {isEditing ? (
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            flushSave()
                            setIsEditing(false)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                flushSave()
                                setIsEditing(false)
                            }
                        }}
                        className="bg-transparent outline-none text-sm font-semibold w-1/2"
                    />
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-semibold truncate flex items-center gap-x-1.5">
                        {title || "Untitled"}
                    </button>
                )}

                <button
                    onClick={async () => {
                        const res = await fetch(`/api/document/${documentId}/star`, {
                            method: "POST",
                        })
                        const data = await res.json()
                        setStarred(data.starred)
                    }}
                ><Star size={13} className={starred ? "fill-yellow-400 text-yellow-400" : ""} /></button>
            </div>
            <p className="text-xs text-muted-foreground">
                Last edited {lastEditedText}
            </p>
        </div>
    )
}