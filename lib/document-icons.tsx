import { createAvatar } from "@dicebear/core"
import { shapes } from "@dicebear/collection"

const DEFAULT_DOCUMENT_ICON_SEED = "document"

export function getDocumentIconSeed(seed?: string | null) {
    const trimmedSeed = seed?.trim()

    if (!trimmedSeed) {
        return DEFAULT_DOCUMENT_ICON_SEED
    }

    return trimmedSeed
}

export function getDocumentIconMarkup(seed?: string | null, size = 32) {
    const resolvedSeed = getDocumentIconSeed(seed)
    const svgMarkup = createAvatar(shapes, {
        seed: getDocumentIconSeed(seed),
        size,
    }).toString()

    return namespaceSvgIds(svgMarkup, `document-icon-${toDomSafeId(`${resolvedSeed}-${size}`)}`)
}

function namespaceSvgIds(svgMarkup: string, idPrefix: string) {
    return svgMarkup
        .replaceAll(/id="([^"]+)"/g, (_match, id) => `id="${idPrefix}-${id}"`)
        .replaceAll(/url\(#([^)]+)\)/g, (_match, id) => `url(#${idPrefix}-${id})`)
        .replaceAll(/href="#([^"]+)"/g, (_match, id) => `href="#${idPrefix}-${id}"`)
}

function toDomSafeId(value: string) {
    return value.replaceAll(/[^a-zA-Z0-9_-]/g, "-")
}
