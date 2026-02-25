"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { LogoGoogle, LogoApple } from "./ui/icons"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authSchema } from "@/lib/validations/auth"
import z from "zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

  const router = useRouter();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  async function onLoginSubmit(data: z.infer<typeof authSchema>) {

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.warning(result.error)
        return
      }

      // Success
      // router.push("/dashboard")

      const workspaceRes = await fetch("/api/me/workspace")

      if (!workspaceRes.ok) {
        toast.warning("Something went wrong.")
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onLoginSubmit)}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <LogoApple />
                  Login with Apple
                </Button>
                <Button variant="outline" type="button">
                  <LogoGoogle />
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>

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
                    ? "Logging in..."
                    : "Login"}
                </Button>
                <FieldDescription className="text-center">Don&apos;t have an account? <Link href="/signup">Sign up</Link></FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
