import { ai } from "./gemini"

const MODEL = "gemini-3-flash-preview"

export async function summarizeDocument(text: string) {
    const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Summarize the following document clearly:

${text}`,
    })

    return res.text
}

export async function rewriteText(text: string) {
    const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Rewrite this text to be clearer and more professional:${text}`,
    })

    return res.text
}

export async function fixGrammar(text: string) {
    const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Fix grammar and improve clarity without changing meaning:${text}`,
    })

    return res.text
}