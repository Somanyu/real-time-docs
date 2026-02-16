
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <Image src="logo.svg" width={150} height={50} className="mr-3 h-6 sm:h-9" alt="Logo" />
        </span>
        <LoginForm />
      </div>
    </div>
  )
}
