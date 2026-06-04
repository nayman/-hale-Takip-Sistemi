"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { useRouter } from "next/navigation"
import { iller } from "@/lib/turkiye-il-ilce"

export default function KurumlarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Lists
  const [kurumlar, setKurumlar] = useState<any[]>([])
  const [rakipFirmalar, setRakipFirmalar] = useState<any[]>([])
  
  // States
  const [activeTab, setActiveTab] = useState<"kurum" | "rakip">("kurum")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIl, setSelectedIl] = useState("")
  const [loading, setLoading] = useState(true)

  // Competitor Modal States
  const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false)
  const [editingFirma, setEditingFirma] = useState<any>(null)
  const [firmaForm, setFirmaForm] = useState({
    ad: "",
    unvan: "",
    vergiNo: "",
    il: "",
    telefon: ""
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [kurumRes, rakipRes] = await Promise.all([
        fetch("/api/kurumlar"),
        fetch("/api/rakip-firmalar")
      ])
      
      if (kurumRes.ok) {
        setKurumlar(await kurumRes.json())
      }
      if (rakipRes.ok) {
        setRakipFirmalar(await rakipRes.json())
      }
    } catch (e) {
      console.error("Fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session) return
    const t = setTimeout(() => {
      void fetchData()
    }, 0)
    return () => clearTimeout(t)
  }, [session])

  const handleDeleteKurum = async (id: string) => {
    if (!confirm("Bu kurumu silmek istediğinize emin misiniz?")) return
    const res = await fetch(`/api/kurumlar?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchData()
    } else {
      alert("Silinirken hata oluştu.")
    }
  }

  // Competitor CRUD
  const handleFirmaEditClick = (firma: any) => {
    setEditingFirma(firma)
    setFirmaForm({
      ad: firma.ad || "",
      unvan: firma.unvan || "",
      vergiNo: firma.vergiNo || "",
      il: firma.il || "",
      telefon: firma.telefon || ""
    })
    setIsFirmaModalOpen(true)
  }

  const handleFirmaAddClick = () => {
    setEditingFirma(null)
    setFirmaForm({ ad: "", unvan: "", vergiNo: "", il: "", telefon: "" })
    setIsFirmaModalOpen(true)
  }

  const handleFirmaSave = async () => {
    const url = editingFirma ? `/api/rakip-firmalar?id=${editingFirma.id}` : "/api/rakip-firmalar"
    const method = editingFirma ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firmaForm)
    })

    if (res.ok) {
      setIsFirmaModalOpen(false)
      fetchData()
    } else {
      alert("İşlem gerçekleştirilemedi.")
    }
  }

  const handleDeleteFirma = async (id: string) => {
    if (!confirm("Bu rakip firmayı silmek istediğinize emin misiniz?")) return
    const res = await fetch(`/api/rakip-firmalar?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchData()
    } else {
      alert("Silinirken hata oluştu.")
    }
  }

  // Filter Lists
  const filteredKurumlar = useMemo(() => {
    return kurumlar.filter(k => {
      const matchesSearch = k.ad.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (k.unvan && k.unvan.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesIl = selectedIl === "" || k.il === selectedIl
      return matchesSearch && matchesIl
    })
  }, [kurumlar, searchTerm, selectedIl])

  const filteredRakipFirmalar = useMemo(() => {
    return rakipFirmalar.filter(rf => {
      const matchesSearch = rf.ad.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (rf.unvan && rf.unvan.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesIl = selectedIl === "" || rf.il === selectedIl
      return matchesSearch && matchesIl
    })
  }, [rakipFirmalar, searchTerm, selectedIl])

  // Get active cities list for dropdown filtering
  const activeCities = useMemo(() => {
    const cities = new Set<string>()
    kurumlar.forEach(k => { if (k.il) cities.add(k.il) })
    rakipFirmalar.forEach(rf => { if (rf.il) cities.add(rf.il) })
    return Array.from(cities).sort()
  }, [kurumlar, rakipFirmalar])

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Kurum & Firma Yönetimi</h2>
                <p className="text-sm text-on-surface-variant">İhale açan kurumlar ve ihaledeki rakip firmalarınızın merkezi listesi.</p>
              </div>
              <div>
                {activeTab === "kurum" ? (
                  <Link href="/kurumlar/yeni" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition inline-block text-sm">
                    + Yeni Kurum Ekle
                  </Link>
                ) : (
                  <button onClick={handleFirmaAddClick} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition text-sm">
                    + Yeni Rakip Firma Ekle
                  </button>
                )}
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-outline-variant">
              <button
                onClick={() => { setActiveTab("kurum"); setSearchTerm(""); setSelectedIl(""); }}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "kurum"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary"
                }`}
              >
                Kamu Kurumları
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "kurum" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low text-on-surface-variant"}`}>
                  {kurumlar.length}
                </span>
              </button>
              <button
                onClick={() => { setActiveTab("rakip"); setSearchTerm(""); setSelectedIl(""); }}
                className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === "rakip"
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary"
                }`}
              >
                Rakip Firmalar
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "rakip" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low text-on-surface-variant"}`}>
                  {rakipFirmalar.length}
                </span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant p-4 flex flex-col md:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder={activeTab === "kurum" ? "Kurum Adı veya Unvan Ara..." : "Firma Adı veya Unvan Ara..."}
                className="w-full md:flex-1 border border-outline-variant bg-surface-container-low px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                value={selectedIl}
                onChange={e => setSelectedIl(e.target.value)}
                className="w-full md:w-48 border border-outline-variant bg-surface-container-low px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Tüm İller</option>
                {activeCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Table Card */}
            <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-4 font-semibold text-sm">Adı / Resmi Unvan</th>
                      <th className="p-4 font-semibold text-sm">İl</th>
                      <th className="p-4 font-semibold text-sm">{activeTab === "kurum" ? "Vergi Dairesi / No" : "Vergi Numarası"}</th>
                      <th className="p-4 font-semibold text-sm">İletişim</th>
                      <th className="p-4 font-semibold text-sm">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-variant">Yükleniyor...</td>
                      </tr>
                    ) : activeTab === "kurum" ? (
                      filteredKurumlar.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-on-surface-variant">Kayıt bulunamadı.</td>
                        </tr>
                      ) : (
                        filteredKurumlar.map((kurum) => (
                          <tr key={kurum.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container transition">
                            <td className="p-4">
                              <div className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => router.push(`/kurumlar/${kurum.id}`)}>
                                {kurum.ad}
                              </div>
                              {kurum.unvan && <div className="text-xs text-on-surface-variant mt-0.5">{kurum.unvan}</div>}
                            </td>
                            <td className="p-4 text-sm font-medium">
                              {kurum.il ? `${kurum.il} ${kurum.ilce ? `/ ${kurum.ilce}` : ""}` : "-"}
                            </td>
                            <td className="p-4 text-sm">
                              {kurum.vergiDairesi || "-"}<br/>
                              <span className="text-xs text-on-surface-variant">{kurum.vergiNo || "-"}</span>
                            </td>
                            <td className="p-4 text-sm text-on-surface">
                              {kurum.telefon && <div className="flex items-center gap-1">📞 {kurum.telefon}</div>}
                              {kurum.email && <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">✉️ {kurum.email}</div>}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Link href={`/kurumlar/${kurum.id}`} className="px-3 py-1 bg-surface-container-lowest border border-outline-variant text-primary rounded text-sm hover:bg-surface-container font-medium transition">
                                  Giriş Yap
                                </Link>
                                <button onClick={() => handleDeleteKurum(kurum.id)} className="px-3 py-1 bg-error-container text-on-error-container rounded text-sm hover:opacity-90 font-medium transition">
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      filteredRakipFirmalar.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-on-surface-variant">Kayıt bulunamadı.</td>
                        </tr>
                      ) : (
                        filteredRakipFirmalar.map((firma) => (
                          <tr key={firma.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container transition">
                            <td className="p-4">
                              <div className="font-semibold text-primary">
                                {firma.ad}
                              </div>
                              {firma.unvan && <div className="text-xs text-on-surface-variant mt-0.5">{firma.unvan}</div>}
                            </td>
                            <td className="p-4 text-sm font-medium">
                              {firma.il || "-"}
                            </td>
                            <td className="p-4 text-sm">
                              {firma.vergiNo || "-"}
                            </td>
                            <td className="p-4 text-sm text-on-surface">
                              {firma.telefon ? `📞 ${firma.telefon}` : "-"}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleFirmaEditClick(firma)} className="px-3 py-1 bg-surface-container-lowest border border-outline-variant text-primary rounded text-sm hover:bg-surface-container font-medium transition">
                                  Düzenle
                                </button>
                                <button onClick={() => handleDeleteFirma(firma.id)} className="px-3 py-1 bg-error-container text-on-error-container rounded text-sm hover:opacity-90 font-medium transition">
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* RAKİP FİRMA MODAL */}
      {isFirmaModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant w-full max-w-lg">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-lg font-bold">{editingFirma ? "Rakip Firma Düzenle" : "Yeni Rakip Firma Ekle"}</h3>
              <button onClick={() => setIsFirmaModalOpen(false)} className="text-on-surface-variant hover:text-primary text-xl font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Firma Adı *</label>
                <input required type="text" value={firmaForm.ad} onChange={e => setFirmaForm({...firmaForm, ad: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Örn: Vega Ltd. Şti." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Resmi Unvan</label>
                <input type="text" value={firmaForm.unvan} onChange={e => setFirmaForm({...firmaForm, unvan: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Vergi No</label>
                <input type="text" value={firmaForm.vergiNo} onChange={e => setFirmaForm({...firmaForm, vergiNo: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">İl</label>
                <select 
                  value={firmaForm.il} 
                  onChange={e => setFirmaForm({...firmaForm, il: e.target.value})} 
                  className="w-full border border-outline-variant bg-surface-container-low px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">İl Seçin</option>
                  {iller.map(il => (
                    <option key={il.kod} value={il.ad}>{il.ad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Telefon</label>
                <input type="text" value={firmaForm.telefon} onChange={e => setFirmaForm({...firmaForm, telefon: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-end gap-2 bg-surface-container-low -mx-6 -mb-6 p-4">
                <button type="button" onClick={() => setIsFirmaModalOpen(false)} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg font-medium hover:bg-surface-container transition-colors">
                  İptal
                </button>
                <button type="button" onClick={handleFirmaSave} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
