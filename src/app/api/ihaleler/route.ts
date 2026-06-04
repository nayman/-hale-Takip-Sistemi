import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit-log"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { turkishToAscii } from "@/lib/slug"

const dateInput = z.preprocess((value) => {
  if (value instanceof Date) return value
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`)
  }
  return new Date(trimmed)
}, z.date())

const ihaleSchema = z.object({
  ihaleNo: z.string().min(1, "İhale no zorunludur"),
  ad: z.string().min(1, "İhale adı zorunludur"),
  aciklama: z.string().optional(),
  tur: z.enum(["MAL_ALIM", "HIZMET_ALIM", "YAPIM_ISI"]),
  usul: z.enum(["ACIK_IHALE", "BELLI_ISTEKLI", "DOGRUDAN_TEMIN"]),
  kurumId: z.string().min(1, "Kurum seçimi zorunludur"),
  butce: z.coerce.number().finite().min(0, "Bütçe 0'dan büyük olmalıdır"),
  sozlesmeBedeli: z.coerce.number().finite().optional(),
  baslangicTarihi: dateInput,
  bitisTarihi: dateInput,
  teklifSonTarihi: dateInput,
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const durum = searchParams.get('durum')

    const whereClause: any = {
      tenantId
    }

    if (durum) {
      if (durum === 'AKTIF') {
        whereClause.durum = {
          in: ['TASLAK', 'DEVAM_EDİYOR']
        }
      } else if (durum === 'TASLAK') {
        whereClause.durum = 'TASLAK'
      } else if (durum === 'DEVAM_EDİYOR') {
        whereClause.durum = 'DEVAM_EDİYOR'
      } else {
        whereClause.durum = durum
      }
    }

    const { ihaleler, total } = await withTenant(tenantId, async (tx) => {
      const [ihaleler, total] = await Promise.all([
        tx.ihale.findMany({
          where: whereClause,
          select: {
            id: true,
            ihaleNo: true,
            ad: true,
            aciklama: true,
            tur: true,
            usul: true,
            kurumId: true,
            butce: true,
            sozlesmeBedeli: true,
            baslangicTarihi: true,
            bitisTarihi: true,
            teklifSonTarihi: true,
            durum: true,
            createdAt: true,
            updatedAt: true,
            tenantId: true,
            olusturanUserId: true,
            sorumluUserId: true,
            olusturanUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            sorumluUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            bitisTarihi: "asc",
          },
          take: limit,
          skip: offset,
        }),
        tx.ihale.count({ where: whereClause }),
      ])

      return { ihaleler, total }
    })

    return NextResponse.json({
      ihaleler,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error("İhaleler alınırken hata:", error)
    return NextResponse.json(
      { error: "İhaleler alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const body = await request.json()
    const validatedData = ihaleSchema.parse(body)

    const id =
      (globalThis as any).crypto?.randomUUID?.() ??
      `ihale_${Date.now()}_${Math.random().toString(16).slice(2)}`

    let userId = session.user.id as string
    const userExists = await prismaClient.user.findUnique({ where: { id: userId } })
    if (!userExists && session.user?.email) {
      const userByEmail = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (userByEmail) {
        userId = userByEmail.id
      } else {
        return NextResponse.json({ error: "User not found in database" }, { status: 401 })
      }
    }

    const ihale = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.create({
        data: {
          id,
          ihaleNo: validatedData.ihaleNo,
          ad: validatedData.ad,
          aciklama: validatedData.aciklama,
          tur: validatedData.tur,
          usul: validatedData.usul,
          kurumId: validatedData.kurumId,
          butce: validatedData.butce,
          sozlesmeBedeli: validatedData.sozlesmeBedeli,
          baslangicTarihi: validatedData.baslangicTarihi,
          bitisTarihi: validatedData.bitisTarihi,
          teklifSonTarihi: validatedData.teklifSonTarihi,
          durum: "TASLAK",
          tenantId,
          olusturanUserId: userId,
        },
      })

      await createAuditLog(
        tx,
        tenantId,
        "IHALE",
        ihale.id,
        "CREATE",
        userId,
        { ihaleNo: ihale.ihaleNo, ad: ihale.ad }
      )

      return ihale
    })

    try {
      const kurum = await withTenant(tenantId, (tx) =>
        tx.kurum.findFirst({ where: { id: ihale.kurumId, tenantId }, select: { ad: true } })
      )

      const sanitizePart = (value: string, maxLen: number) => {
        const ascii = turkishToAscii(value || "")
        const cleaned = ascii
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
          .replace(/\s+/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_+|_+$/g, "")
        const cut = cleaned.length > maxLen ? cleaned.substring(0, maxLen).replace(/_+$/g, "") : cleaned
        return cut || "X"
      }

      const year = new Date(ihale.teklifSonTarihi).getFullYear()
      const folderName = `${year}_${sanitizePart(ihale.ihaleNo, 24)}_${sanitizePart(kurum?.ad || "KURUM", 40)}`
      const base = `Ihaleler/${folderName}`

      const subFolders = [
        `${base}/01_Ihale_Dokumanlari`,
        `${base}/02_Teklif_ve_Yeterlik_Belgeleri`,
        `${base}/03_Sozlesme_ve_Teminatlar`,
        `${base}/04_Operasyon_ve_Personel`,
        `${base}/05_Hakedisler`,
        `${base}/05_Hakedisler/Fatura_ve_Hak_Edis_Raporu`,
        `${base}/05_Hakedisler/SGK_ve_Vergi_Belgeleri`,
        `${base}/05_Hakedisler/Banka_Dekontlari_ve_Tahakkuklar`,
      ]

      const storage: any = await getStorageAdapter(tenantId)
      if (typeof storage?.ensureFolder === "function") {
        for (const folderPath of subFolders) {
          await storage.ensureFolder(folderPath)
        }
      }

      await createAuditLog(prismaClient, tenantId, "IHALE", ihale.id, "UPDATE", userId, {
        action: "ARCHIVE_FOLDER_INIT",
        basePath: base,
      })
    } catch (e: any) {
      console.error("İhale arşiv klasör şablonu oluşturulamadı:", e?.message || e)
      await createAuditLog(prismaClient, tenantId, "IHALE", ihale.id, "UPDATE", userId, {
        action: "ARCHIVE_FOLDER_INIT_FAILED",
        error: e?.message || String(e),
      })
    }

    return NextResponse.json(ihale, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("İhale oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "İhale oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "İhale ID zorunludur" }, { status: 400 })
    }

    const validatedData = ihaleSchema.partial().parse(updateData)

    const ihale = await withTenant(tenantId, async (tx) =>
      tx.ihale.update({
        where: {
          id: id,
          tenantId,
        },
        data: validatedData,
      })
    )

    return NextResponse.json(ihale)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("İhale güncellenirken hata:", error)
    return NextResponse.json(
      { error: "İhale güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "İhale ID zorunludur" }, { status: 400 })
    }

    await withTenant(tenantId, async (tx) =>
      tx.ihale.delete({
        where: {
          id: id,
          tenantId,
        },
      })
    )

    return NextResponse.json({ message: "İhale başarıyla silindi" })
  } catch (error) {
    console.error("İhale silinirken hata:", error)
    return NextResponse.json(
      { error: "İhale silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
