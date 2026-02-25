"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: Readonly<{ error: Error & { digest?: string }, reset: () => void }>) {

    useEffect(() => {
        console.error("Global App Error:", error)
    }, [error])

    return (
        <html lang="en">
            <body>
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="text-center space-y-6 max-w-md">
                        <h1 className="text-3xl font-semibold">
                            Something went wrong
                        </h1>

                        <p className="text-muted-foreground">
                            An unexpected error occurred. Please try again.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => reset()}
                                className="px-4 py-2 bg-black text-white rounded-md"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
