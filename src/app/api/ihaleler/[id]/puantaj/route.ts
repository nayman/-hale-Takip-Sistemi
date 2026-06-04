import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

const upsertSchema = z.object({
  yil: z.coerce.number().int().min(2000),
  ay: z.coerce.number().int().min(1).max(12),
  calismaGunu: z.coerce.number().int().min(0),
  devamsizlikGunu: z.coerce.number().int().min(0).optional(),
  fazlaMesaiSaat: z.coerce.number().finite().min(0).optional(),
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

    const list = await withTenant(tenantId, (tx) =>
      tx.puantaj.findMany({
        where: { ihaleId, ihale: { tenantId } },
        orderBy: [{ yil: "desc" }, { ay: "desc" }],
      })
    )

    return NextResponse.json(list)
  } catch (error) {
    console.error("GET puantaj hatası:", error)
    return NextResponse.json({ error: "Puantaj kayıtları alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(
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
    const validated = upsertSchema.parse(body)

    const saved = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      return tx.puantaj.upsert({
        where: { ihaleId_yil_ay: { ihaleId, yil: validated.yil, ay: validated.ay } },
        create: {
          ihaleId,
          yil: validated.yil,
          ay: validated.ay,
          calismaGunu: validated.calismaGunu,
          devamsizlikGunu: validated.devamsizlikGunu ?? 0,
          fazlaMesaiSaat: validated.fazlaMesaiSaat ?? 0,
        },
        update: {
          calismaGunu: validated.calismaGunu,
          devamsizlikGunu: validated.devamsizlikGunu ?? 0,
          fazlaMesaiSaat: validated.fazlaMesaiSaat ?? 0,
        },
      })
    })

    if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("POST puantaj hatası:", error)
    return NextResponse.json({ error: "Puantaj kaydı oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.puantaj.findFirst({ where: { id, ihaleId, ihale: { tenantId } } })
      if (!existing) return false
      await tx.puantaj.delete({ where: { id } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE puantaj hatası:", error)
    return NextResponse.json({ error: "Puantaj kaydı silinirken hata oluştu" }, { status: 500 })
  }
}

