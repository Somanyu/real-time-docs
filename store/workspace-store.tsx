import { WorkspaceState } from "@/types/workspace"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            lastVisitedWorkspace: null,

            setLastVisitedWorkspace: (slug) =>
                set({ lastVisitedWorkspace: slug }),

        }),
        {
            name: "workspace-storage"
        }
    )
)
