"use client"

import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

type MonthlySeriesItem = {
  key: string
  total: number
  won: number
  lost: number
  volume: number
}

const AnalizDashboard = () => {
  const [months, setMonths] = useState(6)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [monthlySeries, setMonthlySeries] = useState<MonthlySeriesItem[]>([])
  const [topRakipler, setTopRakipler] = useState<any[]>([])
  const [recentConcluded, setRecentConcluded] = useState<any[]>([])

  const formatCurrency = (value: number) =>
    value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })

  useEffect(() => {
    let isActive = true
    setLoading(true)
    setError('')
    fetch(`/api/dashboard/analiz?months=${months}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Analiz verileri alınamadı'))))
      .then((data) => {
        if (!isActive) return
        setSummary(data?.summary || null)
        setMonthlySeries(Array.isArray(data?.monthlySeries) ? data.monthlySeries : [])
        setTopRakipler(Array.isArray(data?.topRakipler) ? data.topRakipler : [])
        setRecentConcluded(Array.isArray(data?.recentConcluded) ? data.recentConcluded : [])
      })
      .catch((e: any) => {
        if (!isActive) return
        setError(e.message || 'Hata oluştu')
      })
      .finally(() => {
        if (!isActive) return
        setLoading(false)
      })
    return () => {
      isActive = false
    }
  }, [months])

  const chartBars = useMemo(() => {
    return monthlySeries.map((s) => {
      const total = Math.max(0, s.total)
      const won = Math.max(0, s.won)
      const actual = total > 0 ? Math.round((won / total) * 100) : 0
      const target = 60
      const label = s.key.split('-')[1] || ''
      return { label, actual, target }
    })
  }, [monthlySeries])

  const getStatusBadge = (status: string) => {
    if (status === 'KAZANILDI') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>
          KAZANILDI
        </span>
      )
    }
    if (status === 'KAYBEDİLDİ') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
          KAYBEDİLDİ
        </span>
      )
    }
    if (status === 'İPTAL') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-low text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mr-1.5"></span>
          İPTAL
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 mr-1.5"></span>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

        {/* Dashboard Content */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">
                  Stratejik Analiz ve Planlama
                </p>
                <h1 className="font-display-lg text-headline-md font-bold text-primary">
                  Raporlama & Analiz Paneli
                </h1>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setMonths(6)}
                  className="flex-1 md:flex-none px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-xs font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Son 6 Ay
                </button>
                <button
                  onClick={() => window.open(`/api/dashboard/analiz/export?type=ihale&months=${months}`, "_blank")}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  İhale CSV
                </button>
                <button
                  onClick={() => window.open(`/api/dashboard/analiz/export?type=rakip&months=${months}`, "_blank")}
                  className="flex-1 md:flex-none px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-xs font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  Rakip CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 md:flex-none px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-xs font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  PDF (Yazdır)
                </button>
              </div>
            </div>

            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>
            ) : null}

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-gutter">
              {/* Total Tender Volume (3/12 cols) */}
              <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      analytics
                    </span>
                    <span className="text-on-surface-variant bg-surface-container px-2 py-0.5 rounded text-xs font-bold leading-none">{months} ay</span>
                  </div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] mb-1">Toplam İhale Hacmi</p>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">{loading || !summary ? "-" : formatCurrency(summary.totalTenderVolume || 0)}</h3>
                </div>
                <div className="mt-4 h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4"></div>
                </div>
              </div>

              {/* Active Tenders Metric (3/12 cols) */}
              <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      assignment
                    </span>
                    <span className="text-on-surface-variant bg-surface-container px-2 py-0.5 rounded text-xs font-bold leading-none">Stabil</span>
                  </div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] mb-1">Aktif Teklifler</p>
                  <h3 className="font-headline-md text-headline-md text-primary font-bold">{loading || !summary ? "-" : `${summary.activeCount || 0} Adet`}</h3>
                </div>
                <p className="font-label-sm text-[11px] text-on-surface-variant mt-4">Kazanma oranı: {loading || !summary || summary.winRate === null ? "-" : `%${summary.winRate}`}</p>
              </div>

              {/* Win Rate Trends Chart Card (6/12 cols) */}
              <div className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl relative overflow-hidden shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] mb-1">Kazanma Oranı Trendleri</p>
                    <h3 className="font-headline-sm text-sm text-primary font-bold">Aylık Dönüşüm Analizi</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="text-xs text-on-surface-variant font-medium">Fiili</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                      <span className="text-xs text-on-surface-variant font-medium">Hedef</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart Visualized with Tailwind */}
                <div className="h-32 flex items-end gap-3 px-2">
                  {(chartBars.length ? chartBars : [{ label: '-', actual: 0, target: 0 }]).map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full gap-1">
                      <div className="flex items-end justify-center gap-0.5 h-24">
                        <div 
                          className="bg-primary rounded-t-sm w-3.5 hover:opacity-90 transition-opacity" 
                          style={{ height: `${bar.actual}%` }}
                          title={`Fiili: %${bar.actual}`}
                        />
                        <div 
                          className="bg-outline-variant rounded-t-sm w-1.5" 
                          style={{ height: `${bar.target}%` }}
                          title={`Hedef: %${bar.target}`}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant text-center block mt-1 font-semibold">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-12 md:col-span-12 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] mb-1">Rakip Analizi</p>
                    <h3 className="font-headline-sm text-sm text-primary font-bold">En Sık Karşılaşılan Rakipler (Top 10)</h3>
                  </div>
                  <button
                    onClick={() => window.open(`/api/dashboard/analiz/export?type=rakip&months=${months}`, "_blank")}
                    className="px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    CSV
                  </button>
                </div>

                {loading ? (
                  <div className="py-10 text-center text-sm text-on-surface-variant">Yükleniyor...</div>
                ) : topRakipler.length === 0 ? (
                  <div className="py-10 text-center text-sm text-on-surface-variant">Rakip verisi bulunamadı.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topRakipler.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 bg-white border border-outline-variant rounded-lg px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-primary truncate" title={r.ad}>{r.ad}</div>
                          <div className="text-[11px] text-on-surface-variant font-semibold">
                            İhale: {r.ihaleSayisi} • Teklif: {r.teklifSayisi}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-on-surface-variant uppercase font-bold">Ortalama</div>
                          <div className="text-sm font-extrabold text-primary">{formatCurrency(r.ortalamaTeklif || 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Critical Concluded Tenders (12/12 cols) */}
              <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                  <div>
                    <h3 className="font-headline-sm text-sm text-primary font-bold">Nihai Sonuçlanan Son İhaleler</h3>
                    <p className="text-body-md text-on-surface-variant text-xs mt-1">Sözleşme bağlanan yüksek bütçeli ihale listesi.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/api/dashboard/analiz/export?type=ihale&months=${months}`, "_blank")}
                      className="p-1.5 border border-outline-variant rounded hover:bg-surface-container transition-all cursor-pointer"
                      title="İhale performans CSV"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase font-semibold text-xs">Dosya No</th>
                        <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase font-semibold text-xs">Proje Adı</th>
                        <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase font-semibold text-xs">Bedel</th>
                        <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase font-semibold text-xs">İhale Makamı</th>
                        <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase font-semibold text-xs">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {loading ? (
                        <tr>
                          <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={5}>
                            Yükleniyor...
                          </td>
                        </tr>
                      ) : recentConcluded.length === 0 ? (
                        <tr>
                          <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={5}>
                            Sonuçlanan ihale bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        recentConcluded.map((t: any) => (
                          <tr key={t.id} className="hover:bg-surface-container-low transition-colors duration-150">
                            <td className="px-6 py-4 font-label-md text-primary font-bold text-xs">{t.ihaleNo}</td>
                            <td className="px-6 py-4 font-body-md text-primary text-sm font-semibold">{t.ad}</td>
                            <td className="px-6 py-4 font-body-md text-primary text-sm font-bold">{formatCurrency(t.sozlesmeBedeli || t.butce || 0)}</td>
                            <td className="px-6 py-4 font-body-md text-on-surface-variant text-sm">{t.kurum?.ad || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(t.durum)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default AnalizDashboard
