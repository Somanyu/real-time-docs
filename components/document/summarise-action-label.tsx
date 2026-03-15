"use client"

import { useRef } from "react"

import { SparklesIcon, SparklesIconHandle } from "@/components/ui/sparkles-icon"
import { SummariseActionLabelProps } from "@/types/document"

const GEMINI_ICON_CLASSNAME = "h-4 w-4 text-[#4285F4] drop-shadow-[0_0_6px_rgba(66,133,244,0.35)]"

export function SummariseActionLabel({ className }: Readonly<SummariseActionLabelProps>) {
    const sparkleRef = useRef<SparklesIconHandle>(null)

    return (
        <div
            className={className}
            onMouseEnter={() => sparkleRef.current?.startAnimation()}
            onMouseLeave={() => sparkleRef.current?.stopAnimation()}
        >
            <SparklesIcon ref={sparkleRef} className={GEMINI_ICON_CLASSNAME} />
            <span>Summarise</span>
        </div>
    )
}
