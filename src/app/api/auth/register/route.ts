import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prismaClient } from "@/lib/prisma-client"
import { rateLimit } from "@/lib/rate-limit"
import { sanitizeObject } from "@/lib/sanitize"
import { registerSchema } from "@/lib/schemas/register"

export async function POST(request: Request) {
  try {
    // Rate limiting - IP başına 5 istek / 1 dakika
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const rateLimitResult = await rateLimit(`register:${ip}`, 5, 60)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          }
        }
      )
    }

    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // XSS Sanitization
    const sanitizedData = sanitizeObject(validatedData)

    // Mevcut kullanıcı kontrolü
    const existingUser = await prismaClient.user.findUnique({
      where: { email: sanitizedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(sanitizedData.password, 12)

    // İlk tenant'ı oluştur veya mevcut tenant'ı kullan
    let tenant = await prismaClient.tenant.findFirst()
    
    if (!tenant) {
      tenant = await prismaClient.tenant.create({
        data: {
          name: "İlk Şirket",
        }
      })
    }

    // Kullanıcıyı oluştur
    const user = await prismaClient.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        password: hashedPassword,
        rol: "TENANT_ADMIN", // İlk kullanıcı admin olur
        tenantId: tenant.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        rol: true,
        tenantId: true,
      }
    })

    // Account kaydı oluştur (NextAuth için)
    await prismaClient.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
        tenantId: tenant.id,
      }
    })

    return NextResponse.json({
      message: "Kullanıcı başarıyla oluşturuldu",
      user
    })

  } catch (error) {
    console.error("Register error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Doğrulama hatası", details: error.issues },
        { status: 400 }
      )
    }

    // Daha detaylı hata mesajı
    let errorMessage = "Kayıt sırasında bir hata oluştu"
    let statusCode = 500
    
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Spesifik hata mesajları
      if (error.message?.includes("Unique constraint")) {
        errorMessage = "Bu email adresi zaten kullanılıyor"
        statusCode = 400
      } else if (error.message?.includes("Foreign key constraint")) {
        errorMessage = "Tenant oluşturulurken bir hata oluştu"
        statusCode = 500
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}
