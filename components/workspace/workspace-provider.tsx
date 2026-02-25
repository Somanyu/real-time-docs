"use client"

import { Workspace, WorkspaceMember } from "@/app/generated/prisma/client"
import { createContext, useContext } from "react"

interface WorkspaceContextValue {
    workspace: Workspace
    membership: WorkspaceMember
}

const WorkspaceContext =
    createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ value, children }: Readonly<{ value: WorkspaceContextValue, children: React.ReactNode }>) {
    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)

    if (!context) {
        throw new Error(
            "useWorkspace must be used inside WorkspaceProvider"
        )
    }

    return context
}
