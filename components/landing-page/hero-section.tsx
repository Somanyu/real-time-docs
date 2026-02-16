"use client"

import { Circle, Pencil, Play } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function LandingPageHeroSection() {

    const router = useRouter()

    const handleRedirect = (type: "signup" | "demo") => {
        if (type === "signup") {
            router.push("/signup")
        } else {
            router.push("/demo")
        }
    }

    return (
        <div className="overflow-x-hidden">

            <section className="pt-12 sm:pt-16">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-7">

                        <div className="space-y-5">
                            <Badge className="bg-green-50 text-primary border-primary text-sm capitalize">
                                <Circle fill="oklch(52.7% 0.154 150.069)" className="size-2!" /> New AI Drafting Tool
                            </Badge>

                            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
                                Your team&#39;s ideas, in <span className="text-primary">one shared workspace</span>
                            </h1>
                        </div>

                        <div className="max-w-xl mx-auto">
                            <p className="text-base text-gray-500 font-inter">Experience the fastest real-time collaborative editor built for professional teams. Write, plan, and create together without the lag.</p>
                        </div>

                        <div className="px-8 sm:items-center sm:justify-center sm:px-0 sm:space-x-5 sm:flex">
                            <Button onClick={() => handleRedirect("signup")} size="lg">Start documenting <Pencil className="size-4 ml-1" /></Button>
                            <Button onClick={() => handleRedirect("demo")} size="lg">Watch demo<Play className="size-4 ml-1" /></Button>
                        </div>

                    </div>
                </div>

                <div className="pb-12">
                    <div className="relative">
                        <div className="absolute inset-0"></div>
                        <div className="relative mx-auto">
                            <div className="lg:max-w-6xl lg:mx-auto">
                                <Image height={1700} width={1700} className="transform scale-100" src="/image.png" alt="Workspace" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

    )
}
