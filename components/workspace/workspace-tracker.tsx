"use client"

import { useWorkspaceStore } from "@/store/workspace-store"
import { useEffect } from "react"

export default function WorkspaceTracker({ slug }: { slug: string }) {
    const setLastVisitedWorkspace = useWorkspaceStore((state) => state.setLastVisitedWorkspace)

    useEffect(() => {
        setLastVisitedWorkspace(slug)
    }, [slug, setLastVisitedWorkspace])

    return null
}