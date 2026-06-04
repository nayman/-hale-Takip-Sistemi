import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

function parseDateOnly(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const m = trimmed.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/)
  if (m) {
    const day = Number(m[1])
    const month = Number(m[2])
    const year = Number(m[3])
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
    const d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00.000Z`)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  const asDate = new Date(trimmed)
  if (Number.isNaN(asDate.getTime())) return null
  asDate.setUTCHours(0, 0, 0, 0)
  return asDate
}

async function ensureDimTakvim(tx: any, date: Date) {
  const yil = date.getUTCFullYear()
  const ay = date.getUTCMonth() + 1
  const gun = date.getUTCDate()
  const jsDay = date.getUTCDay()
  const haftaninGunu = jsDay === 0 ? 7 : jsDay
  const haftaSonuMu = jsDay === 0 || jsDay === 6

  await tx.dimTakvim.upsert({
    where: { tarih: date },
    create: { tarih: date, yil, ay, gun, haftaninGunu, haftaSonuMu },
    update: {},
  })
}

const holidayItemSchema = z.object({
  tarih: z.string().min(1),
  aciklama: z.string().optional().nullable(),
  arefe: z.boolean().optional(),
})

const postSchema = z.object({
  items: z.array(holidayItemSchema).optional(),
  importText: z.string().optional(),
})

const putSchema = z.object({
  id: z.string().min(1),
  tarih: z.string().optional(),
  aciklama: z.string().optional().nullable(),
  arefe: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    const year = yearParam ? Number(yearParam) : null

    const where: any = { tenantId }
    if (year && Number.isFinite(year)) {
      where.tarih = {
        gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
        lt: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0)),
      }
    }

    const items = await withTenant(tenantId, (tx) =>
      tx.resmiTatil.findMany({
        where,
        orderBy: { tarih: "asc" },
        select: { id: true, tarih: true, aciklama: true, arefe: true },
      })
    )

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET resmi tatiller hatası:", error)
    return NextResponse.json({ error: "Resmi tatiller alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const body = await request.json()
    const input = postSchema.parse(body)

    const items: Array<{ tarih: Date; aciklama: string | null; arefe: boolean }> = []

    if (typeof input.importText === "string" && input.importText.trim()) {
      const lines = input.importText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)

      for (const line of lines) {
        const m = line.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})(?:\s+(.*))?$/)
        if (!m) continue
        const tarih = parseDateOnly(`${m[1]}.${m[2]}.${m[3]}`)
        if (!tarih) continue
        const aciklama = typeof m[4] === "string" && m[4].trim() ? m[4].trim() : null
        const arefe = aciklama ? /\barefe\b/i.test(aciklama) : false
        items.push({ tarih, aciklama, arefe })
      }
    } else if (Array.isArray(input.items) && input.items.length) {
      for (const raw of input.items) {
        const tarih = parseDateOnly(raw.tarih)
        if (!tarih) continue
        const aciklama = raw.aciklama && raw.aciklama.trim() ? raw.aciklama.trim() : null
        items.push({ tarih, aciklama, arefe: raw.arefe ?? false })
      }
    } else {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
    }

    if (items.length === 0) return NextResponse.json({ createdCount: 0 })

    const createdCount = await withTenant(tenantId, async (tx) => {
      for (const it of items) {
        await ensureDimTakvim(tx, it.tarih)
      }

      const result = await tx.resmiTatil.createMany({
        data: items.map((it) => ({
          tarih: it.tarih,
          aciklama: it.aciklama,
          arefe: it.arefe,
          tenantId,
        })),
        skipDuplicates: true,
      })

      return result.count ?? 0
    })

    return NextResponse.json({ createdCount })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("POST resmi tatil hatası:", error)
    return NextResponse.json({ error: "Resmi tatil oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const body = await request.json()
    const input = putSchema.parse(body)

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.resmiTatil.findFirst({ where: { id: input.id, tenantId } })
      if (!existing) return null

      const data: any = {}
      if (input.aciklama !== undefined) data.aciklama = input.aciklama && input.aciklama.trim() ? input.aciklama.trim() : null
      if (input.arefe !== undefined) data.arefe = input.arefe

      if (input.tarih !== undefined) {
        const parsed = parseDateOnly(input.tarih)
        if (!parsed) return null
        await ensureDimTakvim(tx, parsed)
        data.tarih = parsed
      }

      const result = await tx.resmiTatil.update({ where: { id: input.id }, data })
      return result
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("PUT resmi tatil hatası:", error)
    return NextResponse.json({ error: "Resmi tatil güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.resmiTatil.findFirst({ where: { id, tenantId } })
      if (!existing) return false
      await tx.resmiTatil.delete({ where: { id } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE resmi tatil hatası:", error)
    return NextResponse.json({ error: "Resmi tatil silinirken hata oluştu" }, { status: 500 })
  }
}
