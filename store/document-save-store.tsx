import { DocumentSaveState } from "@/types/document";
import { create } from "zustand";

export const useDocumentSaveStore = create<DocumentSaveState>((set) => ({
    status: "idle",
    isOnline: globalThis.window === undefined ? true : navigator.onLine,

    setStatus: (status) =>
        set((state) => {
            if (!state.isOnline) {
                return { status: "offline" }
            }

            if (status === "saved") {
                setTimeout(() => set({ status: "idle" }), 2000)
            }

            return { status }
        }),

    setOnline: (value) =>
        set(() => ({
            isOnline: value,
            status: value ? "idle" : "offline"
        }))
}))