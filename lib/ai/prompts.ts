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
        // contents: `Rewrite this text to be clearer and more professional:${text}`,
        contents: `
            Rewrite the following text in 3 different ways.

            Return ONLY valid JSON in this format:

            {
            "options": [
                { "title": "Direct and Polished", "text": "..." },
                { "title": "Concise and Informative", "text": "..." },
                { "title": "Academic / Scientific", "text": "..." }
            ],
            "notes": "Explain what improvements were made."
            }

            Text:
            ${text}
        `,
    })

    const raw = res.text ?? ""

    return raw
        .replaceAll('```json', "")
        .replaceAll('```', "")
        .trim()
}

export async function fixGrammar(text: string) {
    const res = await ai.models.generateContent({
        model: MODEL,
        contents: `Fix grammar and improve clarity without changing meaning:${text}`,
    })

    return res.text
}