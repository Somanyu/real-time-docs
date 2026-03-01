"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { createWorkspaceSchema, collaboratorEmailSchema, CreateWorkspaceInput } from "@/lib/validations/add-workspace"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { CreateWorkspaceDialogProps } from "@/types/workspace"
import z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateWorkspaceDialog({ open, onOpenChange }: Readonly<CreateWorkspaceDialogProps>) {
    const router = useRouter()

    const [emailInput, setEmailInput] = useState<string>("")

    const form = useForm<CreateWorkspaceInput>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: "",
            collaborators: [],
            sendInvites: true,
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "collaborators"
    })

    const addCollaborator = () => {
        const email = emailInput.trim()

        if (!email) return

        // validate email 
        const result = collaboratorEmailSchema?.safeParse(email)

        if (!result.success) {
            form.setError("collaborators", {
                message: "Invalid email format",
            })
            return
        }

        // Check duplicates
        const existing = form.getValues("collaborators")
        if (existing.some((c) => c.email === email)) {
            form.setError("collaborators", {
                message: "Duplicate email addresses are not allowed",
            })
            return
        }

        append({ email })
        setEmailInput("")
        form.clearErrors("collaborators")
    }

    async function handleCreateWorkspaceSubmit(data: z.infer<typeof createWorkspaceSchema>) {
        try {
            const res = await fetch("/api/workspace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            const workspace = await res.json()

            if (res.ok) {
                toast.success("Created workspace")
                router.push(`/workspace/${workspace.slug}`)
            } else {
                toast.warning("Failed to create workspace")
            }

            onOpenChange(false)
            form.reset();
        } catch (error) {
            toast.error("Error in creating workspace")
            console.log("Error in creating workspace: ", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" aria-describedby="create-workspace">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                </DialogHeader>

                <form id="create-workspace-form" onSubmit={form.handleSubmit(handleCreateWorkspaceSubmit)} className="space-y-4">

                    {/* Workspace Name */}
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="workspace-name">Workspace Name</FieldLabel>
                                <Input {...field} id="workspace-name" placeholder="Acme Inc." aria-invalid={fieldState.invalid} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* Add Collaborators */}
                    <Field>
                        <FieldLabel htmlFor="collaborators">Add Collaborators</FieldLabel>
                        <div className="flex gap-2">
                            <Input
                                id="collaborators"
                                placeholder="m@example.com"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addCollaborator()
                                    }
                                }}
                            />
                            <Button type="button" onClick={addCollaborator}>Add</Button>
                        </div>

                        {/* Email Tags */}
                        {fields.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {fields.map((fieldItem, index) => (
                                    <div key={fieldItem.id} className="flex items-center gap-2 px-3 py-1 text-sm bg-muted rounded-full">
                                        {fieldItem.email}
                                        <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {form.formState.errors.collaborators && (
                            <FieldError errors={[form.formState.errors.collaborators]} />
                        )}
                    </Field>

                    {/* Send Email Checkbox */}
                    <Controller
                        name="sendInvites"
                        control={form.control}
                        render={({ field }) => (
                            <Field>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="send_email_notification" checked={field.value} onCheckedChange={(value) => field.onChange(!!value)} />
                                    <FieldLabel htmlFor="send_email_notification" className="text-sm">Send email notification to collaborators</FieldLabel>
                                </div>
                            </Field>
                        )}
                    />
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="create-workspace-form" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating...." : "Create Workspace"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}