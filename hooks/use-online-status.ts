"use client"

import { useDocumentSaveStore } from "@/store/document-save-store"
import { useEffect } from "react"

export function useOnlineStatus() {
    const setOnline = useDocumentSaveStore((s) => s.setOnline)

    useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)

        globalThis.addEventListener("online", handleOnline)
        globalThis.addEventListener("offline", handleOffline)

        return () => {
            globalThis.removeEventListener("online", handleOnline)
            globalThis.removeEventListener("offline", handleOffline)
        }
    })
}