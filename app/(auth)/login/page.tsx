"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Logo from "@/components/shared/Logo"
import { toast } from "sonner"
import { useLoginMutation } from "@/redux/features/auth.api"
import { Role } from "@/app/api/user/user.interface"
import { ShieldCheck } from "lucide-react"
import { getDefaultDashboardRoutes } from "@/lib/auth/auth"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean(),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginPage = () => {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()

  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@gmail.com"
  const adminPassword =
    process.env.NEXT_PUBLIC_ADMIN_PASS || "Admin123"

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const rememberMe = watch("rememberMe")

  const handleFillAdminCredentials = () => {
    setValue("email", adminEmail, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    setValue("password", adminPassword, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
    toast.success("Admin credentials set!")
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      }).unwrap()

      toast.success(response.message)
      router.push(getDefaultDashboardRoutes(response.data.user.role))
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        "Login failed"
      toast.error(message)
    }
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="relative z-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-background"
          >
            Health<span className="text-background">Care+</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg pb-10 text-primary-foreground">
          <h1 className="text-4xl font-bold tracking-tight xl:text-5xl">
            Welcome back.
          </h1>

          <p className="mt-4 text-lg text-primary-foreground/80">
            Sign in to your account and continue where you left off.
          </p>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-foreground/10" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-foreground/10" />
      </div>

      {/* Right Side */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Quick Admin Credentials Autofill */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleFillAdminCredentials}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleFillAdminCredentials()
              }
            }}
            className="mb-6 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/10 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  Admin Credentials
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {adminEmail}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFillAdminCredentials()
              }}
              className="shrink-0 cursor-pointer border-primary/30 font-medium hover:bg-primary hover:text-primary-foreground"
            >
              Auto Fill
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("rememberMe", checked === true)
                }
              />

              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal"
              >
                Remember me
              </Label>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
