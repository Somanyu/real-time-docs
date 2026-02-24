import { z } from "zod"

export const signupSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})

export type SignupInput = z.infer<typeof signupSchema>
