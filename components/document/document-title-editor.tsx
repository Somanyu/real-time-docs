"use client"

import { DocumentTitleProps } from "@/types/document";
import { Star } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function DocumentTitleEditor({ documentId, initialTitle }: Readonly<DocumentTitleProps>) {
    const [title, setTitle] = useState<string>(initialTitle)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const saveIdRef = useRef<number>(0)

    const handleSave = async () => {
        const trimmed = title.trim() || "Untitled"

        if (trimmed === initialTitle) {
            setIsEditing(false)
            return
        }

        const currentSaveId = ++saveIdRef.current
        setIsSaving(true)

        try {
            await fetch(`/api/document/${documentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmed }),
            })

            if (currentSaveId === saveIdRef.current) {
                setIsSaving(false)
                setIsEditing(false)

                toast.success("Updated the document title")
            }
        } catch (error) {
            console.error(error)
            setIsSaving(false)
        }
    }

    return (
        <div className="flex-col items-center">
            <div className="flex items-center gap-x-1.5">
                {isEditing ? (
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleSave()
                            }
                        }}
                        className="bg-transparent outline-none text-sm font-semibold"
                    />
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-semibold truncate flex items-center gap-x-1.5">
                        {title || "Untitled"}
                    </button>
                )}

                <button><Star size={13} /></button>
            </div>
            <p className="text-xs text-muted-foreground">
                Last edited 2 mins ago
            </p>
        </div>
    )
}