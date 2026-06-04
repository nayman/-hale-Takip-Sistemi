import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit-log"
import { Prisma } from "@prisma/client"

const checklistTemplate = [
  { belgeKodu: "FATURA", belgeAdi: "Fatura" },
  { belgeKodu: "SGK_PRIM_BORCSUZLUK", belgeAdi: "SGK Prim Borçsuzluk Yazısı" },
  { belgeKodu: "VERGI_BORCSUZLUK", belgeAdi: "Vergi Borcu Yoktur Yazısı" },
  { belgeKodu: "SGK_BILDIRGE_TAHAKKUK", belgeAdi: "SGK Bildirgeleri ve Tahakkuk Fişleri" },
  { belgeKodu: "MAAS_DEKONTLARI", belgeAdi: "Maaş Ödeme Dekontları (Önceki Ay)" },
] as const

const checklistDurumEnum = z.enum(["EKSIK", "TAMAMLANDI", "MUAF"])

const upsertSchema = z.object({
  yil: z.coerce.number().int().min(2000),
  ay: z.coerce.number().int().min(1).max(12),
  brutTutar: z.coerce.number().finite().min(0),
  kdvOrani: z.coerce.number().finite().min(0).optional(),
  stopajOrani: z.coerce.number().finite().min(0).optional(),
  ceza: z.coerce.number().finite().min(0).optional(),
  digerKesinti: z.coerce.number().finite().min(0).optional(),
  durum: z.enum(["TASLAK", "ONAYLANDI", "ODENDI"]).optional(),
  odemeTarihi: z.string().optional().nullable(),
})

const checklistGetSchema = z.object({
  yil: z.coerce.number().int().min(2000),
  ay: z.coerce.number().int().min(1).max(12),
})

const checklistPutSchema = z.object({
  yil: z.coerce.number().int().min(2000),
  ay: z.coerce.number().int().min(1).max(12),
  items: z
    .array(
      z.object({
        belgeKodu: z.string().min(1),
        durum: checklistDurumEnum,
        not: z.string().max(2000).optional().nullable(),
        dosyaAdi: z.string().max(500).optional().nullable(),
      })
    )
    .max(100),
})

async function applyOdemeTerminiMeta(input: {
  tx: any
  tenantId: string
  ihaleId: string
  hakedisId: string
  durum: string
}) {
  if (!input.hakedisId) return
  try {
    if (input.durum === "TASLAK") {
      await input.tx.$executeRaw(
        Prisma.sql`UPDATE "hakedisler" SET "onayTarihi" = NULL, "vadeTarihi" = NULL WHERE "id" = ${input.hakedisId}`
      )
      return
    }

    if (input.durum !== "ONAYLANDI" && input.durum !== "ODENDI") return

    let odemeVadesiGun = 30
    try {
      const rows: any[] = await input.tx.$queryRaw(
        Prisma.sql`SELECT COALESCE("odemeVadesiGun", 30) AS "odemeVadesiGun" FROM "sozlesmeler" WHERE "ihaleId" = ${input.ihaleId} AND "tenantId" = ${input.tenantId} LIMIT 1`
      )
      const v = rows?.[0]?.odemeVadesiGun
      if (Number.isFinite(Number(v))) odemeVadesiGun = Number(v)
    } catch {
      odemeVadesiGun = 30
    }

    const now = new Date()
    await input.tx.$executeRaw(
      Prisma.sql`
        UPDATE "hakedisler"
        SET
          "onayTarihi" = COALESCE("onayTarihi", ${now}),
          "vadeTarihi" = COALESCE("vadeTarihi", COALESCE("onayTarihi", ${now}) + make_interval(days => ${odemeVadesiGun}))
        WHERE "id" = ${input.hakedisId}
      `
    )
  } catch {
    return
  }
}

