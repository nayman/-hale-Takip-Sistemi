"use client"

import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormValues } from "@/lib/schemas/login"
import { sanitizeInput } from "@/lib/sanitize"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)
    setError("")

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(data.email)
      const sanitizedPassword = sanitizeInput(data.password)

      const result = await signIn("credentials", {
        email: sanitizedEmail,
        password: sanitizedPassword,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("Geçersiz e-posta veya şifre")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_12px_rgba(30,41,59,0.05)]">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-on-surface">
            İhale Yönetim Sistemi
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Hesabınıza giriş yapın
          </p>
        </div>
        
        {error && (
          <div className="bg-error-container border border-outline-variant px-4 py-3 rounded-lg">
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                type="email"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-t-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                  errors.email ? "border-red-500" : "border-outline-variant"
                }`}
                placeholder="E-posta adresi"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                id="password"
                type="password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-b-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${
                  errors.password ? "border-red-500" : "border-outline-variant"
                }`}
                placeholder="Şifre"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
