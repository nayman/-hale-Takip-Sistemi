"use client"

import { signOut, useSession } from "next-auth/react"

export function LogoutButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      Çıkış Yap
    </button>
  )
}
