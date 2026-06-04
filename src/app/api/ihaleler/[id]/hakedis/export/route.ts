import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

const checklistTemplate = [
  { belgeKodu: "FATURA", label: "Fatura" },
  { belgeKodu: "SGK_PRIM_BORCSUZLUK", label: "SGK Prim Borçsuzluk" },
  { belgeKodu: "VERGI_BORCSUZLUK", label: "Vergi Borçsuzluk" },
  { belgeKodu: "SGK_BILDIRGE_TAHAKKUK", label: "SGK Bildirge+Tahakkuk" },
  { belgeKodu: "MAAS_DEKONTLARI", label: "Maaş Dekontları" },
] as const

function toCsvRow(values: Array<string | number | null | undefined>) {
  const escaped = values.map((v) => {
    const s = v === null || v === undefined ? "" : String(v)
    const safe = s.replaceAll('"', '""')
    return `"${safe}"`
  })
  return escaped.join(",")
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
    const yearParam = searchParams.get("year")
    const year = yearParam ? Number(yearParam) : null

    const hakedisler = await withTenant(tenantId, (tx) =>
      tx.hakedis.findMany({
        where: {
          ihaleId,
          ihale: { tenantId },
          ...(year && Number.isFinite(year)
            ? { yil: year }
            : {}),
        },
        orderBy: [{ yil: "asc" }, { ay: "asc" }],
      })
    )

    const checklistByHakedisId = new Map<string, Map<string, any>>()
    if (hakedisler.length > 0) {
      try {
        const ids = hakedisler.map((h) => h.id)
        const loaded = await withTenant(tenantId, async (tx) => {
          const delegate = (tx as any).hakedisChecklistItem
          if (!delegate) return [] as any[]
          return delegate.findMany({
            where: { tenantId, hakedisId: { in: ids } },
            select: { hakedisId: true, belgeKodu: true, durum: true },
          })
        })

        for (const row of loaded) {
          const hakedisId = String(row.hakedisId)
          const m = checklistByHakedisId.get(hakedisId) ?? new Map<string, any>()
          m.set(String(row.belgeKodu), row)
          checklistByHakedisId.set(hakedisId, m)
        }
      } catch {
        checklistByHakedisId.clear()
      }
    }

    const header = toCsvRow([
      "Yıl",
      "Ay",
      "Brüt",
      "KDV Oranı",
      "KDV Tutarı",
      "Stopaj Oranı",
      "Stopaj Tutarı",
      "Ceza",
      "Diğer Kesinti",
      "Net",
      "Durum",
      "Ödeme Tarihi",
      "Oluşturma",
      ...checklistTemplate.map((x) => `${x.label} (Checklist)`),
    ])

    const rows = hakedisler.map((h) =>
      toCsvRow([
        h.yil,
        h.ay,
        h.brutTutar,
        h.kdvOrani,
        h.kdvTutari,
        h.stopajOrani,
        h.stopajTutari,
        h.ceza,
        h.digerKesinti,
        h.netTutar,
        h.durum,
        h.odemeTarihi ? h.odemeTarihi.toISOString() : "",
        h.createdAt.toISOString(),
        ...checklistTemplate.map((t) => {
          const m = checklistByHakedisId.get(h.id)
          const hit = m?.get(t.belgeKodu)
          const durum = hit?.durum
          return durum === "TAMAMLANDI" || durum === "MUAF" || durum === "EKSIK" ? durum : ""
        }),
      ])
    )

    const bom = "\uFEFF"
    const csv = bom + [header, ...rows].join("\n")
    const filename = year ? `hakedis_muhasebe_${year}.csv` : `hakedis_muhasebe.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error("Hakediş export hatası:", error)
    return NextResponse.json({ error: "Hakediş export sırasında hata oluştu" }, { status: 500 })
  }
}
