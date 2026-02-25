import slugify from "slugify"
import { nanoid } from "nanoid"

/**
 * Generates a workspace slug.
 * Example: john-doe-a8f3k2
 */
export function generateWorkspaceSlug(base: string) {
    const readable = slugify(base, {
        lower: true,
        strict: true,
        trim: true,
    })

    const uniqueSuffix = nanoid(6)

    return `${readable}-${uniqueSuffix}`
}
