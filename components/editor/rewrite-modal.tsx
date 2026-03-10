"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"

import { useState } from "react"
import { Typewriter } from "../ui/typewriter"
import { Card, CardContent, CardHeader } from "../ui/card"

type Option = {
    title: string
    text: string
}

interface Props {
    open: boolean
    setOpen: (v: boolean) => void
    options: Option[]
    notes: string
    loading: boolean
    onChoose: (text: string) => void
    onRetry: () => void
}

export function RewriteModal({ open, setOpen, options, notes, loading, onChoose, onRetry }: Readonly<Props>) {

    const [selected, setSelected] = useState<string | null>(null)

    function handleApply() {
        if (!selected) return
        onChoose(selected)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">

                <DialogHeader>
                    <DialogTitle>Rewrite Options</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-96 pr-4">

                    {loading && (
                        <div className="flex w-full max-w-xs flex-col gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i + 1} className="w-full max-w-xs">
                                    <CardHeader>
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>

                                    <CardContent>
                                        <Skeleton className="aspect-video w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                    )}

                    {!loading && (
                        <RadioGroup onValueChange={setSelected} className="space-y-3">
                            {options.map((opt, i) => (
                                <FieldLabel key={opt.title} htmlFor={`rewrite-${i}`}>
                                    <Field orientation="horizontal" className="items-start justify-between gap-4">

                                        <FieldContent className="space-y-1">
                                            <FieldTitle>{opt.title}</FieldTitle>

                                            <FieldDescription className="text-sm leading-relaxed">
                                                <Typewriter text={opt.text} />
                                            </FieldDescription>
                                        </FieldContent>

                                        <RadioGroupItem value={opt.text} id={`rewrite-${i}`} className="mt-1" />

                                    </Field>
                                </FieldLabel>
                            ))}
                        </RadioGroup>
                    )}

                    {!loading && notes && (
                        <div className="mt-6 text-sm text-muted-foreground">{notes}</div>
                    )}

                </ScrollArea>

                <DialogFooter className="flex justify-between">

                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>

                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onRetry}>Retry</Button>
                        <Button onClick={handleApply} disabled={!selected}>Apply</Button>
                    </div>

                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}