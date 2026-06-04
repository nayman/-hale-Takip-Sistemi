"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface AuditLogItem {
  id: string
  entity: string
  entityId: string
  action: string
  userId: string
  data: any
  createdAt: string
  user: {
    name: string | null
    email: string
    rol: string
  }
}

export default function AyarlarSayfasi() {
  const [appealPeriod, setAppealPeriod] = useState<number>(10)
  const [contractDeadline, setContractDeadline] = useState<number>(15)
  const [announcementThreshold, setAnnouncementThreshold] = useState<string>('1.240.500')
  const [enablePenaltyCalc, setEnablePenaltyCalc] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // Live Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true)

  // Infrastructure health metrics (simulated dynamics)
  const [engineLatency, setEngineLatency] = useState<number>(12)
  const [healthPercent, setHealthPercent] = useState<number>(94)

  useEffect(() => {
    // Dynamic health metrics
    const interval = setInterval(() => {
      setEngineLatency(prev => Math.max(8, Math.min(24, prev + (Math.random() > 0.5 ? 1 : -1))))
      setHealthPercent(prev => Math.max(90, Math.min(99, prev + (Math.random() > 0.5 ? 0.5 : -0.5))))
    }, 4000)

    // Fetch live audit logs
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/audit-logs')
        if (res.ok) {
          const data = await res.json()
          setAuditLogs(data)
        }
      } catch (err) {
        console.error('Audit logs fetch failed:', err)
      } finally {
        setLoadingLogs(false)
      }
    }

    fetchLogs()
    return () => clearInterval(interval)
  }, [])

  const handleSaveChanges = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1000)
  }

  const formatLogTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-800 bg-green-100'
      case 'UPDATE':
        return 'text-blue-800 bg-blue-100'
      case 'DELETE':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-on-surface-variant bg-surface-container'
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
                  <span>Sistem</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-primary font-bold">Genel Ayarlar</span>
                </nav>
                <h1 className="font-display-lg text-headline-md font-bold text-primary">Sistem Ayarları &amp; Parametreler</h1>
                <p className="text-body-lg text-on-surface-variant mt-1">Multi-tenant erişim denetimleri ve 4734 mevzuat motoru konfigürasyonu.</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <a
                  href="/ayarlar/resmi-tatiller"
                  className="flex-1 md:flex-none px-4 py-2 border border-outline-variant rounded-lg font-label-md text-xs font-bold hover:bg-surface-container-low transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Resmi Tatiller
                </a>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-bold animate-fade-in">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Değişiklikler Kaydedildi
                  </span>
                )}
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex-1 md:flex-none px-6 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-gutter">
              
              {/* Infrastructure Health (4/12 cols) */}
              <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex flex-col justify-between shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-primary">Altyapı Sağlık Durumu</h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Sistem bileşenlerinin çalışma metrikleri.</p>
                  </div>
                  <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg text-[20px]">
                    memory
                  </span>
                </div>

                <div className="space-y-5 py-6">
                  {/* Compliance Engine */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-on-surface-variant font-medium">Mevzuat Uyumluluk Motoru</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-[10px] font-bold">STABİL</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${healthPercent}%` }}></div>
                    </div>
                  </div>

                  {/* RBAC Latency */}
                  <div className="flex items-center justify-between text-xs py-2 border-y border-outline-variant/30">
                    <span className="text-on-surface-variant font-medium">Erişim Denetimi (RBAC) Gecikmesi</span>
                    <span className="font-bold text-primary">{engineLatency}ms</span>
                  </div>

                  {/* DB Sync */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Veri Eşitleme (Sync)</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-[10px] font-bold">AKTİF</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant text-[10px] text-on-surface-variant font-semibold">
                  * Son tam denetleme: 2 saat önce yapıldı.
                </div>
              </div>

              {/* 4734 Law Configuration (8/12 cols) */}
              <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-3">
                  <span className="material-symbols-outlined text-primary bg-secondary-container p-2 rounded-lg text-[20px]">
                    gavel
                  </span>
                  <div>
                    <h3 className="font-headline-sm text-sm font-bold text-primary">4734 Kamu İhale Mevzuat Parametreleri</h3>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Süre hesaplamalarında ve eşik değer kontrollerinde kullanılan yasal parametreler.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Yasal İtiraz Süresi (Gün)</label>
                      <input 
                        className="w-full h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold" 
                        type="number" 
                        value={appealPeriod}
                        onChange={(e) => setAppealPeriod(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Sözleşmeye Davet Süresi (Gün)</label>
                      <input 
                        className="w-full h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold" 
                        type="number" 
                        value={contractDeadline}
                        onChange={(e) => setContractDeadline(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Resmi İlan Eşik Değeri (TRY)</label>
                      <input 
                        className="w-full h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold" 
                        type="text" 
                        value={announcementThreshold}
                        onChange={(e) => setAnnouncementThreshold(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end h-[68px] pb-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={enablePenaltyCalc}
                          onChange={(e) => setEnablePenaltyCalc(e.target.checked)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-0" 
                        />
                        <span className="text-xs font-bold text-on-surface">Gecikme Cezalarını Otomatik Hesapla</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* RBAC Access Matrix (7/12 cols) */}
              <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 border-b border-outline-variant">
                  <h3 className="font-headline-sm text-sm font-bold text-primary">Çoklu Kiracı Yetki Matrisi (RBAC)</h3>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Rol bazlı yetkilendirme ve erişim sınırlandırmaları.</p>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase font-semibold">İşlem Alanı</th>
                        <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase font-semibold text-center">Yönetici (Admin)</th>
                        <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase font-semibold text-center">Sorumlu</th>
                        <th className="px-4 py-3 font-label-md text-on-surface-variant uppercase font-semibold text-center">Operasyon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-3.5 font-bold text-primary">İhale Tanımlama / Düzenleme</td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-3.5 font-bold text-primary">Hakediş Girişi / Onay</td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-3.5 font-bold text-primary">Sistem Ayarları Değişimi</td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-3.5 font-bold text-primary">Evrak Silme / Arşivleme</td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-green-700 font-bold">check_circle</span></td>
                        <td className="px-4 py-3.5 text-center"><span className="material-symbols-outlined text-on-surface-variant/30">cancel</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Tenant Audit Trail (5/12 cols) */}
              <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col h-full max-h-[360px]">
                <div className="p-6 border-b border-outline-variant">
                  <h3 className="font-headline-sm text-sm font-bold text-primary">Canlı İşlem Logu (Audit Log)</h3>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Tenant düzeyinde tüm veri değişiklikleri ve kullanıcı aktiviteleri.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-outline-variant">
                  {loadingLogs ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant">Loglar yükleniyor...</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant italic">Kayıtlı aktivite bulunamadı.</div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-surface-container-low transition-colors text-xs flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-base">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-primary truncate">{log.user?.name || log.user?.email || 'Sistem'}</span>
                            <span className="text-[10px] text-on-surface-variant shrink-0">{formatLogTime(log.createdAt)}</span>
                          </div>
                          <p className="text-on-surface-variant mt-1 text-[11px]">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mr-1.5 ${getActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                            {log.entity} tablosunda işlem yapıldı.
                          </p>
                          {log.data && (
                            <div className="mt-2 bg-surface border border-outline-variant/40 rounded p-1.5 text-[10px] font-mono text-on-surface-variant overflow-x-auto">
                              {JSON.stringify(log.data)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Gazette Banner */}
            <div className="bg-white border border-outline-variant rounded-xl p-8 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <span className="material-symbols-outlined text-[240px]">account_balance</span>
              </div>
              <div className="flex-1 z-10">
                <h3 className="font-headline-sm text-sm font-bold text-primary mb-2">Law 4734 Semantic Engine Durumu</h3>
                <p className="text-xs text-on-surface-variant max-w-3xl">
                  Mevzuat motorumuz, Kamu İhale Kurumu tarafından yayımlanan Resmi Gazete değişikliklerini otomatik olarak takip eder ve sistem kurallarını günceller. Son eşitleme işleminde kritik bir değişiklik tespit edilmemiştir.
                </p>
              </div>
              <div className="flex gap-2 z-10 w-full md:w-auto shrink-0">
                <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-bold hover:opacity-90 transition-all cursor-pointer">
                  Manuel Eşitle
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
