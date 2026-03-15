import { cn } from "@/lib/utils"
import { getDocumentIconMarkup } from "@/lib/document-icons"

type DocumentIconProps = Readonly<{
    iconSeed?: string | null
    size?: number
    className?: string
    containerClassName?: string
    withBackground?: boolean
}>

export function DocumentIcon({
    iconSeed,
    size = 32,
    className,
    containerClassName,
    withBackground = false,
}: DocumentIconProps) {
    const svgMarkup = getDocumentIconMarkup(iconSeed, size)

    return (
        <div
            aria-hidden="true"
            className={cn(
                "shrink-0 overflow-hidden [&_svg]:size-full",
                withBackground && "rounded-md border bg-muted/40",
                className,
                containerClassName,
            )}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
    )
}
