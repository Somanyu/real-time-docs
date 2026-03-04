export interface DocumentTitleProps {
    documentId: string,
    initialTitle: string,
}

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline"

export interface DocumentSaveState {
    status: SaveStatus
    isOnline: boolean
    setStatus: (status: SaveStatus) => void
    setOnline: (value: boolean) => void
}