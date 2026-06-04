"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type HolidayItem = {
  id: string
  tarih: string
  aciklama: string | null
  arefe: boolean | null
}

type ItirazItem = {
  id: string
  tip: string
  durum: string
  aciklama: string | null
  basvuruTarihi: string
  kararTarihi: string | null
}

type HukukiIhaleRow = {
  id: string
  ihaleNo: string
  ad: string
  durum: string
  teklifSonTarihi: string
  kurum: { id: string; ad: string }
  itiraz: {
    itirazSonGunu: string
    kritikUyariGunu: string
    remainingDays: number
    kritikRemainingDays: number
  }
  itirazlar: ItirazItem[]
  itirazCount: number
}

type TahsilatItem = {
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
}

type HukukiSurecResponse = {
  now: string
  window: { from: string; to: string; daysWindow: number; lookbackDays: number }
  holidays: HolidayItem[]
  ihaleler: HukukiIhaleRow[]
  tahsilatlar?: TahsilatItem[]
}

function formatDateTr(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("tr-TR")
}

function formatCurrencyTry(amount: number) {
  try {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount || 0)
  } catch {
    return String(amount || 0)
  }
}

function badgeClasses(kind: "danger" | "warning" | "info" | "muted" | "success") {
  switch (kind) {
    case "danger":
      return "bg-error-container text-on-error-container border-outline-variant"
    case "warning":
      return "bg-secondary-container text-on-secondary-container border-outline-variant"
    case "success":
      return "bg-secondary-fixed text-on-secondary-fixed border-outline-variant"
    case "info":
      return "bg-surface-container text-on-surface border-outline-variant"
    default:
      return "bg-surface-container-low text-on-surface-variant border-outline-variant"
  }
}

