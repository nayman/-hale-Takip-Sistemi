import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { storage } from "@/lib/storage-adapter"
import { createAuditLog } from "@/lib/audit-log"
import { slug, dosyaUzantisi } from "@/lib/slug"

const uploadSchema = z.object({
  ad: z.string().min(1, "Evrak adı zorunludur"),
  tip: z.enum(["KIMLIK", "VERGI", "SIGORTA", "RUHSAT", "SERTIFIKA", "SOZLESME", "DIGER"]),
  kategori: z.enum(["PERSONEL", "MALI", "HUKUKI", "TEKNIK", "IDARI"]),
  aciklama: z.string().optional(),
  sonGecerlilikTarihi: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string)

    if (!file) {
      return NextResponse.json({ error: "Dosya zorunludur" }, { status: 400 })
    }

    // Validate metadata
    const validatedData = uploadSchema.parse(metadata)

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan büyük olamaz" }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 })
    }

    const yearSource = validatedData.sonGecerlilikTarihi ? new Date(validatedData.sonGecerlilikTarihi) : new Date()
    const year = yearSource.getFullYear()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const ext = dosyaUzantisi(file.name)
    const base = slug(validatedData.ad, 40)
    const uniqueFilename = ext ? `${base}_${timestamp}_${randomString}.${ext}` : `${base}_${timestamp}_${randomString}`

    const filePath = `05_Sertifikalar/${year}/${uniqueFilename}`
    
    try {
      const uploadResult = await storage.upload(file, filePath)
      
      // Save to database
      const evrak = await withTenant(tenantId, async (tx) => {
        const evrak = await tx.sirketEvrak.create({
          data: {
            ...validatedData,
            dosyaYolu: uploadResult,
            dosyaAdi: file.name,
            dosyaBoyutu: file.size,
            dosyaTipi: file.type,
            yukleyenUserId: session.user.id as string,
            tenantId,
            durum: "AKTIF",
          },
          include: {
            yukleyenUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })

        await createAuditLog(
          tx,
          tenantId,
          "SIRKET_EVRAK",
          evrak.id,
          "CREATE",
          session.user.id as string,
          { ad: evrak.ad, tip: evrak.tip }
        )

        return evrak
      })

      return NextResponse.json(evrak, { status: 201 })
    } catch (uploadError) {
      console.error("Dosya yüklenirken hata:", uploadError)
      return NextResponse.json(
        { error: "Dosya yüklenirken bir hata oluştu" },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Evrak yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Evrak yüklenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
