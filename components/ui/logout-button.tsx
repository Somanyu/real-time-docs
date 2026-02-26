"use client"

import { signOut } from "next-auth/react";
import { Button } from "./button";

export default function LogoutButton() {
    return (
        <Button className="bg-destructive/80 hover:bg-destructive/50" onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
    )
}