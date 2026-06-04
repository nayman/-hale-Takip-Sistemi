import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      rol: "SUPER_ADMIN" | "TENANT_ADMIN" | "SORUMLU" | "OPERASYON"
      tenantId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    rol: "SUPER_ADMIN" | "TENANT_ADMIN" | "SORUMLU" | "OPERASYON"
    tenantId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: string
    tenantId: string
  }
}
