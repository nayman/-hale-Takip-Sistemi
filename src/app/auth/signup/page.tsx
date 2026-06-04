"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (response.ok) {
        router.push("/auth/signin?message=Kayıt başarılı")
      } else {
        const data = await response.json()
        setError(data.error || "Kayıt olurken bir hata oluştu")
      }
    } catch (error) {
      setError("Kayıt olurken bir hata oluştu")
    } finally {
      setIsLoading(false)
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
            Yeni hesap oluşturun
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-error-container border border-outline-variant px-4 py-3 rounded-lg text-on-error-container">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant">
                Ad Soyad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-outline-variant placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant">
                Email adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-outline-variant placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-outline-variant placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Şifre (en az 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface-variant">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-outline-variant placeholder:text-on-surface-variant text-on-surface bg-surface-container-low rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Şifre tekrar"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-on-surface-variant">
              Zaten hesabınız var mı?{" "}
              <a href="/auth/signin" className="font-medium text-primary hover:opacity-90">
                Giriş yapın
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
