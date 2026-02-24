import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // If user is not authenticated AND is accessing protected routes
    if (
        !token &&
        req.nextUrl.pathname.match(
            /^\/(dashboard|workspace|document)(\/.*)?$/ // matches /dashboard, /workspace/*, /document/*
        )
    ) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/workspace/:path*", "/document/:path*"],
}
