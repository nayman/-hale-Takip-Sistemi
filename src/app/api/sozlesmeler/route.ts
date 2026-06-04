import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { hesaplaSozlesmeKesintileri } from "@/lib/sozlesme-hesap"
import { createAuditLog } from "@/lib/audit-log"

const sozlesmeSchema = z.object({
  ihaleId: z.string().min(1, "İhale ID zorunludur"),
  ekapNo: z.string().optional(),
  bedel: z.coerce.number().min(0, "Sözleşme bedeli 0'dan büyük olmalıdır"),
  odemeVadesiGun: z.coerce.number().int().min(0).optional(),
  cezaUstSinirYuzde: z.coerce.number().finite().min(0).optional(),
  kritikKesintiSaat: z.coerce.number().int().min(0).optional(),
  kritikKesintiCezaYuzde: z.coerce.number().finite().min(0).optional(),
  donemSonlandirmaFesihTekrar: z.coerce.number().int().min(0).optional(),
  ozelAykirilikFesihLimit: z.coerce.number().int().min(0).optional(),
  altYukleniciKural: z.enum(["YASAK", "IZINLI"]).optional(),
  baslangicTarihi: z.string().datetime().optional().nullable(),
  bitisTarihi: z.string().datetime().optional().nullable(),
  // Yeni eklenen alanlar (P2.2)
  fikriMulkiyet: z.string().optional().nullable(),
  teslimHaklari: z.string().optional().nullable(),
  ortakGirisim: z.boolean().optional(),
  ortaklikOranlari: z.any().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 200) || 200))
    const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0)

    const sozlesmeler = await withTenant(
      tenantId,
      async (tx) =>
        tx.sozlesme.findMany({
          where: { tenantId },
          select: {
            id: true,
            ekapNo: true,
            bedel: true,
            odemeVadesiGun: true,
            cezaUstSinirYuzde: true,
            kritikKesintiSaat: true,
            kritikKesintiCezaYuzde: true,
            donemSonlandirmaFesihTekrar: true,
            ozelAykirilikFesihLimit: true,
            altYukleniciKural: true,
            baslangicTarihi: true,
            bitisTarihi: true,
            fikriMulkiyet: true,
            teslimHaklari: true,
            ortakGirisim: true,
            ortaklikOranlari: true,
            createdAt: true,
            ihale: { select: { ad: true, ihaleNo: true, durum: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
      { timeoutMs: 30000 }
    )

    return NextResponse.json(sozlesmeler)
  } catch (error) {
    console.error("Sözleşmeler alınırken hata:", error)
    return NextResponse.json({ error: "Sözleşmeler alınırken bir hata oluştu" }, { status: 500 })
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
    const validatedData = sozlesmeSchema.parse(body)

    // Calculate taxes and guarantees automatically
    const hesaplamalar = hesaplaSozlesmeKesintileri(validatedData.bedel)

    const sozlesme = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.create({
        data: {
          ...validatedData,
          ...hesaplamalar,
          tenantId,
        },
        include: { ihale: true },
      })

      await createAuditLog(
        tx,
        tenantId,
        "SOZLESME",
        sozlesme.id,
        "CREATE",
        session.user.id as string,
        { ihaleId: sozlesme.ihaleId, bedel: sozlesme.bedel }
      )

      return sozlesme
    })

    return NextResponse.json(sozlesme, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Sözleşme oluşturulurken hata:", error)
    return NextResponse.json({ error: "Sözleşme oluşturulurken bir hata oluştu" }, { status: 500 })
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
      return NextResponse.json({ error: "Sözleşme ID zorunludur" }, { status: 400 })
    }

    const validatedData = sozlesmeSchema.partial().parse(updateData)
    
    // Recalculate if bedel changed
    let hesaplamalar = {}
    if (validatedData.bedel !== undefined) {
      hesaplamalar = hesaplaSozlesmeKesintileri(validatedData.bedel)
    }

    const sozlesme = await withTenant(tenantId, async (tx) => {
      const existing = await tx.sozlesme.findFirst({ where: { id, tenantId } })
      if (!existing) return null

      const sozlesme = await tx.sozlesme.update({
        where: { id },
        data: {
          ...validatedData,
          ...hesaplamalar,
        },
      })

      await createAuditLog(
        tx,
        tenantId,
        "SOZLESME",
        sozlesme.id,
        "UPDATE",
        session.user.id as string,
        validatedData
      )

      return sozlesme
    })

    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(sozlesme)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Sözleşme güncellenirken hata:", error)
    return NextResponse.json({ error: "Sözleşme güncellenirken bir hata oluştu" }, { status: 500 })
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
      return NextResponse.json({ error: "Sözleşme ID zorunludur" }, { status: 400 })
    }

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.sozlesme.findFirst({ where: { id, tenantId } })
      if (!existing) return false
      await tx.sozlesme.delete({ where: { id } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Sözleşme başarıyla silindi" })
  } catch (error) {
    console.error("Sözleşme silinirken hata:", error)
    return NextResponse.json({ error: "Sözleşme silinirken bir hata oluştu" }, { status: 500 })
  }
}
