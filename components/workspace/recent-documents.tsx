"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { Document } from "@/app/generated/prisma/client"
import getRelativeTime from "@/lib/get-relative-time"
import { Avatar, AvatarFallback } from "../ui/avatar"

export function RecentDocuments({ documents }: Readonly<{ documents: Document[] }>) {

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Recent Documents</h2>
                    <p className="text-sm text-muted-foreground">
                        Pick up where you left off
                    </p>
                </div>
            </div>

            {/* Documents */}
            <div className="grid gap-6 md:grid-cols-4">
                {documents.map((doc: Document) => (
                    <Link
                        key={doc.id}
                        href={`/document/${doc.id}`}
                        className="group rounded-xl border hover:shadow-sm transition"
                    >
                        <div className="aspect-4/3 bg-orange-100 rounded-t-xl flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>

                        <div className="p-4 space-y-4">
                            <p className="font-medium line-clamp-1">{doc.title}</p>

                            <div className="flex items-center gap-x-2">
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback>{doc.createdById.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <p className="text-xs text-muted-foreground">
                                    Edited {getRelativeTime(doc.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}