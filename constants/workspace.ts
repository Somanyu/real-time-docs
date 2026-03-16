import { WorkspaceRole } from "@/app/generated/prisma/enums"

export const WORKSPACE_FILTERS = ["favorites", "recent", "archived"] as const

export const COLLABORATOR_ROLE_OPTIONS = [
    { label: "Editor", value: WorkspaceRole.EDITOR },
    { label: "Viewer", value: WorkspaceRole.VIEWER },
] as const
