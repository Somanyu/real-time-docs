"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "../workspace/workspace-provider"
import { toast } from "sonner"

export default function EmptyDocumentState() {

    const { workspace } = useWorkspace()


    async function handleCreateDocument() {
        if (!workspace?.id) {
            toast.error("No workspace selected")
            return
        }

        try {
            const res = await fetch("/api/document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId: workspace.id })
            })

            if (!res.ok) {
                toast.error("Failed to create document")
                return
            }

            const doc = await res.json()

            window.open(`/document/${doc.id}`, "_blank")
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        }
    }
    return (
        <div className="flex flex-col gap-3 items-center justify-center py-20 text-center h-full">

            <Image src="/empty-state-document.svg" alt="No documents" width={300} height={300} className="mb-6 opacity-90" />

            <h2 className="text-2xl font-semibold">Ready to start your next big project?</h2>

            <p className="text-muted-foreground max-w-md">
                Create your first document or invite your team to collaborate.
                Your ideas deserve a workspace as organized as you are.
            </p>

            <div className="flex gap-3 pt-10">
                <Button onClick={handleCreateDocument}>Create New Document</Button>
                <Button variant="outline">Import from Google Docs</Button>
            </div>

        </div>
    )
}