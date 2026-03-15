"use server"

import prisma from "@/lib/prisma"

export async function deleteDocument(documentId: string) {
    try {
        await prisma.document.delete({
            where: {
                id: documentId
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Delete document failed:", error)
        return { success: false }
    }
}