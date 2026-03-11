"use client"

import { signOut } from "next-auth/react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export default function LogoutButton({ className }: Readonly<{ className: string }>) {
    return (
        <Button className={cn("bg-destructive/80 hover:bg-destructive/50", className)} onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
    )
}