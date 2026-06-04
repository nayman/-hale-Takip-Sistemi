"use client"

import { useSession } from "next-auth/react"
import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { iller, LocationUtils } from "@/lib/turkiye-il-ilce"

export default function KurumDetayPage() {
  const { data: session, status } = useSession()
  const { id } = useParams()
  const router = useRouter()
  
  const [kurum, setKurum] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"notlar" | "aramalar">("notlar")
  
  // Hafiza Notu
  const [yeniNot, setYeniNot] = useState("")
  const [loadingNot, setLoadingNot] = useState(false)
  const [editingNotId, setEditingNotId] = useState<string | null>(null)
  const [editingNotText, setEditingNotText] = useState("")
  
  // Kurum Kisi
  const [showKisiForm, setShowKisiForm] = useState(false)
  const [yeniKisi, setYeniKisi] = useState({ ad: "", soyad: "", unvan: "", telefon: "", email: "" })
  const [loadingKisi, setLoadingKisi] = useState(false)

  // Arama Loglari
  const [yeniArama, setYeniArama] = useState({ arananKisi: "", modul: "YAKLASIK_MALIYET", not: "" })
  const [loadingArama, setLoadingArama] = useState(false)
  const [filterLogStart, setFilterLogStart] = useState("")
  const [filterLogEnd, setFilterLogEnd] = useState("")
  const [filterLogModul, setFilterLogModul] = useState("")
  const [filterLogYazar, setFilterLogYazar] = useState("")
  const [filterLogAranan, setFilterLogAranan] = useState("")

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    ad: "",
    unvan: "",
    vergiNo: "",
    vergiDairesi: "",
    il: "",
    ilce: "",
    adres: "",
    telefon: "",
    email: ""
  })
  const [editSelectedIlKod, setEditSelectedIlKod] = useState("")

  const fetchKurum = async () => {
    const res = await fetch(`/api/kurumlar?id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setKurum(data)
      // Pre-fill edit form
      setEditForm({
        ad: data.ad || "",
        unvan: data.unvan || "",
        vergiNo: data.vergiNo || "",
        vergiDairesi: data.vergiDairesi || "",
        il: data.il || "",
        ilce: data.ilce || "",
        adres: data.adres || "",
        telefon: data.telefon || "",
        email: data.email || ""
      })
      // Find matching il code
      const matchingIl = iller.find(il => il.ad.toLowerCase() === (data.il || "").toLowerCase())
      setEditSelectedIlKod(matchingIl ? matchingIl.kod : "")
    }
  }

  useEffect(() => {
    if (session && id) fetchKurum()
  }, [session, id])

  const getWhatsAppLink = (phone: string | null | undefined) => {
    if (!phone) return null;
    const clean = phone.replace(/[\s()-]/g, "");
    if (clean.startsWith("05") && clean.length >= 10) {
      return `https://wa.me/90${clean.substring(1)}`;
    }
    if (clean.startsWith("5") && clean.length >= 9) {
      return `https://wa.me/90${clean}`;
    }
    if (clean.startsWith("+905") && clean.length >= 12) {
      return `https://wa.me/${clean.substring(1)}`;
    }
    if (clean.startsWith("905") && clean.length >= 11) {
      return `https://wa.me/${clean}`;
    }
    return null;
  }

  const handleAddNot = async (e?: any) => {
    e?.preventDefault()
    if (!yeniNot.trim()) return
    setLoadingNot(true)

    const res = await fetch(`/api/kurumlar/${id}/hafiza-notlari`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: yeniNot })
    })

    setLoadingNot(false)
    if (res.ok) {
      setYeniNot("")
      fetchKurum()
    }
  }

  const handleDeleteNot = async (notId: string) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return
    await fetch(`/api/kurumlar/${id}/hafiza-notlari?notId=${notId}`, { method: "DELETE" })
    fetchKurum()
  }

  const handleStartEditNot = (note: any) => {
    setEditingNotId(note.id)
    setEditingNotText(note.not || "")
  }

  const handleCancelEditNot = () => {
    setEditingNotId(null)
    setEditingNotText("")
  }

  const handleSaveEditNot = async () => {
    if (!editingNotId) return
    const res = await fetch(`/api/kurumlar/${id}/hafiza-notlari?notId=${editingNotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not: editingNotText }),
    })
    if (res.ok) {
      handleCancelEditNot()
      fetchKurum()
    } else {
      alert("Not güncellenemedi.")
    }
  }

  const handleAddKisi = async (e?: any) => {
    e?.preventDefault()
    setLoadingKisi(true)
    const res = await fetch(`/api/kurumlar/${id}/kisiler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(yeniKisi)
    })
    setLoadingKisi(false)
    if (res.ok) {
      setYeniKisi({ ad: "", soyad: "", unvan: "", telefon: "", email: "" })
      setShowKisiForm(false)
      fetchKurum()
    }
  }

  const handleDeleteKisi = async (kisiId: string) => {
    if (!confirm("Bu kişiyi silmek istediğinize emin misiniz?")) return
    await fetch(`/api/kurumlar/${id}/kisiler?kisiId=${kisiId}`, { method: "DELETE" })
    fetchKurum()
  }

  // Arama Logları
  const handleAddArama = async (e?: any) => {
    e?.preventDefault()
    if (!yeniArama.not.trim()) return
    setLoadingArama(true)

    const res = await fetch(`/api/kurumlar/${id}/arama-loglari`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(yeniArama)
    })

    setLoadingArama(false)
    if (res.ok) {
      setYeniArama({ arananKisi: "", modul: "YAKLASIK_MALIYET", not: "" })
      fetchKurum()
    } else {
      alert("Arama kaydı eklenemedi.")
    }
  }

  const handleDeleteArama = async (logId: string) => {
    if (!confirm("Bu görüşme kaydını silmek istediğinize emin misiniz?")) return
    const res = await fetch(`/api/kurumlar/${id}/arama-loglari?logId=${logId}`, { method: "DELETE" })
    if (res.ok) fetchKurum()
  }

  const filteredAramaLoglari = useMemo(() => {
    const logs = Array.isArray(kurum?.aramaLoglari) ? kurum.aramaLoglari : []
    const yazarQ = filterLogYazar.trim().toLowerCase()
    const arananQ = filterLogAranan.trim().toLowerCase()
    const modulQ = filterLogModul.trim()
    const start = filterLogStart ? new Date(`${filterLogStart}T00:00:00.000Z`) : null
    const end = filterLogEnd ? new Date(`${filterLogEnd}T23:59:59.999Z`) : null

    return logs.filter((log: any) => {
      if (modulQ && String(log.modul || "") !== modulQ) return false
      if (yazarQ && !String(log.yazar || "").toLowerCase().includes(yazarQ)) return false
      if (arananQ && !String(log.arananKisi || "").toLowerCase().includes(arananQ)) return false

      const createdAt = log.createdAt ? new Date(log.createdAt) : null
      if (start && createdAt && createdAt < start) return false
      if (end && createdAt && createdAt > end) return false
      return true
    })
  }, [kurum, filterLogAranan, filterLogEnd, filterLogModul, filterLogStart, filterLogYazar])

  // Edit Handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditIlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kod = e.target.value
    setEditSelectedIlKod(kod)
    const ilObj = iller.find(i => i.kod === kod)
    setEditForm(prev => ({
      ...prev,
      il: ilObj ? ilObj.ad : "",
      ilce: ""
    }))
  }

  const handleEditIlceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, ilce: e.target.value }))
  }

  const handleEditSubmit = async (e?: any) => {
    e?.preventDefault()
    const res = await fetch(`/api/kurumlar?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    })
    if (res.ok) {
      setIsEditModalOpen(false)
      fetchKurum()
    } else {
      alert("Kurum güncellenemedi.")
    }
  }

  if (status === "loading" || !kurum) return <div className="p-8 text-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{kurum.ad}</h2>
                {kurum.unvan && <p className="text-sm text-gray-500">{kurum.unvan}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsEditModalOpen(true)} className="bg-primary text-on-primary px-4 py-2 rounded text-sm font-medium hover:bg-primary/95 transition">
                  Kurumu Düzenle
                </button>
                <Link href="/kurumlar" className="bg-surface-container px-4 py-2 rounded text-sm font-medium hover:bg-surface-container-high transition">
                  Geri Dön
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sol: Kurum İletişim Bilgileri */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-6 shadow-sm rounded-lg border">
                  <h3 className="text-lg font-bold border-b pb-2 mb-4">İletişim Bilgileri</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs">Telefon</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{kurum.telefon || "-"}</span>
                        {getWhatsAppLink(kurum.telefon) && (
                          <a href={getWhatsAppLink(kurum.telefon)!} target="_blank" rel="noreferrer" title="WhatsApp ile mesaj gönder" className="text-green-500 hover:text-green-600">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">E-posta</span>
                      <span className="font-medium">{kurum.email || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Adres</span>
                      <span className="font-medium">{kurum.adres || "-"}</span>
                      <div className="text-xs text-gray-600 mt-1">{kurum.il} {kurum.ilce ? `/ ${kurum.ilce}` : ""}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 shadow-sm rounded-lg border">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-bold">İletişim Kişileri</h3>
                    <button onClick={() => setShowKisiForm(!showKisiForm)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition">
                      + Kişi Ekle
                    </button>
                  </div>

                  {showKisiForm && (
                    <div className="mb-4 bg-surface-container-low p-3 rounded border border-outline-variant text-sm space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Ad *</label>
                          <input required type="text" value={yeniKisi.ad} onChange={e => setYeniKisi({...yeniKisi, ad: e.target.value})} className="w-full border p-1 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Soyad *</label>
                          <input required type="text" value={yeniKisi.soyad} onChange={e => setYeniKisi({...yeniKisi, soyad: e.target.value})} className="w-full border p-1 rounded" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Unvan</label>
                          <input type="text" value={yeniKisi.unvan} onChange={e => setYeniKisi({...yeniKisi, unvan: e.target.value})} className="w-full border p-1 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Telefon</label>
                          <input type="text" value={yeniKisi.telefon} onChange={e => setYeniKisi({...yeniKisi, telefon: e.target.value})} className="w-full border p-1 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">E-posta</label>
                          <input type="email" value={yeniKisi.email} onChange={e => setYeniKisi({...yeniKisi, email: e.target.value})} className="w-full border p-1 rounded" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowKisiForm(false)} className="px-2 py-1 bg-surface-container rounded">İptal</button>
                        <button type="button" onClick={handleAddKisi} disabled={loadingKisi} className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Kaydet</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {(!kurum.kisiler || kurum.kisiler.length === 0) ? (
                      <p className="text-gray-500 text-xs italic">Henüz kişi eklenmemiş.</p>
                    ) : (
                      kurum.kisiler.map((kisi: any) => (
                        <div key={kisi.id} className="border p-2 rounded relative group">
                          <button onClick={() => handleDeleteKisi(kisi.id)} className="absolute top-2 right-2 text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Sil</button>
                          <div className="font-semibold text-primary">{kisi.ad} {kisi.soyad}</div>
                          {kisi.unvan && <div className="text-xs text-gray-600">{kisi.unvan}</div>}
                          <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                            {kisi.telefon && (
                              <div className="flex items-center gap-2">
                                <span>📞 {kisi.telefon}</span>
                                {getWhatsAppLink(kisi.telefon) && (
                                  <a href={getWhatsAppLink(kisi.telefon)!} target="_blank" rel="noreferrer" title="WhatsApp ile mesaj gönder" className="text-green-500 hover:text-green-600">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                  </a>
                                )}
                              </div>
                            )}
                            {kisi.email && <span>✉️ {kisi.email}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 shadow-sm rounded-lg border">
                  <h3 className="text-lg font-bold border-b pb-2 mb-4">Vergi Bilgileri</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs">Vergi Dairesi</span>
                      <span className="font-medium">{kurum.vergiDairesi || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Vergi Numarası</span>
                      <span className="font-medium">{kurum.vergiNo || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ: Kurumsal Hafıza Notları & Arama Logları Sekmeli Panel */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col min-h-[500px]">
                  
                  {/* Sekme Başlıkları */}
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab("notlar")}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
                        activeTab === "notlar"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Hafıza Notları ({kurum.hafizaNotlari?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("aramalar")}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
                        activeTab === "aramalar"
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Görüşme & Arama Kayıtları ({kurum.aramaLoglari?.length || 0})
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    
                    {/* SEKME 1: HAFIZA NOTLARI */}
                    {activeTab === "notlar" && (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="overflow-y-auto mb-4 space-y-4 max-h-[400px] pr-2 custom-scrollbar">
                          {(!kurum.hafizaNotlari || kurum.hafizaNotlari.length === 0) ? (
                            <div className="text-center py-8 text-gray-500 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm">
                              Bu kuruma ait henüz bir hafıza notu girilmemiş.
                            </div>
                          ) : (
                            kurum.hafizaNotlari.map((not: any) => (
                              <div key={not.id} className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 group">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-semibold text-blue-800 text-sm">{not.yazar}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{new Date(not.createdAt).toLocaleString("tr-TR")}</span>
                                    <button onClick={() => handleStartEditNot(not)} className="text-blue-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Düzenle</button>
                                    <button onClick={() => handleDeleteNot(not.id)} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Sil</button>
                                  </div>
                                </div>
                                {editingNotId === not.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      rows={3}
                                      value={editingNotText}
                                      onChange={(e) => setEditingNotText(e.target.value)}
                                      className="w-full border p-3 rounded-lg text-sm resize-none focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={handleCancelEditNot}
                                        className="bg-surface-container px-3 py-1.5 rounded text-sm font-medium hover:bg-surface-container-high transition"
                                      >
                                        Vazgeç
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveEditNot}
                                        className="bg-primary text-on-primary px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90 transition"
                                      >
                                        Kaydet
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap text-gray-700">{not.not}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="border-t pt-4">
                          <textarea
                            required
                            rows={3}
                            value={yeniNot}
                            onChange={e => setYeniNot(e.target.value)}
                            placeholder="Yeni bir hafıza notu ekle..."
                            className="w-full border p-3 rounded-lg text-sm resize-none focus:ring-1 focus:ring-primary focus:outline-none"
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button type="button" onClick={handleAddNot} disabled={loadingNot} className="bg-primary text-on-primary px-4 py-2 rounded font-medium hover:bg-primary/90 transition disabled:opacity-50 text-sm">
                              {loadingNot ? "Ekleniyor..." : "Not Ekle"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEKME 2: GÖRÜŞME & ARAMA LOGLARI */}
                    {activeTab === "aramalar" && (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-3 mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            <input
                              type="date"
                              value={filterLogStart}
                              onChange={(e) => setFilterLogStart(e.target.value)}
                              className="w-full border p-2 rounded text-sm bg-white"
                            />
                            <input
                              type="date"
                              value={filterLogEnd}
                              onChange={(e) => setFilterLogEnd(e.target.value)}
                              className="w-full border p-2 rounded text-sm bg-white"
                            />
                            <select
                              value={filterLogModul}
                              onChange={(e) => setFilterLogModul(e.target.value)}
                              className="w-full border p-2 rounded text-sm bg-white"
                            >
                              <option value="">Tüm Modüller</option>
                              <option value="YAKLASIK_MALIYET">Yaklaşık Maliyet</option>
                              <option value="IHALE">İhale</option>
                              <option value="SOZLESME">Sözleşme</option>
                              <option value="DIGER">Diğer</option>
                            </select>
                            <input
                              type="text"
                              value={filterLogYazar}
                              onChange={(e) => setFilterLogYazar(e.target.value)}
                              className="w-full border p-2 rounded text-sm bg-white"
                              placeholder="Yazan"
                            />
                            <input
                              type="text"
                              value={filterLogAranan}
                              onChange={(e) => setFilterLogAranan(e.target.value)}
                              className="w-full border p-2 rounded text-sm bg-white"
                              placeholder="Ulaşılan"
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto mb-4 space-y-4 max-h-[400px] pr-2 custom-scrollbar">
                          {(!kurum.aramaLoglari || kurum.aramaLoglari.length === 0) ? (
                            <div className="text-center py-8 text-gray-500 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm">
                              Görüşme veya arama kaydı bulunmuyor.
                            </div>
                          ) : filteredAramaLoglari.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm">
                              Filtreye uygun kayıt bulunamadı.
                            </div>
                          ) : (
                            filteredAramaLoglari.map((log: any) => (
                              <div key={log.id} className="bg-surface-container-low p-4 rounded-lg border border-outline-variant group">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800 text-sm">{log.yazar}</span>
                                    <div className="flex gap-2 items-center mt-0.5">
                                      {log.arananKisi && <span className="text-xs bg-surface-container text-on-surface px-1.5 py-0.5 rounded">Ulaşılan: {log.arananKisi}</span>}
                                      {log.modul && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase">
                                          {log.modul === 'YAKLASIK_MALIYET' ? 'Yaklaşık Maliyet' : log.modul === 'IHALE' ? 'İhale' : log.modul === 'SOZLESME' ? 'Sözleşme' : 'Diğer'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                                    <button onClick={() => handleDeleteArama(log.id)} className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Sil</button>
                                  </div>
                                </div>
                                <p className="text-sm whitespace-pre-wrap text-gray-700 mt-1">{log.not}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="border-t pt-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Ulaşılan / Görüşülen Kişi</label>
                              <input 
                                type="text" 
                                value={yeniArama.arananKisi} 
                                onChange={e => setYeniArama({...yeniArama, arananKisi: e.target.value})} 
                                className="w-full border p-2 rounded text-sm bg-white" 
                                placeholder="Örn: Ahmet Bey"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Görüşme Kaynağı (Modül)</label>
                              <select 
                                value={yeniArama.modul} 
                                onChange={e => setYeniArama({...yeniArama, modul: e.target.value})} 
                                className="w-full border p-2 rounded text-sm bg-white"
                              >
                                <option value="YAKLASIK_MALIYET">Yaklaşık Maliyet</option>
                                <option value="IHALE">İhale</option>
                                <option value="SOZLESME">Sözleşme</option>
                                <option value="DIGER">Diğer</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <textarea
                              required
                              rows={2}
                              value={yeniArama.not}
                              onChange={e => setYeniArama({...yeniArama, not: e.target.value})}
                              placeholder="Görüşme detaylarını buraya not edin..."
                              className="w-full border p-3 rounded-lg text-sm resize-none focus:ring-1 focus:ring-primary focus:outline-none"
                            ></textarea>
                          </div>
                          <div className="flex justify-end">
                            <button type="button" onClick={handleAddArama} disabled={loadingArama} className="bg-primary text-on-primary px-4 py-2 rounded font-medium hover:bg-primary/90 transition disabled:opacity-50 text-sm">
                              {loadingArama ? "Kaydediliyor..." : "Görüşmeyi Kaydet"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* DÜZENLEME MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-surface-container-low border-outline-variant">
              <h3 className="text-lg font-bold">Kurum Bilgilerini Düzenle</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Kurum Kısa Adı *</label>
                  <input required type="text" name="ad" value={editForm.ad} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Resmi Unvan</label>
                  <input type="text" name="unvan" value={editForm.unvan} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Vergi Dairesi</label>
                  <input type="text" name="vergiDairesi" value={editForm.vergiDairesi} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vergi No</label>
                  <input type="text" name="vergiNo" value={editForm.vergiNo} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">İl</label>
                  <select 
                    value={editSelectedIlKod} 
                    onChange={handleEditIlChange} 
                    className="w-full border p-2 rounded bg-white"
                  >
                    <option value="">İl Seçin</option>
                    {iller.map(il => (
                      <option key={il.kod} value={il.kod}>{il.ad}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İlçe</label>
                  <select 
                    value={editForm.ilce} 
                    onChange={handleEditIlceChange} 
                    disabled={!editSelectedIlKod}
                    className="w-full border p-2 rounded bg-white disabled:opacity-50"
                  >
                    <option value="">İlçe Seçin</option>
                    {editSelectedIlKod && LocationUtils.getIlcelerByIlKod(editSelectedIlKod).map(ilce => (
                      <option key={ilce.kod} value={ilce.ad}>{ilce.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input type="text" name="telefon" value={editForm.telefon} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-posta</label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full border p-2 rounded" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Açık Adres</label>
                  <textarea name="adres" value={editForm.adres} onChange={handleEditChange} rows={3} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2 bg-surface-container-low border-outline-variant -mx-6 -mb-6 p-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-surface-container text-gray-800 rounded font-medium hover:bg-surface-container-high">
                  İptal
                </button>
                <button type="button" onClick={handleEditSubmit} className="px-4 py-2 bg-primary text-on-primary rounded font-medium hover:bg-primary/95">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
