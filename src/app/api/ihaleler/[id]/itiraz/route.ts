import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit-log"

const itirazCreateSchema = z.object({
  tip: z.enum(["IDAREYE_ITIRAZ", "KIK_ITIRAZI"]),
  durum: z.enum(["TASLAK", "GONDERILDI", "REDDEDILDI", "KABUL_EDILDI"]).default("TASLAK"),
  aciklama: z.string().optional().nullable(),
  basvuruTarihi: z.string().optional().nullable(),
  kararTarihi: z.string().optional().nullable(),
})

const itirazUpdateSchema = z.object({
  id: z.string().min(1),
  tip: z.enum(["IDAREYE_ITIRAZ", "KIK_ITIRAZI"]).optional(),
  durum: z.enum(["TASLAK", "GONDERILDI", "REDDEDILDI", "KABUL_EDILDI"]).optional(),
  aciklama: z.string().optional().nullable(),
  basvuruTarihi: z.string().optional().nullable(),
  kararTarihi: z.string().optional().nullable(),
})

function parseOptionalDate(input: string | null | undefined): Date | null | undefined {
  if (input === undefined) return undefined
  if (input === null) return null
  const trimmed = input.trim()
  if (!trimmed) return null
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const { id: ihaleId } = await params

    const itirazlar = await withTenant(tenantId, (tx) =>
      tx.ihaleItiraz.findMany({
        where: { ihaleId, ihale: { tenantId } },
        orderBy: { basvuruTarihi: "desc" },
        include: {
          belgeler: {
            orderBy: { ad: "asc" },
          },
        },
      })
    )

    return NextResponse.json(itirazlar)
  } catch (error) {
    console.error("GET itirazlar hatası:", error)
    return NextResponse.json({ error: "İtirazlar alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: ihaleId } = await params

    const body = await request.json()
    const input = itirazCreateSchema.parse(body)

    const created = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const itiraz = await tx.ihaleItiraz.create({
        data: {
          ihaleId,
          tip: input.tip,
          durum: input.durum,
          aciklama: input.aciklama && input.aciklama.trim() ? input.aciklama.trim() : null,
          basvuruTarihi: parseOptionalDate(input.basvuruTarihi) ?? undefined,
          kararTarihi: parseOptionalDate(input.kararTarihi) ?? undefined,
        },
        include: { belgeler: true },
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "ADD_ITIRAZ",
        itirazId: itiraz.id,
        tip: itiraz.tip,
        durum: itiraz.durum,
      })

      return itiraz
    })

    if (!created) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("POST itiraz hatası:", error)
    return NextResponse.json({ error: "İtiraz oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: ihaleId } = await params

    const body = await request.json()
    const input = itirazUpdateSchema.parse(body)

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleItiraz.findFirst({
        where: { id: input.id, ihaleId, ihale: { tenantId } },
      })
      if (!existing) return null

      const data: any = {}
      if (input.tip !== undefined) data.tip = input.tip
      if (input.durum !== undefined) data.durum = input.durum
      if (input.aciklama !== undefined) data.aciklama = input.aciklama && input.aciklama.trim() ? input.aciklama.trim() : null

      const basvuruTarihi = parseOptionalDate(input.basvuruTarihi)
      if (basvuruTarihi !== undefined) data.basvuruTarihi = basvuruTarihi

      const kararTarihi = parseOptionalDate(input.kararTarihi)
      if (kararTarihi !== undefined) data.kararTarihi = kararTarihi

      const result = await tx.ihaleItiraz.update({ where: { id: input.id }, data, include: { belgeler: true } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "UPDATE_ITIRAZ", itirazId: input.id, changes: data })
      return result
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("PUT itiraz hatası:", error)
    return NextResponse.json({ error: "İtiraz güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: ihaleId } = await params

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleItiraz.findFirst({ where: { id, ihaleId, ihale: { tenantId } } })
      if (!existing) return false
      await tx.ihaleItiraz.delete({ where: { id } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "DELETE_ITIRAZ", itirazId: id })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE itiraz hatası:", error)
    return NextResponse.json({ error: "İtiraz silinirken hata oluştu" }, { status: 500 })
  }
}

