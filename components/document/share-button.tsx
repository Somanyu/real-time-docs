"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Share2 } from "lucide-react"
import { ShareModal } from "./share-modal"

export function ShareButton({ documentId }: Readonly<{ documentId: string }>) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
            </Button>

            <ShareModal documentId={documentId} open={open} onOpenChange={setOpen} />
        </>
    )
}