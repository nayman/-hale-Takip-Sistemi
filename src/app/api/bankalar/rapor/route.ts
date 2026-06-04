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

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format")
    const section = searchParams.get("section") || "bankalar"

    const banks = await withTenant<any[]>(tenantId, (tx: any) =>
      tx.banka.findMany({
        where: { tenantId },
        select: {
          id: true,
          ad: true,
          sube: true,
          toplamLimit: true,
          kullanilanLimit: true,
          komisyonOrani: true,
          teminatlar: {
            where: { tip: "MEKTUP" },
            select: {
              id: true,
              tutar: true,
              durum: true,
              vadeTarihi: true,
              mektupNo: true,
              sozlesme: {
                select: {
                  id: true,
                  ihale: { select: { ihaleNo: true, ad: true } },
                },
              },
            },
          },
        },
        orderBy: { ad: "asc" },
      })
    )

    const bankSummary = banks.map((b) => {
      const aktifMektuplar = (b.teminatlar || []).filter((t: any) => t.durum === "AKTIF")
      const aktifMektupTutari = aktifMektuplar.reduce((sum: number, t: any) => sum + (t.tutar || 0), 0)
      const komisyonMaliyeti = (aktifMektupTutari * (b.komisyonOrani || 0)) / 100
      const bosLimit = (b.toplamLimit || 0) - (b.kullanilanLimit || 0)
      return {
        id: b.id,
        ad: b.ad,
        sube: b.sube,
        toplamLimit: b.toplamLimit,
        kullanilanLimit: b.kullanilanLimit,
        bosLimit,
        komisyonOrani: b.komisyonOrani,
        aktifMektupSayisi: aktifMektuplar.length,
        aktifMektupTutari,
        komisyonMaliyeti,
      }
    })

    const activeLetters = banks.flatMap((b) =>
      (b.teminatlar || [])
        .filter((t: any) => t.durum === "AKTIF")
        .map((t: any) => ({
          bankaId: b.id,
          bankaAd: b.ad,
          komisyonOrani: b.komisyonOrani || 0,
          teminatId: t.id,
          mektupNo: t.mektupNo,
          tutar: t.tutar,
          vadeTarihi: t.vadeTarihi,
          sozlesmeId: t.sozlesme.id,
          ihaleNo: t.sozlesme.ihale.ihaleNo,
          ihaleAdi: t.sozlesme.ihale.ad,
          komisyonMaliyeti: (t.tutar * (b.komisyonOrani || 0)) / 100,
        }))
    )

    if (format === "csv") {
      if (section === "teminat") {
        const header = toCsvRow([
          "Banka",
          "Komisyon Oranı (%)",
          "Teminat ID",
          "Mektup No",
          "Tutar",
          "Vade Tarihi",
          "Sözleşme ID",
          "IKN",
          "İhale Adı",
          "Komisyon Maliyeti",
        ])
        const rows = activeLetters.map((x) =>
          toCsvRow([
            x.bankaAd,
            x.komisyonOrani,
            x.teminatId,
            x.mektupNo || "",
            x.tutar,
            x.vadeTarihi ? new Date(x.vadeTarihi).toISOString() : "",
            x.sozlesmeId,
            x.ihaleNo,
            x.ihaleAdi,
            x.komisyonMaliyeti,
          ])
        )
        const bom = "\uFEFF"
        const csv = bom + [header, ...rows].join("\n")
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${encodeURIComponent("banka_mektup_teminatlar.csv")}"`,
          },
        })
      }

      const header = toCsvRow([
        "Banka",
        "Şube",
        "Toplam Limit",
        "Kullanılan Limit",
        "Boş Limit",
        "Komisyon Oranı (%)",
        "Aktif Mektup Sayısı",
        "Aktif Mektup Tutarı",
        "Komisyon Maliyeti",
      ])
      const rows = bankSummary.map((b) =>
        toCsvRow([
          b.ad,
          b.sube || "",
          b.toplamLimit,
          b.kullanilanLimit,
          b.bosLimit,
          b.komisyonOrani,
          b.aktifMektupSayisi,
          b.aktifMektupTutari,
          b.komisyonMaliyeti,
        ])
      )
      const bom = "\uFEFF"
      const csv = bom + [header, ...rows].join("\n")
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent("banka_raporu.csv")}"`,
        },
      })
    }

    return NextResponse.json({
      banks: bankSummary,
      activeLetters,
    })
  } catch (error) {
    console.error("Banka raporu hatası:", error)
    return NextResponse.json({ error: "Banka raporu alınırken hata oluştu" }, { status: 500 })
  }
}

