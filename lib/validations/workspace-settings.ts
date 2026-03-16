import { z } from "zod"

import { WorkspaceRole } from "@/app/generated/prisma/enums"
import { collaboratorEmailSchema } from "@/lib/validations/add-workspace"

export const updateWorkspaceNameSchema = z.object({
    name: z
        .string()
        .min(1, "Workspace name is required")
        .max(20, "Very long workspace name 👀")
        .trim(),
})

export const addWorkspaceCollaboratorSchema = z.object({
    email: collaboratorEmailSchema,
    role: z.enum([WorkspaceRole.EDITOR, WorkspaceRole.VIEWER]),
})

export const updateWorkspaceCollaboratorRoleSchema = z.object({
    role: z.enum([WorkspaceRole.EDITOR, WorkspaceRole.VIEWER]),
})
