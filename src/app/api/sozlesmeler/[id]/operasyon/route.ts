import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

function isPrivilegedRole(role: unknown) {
  return role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
}

async function notifyTenantUsers(
  tx: any,
  tenantId: string,
  input: { title: string; message: string; type: string; data?: unknown; userIds?: string[] }
) {
  const users = input.userIds
    ? await tx.user.findMany({
        where: { tenantId, id: { in: input.userIds } },
        select: { id: true },
      })
    : await tx.user.findMany({
        where: { tenantId, rol: { in: ["TENANT_ADMIN", "SORUMLU", "OPERASYON"] } },
        select: { id: true },
      })

  if (!Array.isArray(users) || users.length === 0) return

  await tx.notification.createMany({
    data: users.map((u: { id: string }) => ({
      tenantId,
      userId: u.id,
      title: input.title,
      message: input.message,
      type: input.type,
      data: input.data ?? null,
      isRead: false,
      readAt: null,
    })),
  })
}

const incidentCreateSchema = z.object({
  kind: z.literal("INCIDENT"),
  tip: z.enum(["KESINTI", "DONEM_SONLANDIRMA", "OZEL_AYKIRILIK", "ALT_YUKLENICI_IHLAL", "DIGER"]),
  baslangicTarihi: z.string().datetime().optional().nullable(),
  bitisTarihi: z.string().datetime().optional().nullable(),
  sureSaat: z.coerce.number().finite().min(0).optional().nullable(),
  cezaTutar: z.coerce.number().finite().min(0).optional().nullable(),
  aciklama: z.string().optional().nullable(),
})

const raporCreateSchema = z.object({
  kind: z.literal("RAPOR"),
  personelAdSoyad: z.string().min(1),
  raporGun: z.coerce.number().int().min(0),
  baslangicTarihi: z.string().datetime().optional().nullable(),
  bitisTarihi: z.string().datetime().optional().nullable(),
})

const altYukleniciCreateSchema = z.object({
  kind: z.literal("ALT_YUKLENICI"),
  firmaAd: z.string().min(1),
  vergiNo: z.string().optional().nullable(),
  belgeDosyaAdi: z.string().optional().nullable(),
  belgeDosyaYolu: z.string().optional().nullable(),
  durum: z.enum(["TASLAK", "ONAY_BEKLIYOR", "ONAYLANDI", "REDDEDILDI"]).optional(),
})

const createSchema = z.discriminatedUnion("kind", [incidentCreateSchema, raporCreateSchema, altYukleniciCreateSchema])

const patchSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("RAPOR_IKAME"),
    id: z.string().min(1),
    ikameEdildi: z.coerce.boolean(),
    ikameNot: z.string().optional().nullable(),
  }),
  z.object({
    kind: z.literal("ALT_YUKLENICI_DURUM"),
    id: z.string().min(1),
    durum: z.enum(["TASLAK", "ONAY_BEKLIYOR", "ONAYLANDI", "REDDEDILDI"]),
  }),
])

const deleteSchema = z.object({
  kind: z.enum(["INCIDENT", "RAPOR", "ALT_YUKLENICI"]),
  id: z.string().min(1),
})

