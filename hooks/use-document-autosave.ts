"use client"

import { useDocumentSaveStore } from "@/store/document-save-store";
import { MutableRefObject, useEffect, useRef } from "react";
import { Descendant } from "slate";
import { toast } from "sonner";

export function useDocumentAutosave(
    documentId: string,
    value: Descendant[],
    skipSaveRef?: MutableRefObject<boolean>
) {
    const setStatus = useDocumentSaveStore((s) => s.setStatus)

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const saveIdRef = useRef<number>(0)
    const hasMountedRef = useRef<boolean>(false)
    const lastSavedRef = useRef<string>("")

    useEffect(() => {
        const serialized = JSON.stringify(value)

        if (skipSaveRef?.current) {
            skipSaveRef.current = false
            lastSavedRef.current = serialized
            return
        }

        // skip first render
        if (!hasMountedRef.current) {
            hasMountedRef.current = true
            lastSavedRef.current = serialized
            return
        }

        if (serialized === lastSavedRef.current) return

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(async () => {
            const saveId = ++saveIdRef.current

            try {
                setStatus("saving")

                const res = await fetch(`/api/document/${documentId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: value })
                })

                if (!res.ok) {
                    toast.warning("Something went wrong while saving")
                }

                // Race condition protection, ignore outdated saves
                if (saveId === saveIdRef.current) {
                    lastSavedRef.current = serialized
                    setStatus("saved")
                }
            } catch (error) {
                console.log(error)
                setStatus("error")
            }
        }, 1000)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [value, documentId, setStatus, skipSaveRef])
}
