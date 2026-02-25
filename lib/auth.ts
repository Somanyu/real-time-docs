import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcrypt"
import { generateWorkspaceSlug } from "./slug"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
        }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user?.password) {
                    throw new Error("User not found")
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isValid) {
                    throw new Error("Invalid password")
                }

                return user
            },
        }),
    ],

    callbacks: {
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub
            }
            return session
        },
    },

    events: {
        async createUser({ user }) {
            console.log("🔥 createUser event triggered for:", user.email)

            const baseName = user.name ||
                user.email?.split("@")[0] ||
                "workspace"

            const slug = generateWorkspaceSlug(baseName)

            const workspace = await prisma.workspace.create({
                data: {
                    name: user.name
                        ? `${baseName}'s Workspace`
                        : "Personal Workspace",
                    slug,
                }
            })

            await prisma.workspaceMember.create({
                data: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    role: "OWNER",
                }
            })
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
