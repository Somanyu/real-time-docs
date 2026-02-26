"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { LogoApple, LogoGoogle } from "./ui/icons"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { authSchema } from "@/lib/validations/auth"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { toast } from "sonner"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  async function onSignupSubmit(data: z.infer<typeof authSchema>) {

    try {

      // Call signup API
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.warning(result.error)
        return
      }

      // Auto login using credentials
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.warning("Login failed after signup")
        return
      }

      // Get workspace
      const workspaceRes = await fetch("/api/me/workspace")

      if (!workspaceRes.ok) {
        toast.warning("Unexpected error in workspace.")
        router.push("/")
        return
      }

      const { slug } = await workspaceRes.json()

      router.push(`/workspace/${slug}`)
    } catch (error) {
      console.error(error)
      toast.error("Unexpected error occurred.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSignupSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <Image height={100} width={100} src="logo-large.svg" alt="Large Logo" />
              </div>
              <span className="sr-only">RealTime Docs</span>
            </span>
            <h1 className="text-xl font-bold">Welcome to RealTime Docs</h1>
            <FieldDescription>Already have an account? <Link href="/login">Sign in</Link></FieldDescription>
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...field} id="email" type="email" aria-invalid={fieldState.invalid} placeholder="m@example.com" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input {...field} id="password" name="password" aria-invalid={fieldState.invalid} type="password" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Creating..."
                : "Create Account"}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}>
              <LogoApple />
              Continue with Apple
            </Button>
            <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
              <LogoGoogle />
              Continue with Google
            </Button>
          </Field>

        </FieldGroup>
      </form>
    </div>
  )
}