function hesapla(input: {
  brutTutar: number
  kdvOrani: number
  stopajOrani: number
  ceza: number
  digerKesinti: number
}) {
  const kdvTutari = (input.brutTutar * input.kdvOrani) / 100
  const stopajTutari = (input.brutTutar * input.stopajOrani) / 100
  const netTutar = input.brutTutar + kdvTutari - stopajTutari - input.ceza - input.digerKesinti
  return { kdvTutari, stopajTutari, netTutar }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: ihaleId } = await params
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode")

    if (mode === "checklist") {
      const validated = checklistGetSchema.parse({
        yil: searchParams.get("yil"),
        ay: searchParams.get("ay"),
      })

      const result = await withTenant(tenantId, async (tx) => {
        const hakedis = await tx.hakedis.findFirst({
          where: { ihaleId, yil: validated.yil, ay: validated.ay, ihale: { tenantId } },
          select: { id: true },
        })

        const base = checklistTemplate.map((t) => ({
          belgeKodu: t.belgeKodu,
          belgeAdi: t.belgeAdi,
          durum: "EKSIK" as const,
          not: null as string | null,
          dosyaAdi: null as string | null,
        }))

        if (!hakedis) {
          const missingCount = base.filter((x) => x.durum === "EKSIK").length
          return {
            hakedisId: null as string | null,
            items: base,
            total: base.length,
            missingCount,
            persisted: false,
            message: "Bu dönem için hakediş kaydı yok. Önce hakediş kaydı oluşturun.",
          }
        }

        const delegate = (tx as any).hakedisChecklistItem
        if (!delegate) {
          const missingCount = base.filter((x) => x.durum === "EKSIK").length
          return { hakedisId: hakedis.id, items: base, total: base.length, missingCount, persisted: false }
        }

        try {
          const existing: any[] = await delegate.findMany({
            where: { tenantId, hakedisId: hakedis.id },
            select: { belgeKodu: true, belgeAdi: true, durum: true, not: true, dosyaAdi: true },
          })

          const byCode = new Map(existing.map((x) => [String(x.belgeKodu), x]))
          const merged = checklistTemplate.map((t) => {
            const hit = byCode.get(t.belgeKodu)
            return {
              belgeKodu: t.belgeKodu,
              belgeAdi: t.belgeAdi,
              durum: hit?.durum === "TAMAMLANDI" || hit?.durum === "MUAF" || hit?.durum === "EKSIK" ? hit.durum : "EKSIK",
              not: typeof hit?.not === "string" ? hit.not : null,
              dosyaAdi: typeof hit?.dosyaAdi === "string" ? hit.dosyaAdi : null,
            }
          })

          const extra = existing
            .filter((x) => !checklistTemplate.some((t) => t.belgeKodu === x.belgeKodu))
            .map((x) => ({
              belgeKodu: String(x.belgeKodu),
              belgeAdi: String(x.belgeAdi || x.belgeKodu),
              durum: x.durum === "TAMAMLANDI" || x.durum === "MUAF" || x.durum === "EKSIK" ? x.durum : "EKSIK",
              not: typeof x.not === "string" ? x.not : null,
              dosyaAdi: typeof x.dosyaAdi === "string" ? x.dosyaAdi : null,
            }))

          const items = [...merged, ...extra]
          const missingCount = items.filter((x) => x.durum === "EKSIK").length
          return { hakedisId: hakedis.id, items, total: items.length, missingCount, persisted: true }
        } catch {
          const missingCount = base.filter((x) => x.durum === "EKSIK").length
          return { hakedisId: hakedis.id, items: base, total: base.length, missingCount, persisted: false }
        }
      })

      return NextResponse.json(result)
    }

    const list = await withTenant(tenantId, (tx) =>
      tx.hakedis.findMany({
        where: { ihaleId, ihale: { tenantId } },
        orderBy: [{ yil: "desc" }, { ay: "desc" }],
      })
    )

    return NextResponse.json(list)
  } catch (error) {
    console.error("GET hakediş hatası:", error)
    return NextResponse.json({ error: "Hakediş kayıtları alınırken hata oluştu" }, { status: 500 })
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

    const kdvOrani = validated.kdvOrani ?? 20
    const stopajOrani = validated.stopajOrani ?? 0
    const ceza = validated.ceza ?? 0
    const digerKesinti = validated.digerKesinti ?? 0
    const calc = hesapla({ brutTutar: validated.brutTutar, kdvOrani, stopajOrani, ceza, digerKesinti })

    const saved = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const odemeTarihi = validated.odemeTarihi ? new Date(validated.odemeTarihi) : null

      const saved = await tx.hakedis.upsert({
        where: { ihaleId_yil_ay: { ihaleId, yil: validated.yil, ay: validated.ay } },
        create: {
          ihaleId,
          yil: validated.yil,
          ay: validated.ay,
          brutTutar: validated.brutTutar,
          kdvOrani,
          stopajOrani,
          ceza,
          digerKesinti,
          ...calc,
          durum: validated.durum ?? "TASLAK",
          odemeTarihi: validated.durum === "ODENDI" ? odemeTarihi ?? new Date() : null,
        },
        update: {
          brutTutar: validated.brutTutar,
          kdvOrani,
          stopajOrani,
          ceza,
          digerKesinti,
          ...calc,
          durum: validated.durum ?? undefined,
          odemeTarihi: validated.durum === "ODENDI" ? odemeTarihi ?? new Date() : validated.durum ? null : undefined,
        },
      })

      await applyOdemeTerminiMeta({
        tx,
        tenantId,
        ihaleId,
        hakedisId: saved.id,
        durum: validated.durum ?? saved.durum,
      })

      return saved
    })

    if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("POST hakediş hatası:", error)
    return NextResponse.json({ error: "Hakediş kaydı oluşturulurken hata oluştu" }, { status: 500 })
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
    const userId = session.user.id
    const { id: ihaleId } = await params
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode")

    if (mode === "checklist") {
      const body = await request.json()
      const validated = checklistPutSchema.parse(body)

      const templateMap = new Map<string, string>(checklistTemplate.map((t) => [t.belgeKodu, t.belgeAdi]))

      const result = await withTenant(tenantId, async (tx) => {
        const hakedis = await tx.hakedis.findFirst({
          where: { ihaleId, yil: validated.yil, ay: validated.ay, ihale: { tenantId } },
          select: { id: true },
        })
        if (!hakedis) return { ok: false as const, error: "Bu dönem için hakediş kaydı yok" }

        const delegate = (tx as any).hakedisChecklistItem
        if (!delegate) return { ok: false as const, error: "Checklist modülü için migration gerekli" }

        for (const item of validated.items) {
          const belgeKodu = item.belgeKodu
          const belgeAdi = templateMap.get(belgeKodu) ?? belgeKodu
          await delegate.upsert({
            where: { tenantId_hakedisId_belgeKodu: { tenantId, hakedisId: hakedis.id, belgeKodu } },
            create: {
              tenantId,
              hakedisId: hakedis.id,
              belgeKodu,
              belgeAdi,
              durum: item.durum,
              not: item.not ?? null,
              dosyaAdi: item.dosyaAdi ?? null,
            },
            update: {
              belgeAdi,
              durum: item.durum,
              not: item.not ?? null,
              dosyaAdi: item.dosyaAdi ?? null,
            },
          })
        }

        await createAuditLog(tx, tenantId, "HAKEDIS", hakedis.id, "UPDATE", userId, {
          action: "CHECKLIST_UPDATE",
          yil: validated.yil,
          ay: validated.ay,
          count: validated.items.length,
        })

        return { ok: true as const }
      })

      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.error.includes("migration") ? 501 : 400 })
      return NextResponse.json({ ok: true })
    }

    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const body = await request.json()
    const partial = upsertSchema.partial().parse(body)

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.hakedis.findFirst({ where: { id, ihaleId, ihale: { tenantId } } })
      if (!existing) return null

      const kdvOrani = partial.kdvOrani ?? existing.kdvOrani
      const stopajOrani = partial.stopajOrani ?? existing.stopajOrani
      const ceza = partial.ceza ?? existing.ceza
      const digerKesinti = partial.digerKesinti ?? existing.digerKesinti
      const brutTutar = partial.brutTutar ?? existing.brutTutar
      const calc = hesapla({ brutTutar, kdvOrani, stopajOrani, ceza, digerKesinti })

      const durum = partial.durum ?? existing.durum
      const odemeTarihiRaw = partial.odemeTarihi !== undefined ? partial.odemeTarihi : undefined
      const odemeTarihi = odemeTarihiRaw ? new Date(odemeTarihiRaw) : null

      const updated = await tx.hakedis.update({
        where: { id },
        data: {
          brutTutar,
          kdvOrani,
          stopajOrani,
          ceza,
          digerKesinti,
          ...calc,
          durum,
          odemeTarihi: durum === "ODENDI" ? odemeTarihi ?? existing.odemeTarihi ?? new Date() : null,
        },
      })

      await applyOdemeTerminiMeta({ tx, tenantId, ihaleId, hakedisId: updated.id, durum })

      return updated
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("PUT hakediş hatası:", error)
    return NextResponse.json({ error: "Hakediş güncellenirken hata oluştu" }, { status: 500 })
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
      const existing = await tx.hakedis.findFirst({ where: { id, ihaleId, ihale: { tenantId } } })
      if (!existing) return false
      await tx.hakedis.delete({ where: { id } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE hakediş hatası:", error)
    return NextResponse.json({ error: "Hakediş silinirken hata oluştu" }, { status: 500 })
  }
}
