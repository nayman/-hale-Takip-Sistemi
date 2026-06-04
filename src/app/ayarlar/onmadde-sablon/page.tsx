"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import {
  ONMADDE_TEMPLATES,
  BELGE_TIPI_ETIKETLER,
  getSablonByKod,
  type BelgeTipiKodu,
  type BelgeSablon,
} from "@/lib/onmadde-templates"

export default function OnMaddeSablonPage() {
  const { data: session, status } = useSession()
  const [sablonlar, setSablonlar] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ ad: "", belgeTipi: "VERGI_BORCU", aciklama: "" })
  const [selectedSablon, setSelectedSablon] = useState<BelgeSablon | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const fetchSablonlar = async () => {
    const res = await fetch("/api/ayarlar/onmadde-sablon")
    if (res.ok) {
      const data = await res.json()
      setSablonlar(data)
    }
  }

  useEffect(() => {
    if (session) fetchSablonlar()
  }, [session])

  // Belge tipi değiştiğinde ilgili şablonu güncelle
  useEffect(() => {
    const sablon = getSablonByKod(formData.belgeTipi as BelgeTipiKodu)
    setSelectedSablon(sablon || null)
    if (sablon && !editingId) {
      setFormData((prev) => ({
        ...prev,
        ad: sablon.ad,
        aciklama: sablon.aciklama,
      }))
    }
  }, [formData.belgeTipi, editingId])

  const handleSubmit = async (e?: any) => {
    e?.preventDefault()
    
    if (editingId) {
      await fetch("/api/ayarlar/onmadde-sablon", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...formData })
      })
    } else {
      await fetch("/api/ayarlar/onmadde-sablon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
    }
    
    setShowForm(false)
    setEditingId(null)
    setFormData({ ad: "", belgeTipi: "VERGI_BORCU", aciklama: "" })
    fetchSablonlar()
  }

  const handleEdit = (sablon: any) => {
    setEditingId(sablon.id)
    setFormData({ ad: sablon.ad, belgeTipi: sablon.belgeTipi, aciklama: sablon.aciklama || "" })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Emin misiniz?")) return
    await fetch(`/api/ayarlar/onmadde-sablon?id=${id}`, { method: "DELETE" })
    fetchSablonlar()
  }

  const handleQuickAdd = (sablon: BelgeSablon) => {
    setEditingId(null)
    setFormData({
      ad: sablon.ad,
      belgeTipi: sablon.belgeTipiKodu,
      aciklama: sablon.aciklama,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Aşama badge'i
  const getAsamaBadge = (asama: string) => {
    switch (asama) {
      case "TEKLIF":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[12px]">description</span>
            Teklif Aşaması
          </span>
        )
      case "SOZLESME_ONCESI":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="material-symbols-outlined text-[12px]">gavel</span>
            Sözleşme Öncesi
          </span>
        )
      case "HER_IKI":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[12px]">done_all</span>
            Her İki Aşama
          </span>
        )
      default:
        return null
    }
  }

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                <span className="material-symbols-outlined text-[200px]">article</span>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">10. Madde Evrak Şablonları</h2>
                    <p className="text-indigo-200 text-sm mt-1">
                      4734 Sayılı Kamu İhale Kanunu Madde 10 kapsamında ihalelerde istenebilecek tüm belge şablonları
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setFormData({ ad: "", belgeTipi: "VERGI_BORCU", aciklama: "" })
                      setShowForm(true)
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Yeni Şablon Ekle
                  </button>
                </div>
                {/* Özet İstatistikler */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {ONMADDE_TEMPLATES.map((kat) => (
                    <div key={kat.fikra} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                      <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider block">{kat.fikra}</span>
                      <span className="text-lg font-bold">{kat.sablonlar.length} Belge</span>
                      <p className="text-indigo-300 text-[11px] mt-0.5 line-clamp-1">{kat.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kayıt Formu */}
            {showForm && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
                  <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined">edit_document</span>
                    {editingId ? "Şablon Düzenle" : "Yeni Şablon"}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Kategori / Belge Tipi</label>
                    <select
                      value={formData.belgeTipi}
                      onChange={(e) => setFormData({ ...formData, belgeTipi: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <optgroup label="─── Ekonomik ve Mali ───">
                        <option value="BANKA_REFERANS">Banka Referans Mektubu</option>
                        <option value="BILANCO">Mali Bilanço ve Gelir Tablosu</option>
                        <option value="IS_HACMI">İş Hacmini Gösteren Belgeler</option>
                      </optgroup>
                      <optgroup label="─── Mesleki ve Teknik ───">
                        <option value="ODA_KAYIT">Oda Kayıt Belgesi</option>
                        <option value="IMZA_SIRKULER">İmza Sirküleri / İmza Beyannamesi</option>
                        <option value="IS_DENEYIM">İş Deneyim Belgeleri</option>
                        <option value="TEKNIK_PERSONEL">Teknik Personel Bildirimi</option>
                        <option value="MAKINE_TECHIZAT">Makine, Teçhizat ve Ekipman Belgeleri</option>
                        <option value="KALITE_STANDART">Kalite ve Standart Belgeleri</option>
                      </optgroup>
                      <optgroup label="─── İhale Dışı Bırakılma (10/4. Fıkra) ───">
                        <option value="IFLAS_KONKORDATO">İflas ve Konkordato Durum Belgesi</option>
                        <option value="SGK_BORCU">SGK Prim Borcu Yoktur Belgesi</option>
                        <option value="VERGI_BORCU">Vergi Borcu Yoktur Belgesi</option>
                        <option value="ADLI_SICIL">Adli Sicil Kaydı</option>
                        <option value="IHALE_DURUM">İhale Durum Belgesi</option>
                        <option value="TICARET_SICIL">Ticaret Sicil Gazetesi</option>
                      </optgroup>
                      <optgroup label="─── Diğer ───">
                        <option value="DIGER">Diğer</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Belge Adı</label>
                    <input
                      required
                      type="text"
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Açıklama (Opsiyonel)</label>
                    <textarea
                      value={formData.aciklama}
                      onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      rows={2}
                    />
                  </div>

                  {/* Seçilen belge şablonu detay bilgisi */}
                  {selectedSablon && (
                    <div className="md:col-span-2 bg-indigo-50 rounded-xl p-4 border border-indigo-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">info</span>
                        <span className="text-sm font-bold text-indigo-800">Şablon Detayları</span>
                        {getAsamaBadge(selectedSablon.asama)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-indigo-400 font-bold uppercase block text-[10px]">Yasal Dayanak</span>
                          <span className="text-indigo-800 font-semibold">{selectedSablon.yasalDayanak}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400 font-bold uppercase block text-[10px]">Veren Makam</span>
                          <span className="text-indigo-800 font-semibold">{selectedSablon.verenMakam}</span>
                        </div>
                        <div>
                          <span className="text-indigo-400 font-bold uppercase block text-[10px]">Geçerlilik Süresi</span>
                          <span className="text-indigo-800 font-semibold">{selectedSablon.gecerlilikSuresi}</span>
                        </div>
                      </div>
                      {selectedSablon.alanlar.length > 0 && (
                        <div>
                          <span className="text-indigo-400 font-bold uppercase block text-[10px] mb-1">Gerekli Alanlar ({selectedSablon.alanlar.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedSablon.alanlar.map((alan) => (
                              <span
                                key={alan.anahtar}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  alan.zorunlu
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-surface-container text-on-surface border border-outline-variant"
                                }`}
                              >
                                {alan.etiket} {alan.zorunlu && "*"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-outline text-on-surface-variant hover:bg-surface-container rounded-lg text-sm font-semibold transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      {editingId ? "Güncelle" : "Kaydet"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Kayıtlı Şablonlar Tablosu */}
            {sablonlar.length > 0 && (
              <div className="bg-surface-container-lowest shadow-sm rounded-xl overflow-hidden border border-outline-variant">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">folder_special</span>
                    Kayıtlı Şablonlarınız ({sablonlar.length})
                  </h3>
                </div>
                <table className="min-w-full divide-y divide-outline-variant">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Belge Adı</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Açıklama</th>
                      <th className="px-6 py-3 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-outline-variant">
                    {sablonlar.map((sablon) => (
                      <tr key={sablon.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{sablon.ad}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                            {BELGE_TIPI_ETIKETLER[sablon.belgeTipi as BelgeTipiKodu] || sablon.belgeTipi}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant max-w-xs truncate">{sablon.aciklama || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <button onClick={() => handleEdit(sablon)} className="text-indigo-600 hover:text-indigo-800 mr-3 font-semibold text-xs">Düzenle</button>
                          <button onClick={() => handleDelete(sablon.id)} className="text-rose-600 hover:text-rose-800 font-semibold text-xs">Sil</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Kanun Maddeleri ve Belge Şablonları Referans Kılavuzu */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600">menu_book</span>
                Kanun Referans Kılavuzu — Tüm Belge Şablonları
              </h3>
              <p className="text-xs text-on-surface-variant">
                Aşağıda 4734 Sayılı Kanun’un 10. Maddesi kapsamında istenebilecek tüm belgelerin tam listesi, yasal dayanakları ve şablon detayları yer almaktadır.
                İstediğiniz belgeyi &quot;Hızlı Ekle&quot; butonuyla şablonlarınıza kaydedebilirsiniz.
              </p>

              {ONMADDE_TEMPLATES.map((kategori) => (
                <div key={kategori.fikra} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                  {/* Kategori Başlığı */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === kategori.fikra ? null : kategori.fikra)}
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                        kategori.fikra.includes("1") ? "bg-blue-600" :
                        kategori.fikra.includes("2") ? "bg-emerald-600" : "bg-amber-600"
                      }`}>
                        {kategori.fikra.split("/")[1]?.charAt(0) || "?"}
                      </span>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-on-surface">{kategori.category}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {kategori.fikra} • {kategori.sablonlar.length} belge • {kategori.aciklama}
                        </p>
                      </div>
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandedCategory === kategori.fikra ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Belge Kartları */}
                  {expandedCategory === kategori.fikra && (
                    <div className="border-t border-outline-variant p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {kategori.sablonlar.map((sablon) => {
                        const isAdded = sablonlar.some((s) => s.belgeTipi === sablon.belgeTipiKodu)
                        return (
                          <div
                            key={sablon.belgeTipiKodu}
                            className={`rounded-xl border p-4 space-y-3 transition-all ${
                              isAdded
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-surface-container-low border-outline-variant hover:border-indigo-300 hover:shadow-sm"
                            }`}
                          >
                            {/* Üst Kısım */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-sm font-bold text-on-surface">{sablon.ad}</h5>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-container text-on-surface-variant">
                                    {sablon.bentRef}
                                  </span>
                                  {getAsamaBadge(sablon.asama)}
                                  {isAdded && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200 text-emerald-700 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                      Eklendi
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{sablon.aciklama}</p>
                              </div>
                              {!isAdded && (
                                <button
                                  onClick={() => handleQuickAdd(sablon)}
                                  className="ml-2 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                  Hızlı Ekle
                                </button>
                              )}
                            </div>

                            {/* Detay Grid */}
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div>
                                <span className="text-on-surface-variant font-bold uppercase block">Veren Makam</span>
                                <span className="text-on-surface font-semibold">{sablon.verenMakam}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant font-bold uppercase block">Geçerlilik</span>
                                <span className="text-on-surface font-semibold">{sablon.gecerlilikSuresi}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant font-bold uppercase block">Yasal Dayanak</span>
                                <span className="text-on-surface font-semibold">{sablon.yasalDayanak}</span>
                              </div>
                            </div>

                            {/* Form Alanları Önizleme */}
                            <div>
                              <span className="text-[10px] text-on-surface-variant font-bold uppercase block mb-1">
                                Şablon Alanları ({sablon.alanlar.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {sablon.alanlar.map((alan) => (
                                  <span
                                    key={alan.anahtar}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                      alan.zorunlu
                                        ? "bg-red-100 text-red-600"
                                        : "bg-surface-container text-on-surface-variant"
                                    }`}
                                    title={alan.ipucu || alan.etiket}
                                  >
                                    {alan.etiket}
                                    {alan.zorunlu ? " *" : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