function calcRiskByPercent(p: number | null | undefined, threshold: number) {
  if (p == null || !Number.isFinite(p)) return { riskSeviye: "INFO", fesihRiski: false }
  if (p >= threshold) return { riskSeviye: "CRITICAL", fesihRiski: true }
  if (p >= threshold * 0.8) return { riskSeviye: "WARNING", fesihRiski: false }
  return { riskSeviye: "INFO", fesihRiski: false }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const data = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: {
          ihale: { select: { id: true, ihaleNo: true, ad: true, kurum: { select: { id: true, ad: true } } } },
          incidents: { orderBy: { createdAt: "desc" }, take: 200 },
          personelRaporlar: { orderBy: { createdAt: "desc" }, take: 200 },
          altYukleniciler: { orderBy: { createdAt: "desc" }, take: 200 },
        },
      })
      if (!sozlesme) return null

      const totalCezaTutar = (sozlesme.incidents ?? []).reduce((sum: number, i: any) => sum + Number(i?.cezaTutar || 0), 0)
      const bedel = Number(sozlesme.bedel || 0)
      const totalCezaYuzde = bedel > 0 ? (totalCezaTutar / bedel) * 100 : 0

      const byTip = new Map<string, number>()
      for (const i of sozlesme.incidents ?? []) {
        const tip = String(i?.tip || "")
        if (!tip) continue
        byTip.set(tip, (byTip.get(tip) || 0) + 1)
      }

      return {
        sozlesme,
        stats: {
          totalCezaTutar,
          totalCezaYuzde,
          incidentCounts: Object.fromEntries(byTip.entries()),
        },
      }
    })

    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error("GET sözleşme operasyon hatası:", error)
    return NextResponse.json({ error: "Operasyon verisi alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!isPrivilegedRole(session.user.rol)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const body = await request.json()
    const input = createSchema.parse(body)

    const result = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId }, select: { id: true, bedel: true, cezaUstSinirYuzde: true, kritikKesintiSaat: true, kritikKesintiCezaYuzde: true, donemSonlandirmaFesihTekrar: true, ozelAykirilikFesihLimit: true, altYukleniciKural: true, ihale: { select: { id: true, ihaleNo: true, ad: true } } } })
      if (!sozlesme) return { ok: false as const, status: 404, payload: { error: "Not found" } }

      if (input.kind === "ALT_YUKLENICI") {
        if (sozlesme.altYukleniciKural === "YASAK") {
          const incident = await tx.sozlesmeIncident.create({
            data: {
              sozlesmeId,
              tenantId,
              tip: "ALT_YUKLENICI_IHLAL",
              cezaTutar: 0,
              cezaYuzde: 0,
              riskSeviye: "CRITICAL",
              fesihRiski: true,
              aciklama: `Alt yüklenici girişi denemesi: ${input.firmaAd}`,
            },
          })
          await notifyTenantUsers(tx, tenantId, {
            title: "Alt yüklenici ihlali",
            message: `${sozlesme.ihale.ihaleNo} • ${sozlesme.ihale.ad} için alt yüklenici girişi yasaklı sözleşmede denendi.`,
            type: "ALT_YUKLENICI_IHLAL",
            data: { sozlesmeId, incidentId: incident.id },
          })
          return { ok: false as const, status: 409, payload: { error: "Alt yüklenici yasaklı" } }
        }

        const created = await tx.sozlesmeAltYuklenici.create({
          data: {
            sozlesmeId,
            tenantId,
            firmaAd: input.firmaAd,
            vergiNo: input.vergiNo ?? null,
            belgeDosyaAdi: input.belgeDosyaAdi ?? null,
            belgeDosyaYolu: input.belgeDosyaYolu ?? null,
            durum: input.durum ?? "ONAY_BEKLIYOR",
            onayTarihi: input.durum === "ONAYLANDI" || input.durum === "REDDEDILDI" ? new Date() : null,
          },
        })

        await notifyTenantUsers(tx, tenantId, {
          title: "Alt yüklenici kaydı",
          message: `${sozlesme.ihale.ihaleNo} • ${sozlesme.ihale.ad} için alt yüklenici eklendi: ${input.firmaAd}`,
          type: "ALT_YUKLENICI",
          data: { sozlesmeId, altYukleniciId: created.id },
        })

        return { ok: true as const, status: 201, payload: created }
      }

      if (input.kind === "RAPOR") {
        const created = await tx.sozlesmePersonelRapor.create({
          data: {
            sozlesmeId,
            tenantId,
            personelAdSoyad: input.personelAdSoyad,
            raporGun: input.raporGun,
            baslangicTarihi: input.baslangicTarihi ? new Date(input.baslangicTarihi) : null,
            bitisTarihi: input.bitisTarihi ? new Date(input.bitisTarihi) : null,
            ikameEdildi: false,
            ikameNot: null,
          },
        })

        if (input.raporGun > 7) {
          await notifyTenantUsers(tx, tenantId, {
            title: "İkame gerekli",
            message: `${sozlesme.ihale.ihaleNo} • ${sozlesme.ihale.ad} personel raporu ${input.raporGun} gün: ${input.personelAdSoyad}`,
            type: "PERSONEL_IKAME_GEREKLI",
            data: { sozlesmeId, raporId: created.id },
          })
        }

        return { ok: true as const, status: 201, payload: created }
      }

      const bedel = Number(sozlesme.bedel || 0)
      const cezaUst = Number(sozlesme.cezaUstSinirYuzde ?? 30)
      const kritikSaat = Number(sozlesme.kritikKesintiSaat ?? 12)
      const kritikCezaYuzde = Number(sozlesme.kritikKesintiCezaYuzde ?? 2)
      const donemTekrar = Number(sozlesme.donemSonlandirmaFesihTekrar ?? 2)
      const ozelLimit = Number(sozlesme.ozelAykirilikFesihLimit ?? 30)

      const sureSaat = input.tip === "KESINTI" ? Number(input.sureSaat ?? 0) : null
      const baslangicTarihi = input.baslangicTarihi ? new Date(input.baslangicTarihi) : null
      const bitisTarihi = input.bitisTarihi ? new Date(input.bitisTarihi) : null

      let cezaTutar = Number(input.cezaTutar ?? 0)
      let riskSeviye: "INFO" | "WARNING" | "CRITICAL" = "INFO"
      let fesihRiski = false

      if (input.tip === "KESINTI") {
        if (sureSaat != null && sureSaat >= kritikSaat) {
          cezaTutar = bedel > 0 ? (bedel * kritikCezaYuzde) / 100 : 0
          riskSeviye = "CRITICAL"
          fesihRiski = true
        } else {
          riskSeviye = "WARNING"
        }
      } else if (input.tip === "DONEM_SONLANDIRMA") {
        const existingCount = await tx.sozlesmeIncident.count({ where: { tenantId, sozlesmeId, tip: "DONEM_SONLANDIRMA" } })
        const nextCount = existingCount + 1
        riskSeviye = nextCount >= donemTekrar ? "CRITICAL" : "WARNING"
        fesihRiski = nextCount >= donemTekrar
      } else if (input.tip === "OZEL_AYKIRILIK") {
        const existingCount = await tx.sozlesmeIncident.count({ where: { tenantId, sozlesmeId, tip: "OZEL_AYKIRILIK" } })
        const nextCount = existingCount + 1
        riskSeviye = nextCount >= ozelLimit ? "CRITICAL" : "WARNING"
        fesihRiski = nextCount >= ozelLimit
      } else {
        const pct = bedel > 0 ? (cezaTutar / bedel) * 100 : 0
        const pctRisk = calcRiskByPercent(pct, cezaUst)
        riskSeviye = pctRisk.riskSeviye as any
        fesihRiski = pctRisk.fesihRiski
      }

      const created = await tx.sozlesmeIncident.create({
        data: {
          sozlesmeId,
          tenantId,
          tip: input.tip,
          baslangicTarihi,
          bitisTarihi,
          sureSaat,
          cezaTutar,
          cezaYuzde: bedel > 0 ? (cezaTutar / bedel) * 100 : 0,
          riskSeviye,
          fesihRiski,
          aciklama: input.aciklama ?? null,
        },
      })

      const totalCezaTutar = await tx.sozlesmeIncident
        .findMany({ where: { tenantId, sozlesmeId }, select: { cezaTutar: true } })
        .then((rows: Array<{ cezaTutar: number }>) => rows.reduce((sum, r) => sum + Number(r.cezaTutar || 0), 0))
      const totalPct = bedel > 0 ? (totalCezaTutar / bedel) * 100 : 0
      const totalRisk = calcRiskByPercent(totalPct, cezaUst)

      if (totalRisk.riskSeviye === "CRITICAL") {
        await tx.sozlesmeIncident.update({
          where: { id: created.id },
          data: { riskSeviye: "CRITICAL", fesihRiski: true },
        })
      }

      if (riskSeviye === "CRITICAL" || totalRisk.riskSeviye !== "INFO") {
        const title = riskSeviye === "CRITICAL" || totalRisk.riskSeviye === "CRITICAL" ? "Fesih riski" : "Uyumluluk uyarısı"
        const message =
          riskSeviye === "CRITICAL" || totalRisk.riskSeviye === "CRITICAL"
            ? `${sozlesme.ihale.ihaleNo} • ${sozlesme.ihale.ad} ceza/ihlal eşiği kritik seviyede.`
            : `${sozlesme.ihale.ihaleNo} • ${sozlesme.ihale.ad} uyumluluk eşiğine yaklaşıyor.`
        await notifyTenantUsers(tx, tenantId, {
          title,
          message,
          type: "SOZLESME_UYUM",
          data: { sozlesmeId, incidentId: created.id },
        })
      }

      return { ok: true as const, status: 201, payload: created }
    })

    if (!result.ok) return NextResponse.json(result.payload, { status: result.status })
    return NextResponse.json(result.payload, { status: result.status })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("POST sözleşme operasyon hatası:", error)
    return NextResponse.json({ error: "Operasyon kaydı oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!isPrivilegedRole(session.user.rol)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const body = await request.json()
    const input = patchSchema.parse(body)

    const updated = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId }, select: { id: true } })
      if (!sozlesme) return null

      if (input.kind === "RAPOR_IKAME") {
        return tx.sozlesmePersonelRapor.updateMany({
          where: { id: input.id, tenantId, sozlesmeId },
          data: { ikameEdildi: input.ikameEdildi, ikameNot: input.ikameNot ?? null },
        })
      }

      const now = new Date()
      return tx.sozlesmeAltYuklenici.updateMany({
        where: { id: input.id, tenantId, sozlesmeId },
        data: {
          durum: input.durum,
          onayTarihi: input.durum === "ONAYLANDI" || input.durum === "REDDEDILDI" ? now : null,
        },
      })
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const count = typeof (updated as any)?.count === "number" ? (updated as any).count : 0
    if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("PATCH sözleşme operasyon hatası:", error)
    return NextResponse.json({ error: "Operasyon kaydı güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!isPrivilegedRole(session.user.rol)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const { searchParams } = new URL(request.url)
    const kind = searchParams.get("kind")
    const id = searchParams.get("id")
    const input = deleteSchema.parse({ kind, id })

    const deleted = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId }, select: { id: true } })
      if (!sozlesme) return null

      if (input.kind === "INCIDENT") {
        return tx.sozlesmeIncident.deleteMany({ where: { id: input.id, tenantId, sozlesmeId } })
      }
      if (input.kind === "RAPOR") {
        return tx.sozlesmePersonelRapor.deleteMany({ where: { id: input.id, tenantId, sozlesmeId } })
      }
      return tx.sozlesmeAltYuklenici.deleteMany({ where: { id: input.id, tenantId, sozlesmeId } })
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const count = typeof (deleted as any)?.count === "number" ? (deleted as any).count : 0
    if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    console.error("DELETE sözleşme operasyon hatası:", error)
    return NextResponse.json({ error: "Operasyon kaydı silinirken hata oluştu" }, { status: 500 })
  }
}

