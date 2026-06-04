import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Middleware için SADECE Edge uyumlu olan auth.config.ts'i kullanıyoruz.
// Bu sayede Node.js 'crypto' veya 'pg' modülleri Edge runtime'da hata vermez.
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
