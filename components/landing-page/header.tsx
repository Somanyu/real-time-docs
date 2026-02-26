"use client"

import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { NavItem } from "@/types/landing-page";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoutButton from "../ui/logout-button";

export default function LandingPageHeader() {
    const router = useRouter()
    const { data: session } = useSession();
    const lastWorkspace = useWorkspaceStore((state) => state.lastVisitedWorkspace)

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const navItems: NavItem[] = [
        {
            label: "Product",
            href: "#",
        },
        {
            label: "Features",
            href: "#",
        },
        {
            label: "Pricing",
            href: "#",
        },
    ];

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
                <LogoutButton />
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
                        <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => setIsOpen(!isOpen)}><Menu className="size-7" /></Button>
                    </div>

                    <div className={`${isOpen ? "block" : "hidden"} justify-between items-center w-full lg:flex lg:w-auto lg:order-1`} id="mobile-menu-2">
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            {navItems.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0">{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    )
}