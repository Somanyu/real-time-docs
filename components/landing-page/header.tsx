"use client"

import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoutButton from "../ui/logout-button";

export default function LandingPageHeader() {
    const router = useRouter()
    const { data: session } = useSession();
    const lastWorkspace = useWorkspaceStore((state) => state.lastVisitedWorkspace)

    let authButtons: React.ReactNode = null

    const handleRedirect = (type: "login" | "signup") => {
        if (type === "login") {
            router.push("/login")
        } else {
            router.push("/signup")
        }
    }

    const handleWorkspaceRedirect = () => {
        if (lastWorkspace) {
            router.push(`/workspace/${lastWorkspace}`)
        } else {
            router.push("/dashboard")
        }
    }

    if (session) {
        authButtons = (
            <>
                <Button onClick={handleWorkspaceRedirect}>Workspace</Button>
                <LogoutButton className="lg:block hidden" />
            </>
        )
    } else {
        authButtons = (
            <>
                <Button onClick={() => handleRedirect("login")} variant="ghost">Login</Button>
                <Button onClick={() => handleRedirect("signup")}>Get Started</Button>
            </>
        )
    }

    return (
        <header>
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-7xl">
                    <span className="flex items-center">
                        <Image src="logo.svg" width={200} height={50} className="mr-3 h-6 sm:h-9" alt="Logo" />
                    </span>

                    <div className="flex items-center gap-x-3 lg:order-2">
                        <div className="flex items-center gap-x-3">
                            {authButtons}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}