import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { summarizeDocument } from "@/lib/ai/prompts"

export async function POST(req: Request) {
    try {
        const { documentId } = await req.json()

        if (!documentId) {
            return NextResponse.json(
                { error: "Document ID required" },
                { status: 400 }
            )
        }

        const doc = await prisma.document.findUnique({
            where: { id: documentId },
            select: { content: true }
        })

        if (!doc) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            )
        }

        const text =
            typeof doc.content === "string"
                ? doc.content
                : JSON.stringify(doc.content)

        const summary = await summarizeDocument(text.slice(0, 6000))

        return NextResponse.json({ summary })

    } catch (error) {
        console.error("AI summarize error:", error)

        return NextResponse.json(
            { error: "Summarization failed" },
            { status: 500 }
        )
    }
}