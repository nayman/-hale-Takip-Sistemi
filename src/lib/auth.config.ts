import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Bu dosya SADECE Edge runtime ile uyumlu paketleri içermelidir.
// Prisma, bcryptjs veya pg gibi Node.js bağımlılıkları BURAYA EKLENMEMELİDİR.
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    // Boş bir credentials provider tanımlıyoruz, asıl logic auth.ts içinde olacak
    Credentials({}),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user?.tenantId
      const isAuthPage = nextUrl.pathname.startsWith("/auth")
      const isDashboardPage = nextUrl.pathname.startsWith("/dashboard")

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (isDashboardPage) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as any).rol
        token.tenantId = (user as any).tenantId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.rol = token.rol as "SUPER_ADMIN" | "TENANT_ADMIN" | "SORUMLU" | "OPERASYON"
        session.user.tenantId = token.tenantId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig
