import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

// 4734 Sayılı Kanun Madde 10 kapsamındaki tüm belge tipi kodları
const belgeTipiEnum = z.enum([
  // Ekonomik ve Mali (10/1. Fıkra)
  "BANKA_REFERANS",
  "BILANCO",
  "IS_HACMI",
  // Mesleki ve Teknik (10/2. Fıkra)
  "ODA_KAYIT",
  "IMZA_SIRKULER",
  "IS_DENEYIM",
  "TEKNIK_PERSONEL",
  "MAKINE_TECHIZAT",
  "KALITE_STANDART",
  // İhale Dışı Bırakılma (10/4. Fıkra)
  "IFLAS_KONKORDATO",
  "SGK_BORCU",
  "VERGI_BORCU",
  "ADLI_SICIL",
  "IHALE_DURUM",
  "TICARET_SICIL",
  // Genel
  "DIGER",
])

const onMaddeSchema = z.object({
  ad: z.string().min(1, "Şablon adı zorunludur"),
  belgeTipi: belgeTipiEnum,
  aciklama: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const sablonlar = await withTenant(tenantId, async (tx) =>
      tx.onMaddeSablon.findMany({
        where: { tenantId },
        orderBy: { ad: "asc" },
      })
    )

    return NextResponse.json(sablonlar)
  } catch (error) {
    return NextResponse.json({ error: "Şablonlar alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const body = await request.json()
    const validatedData = onMaddeSchema.parse(body)

    const sablon = await withTenant(tenantId, async (tx) =>
      tx.onMaddeSablon.create({
        data: {
          ...validatedData,
          tenantId,
        },
      })
    )

    return NextResponse.json(sablon, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Şablon oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: "Şablon ID zorunludur" }, { status: 400 })

    const validatedData = onMaddeSchema.partial().parse(updateData)

    const existing = await withTenant(tenantId, async (tx) =>
      tx.onMaddeSablon.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const sablon = await withTenant(tenantId, async (tx) =>
      tx.onMaddeSablon.update({
        where: { id },
        data: validatedData,
      })
    )

    return NextResponse.json(sablon)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Şablon güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: "Şablon ID zorunludur" }, { status: 400 })

    const existing = await withTenant(tenantId, async (tx) =>
      tx.onMaddeSablon.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await withTenant(tenantId, async (tx) => tx.onMaddeSablon.delete({ where: { id } }))

    return NextResponse.json({ message: "Şablon başarıyla silindi" })
  } catch (error) {
    return NextResponse.json({ error: "Şablon silinirken hata oluştu" }, { status: 500 })
  }
}
