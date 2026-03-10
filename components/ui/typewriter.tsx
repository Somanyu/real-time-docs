"use client"

import { useEffect, useState } from "react"

export function Typewriter({ text }: Readonly<{ text: string }>) {

    const [display, setDisplay] = useState("")

    useEffect(() => {

        let i = 0

        const interval = setInterval(() => {

            setDisplay(text.slice(0, i))

            i++

            if (i > text.length) clearInterval(interval)

        }, 10)

        return () => clearInterval(interval)

    }, [text])

    return <span>{display}</span>
}