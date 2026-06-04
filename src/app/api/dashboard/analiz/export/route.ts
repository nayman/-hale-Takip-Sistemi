import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

function toCsvRow(values: Array<string | number | null | undefined>) {
  const escaped = values.map((v) => {
    const s = v === null || v === undefined ? "" : String(v)
    const safe = s.replaceAll('"', '""')
    return `"${safe}"`
  })
  return escaped.join(",")
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "ihale"
    const months = Math.min(24, Math.max(3, Number(searchParams.get("months") || "12") || 12))

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

    if (type === "rakip") {
      type RakipAnalizRow = {
        teklifTutar: number
        ihaleId: string
        rakipFirma: { id: string; ad: string }
      }

      const rakipler = await withTenant<RakipAnalizRow[]>(tenantId, (tx) =>
        tx.ihaleRakip.findMany({
          where: { ihale: { tenantId, teklifSonTarihi: { gte: start } }, bizimTeklifMi: false },
          select: {
            teklifTutar: true,
            ihaleId: true,
            rakipFirma: { select: { id: true, ad: true } },
          },
        })
      )

      const map = new Map<string, { ad: string; teklifSayisi: number; ihaleIds: Set<string>; toplam: number; min: number; max: number }>()
      for (const r of rakipler) {
        const id = r.rakipFirma.id
        const ad = r.rakipFirma.ad
        const teklif = r.teklifTutar
        let agg = map.get(id)
        if (!agg) {
          agg = { ad, teklifSayisi: 0, ihaleIds: new Set<string>(), toplam: 0, min: teklif, max: teklif }
          map.set(id, agg)
        }
        agg.teklifSayisi += 1
        agg.ihaleIds.add(r.ihaleId)
        agg.toplam += teklif
        agg.min = Math.min(agg.min, teklif)
        agg.max = Math.max(agg.max, teklif)
      }

      const header = toCsvRow(["Rakip Firma", "İhale Sayısı", "Teklif Sayısı", "Ortalama Teklif", "Min", "Max"])
      const rows = Array.from(map.values())
        .map((x) => ({
          ...x,
          ihaleSayisi: x.ihaleIds.size,
          ortalama: x.teklifSayisi > 0 ? x.toplam / x.teklifSayisi : 0,
        }))
        .sort((a, b) => b.ihaleSayisi - a.ihaleSayisi || b.teklifSayisi - a.teklifSayisi)
        .map((x) => toCsvRow([x.ad, x.ihaleSayisi, x.teklifSayisi, x.ortalama, x.min, x.max]))

      const bom = "\uFEFF"
      const csv = bom + [header, ...rows].join("\n")
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(`rakip_analiz_${months}ay.csv`)}"`,
        },
      })
    }

    type IhalePerformansRow = {
      ihaleNo: string
      ad: string
      durum: string
      teklifSonTarihi: Date
      butce: number
      ymTutar: number | null
      sinirDeger: number | null
      teklifimiz: number | null
      kurum: { ad: string }
    }

    const ihaleler = await withTenant<IhalePerformansRow[]>(tenantId, (tx) =>
      tx.ihale.findMany({
        where: { tenantId, teklifSonTarihi: { gte: start } },
        select: {
          ihaleNo: true,
          ad: true,
          durum: true,
          teklifSonTarihi: true,
          butce: true,
          ymTutar: true,
          sinirDeger: true,
          teklifimiz: true,
          kurum: { select: { ad: true } },
        },
        orderBy: { teklifSonTarihi: "desc" },
      })
    )

    const header = toCsvRow([
      "IKN",
      "İhale Adı",
      "Kurum",
      "Teklif Son Tarihi",
      "Durum",
      "Bütçe",
      "YM Tutar",
      "Sınır Değer",
      "Teklifimiz",
      "Teklif/YM (%)",
      "Teklif/Sınır Değer (%)",
    ])

    const rows = ihaleler.map((i) => {
      const teklifYm = i.ymTutar && i.teklifimiz ? (i.teklifimiz / i.ymTutar) * 100 : null
      const teklifSd = i.sinirDeger && i.teklifimiz ? (i.teklifimiz / i.sinirDeger) * 100 : null
      return toCsvRow([
        i.ihaleNo,
        i.ad,
        i.kurum.ad,
        i.teklifSonTarihi.toISOString(),
        i.durum,
        i.butce,
        i.ymTutar ?? "",
        i.sinirDeger ?? "",
        i.teklifimiz ?? "",
        teklifYm ? Math.round(teklifYm * 100) / 100 : "",
        teklifSd ? Math.round(teklifSd * 100) / 100 : "",
      ])
    })

    const bom = "\uFEFF"
    const csv = bom + [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(`ihale_performans_${months}ay.csv`)}"`,
      },
    })
  } catch (error) {
    console.error("Analiz export hatası:", error)
    return NextResponse.json({ error: "Export sırasında hata oluştu" }, { status: 500 })
  }
}
