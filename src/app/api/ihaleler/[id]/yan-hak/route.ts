import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

const schema = z.object({
  yolGunluk: z.coerce.number().finite().min(0),
  yanHakGunSayisi: z.coerce.number().int().min(0).max(31),
  yemekTip: z.enum(["NAKDI", "AYNI", "IDARE_SAGLAR"]),
  yemekGunluk: z.coerce.number().finite().min(0),
  fazlaMesaiSaatUcreti: z.coerce.number().finite().min(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: ihaleId } = await params

    const data = await withTenant(tenantId, (tx) =>
      tx.ihaleYanHakParam.findFirst({ where: { ihaleId, ihale: { tenantId } } })
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET ihale yan hak param hatası:", error)
    return NextResponse.json({ error: "Yan hak parametreleri alınırken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const { id: ihaleId } = await params
    const body = await request.json()
    const validated = schema.parse(body)

    const saved = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      return tx.ihaleYanHakParam.upsert({
        where: { ihaleId },
        create: { ihaleId, ...validated },
        update: { ...validated },
      })
    })

    if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(saved)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("PUT ihale yan hak param hatası:", error)
    return NextResponse.json({ error: "Yan hak parametreleri kaydedilirken hata oluştu" }, { status: 500 })
  }
}
