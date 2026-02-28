import { z } from "zod";

export const collaboratorEmailSchema = z
    .email()

export const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, "Workspace name is required")
        .max(20, "Very long workspace name 👀")
        .trim(),
    collaborators: z
        .array(
            z.object({
                email: collaboratorEmailSchema
            })
        )
        .refine(
            (emails) => new Set(emails).size === emails.length,
            { message: "Duplicate email addressed are not allowed" }
        ),
    sendInvites: z.boolean()
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>