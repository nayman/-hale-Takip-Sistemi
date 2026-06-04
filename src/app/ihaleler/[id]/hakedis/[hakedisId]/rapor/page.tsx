"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"

type Ihale = {
  id: string
  ihaleNo: string
  ad: string
  kurum: { ad: string }
}

type Hakedis = {
  id: string
  yil: number
  ay: number
  brutTutar: number
  kdvOrani: number
  kdvTutari: number
  stopajOrani: number
  stopajTutari: number
  ceza: number
  digerKesinti: number
  netTutar: number
  durum: string
  odemeTarihi: string | null
  createdAt: string
}

type Puantaj = {
  id: string
  yil: number
  ay: number
  calismaGunu: number
  devamsizlikGunu: number
  fazlaMesaiSaat: number
}

type PersonelParam = {
  personelSayisi: number
  asgariUcretYuzde: number
}

type YanHakParam = {
  yolGunluk: number
  yanHakGunSayisi: number
  yemekTip: "NAKDI" | "AYNI" | "IDARE_SAGLAR"
  yemekGunluk: number
  fazlaMesaiSaatUcreti: number
}

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const

function formatCurrency(value: number) {
  return value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
}

export default function HakedisRaporPage() {
  const params = useParams()
  const ihaleId = params.id as string
  const hakedisId = params.hakedisId as string

  const [ihale, setIhale] = useState<Ihale | null>(null)
  const [hakedis, setHakedis] = useState<Hakedis | null>(null)
  const [puantaj, setPuantaj] = useState<Puantaj | null>(null)
  const [personelParam, setPersonelParam] = useState<PersonelParam | null>(null)
  const [yanHakParam, setYanHakParam] = useState<YanHakParam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const monthLabel = useMemo(() => {
    if (!hakedis) return ""
    const name = MONTH_NAMES[hakedis.ay - 1] || "Ay"
    return `${name} ${hakedis.yil}`
  }, [hakedis])

  useEffect(() => {
    if (!ihaleId || !hakedisId) return
    let isActive = true
    setLoading(true)
    setError("")

    Promise.all([
      fetch(`/api/ihaleler/${ihaleId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/ihaleler/${ihaleId}/hakedis`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/ihaleler/${ihaleId}/puantaj`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/ihaleler/${ihaleId}/personel`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/ihaleler/${ihaleId}/yan-hak`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([ihaleData, hakedisList, puantajList, personelData, yanHakData]) => {
        if (!isActive) return
        if (!ihaleData) throw new Error("İhale bulunamadı")
        const h = Array.isArray(hakedisList) ? hakedisList.find((x: any) => x?.id === hakedisId) : null
        if (!h) throw new Error("Hakediş bulunamadı")
        setIhale(ihaleData)
        setHakedis(h)
        const p = Array.isArray(puantajList) ? puantajList.find((x: any) => x?.yil === h.yil && x?.ay === h.ay) : null
        setPuantaj(p || null)
        setPersonelParam(personelData && typeof personelData === "object" ? personelData : null)
        setYanHakParam(yanHakData && typeof yanHakData === "object" ? yanHakData : null)
      })
      .catch((e: any) => {
        if (!isActive) return
        setError(e.message || "Hata oluştu")
      })
      .finally(() => {
        if (!isActive) return
        setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [ihaleId, hakedisId])

  if (loading) return <div className="p-8 text-center text-sm text-on-surface-variant">Yükleniyor...</div>
  if (error) return <div className="p-8 text-center text-sm text-error">{error}</div>
  if (!ihale || !hakedis) return <div className="p-8 text-center text-sm text-on-surface-variant">Bulunamadı</div>

  const yanHakGun = (() => {
    if (!puantaj || !yanHakParam) return null
    const fiili = Math.max(0, Number(puantaj.calismaGunu || 0) - Number(puantaj.devamsizlikGunu || 0))
    const limit = Math.max(0, Math.min(31, Number(yanHakParam.yanHakGunSayisi ?? 22)))
    return Math.max(0, Math.min(limit, fiili))
  })()

  const yanHakKisi = personelParam ? Math.max(0, Number(personelParam.personelSayisi || 0)) : null
  const yolTutar =
    yanHakGun != null && yanHakKisi != null && yanHakParam ? yanHakGun * yanHakKisi * Number(yanHakParam.yolGunluk || 0) : null
  const yemekTutar =
    yanHakGun != null && yanHakKisi != null && yanHakParam && yanHakParam.yemekTip === "NAKDI"
      ? yanHakGun * yanHakKisi * Number(yanHakParam.yemekGunluk || 0)
      : null

  return (
    <div className="bg-surface-container-lowest text-on-surface">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print sticky top-0 bg-surface-container-lowest border-b border-outline-variant p-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Hakediş Raporu • {monthLabel}</div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm"
        >
          Yazdır / PDF Kaydet
        </button>
      </div>

      <div className="page max-w-3xl mx-auto p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Resmi Hakediş Dökümü</div>
          <div className="text-2xl font-extrabold">Hakediş Raporu</div>
          <div className="text-sm font-semibold text-on-surface-variant">{monthLabel}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 border border-outline-variant rounded-xl p-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">İhale</div>
            <div className="text-sm font-bold">{ihale.ad}</div>
            <div className="text-xs text-on-surface-variant">IKN: {ihale.ihaleNo}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Kurum</div>
            <div className="text-sm font-bold">{ihale.kurum?.ad || "-"}</div>
            <div className="text-xs text-on-surface-variant">Durum: {hakedis.durum}</div>
          </div>
        </div>

        <div className="border border-outline-variant rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-4 border-b border-r border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Brüt Tutar</div>
              <div className="text-lg font-extrabold">{formatCurrency(hakedis.brutTutar)}</div>
            </div>
            <div className="p-4 border-b border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Net Ödenecek</div>
              <div className="text-lg font-extrabold">{formatCurrency(hakedis.netTutar)}</div>
            </div>

            <div className="p-4 border-r border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">KDV</div>
              <div className="text-sm font-bold">%{hakedis.kdvOrani} • {formatCurrency(hakedis.kdvTutari)}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Stopaj</div>
              <div className="text-sm font-bold">%{hakedis.stopajOrani} • {formatCurrency(hakedis.stopajTutari)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-outline-variant">
            <div className="p-4 border-r border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Ceza</div>
              <div className="text-sm font-bold">{formatCurrency(hakedis.ceza)}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Diğer Kesinti</div>
              <div className="text-sm font-bold">{formatCurrency(hakedis.digerKesinti)}</div>
            </div>
          </div>
        </div>

        <div className="border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant">
            <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Yan Haklar</div>
            <div className="text-sm font-bold">Yol / Yemek</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 border-b border-r border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Fiili Gün</div>
              <div className="text-sm font-bold">{yanHakGun == null ? "-" : `${yanHakGun} gün`}</div>
            </div>
            <div className="p-4 border-b border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Personel</div>
              <div className="text-sm font-bold">{yanHakKisi == null ? "-" : `${yanHakKisi} kişi`}</div>
            </div>
            <div className="p-4 border-r border-outline-variant">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Yol Tutarı</div>
              <div className="text-sm font-bold">{yolTutar == null ? "-" : formatCurrency(yolTutar)}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Yemek Tutarı</div>
              <div className="text-sm font-bold">
                {yemekTutar == null ? (yanHakParam?.yemekTip === "NAKDI" ? "-" : yanHakParam ? yanHakParam.yemekTip : "-") : formatCurrency(yemekTutar)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="border border-outline-variant rounded-xl p-4 h-32 flex flex-col justify-between">
            <div className="text-xs font-bold">Yüklenici İmza</div>
            <div className="border-t border-outline-variant pt-2 text-xs text-on-surface-variant">Ad Soyad / Ünvan</div>
          </div>
          <div className="border border-outline-variant rounded-xl p-4 h-32 flex flex-col justify-between">
            <div className="text-xs font-bold">İdare İmza</div>
            <div className="border-t border-outline-variant pt-2 text-xs text-on-surface-variant">Ad Soyad / Ünvan</div>
          </div>
        </div>

        <div className="text-[10px] text-on-surface-variant">
          Oluşturma: {new Date(hakedis.createdAt).toLocaleString("tr-TR")} • Ödeme Tarihi:{" "}
          {hakedis.odemeTarihi ? new Date(hakedis.odemeTarihi).toLocaleDateString("tr-TR") : "-"}
        </div>
      </div>

      <div className="page max-w-3xl mx-auto p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-bold tracking-wider uppercase text-on-surface-variant">Arka Sayfa</div>
          <div className="text-xl font-extrabold">Detay ve Puantaj Özeti</div>
          <div className="text-sm font-semibold text-on-surface-variant">{monthLabel}</div>
        </div>

        <div className="border border-outline-variant rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold">Puantaj Özeti</div>
          {puantaj ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Çalışma Günü</div>
                <div className="text-lg font-extrabold">{puantaj.calismaGunu}</div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Devamsızlık</div>
                <div className="text-lg font-extrabold">{puantaj.devamsizlikGunu}</div>
              </div>
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Fazla Mesai</div>
                <div className="text-lg font-extrabold">{puantaj.fazlaMesaiSaat}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-on-surface-variant">Bu ay için puantaj kaydı bulunamadı.</div>
          )}
        </div>

        <div className="border border-outline-variant rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold">Notlar</div>
          <div className="h-40 border border-dashed border-outline-variant rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="border border-outline-variant rounded-xl p-4 h-32 flex flex-col justify-between">
            <div className="text-xs font-bold">Kontrol Eden</div>
            <div className="border-t border-outline-variant pt-2 text-xs text-on-surface-variant">Ad Soyad / Ünvan</div>
          </div>
          <div className="border border-outline-variant rounded-xl p-4 h-32 flex flex-col justify-between">
            <div className="text-xs font-bold">Onaylayan</div>
            <div className="border-t border-outline-variant pt-2 text-xs text-on-surface-variant">Ad Soyad / Ünvan</div>
          </div>
        </div>
      </div>
    </div>
  )
}