export default function HukukiSurecPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HukukiSurecResponse | null>(null)

  const [q, setQ] = useState("")
  const [days, setDays] = useState(120)
  const [includeClosed, setIncludeClosed] = useState(false)
  const [onlyWithItiraz, setOnlyWithItiraz] = useState(false)
  const [itirazTip, setItirazTip] = useState<string>("")
  const [itirazDurum, setItirazDurum] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("days", String(days))
        params.set("lookbackDays", "30")
        if (includeClosed) params.set("includeClosed", "1")
        if (q.trim()) params.set("q", q.trim())
        if (onlyWithItiraz) params.set("onlyWithItiraz", "1")
        if (itirazTip) params.set("itirazTip", itirazTip)
        if (itirazDurum) params.set("itirazDurum", itirazDurum)

        const res = await fetch(`/api/hukuki-surec?${params.toString()}`)
        const json = (await res.json().catch(() => null)) as HukukiSurecResponse | { error?: string } | null
        if (!res.ok) {
          const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Veri alınamadı."
          throw new Error(msg)
        }
        if (!cancelled) setData(json as HukukiSurecResponse)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Bilinmeyen hata")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [days, includeClosed, itirazDurum, itirazTip, onlyWithItiraz, q])

  const flatItirazlar = useMemo(() => {
    const items: Array<
      ItirazItem & { ihaleId: string; ihaleNo: string; ihaleAd: string; kurumAd: string }
    > = []
    for (const ih of data?.ihaleler ?? []) {
      for (const it of ih.itirazlar) {
        items.push({
          ...it,
          ihaleId: ih.id,
          ihaleNo: ih.ihaleNo,
          ihaleAd: ih.ad,
          kurumAd: ih.kurum.ad,
        })
      }
    }
    items.sort((a, b) => new Date(b.basvuruTarihi).getTime() - new Date(a.basvuruTarihi).getTime())
    return items
  }, [data])

  const upcomingHolidays = useMemo(() => {
    const now = new Date()
    return (data?.holidays ?? [])
      .filter((h) => new Date(h.tarih).getTime() >= now.getTime() - 24 * 60 * 60 * 1000)
      .slice(0, 12)
  }, [data])

  const tahsilatAjandasi = useMemo(() => {
    const items = Array.isArray(data?.tahsilatlar) ? data!.tahsilatlar! : []
    return items.slice(0, 12)
  }, [data])

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Hukuki Süreç</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  4734 süreleri, resmi tatiller ve itiraz akışları.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/ayarlar/resmi-tatiller"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                >
                  Resmi Tatiller
                </Link>
                <Link
                  href="/ihaleler"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                >
                  İhaleler
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-4">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Arama</div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="IKN / ihale adı / kurum"
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Pencere</div>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value={30}>30 gün</option>
                    <option value={60}>60 gün</option>
                    <option value={120}>120 gün</option>
                    <option value={180}>180 gün</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">İtiraz Tipi</div>
                  <select
                    value={itirazTip}
                    onChange={(e) => setItirazTip(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    <option value="IDAREYE_ITIRAZ">İdareye İtiraz</option>
                    <option value="KIK_ITIRAZI">KİK İtirazı</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">İtiraz Durumu</div>
                  <select
                    value={itirazDurum}
                    onChange={(e) => setItirazDurum(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    <option value="TASLAK">Taslak</option>
                    <option value="GONDERILDI">Gönderildi</option>
                    <option value="REDDEDILDI">Reddedildi</option>
                    <option value="KABUL_EDILDI">Kabul Edildi</option>
                  </select>
                </div>
                <div className="lg:col-span-6 flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-on-surface-variant select-none">
                    <input
                      type="checkbox"
                      checked={includeClosed}
                      onChange={(e) => setIncludeClosed(e.target.checked)}
                    />
                    Kapalı ihaleleri dahil et
                  </label>
                  <label className="flex items-center gap-2 text-sm text-on-surface-variant select-none">
                    <input
                      type="checkbox"
                      checked={onlyWithItiraz}
                      onChange={(e) => setOnlyWithItiraz(e.target.checked)}
                    />
                    Sadece itirazı olanlar
                  </label>
                </div>
                <div className="lg:col-span-6 flex items-center justify-end text-sm text-on-surface-variant">
                  {loading ? "Yükleniyor..." : data ? `${data.ihaleler.length} ihale` : ""}
                </div>
              </div>

              {error ? (
                <div className="mt-4 bg-error-container border border-outline-variant px-4 py-3 rounded-lg text-on-error-container text-sm">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-9 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                  <div className="text-sm font-semibold text-on-surface">İhale Bazlı Süre Panosu</div>
                  <div className="text-xs text-on-surface-variant">
                    {data ? `${formatDateTr(data.window.from)} → ${formatDateTr(data.window.to)}` : ""}
                  </div>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low">
                      <tr className="text-left text-xs text-on-surface-variant">
                        <th className="px-5 py-3">IKN</th>
                        <th className="px-5 py-3">İhale</th>
                        <th className="px-5 py-3">Kurum</th>
                        <th className="px-5 py-3">Teklif Son</th>
                        <th className="px-5 py-3">İtiraz Son</th>
                        <th className="px-5 py-3">Kalan</th>
                        <th className="px-5 py-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.ihaleler ?? []).map((ih) => {
                        const remaining = ih.itiraz.remainingDays
                        const remainingKind: "danger" | "warning" | "info" | "muted" =
                          remaining < 0 ? "danger" : remaining <= 2 ? "warning" : remaining <= 7 ? "info" : "muted"
                        return (
                          <tr key={ih.id} className="border-t border-outline-variant/60 hover:bg-surface-container">
                            <td className="px-5 py-3 whitespace-nowrap">
                              <Link href={`/ihaleler/${ih.id}`} className="font-semibold text-primary hover:opacity-90">
                                {ih.ihaleNo}
                              </Link>
                            </td>
                            <td className="px-5 py-3 min-w-[240px]">
                              <div className="font-semibold text-on-surface">{ih.ad}</div>
                              <div className="text-xs text-on-surface-variant mt-0.5">
                                Kritik uyarı: {ih.itiraz.kritikUyariGunu} ({ih.itiraz.kritikRemainingDays}g)
                              </div>
                            </td>
                            <td className="px-5 py-3">{ih.kurum.ad}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{formatDateTr(ih.teklifSonTarihi)}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{ih.itiraz.itirazSonGunu}</td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses(remainingKind)}`}>
                                {remaining} gün
                              </span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses("muted")}`}>
                                {ih.durum}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {!loading && (data?.ihaleler?.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                            Kayıt bulunamadı.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                    <div className="text-sm font-semibold text-on-surface">Tahsilat Ajandası</div>
                    <div className="text-xs text-on-surface-variant">
                      {tahsilatAjandasi.length > 0 ? `${tahsilatAjandasi.length} kayıt` : ""}
                    </div>
                  </div>
                  <div className="divide-y divide-outline-variant/60">
                    {tahsilatAjandasi.map((t) => {
                      const kind: "danger" | "warning" | "info" | "muted" =
                        t.remainingDays < 0 ? "danger" : t.remainingDays <= 2 ? "warning" : t.remainingDays <= 7 ? "info" : "muted"
                      return (
                        <div key={t.id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link href={`/ihaleler/${t.ihaleId}`} className="text-sm font-semibold text-primary hover:opacity-90 truncate block">
                                {t.ihaleNo}
                              </Link>
                              <div className="text-xs text-on-surface-variant mt-0.5 truncate">{t.ihaleAd}</div>
                              <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-on-surface">
                                  {String(t.ay).padStart(2, "0")}.{t.yil} • {formatCurrencyTry(t.netTutar)}
                                </span>
                                <span className="text-on-surface-variant">Vade: {formatDateTr(t.vadeTarihi)}</span>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses(kind)}`}>
                              {t.remainingDays}g
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {!loading && tahsilatAjandasi.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-on-surface-variant">Vadesi gelen tahsilat yok.</div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                    <div className="text-sm font-semibold text-on-surface">Tatil Takvimi</div>
                    <Link href="/ayarlar/resmi-tatiller" className="text-xs font-semibold text-primary hover:opacity-90">
                      Yönet
                    </Link>
                  </div>
                  <div className="divide-y divide-outline-variant/60">
                    {upcomingHolidays.map((h) => {
                      const dateLabel = formatDateTr(h.tarih)
                      const isArefe = !!h.arefe
                      return (
                        <div key={h.id} className="px-5 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-on-surface truncate">{h.aciklama || "Resmi Tatil"}</div>
                              <div className="text-xs text-on-surface-variant mt-0.5">{dateLabel}</div>
                            </div>
                            {isArefe ? (
                              <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses("warning")}`}>
                                Arefe
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                    {!loading && upcomingHolidays.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-on-surface-variant">Yakın tarihli tatil kaydı yok.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                <div className="text-sm font-semibold text-on-surface">Filtreli İtiraz Listesi</div>
                <div className="text-xs text-on-surface-variant">{flatItirazlar.length} kayıt</div>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low">
                    <tr className="text-left text-xs text-on-surface-variant">
                      <th className="px-5 py-3">İhale</th>
                      <th className="px-5 py-3">Kurum</th>
                      <th className="px-5 py-3">Tip</th>
                      <th className="px-5 py-3">Durum</th>
                      <th className="px-5 py-3">Başvuru</th>
                      <th className="px-5 py-3">Karar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatItirazlar.map((it) => (
                      <tr key={it.id} className="border-t border-outline-variant/60 hover:bg-surface-container">
                        <td className="px-5 py-3 min-w-[260px]">
                          <Link href={`/ihaleler/${it.ihaleId}`} className="font-semibold text-primary hover:opacity-90">
                            {it.ihaleNo}
                          </Link>
                          <div className="text-xs text-on-surface-variant mt-0.5 truncate">{it.ihaleAd}</div>
                        </td>
                        <td className="px-5 py-3">{it.kurumAd}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses("info")}`}>
                            {it.tip}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full border text-xs font-semibold ${badgeClasses(it.durum === "KABUL_EDILDI" ? "success" : it.durum === "REDDEDILDI" ? "danger" : "muted")}`}>
                            {it.durum}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">{formatDateTr(it.basvuruTarihi)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{it.kararTarihi ? formatDateTr(it.kararTarihi) : "-"}</td>
                      </tr>
                    ))}
                    {!loading && flatItirazlar.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                          Filtreye uygun itiraz kaydı yok.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

