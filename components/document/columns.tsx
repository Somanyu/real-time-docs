"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, FileText, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DocumentColumnsOptions, DocumentWithAuthor } from "@/types/document"
import getRelativeTime from "@/lib/get-relative-time"

export const columns = ({
    archiveActionLabel,
    isArchiveUpdating,
    onToggleArchive,
    onSummarize,
    setDocumentToDelete,
}: DocumentColumnsOptions): ColumnDef<DocumentWithAuthor>[] => [

        {
            accessorKey: "title",
            header: "Name",

            cell: ({ row }) => {
                const doc = row.original

                return (
                    <Link href={`/document/${doc.id}`} className="flex items-center gap-3 font-medium hover:underline">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.title}
                    </Link>
                )
            },
        },

        {
            accessorKey: "updatedAt",

            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Last Modified
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),

            cell: ({ row }) => {
                const doc = row.original

                return (
                    <span className="text-muted-foreground">{getRelativeTime(doc.updatedAt)}</span>
                )
            },
        },

        {
            accessorKey: "author",
            header: "Author",

            cell: ({ row }) => {
                const doc = row.original

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">{doc.createdBy.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{doc.createdBy.email}</span>
                    </div>
                )
            },
        },

        {
            id: "actions",

            cell: ({ row }) => {
                const doc = row.original

                return (
                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSummarize(doc.id)}>
                                Summarise
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={isArchiveUpdating} onClick={() => void onToggleArchive(doc)}>
                                {archiveActionLabel}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => setDocumentToDelete(doc)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>

                    </DropdownMenu>
                )
            },
        },

    ]
