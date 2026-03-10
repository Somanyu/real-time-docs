import { NextResponse } from "next/server"
import { fixGrammar } from "@/lib/ai/prompts"

export async function POST(req: Request) {
    try {
        const { text } = await req.json()

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            )
        }

        const corrected = await fixGrammar(text)

        return NextResponse.json({ corrected })
    } catch (error) {
        console.error("AI grammar error:", error)

        return NextResponse.json(
            { error: "Grammar fix failed" },
            { status: 500 }
        )
    }
}