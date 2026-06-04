import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

type MonthKey = `${number}-${string}`

function monthKey(d: Date): MonthKey {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}` as MonthKey
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const months = Math.min(24, Math.max(3, Number(searchParams.get("months") || "6") || 6))

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

    const ihaleler = await withTenant<any[]>(tenantId, (tx: any) =>
      tx.ihale.findMany({
        where: { tenantId, teklifSonTarihi: { gte: start } },
        select: {
          id: true,
          ihaleNo: true,
          ad: true,
          durum: true,
          teklifSonTarihi: true,
          butce: true,
          ymTutar: true,
          sinirDeger: true,
          teklifimiz: true,
          sozlesmeBedeli: true,
          kurum: { select: { ad: true } },
          rakipAnalizleri: {
            select: {
              teklifTutar: true,
              bizimTeklifMi: true,
              rakipFirma: { select: { id: true, ad: true } },
            },
          },
        },
        orderBy: { teklifSonTarihi: "desc" },
      })
    )

    const recentConcluded = await withTenant<any[]>(tenantId, (tx: any) =>
      tx.ihale.findMany({
        where: { tenantId, durum: { in: ["KAZANILDI", "KAYBEDİLDİ", "İPTAL"] } },
        select: {
          id: true,
          ihaleNo: true,
          ad: true,
          butce: true,
          sozlesmeBedeli: true,
          durum: true,
          updatedAt: true,
          kurum: { select: { ad: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      })
    )

    const totalTenderVolume = ihaleler.reduce((sum: number, i: any) => sum + (i.butce || 0), 0)
    const totalYmVolume = ihaleler.reduce((sum: number, i: any) => sum + (i.ymTutar || 0), 0)
    const activeCount = ihaleler.filter((i: any) => i.durum === "TASLAK" || i.durum === "DEVAM_EDİYOR").length
    const wonCount = ihaleler.filter((i: any) => i.durum === "KAZANILDI").length
    const lostCount = ihaleler.filter((i: any) => i.durum === "KAYBEDİLDİ").length
    const concludedForWinRate = wonCount + lostCount
    const winRate = concludedForWinRate > 0 ? Math.round((wonCount / concludedForWinRate) * 1000) / 10 : null

    const seriesMap = new Map<MonthKey, { key: MonthKey; total: number; won: number; lost: number; volume: number }>()
    for (let m = 0; m < months; m++) {
      const dt = new Date(start.getFullYear(), start.getMonth() + m, 1)
      const key = monthKey(dt)
      seriesMap.set(key, { key, total: 0, won: 0, lost: 0, volume: 0 })
    }
    for (const i of ihaleler) {
      const key = monthKey(new Date(i.teklifSonTarihi))
      const s = seriesMap.get(key)
      if (!s) continue
      s.total += 1
      s.volume += i.butce || 0
      if (i.durum === "KAZANILDI") s.won += 1
      if (i.durum === "KAYBEDİLDİ") s.lost += 1
    }

    const rakipAgg = new Map<
      string,
      { id: string; ad: string; teklifSayisi: number; ihaleSayisi: number; toplamTeklif: number; min: number; max: number }
    >()
    for (const ihale of ihaleler) {
      const seenInThisIhale = new Set<string>()
      for (const r of ihale.rakipAnalizleri) {
        if (r.bizimTeklifMi) continue
        const firmaId = r.rakipFirma.id
        const firmaAd = r.rakipFirma.ad
        const teklif = r.teklifTutar
        let agg = rakipAgg.get(firmaId)
        if (!agg) {
          agg = { id: firmaId, ad: firmaAd, teklifSayisi: 0, ihaleSayisi: 0, toplamTeklif: 0, min: teklif, max: teklif }
          rakipAgg.set(firmaId, agg)
        }
        agg.teklifSayisi += 1
        agg.toplamTeklif += teklif
        agg.min = Math.min(agg.min, teklif)
        agg.max = Math.max(agg.max, teklif)
        if (!seenInThisIhale.has(firmaId)) {
          agg.ihaleSayisi += 1
          seenInThisIhale.add(firmaId)
        }
      }
    }

    const topRakipler = Array.from(rakipAgg.values())
      .map((r) => ({ ...r, ortalamaTeklif: r.teklifSayisi > 0 ? r.toplamTeklif / r.teklifSayisi : 0 }))
      .sort((a, b) => b.ihaleSayisi - a.ihaleSayisi || b.teklifSayisi - a.teklifSayisi)
      .slice(0, 10)

    return NextResponse.json({
      range: { start: start.toISOString(), months },
      summary: {
        ihaleCount: ihaleler.length,
        activeCount,
        wonCount,
        lostCount,
        winRate,
        totalTenderVolume,
        totalYmVolume,
      },
      monthlySeries: Array.from(seriesMap.values()),
      topRakipler,
      recentConcluded,
    })
  } catch (error) {
    console.error("Dashboard analiz hatası:", error)
    return NextResponse.json({ error: "Analiz verileri alınırken hata oluştu" }, { status: 500 })
  }
}

