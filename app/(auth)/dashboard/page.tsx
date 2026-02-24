"use client"

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Dashboard() {
    return (
        <div>

            <h1>This is Dashboard</h1>
            <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/login" })}
            >
                Logout
            </Button>
        </div>
    )
}