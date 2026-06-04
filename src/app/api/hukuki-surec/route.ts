import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { hesaplaHukukiSureler } from "@/lib/hukuki-surec"
import { Prisma } from "@prisma/client"

function toInt(value: string | null, fallback: number) {
  if (!value) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

function toBool(value: string | null, fallback: boolean) {
  if (value == null) return fallback
  if (value === "1" || value.toLowerCase() === "true") return true
  if (value === "0" || value.toLowerCase() === "false") return false
  return fallback
}

function toDateOnlyISO(d: Date) {
  return d.toISOString().split("T")[0]
}

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}

function addDaysUtc(d: Date, days: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days, 0, 0, 0, 0))
}

function diffDaysUtc(a: Date, b: Date) {
  const ms = startOfDayUtc(a).getTime() - startOfDayUtc(b).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)

    const daysWindow = Math.max(7, Math.min(365, toInt(searchParams.get("days"), 120)))
    const lookbackDays = Math.max(0, Math.min(365, toInt(searchParams.get("lookbackDays"), 30)))
    const includeClosed = toBool(searchParams.get("includeClosed"), false)
    const q = (searchParams.get("q") || "").trim().toLowerCase()

    const itirazTip = (searchParams.get("itirazTip") || "").trim()
    const itirazDurum = (searchParams.get("itirazDurum") || "").trim()
    const onlyWithItiraz = toBool(searchParams.get("onlyWithItiraz"), false)

    const now = new Date()
    const from = addDaysUtc(now, -lookbackDays)
    const to = addDaysUtc(now, daysWindow)

    const data = await withTenant(tenantId, async (tx) => {
      const holidays = await tx.resmiTatil.findMany({
        where: {
          tenantId,
          tarih: { gte: addDaysUtc(now, -365), lte: addDaysUtc(now, 365) },
        },
        orderBy: { tarih: "asc" },
        select: { id: true, tarih: true, aciklama: true, arefe: true },
      })

      const holidayDates = holidays.map((h) => new Date(h.tarih))

      const where: any = {
        tenantId,
        teklifSonTarihi: { gte: from, lte: to },
      }

      if (!includeClosed) {
        where.durum = { in: ["TASLAK", "DEVAM_EDİYOR", "AKTIF"] }
      }

      const ihaleler = await tx.ihale.findMany({
        where,
        orderBy: [{ teklifSonTarihi: "asc" }],
        select: {
          id: true,
          ihaleNo: true,
          ad: true,
          durum: true,
          teklifSonTarihi: true,
          kurum: { select: { id: true, ad: true } },
          _count: { select: { itirazlar: true } },
          itirazlar: {
            orderBy: { basvuruTarihi: "desc" },
            take: 25,
            select: {
              id: true,
              tip: true,
              durum: true,
              aciklama: true,
              basvuruTarihi: true,
              kararTarihi: true,
            },
          },
        },
      })

      const rows = ihaleler
        .map((i) => {
          const { itirazSonGunu, kritikUyariGunu } = hesaplaHukukiSureler(new Date(i.teklifSonTarihi), holidayDates)
          const remaining = diffDaysUtc(itirazSonGunu, now)
          const kritikRemaining = diffDaysUtc(kritikUyariGunu, now)

          const itirazlar = i.itirazlar
            .filter((x) => (!itirazTip ? true : x.tip === itirazTip))
            .filter((x) => (!itirazDurum ? true : x.durum === itirazDurum))

          return {
            id: i.id,
            ihaleNo: i.ihaleNo,
            ad: i.ad,
            durum: i.durum,
            teklifSonTarihi: i.teklifSonTarihi.toISOString(),
            kurum: { id: i.kurum.id, ad: i.kurum.ad },
            itiraz: {
              itirazSonGunu: toDateOnlyISO(itirazSonGunu),
              kritikUyariGunu: toDateOnlyISO(kritikUyariGunu),
              remainingDays: remaining,
              kritikRemainingDays: kritikRemaining,
            },
            itirazlar: itirazlar.map((x) => ({
              id: x.id,
              tip: x.tip,
              durum: x.durum,
              aciklama: x.aciklama,
              basvuruTarihi: x.basvuruTarihi.toISOString(),
              kararTarihi: x.kararTarihi ? x.kararTarihi.toISOString() : null,
            })),
            itirazCount: i._count.itirazlar,
          }
        })
        .filter((i) => {
          if (!q) return true
          const haystack = `${i.ihaleNo} ${i.ad} ${i.kurum.ad}`.toLowerCase()
          return haystack.includes(q)
        })
        .filter((i) => (onlyWithItiraz ? i.itirazCount > 0 : true))

      let tahsilatlar: Array<{
        id: string
        ihaleId: string
        ihaleNo: string
        ihaleAd: string
        kurumAd: string
        yil: number
        ay: number
        netTutar: number
        durum: string
        onayTarihi: string | null
        vadeTarihi: string
        remainingDays: number
      }> = []

      try {
        const dueRows: any[] = await tx.$queryRaw(
          Prisma.sql`
            SELECT
              h.id,
              h."ihaleId",
              i."ihaleNo",
              i."ad" AS "ihaleAd",
              k."ad" AS "kurumAd",
              h."yil",
              h."ay",
              h."netTutar",
              h."durum",
              h."onayTarihi",
              h."vadeTarihi"
            FROM "hakedisler" h
            JOIN "ihaleler" i ON i.id = h."ihaleId"
            JOIN "kurumlar" k ON k.id = i."kurumId"
            WHERE i."tenantId" = ${tenantId}
              AND h."vadeTarihi" IS NOT NULL
              AND h."durum" <> 'ODENDI'
              AND h."vadeTarihi" >= ${from}
              AND h."vadeTarihi" <= ${to}
            ORDER BY h."vadeTarihi" ASC
            LIMIT 50
          `
        )

        tahsilatlar = dueRows
          .map((r) => {
            const vade = r?.vadeTarihi ? new Date(r.vadeTarihi) : null
            if (!vade || Number.isNaN(vade.getTime())) return null
            const remainingDays = diffDaysUtc(vade, now)
            return {
              id: String(r.id),
              ihaleId: String(r.ihaleId),
              ihaleNo: String(r.ihaleNo || ""),
              ihaleAd: String(r.ihaleAd || ""),
              kurumAd: String(r.kurumAd || ""),
              yil: Number(r.yil || 0),
              ay: Number(r.ay || 0),
              netTutar: Number(r.netTutar || 0),
              durum: String(r.durum || ""),
              onayTarihi: r.onayTarihi ? new Date(r.onayTarihi).toISOString() : null,
              vadeTarihi: vade.toISOString(),
              remainingDays,
            }
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
      } catch {
        tahsilatlar = []
      }

      return {
        now: now.toISOString(),
        window: { from: from.toISOString(), to: to.toISOString(), daysWindow, lookbackDays },
        holidays: holidays.map((h) => ({
          id: h.id,
          tarih: h.tarih.toISOString(),
          aciklama: h.aciklama,
          arefe: h.arefe,
        })),
        ihaleler: rows,
        tahsilatlar,
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET hukuki-surec hatası:", error)
    return NextResponse.json({ error: "Hukuki süreç verisi alınırken hata oluştu" }, { status: 500 })
  }
}
