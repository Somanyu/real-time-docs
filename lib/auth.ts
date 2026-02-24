import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcrypt"
import slugify from "slugify"

const handler = NextAuth({
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
            const baseSlug = slugify(
                user.name ? `${user.name}-workspace` : "personal-workspace",
                { lower: true }
            )

            let slug = baseSlug
            let counter = 1

            while (
                await prisma.workspace.findUnique({
                    where: { slug }
                })
            ) {
                slug = `${baseSlug}-${counter++}`
            }

            const workspace = await prisma.workspace.create({
                data: {
                    name: user.name
                        ? `${user.name}'s Workspace`
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
})

export { handler as GET, handler as POST }
