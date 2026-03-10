import { NextResponse } from "next/server"
import { rewriteText } from "@/lib/ai/prompts"

export async function POST(req: Request) {
    try {
        const { text } = await req.json()

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            )
        }

        const rewritten = await rewriteText(text)

        let options = []

        try {
            const parsed = JSON.parse(rewritten)
            options = parsed.options
        } catch {
            options = [rewritten]
        }

        return NextResponse.json({ options })

    } catch (error) {
        console.error("AI rewrite error:", error)

        return NextResponse.json(
            { error: "Rewrite failed" },
            { status: 500 }
        )
    }
}