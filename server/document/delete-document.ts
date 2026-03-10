"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteDocument(documentId: string) {
    try {
        await prisma.document.delete({
            where: {
                id: documentId
            }
        })

        // revalidatePath("/dashboard")

        return { success: true }
    } catch (error) {
        console.error("Delete document failed:", error)
        return { success: false }
    }
}