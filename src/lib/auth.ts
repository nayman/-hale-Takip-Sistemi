import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prismaClient } from "./prisma-client"
import { authConfig } from "./auth.config"

// Bu dosya Node.js runtime (API Routes, Server Actions) ortamında çalışır.
// Prisma ve bcryptjs gibi Node.js bağımlılıklarını burada kullanabiliriz.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prismaClient) as any,
  callbacks: {
    ...(authConfig.callbacks as any),
    async jwt({ token, user }: any) {
      if (user) {
        token.rol = (user as any).rol
        token.tenantId = (user as any).tenantId
        return token
      }

      const userId = token?.sub
      if (!userId) return token

      try {
        const dbUser = await prismaClient.user.findUnique({
          where: { id: userId },
          select: { rol: true, tenantId: true },
        })

        if (!dbUser) {
          token.tenantId = null
          token.rol = null
          token.invalidUser = true
          return token
        }

        token.rol = dbUser.rol
        token.tenantId = dbUser.tenantId

        if (dbUser.tenantId) {
          const tenant = await prismaClient.tenant.findUnique({
            where: { id: dbUser.tenantId },
            select: { id: true },
          })
          if (!tenant) {
            token.tenantId = null
            token.invalidTenant = true
          }
        }
      } catch {
        return token
      }

      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.rol = token.rol
        session.user.tenantId = token.tenantId ?? null
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prismaClient.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          rol: user.rol as "SUPER_ADMIN" | "TENANT_ADMIN" | "SORUMLU" | "OPERASYON",
          tenantId: user.tenantId,
        }
      }
    })
  ],
})
