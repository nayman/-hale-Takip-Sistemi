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

    const puantajlar = await withTenant(tenantId, (tx) =>
      tx.puantaj.findMany({
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

    const header = toCsvRow([
      "Yıl",
      "Ay",
      "Çalışma Günü",
      "Devamsızlık Günü",
      "Fazla Mesai (Saat)",
      "Oluşturma",
    ])

    const rows = puantajlar.map((p) =>
      toCsvRow([
        p.yil,
        p.ay,
        p.calismaGunu,
        p.devamsizlikGunu,
        p.fazlaMesaiSaat,
        p.createdAt.toISOString(),
      ])
    )

    const bom = "\uFEFF"
    const csv = bom + [header, ...rows].join("\n")
    const filename = year ? `puantaj_${year}.csv` : `puantaj.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error("Puantaj export hatası:", error)
    return NextResponse.json({ error: "Puantaj export sırasında hata oluştu" }, { status: 500 })
  }
}

