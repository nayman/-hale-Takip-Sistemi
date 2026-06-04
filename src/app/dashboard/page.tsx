"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface Ihale {
  id: string
  ihaleNo: string
  ad: string
  durum: string
  bitisTarihi?: string | Date
  teklifSonTarihi?: string | Date
  butce?: number
  createdAt: string | Date
  updatedAt: string | Date
  olusturanUserId: string
  sorumluUserId?: string
  tenantId: string
}

interface AlertItem {
  id: string
  type: 'sensor' | 'compliance' | 'milestone'
  severity: 'critical' | 'warning' | 'info'
  title: string
  subtitle: string
  details: string
  timeAgo: string
  actionLabel?: string
  actionUrl?: string
}

interface SirketEvrak {
  id: string
  ad: string
  tip: string
  kategori: string
  sonGecerlilikTarihi?: string | Date
  durum: string
}

const Dashboard = () => {
  const { data: session } = useSession()
  const [ihaleler, setIhaleler] = useState<Ihale[]>([])
  const [evraklar, setEvraklar] = useState<SirketEvrak[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  // Fetch ihaleler & evraklar from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [ihalelerRes, evraklarRes] = await Promise.all([
          fetch('/api/ihaleler?limit=50', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/sirket-evraklari?limit=50', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ])

        let fetchedIhaleler: Ihale[] = []
        let fetchedEvraklar: SirketEvrak[] = []

        if (ihalelerRes.ok) {
          const data = await ihalelerRes.json()
          fetchedIhaleler = data.ihaleler || data || []
          setIhaleler(fetchedIhaleler)
        }

        if (evraklarRes.ok) {
          const data = await evraklarRes.json()
          fetchedEvraklar = data.evraklar || data || []
          setEvraklar(fetchedEvraklar)
        }

        // Generate dynamic alerts based on database records
        const dynamicAlerts: AlertItem[] = []
        const now = new Date()

        // 1. Check documents for validity
        fetchedEvraklar.forEach((evrak) => {
          if (evrak.durum === 'AKTIF' && evrak.sonGecerlilikTarihi) {
            const expDate = new Date(evrak.sonGecerlilikTarihi)
            const diffTime = expDate.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays <= 7) {
              dynamicAlerts.push({
                id: `evrak-alert-${evrak.id}`,
                type: 'compliance',
                severity: 'critical',
                title: evrak.ad,
                subtitle: 'Kritik Evrak Uyarısı',
                details: `${evrak.ad} geçerlilik süresi ${diffDays > 0 ? `${diffDays} gün içinde doluyor.` : 'dolmuştur.'}`,
                timeAgo: 'Mevzuat Kontrolü',
                actionLabel: 'Yenile',
                actionUrl: '/sirket-evraklari'
              })
            } else if (diffDays <= 30) {
              dynamicAlerts.push({
                id: `evrak-alert-${evrak.id}`,
                type: 'compliance',
                severity: 'warning',
                title: evrak.ad,
                subtitle: 'Mevzuat Uyarısı',
                details: `${evrak.ad} geçerlilik süresi ${diffDays} gün içinde doluyor. Lütfen yenileyiniz.`,
                timeAgo: 'Mevzuat Kontrolü',
                actionLabel: 'Yenile',
                actionUrl: '/sirket-evraklari'
              })
            }
          }
        })

        // 2. Check active tenders for deadline
        fetchedIhaleler.forEach((ihale) => {
          if (ihale.durum === 'DEVAM_EDİYOR' || ihale.durum === 'TASLAK') {
            if (ihale.teklifSonTarihi) {
              const deadline = new Date(ihale.teklifSonTarihi)
              const diffTime = deadline.getTime() - now.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

              if (diffDays <= 3) {
                dynamicAlerts.push({
                  id: `ihale-alert-${ihale.id}`,
                  type: 'milestone',
                  severity: 'critical',
                  title: ihale.ad,
                  subtitle: 'Kritik İhale Uyarısı',
                  details: `${ihale.ad} ihalesi son teklif verme süresine ${diffDays > 0 ? `${diffDays} gün kalmıştır.` : 'süre dolmuştur.'}`,
                  timeAgo: 'Zaman Aşımı Kontrolü',
                  actionLabel: 'İhaleye Git',
                  actionUrl: `/ihaleler`
                })
              } else if (diffDays <= 7) {
                dynamicAlerts.push({
                  id: `ihale-alert-${ihale.id}`,
                  type: 'milestone',
                  severity: 'warning',
                  title: ihale.ad,
                  subtitle: 'İhale Yaklaşan Tarih',
                  details: `${ihale.ad} ihalesi son teklif verme süresine ${diffDays} gün kalmıştır.`,
                  timeAgo: 'Zaman Aşımı Kontrolü',
                  actionLabel: 'İhaleye Git',
                  actionUrl: `/ihaleler`
                })
              }
            }
          }
        })

        // Sort: critical first, then warning
        dynamicAlerts.sort((a, b) => {
          const severityWeight = { critical: 2, warning: 1, info: 0 }
          return severityWeight[b.severity] - severityWeight[a.severity]
        })

        setAlerts(dynamicAlerts)

      } catch (error) {
        console.error('Veriler yüklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [session])

  // Acknowledge alert (interactivity)
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId))
  }

  // Calculate statistics
  const activeTenders = ihaleler.filter(i => i.durum === 'TASLAK' || i.durum === 'DEVAM_EDİYOR')
  const activeTendersCount = activeTenders.length
  const totalPortfolioValue = activeTenders.reduce((sum, i) => sum + (i.butce || 0), 0)

  const nowForExp = new Date()
  const criticalDocsCount = evraklar.filter(evrak => {
    if (evrak.durum !== 'AKTIF' || !evrak.sonGecerlilikTarihi) return false
    const expDate = new Date(evrak.sonGecerlilikTarihi)
    const diffTime = expDate.getTime() - nowForExp.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30
  }).length

  const totalDocsCount = evraklar.length

  const stats = {
    toplam: ihaleler.length,
    aktif: activeTendersCount,
    kazanilan: ihaleler.filter(i => i.durum === 'KAZANDI' || i.durum === 'KAZANILDI').length,
    toplamYM: totalPortfolioValue,
  }

  // Formatting date safely
  const formatDate = (tarihStr?: string | Date) => {
    if (!tarihStr) return '-'
    const date = new Date(tarihStr)
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('tr-TR')
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'TASLAK':
        return 'bg-surface-container text-on-surface-variant'
      case 'DEVAM_EDİYOR':
      case 'AKTIF':
        return 'bg-secondary-container text-on-secondary-container font-semibold'
      case 'KAZANILDI':
      case 'KAZANDI':
        return 'bg-green-100 text-green-800 font-semibold'
      case 'KAYBEDİLDİ':
        return 'bg-error-container text-on-error-container'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-on-surface-variant font-label-md uppercase tracking-wider">Veriler Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

        {/* Dashboard Content */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            
            {/* Header info */}
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">
                İşletim ve Operasyon Portalı
              </p>
              <h1 className="font-display-lg text-headline-md font-bold text-primary">
                Operasyonel Kontrol Paneli
              </h1>
            </div>

            {/* Bento-Grid Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {/* Aktif İhaleler */}
              <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg text-[22px]">
                    gavel
                  </span>
                  <span className="text-on-secondary-container bg-secondary-container font-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                    {ihaleler.length} Toplam
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Aktif İhaleler</p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-1 font-bold">{activeTendersCount}</h2>
                  <div className="w-full bg-surface-container h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${ihaleler.length > 0 ? (activeTendersCount / ihaleler.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Portföy Değeri */}
              <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary bg-secondary-container p-2 rounded-lg text-[22px]">
                    trending_up
                  </span>
                  <span className="text-primary font-label-sm px-2.5 py-0.5 rounded-full bg-primary-fixed font-semibold">
                    Bütçe Toplamı
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Portföy Değeri</p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-1 font-bold">
                    ₺{totalPortfolioValue >= 1000000 ? `${(totalPortfolioValue / 1000000).toFixed(1)}M` : totalPortfolioValue.toLocaleString('tr-TR')}
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-1 text-xs">Aktif ihalelerin bütçe toplamı</p>
                </div>
              </div>

              {/* Kritik Evraklar */}
              <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg text-[22px]">
                    warning
                  </span>
                  <span className={`${criticalDocsCount > 0 ? 'text-on-error-container bg-error-container animate-pulse' : 'text-on-secondary-container bg-secondary-container'} font-label-sm px-2.5 py-0.5 rounded-full font-semibold`}>
                    {criticalDocsCount > 0 ? 'Yenileme Gerekli' : 'Sorunsuz'}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Kritik Evraklar</p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-1 font-bold">{criticalDocsCount}</h2>
                  <p className="text-body-md text-on-surface-variant mt-1 text-xs">Son 30 günü kalmış evraklar</p>
                </div>
              </div>

              {/* Toplam Belgeler */}
              <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-primary bg-secondary-container p-2 rounded-lg text-[22px]">
                    folder_open
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer text-[20px]">
                    info
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Evrak Havuzu</p>
                  <h2 className="font-headline-md text-headline-md text-primary mt-1 font-bold">{totalDocsCount}</h2>
                  <p className="text-body-md text-on-surface-variant mt-1 text-xs">Sistemdeki toplam şirket evrakı</p>
                </div>
              </div>
            </div>

            {/* Main Grid: Alerts and Active Tenders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Field Alerts Section (4/12 columns) */}
              <section className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                  <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-error">warning</span>
                    Saha Alarmları
                  </h3>
                  {criticalAlertsCount > 0 && (
                    <span className="bg-error text-on-error text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                      {criticalAlertsCount} Kritik Uyarı
                    </span>
                  )}
                </div>

                <div className="flex-1 custom-scrollbar overflow-y-auto max-h-[480px] divide-y divide-outline-variant">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant italic">
                      Aktif bir alarm bulunmamaktadır.
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="p-stack-lg hover:bg-surface-container-low transition-colors duration-150">
                        <div className="flex justify-between items-start mb-2">
                          <span 
                            className={`font-label-md text-label-md uppercase tracking-wider font-semibold ${
                              alert.severity === 'critical' ? 'text-error' : alert.severity === 'warning' ? 'text-secondary' : 'text-primary'
                            }`}
                          >
                            {alert.subtitle}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{alert.timeAgo}</span>
                        </div>
                        <p className="font-body-md text-body-md text-primary font-bold">{alert.title}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">{alert.details}</p>
                        
                        <div className="flex gap-2 mt-4">
                          {alert.actionLabel && (
                            <button 
                              onClick={() => {
                                if (alert.actionUrl) {
                                  window.location.href = alert.actionUrl
                                } else {
                                  handleAcknowledgeAlert(alert.id)
                                }
                              }}
                              className="text-label-sm font-label-md text-primary bg-primary-fixed px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity font-semibold cursor-pointer"
                            >
                              {alert.actionLabel}
                            </button>
                          )}
                          <button 
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="text-label-sm font-label-md text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface transition-colors font-semibold cursor-pointer"
                          >
                            Kapat
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Active Tenders Progress Table (7/12 columns) */}
              <section className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">Aktif İhale Durumları</h3>
                  <div className="flex gap-2">
                    <button className="material-symbols-outlined p-1 text-on-surface-variant hover:bg-surface-container rounded border border-outline-variant cursor-pointer">
                      filter_list
                    </button>
                    <button className="material-symbols-outlined p-1 text-on-surface-variant hover:bg-surface-container rounded border border-outline-variant cursor-pointer">
                      download
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase font-semibold">İhale / İş Kimliği</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase font-semibold">Durum</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase font-semibold">Bütçe</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase font-semibold">Son Teklif</th>
                        <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase font-semibold">Kritiklik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {ihaleler.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant italic">
                            Aktif ihale bulunmamaktadır.
                          </td>
                        </tr>
                      ) : (
                        ihaleler.map((ihale) => {
                          const deadline = ihale.teklifSonTarihi ? new Date(ihale.teklifSonTarihi) : null
                          const diffTime = deadline ? deadline.getTime() - new Date().getTime() : 0
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          let criticality = 'Düşük'
                          let critClass = 'bg-surface-container text-on-surface-variant'
                          if (diffDays <= 7) {
                            criticality = 'Kritik'
                            critClass = 'bg-error-container text-on-error-container animate-pulse font-semibold'
                          } else if (diffDays <= 15) {
                            criticality = 'Yüksek'
                            critClass = 'bg-secondary-container text-on-secondary-container font-semibold'
                          }

                          return (
                            <tr key={ihale.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-body-md text-body-md font-bold text-primary truncate max-w-[200px]">
                                    {ihale.ad}
                                  </p>
                                  <p className="font-label-sm text-label-sm text-on-surface-variant">IKN: {ihale.ihaleNo}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${getStatusBadgeClass(ihale.durum)}`}>
                                  {ihale.durum}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-body-md text-body-md text-primary font-medium">
                                  ₺{(ihale.butce || 0).toLocaleString('tr-TR')}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                                {formatDate(ihale.teklifSonTarihi)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${critClass}`}>
                                  {criticality}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-surface-bright border-t border-outline-variant flex justify-between items-center">
                  <p className="font-body-md text-body-md text-on-surface-variant italic text-xs">
                    Toplam {stats.toplam} ihaleden {ihaleler.length} tanesi gösteriliyor.
                  </p>
                  <Link href="/ihaleler" className="font-label-md text-label-md text-primary font-bold hover:underline">
                    TÜM İHALELERİ GÖR
                  </Link>
                </div>
              </section>
            </div>
            
          </div>
        </main>
      </div>

      {/* Floating Action Button (Tender Wizard Shortcut) */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          href="/ihaleler/yeni-ihale" 
          className="flex items-center gap-2 bg-primary text-white px-5 py-3.5 rounded-full shadow-sm hover:opacity-95 transition-all active:scale-95 group font-semibold"
        >
          <span className="material-symbols-outlined transition-transform group-hover:rotate-90 text-[20px]">
            add
          </span>
          <span className="font-label-md text-xs uppercase tracking-wider pt-0.5">Yeni İhale Sihirbazı</span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
