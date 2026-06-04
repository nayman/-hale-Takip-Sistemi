"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { iller, LocationUtils } from "@/lib/turkiye-il-ilce"

export default function YeniKurumPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIlKod, setSelectedIlKod] = useState("")
  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleIlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kod = e.target.value
    setSelectedIlKod(kod)
    const ilObj = iller.find(i => i.kod === kod)
    setFormData(prev => ({
      ...prev,
      il: ilObj ? ilObj.ad : "",
      ilce: ""
    }))
  }

  const handleIlceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, ilce: e.target.value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const res = await fetch("/api/kurumlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    if (res.ok) {
      router.push("/kurumlar")
    } else {
      const data = await res.json().catch(() => null)
      const message = typeof data?.error === "string" ? data.error : "Kurum eklenirken bir hata oluştu."
      const full = `${res.status} ${res.statusText || ""}`.trim()
      console.error("POST /api/kurumlar failed:", { status: res.status, statusText: res.statusText, data })
      setError(full ? `${full}: ${message}` : message)
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Yeni Kurum Ekle</h2>
                <p className="text-sm text-on-surface-variant">İhale süreçlerinde kullanılacak yeni bir kurum/idare tanımlayın.</p>
              </div>
              <Link href="/kurumlar" className="px-4 py-2 bg-surface-container text-on-surface rounded font-medium hover:bg-surface-container-high transition border border-outline-variant">
                İptal ve Geri Dön
              </Link>
            </div>

            <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6 space-y-4">
              {error ? (
                <div className="bg-error-container border border-outline-variant px-4 py-3 rounded-lg text-on-error-container">
                  {error}
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Kurum Kısa Adı *</label>
                  <input required type="text" name="ad" value={formData.ad} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Örn: DSİ 5. Bölge" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Resmi Unvan</label>
                  <input type="text" name="unvan" value={formData.unvan} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Örn: Devlet Su İşleri Genel Müdürlüğü 5. Bölge Müdürlüğü" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Vergi Dairesi</label>
                  <input type="text" name="vergiDairesi" value={formData.vergiDairesi} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vergi No</label>
                  <input type="text" name="vergiNo" value={formData.vergiNo} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">İl</label>
                  <select 
                    value={selectedIlKod} 
                    onChange={handleIlChange} 
                    className="w-full border border-outline-variant p-2 rounded bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
                    value={formData.ilce} 
                    onChange={handleIlceChange} 
                    disabled={!selectedIlKod}
                    className="w-full border border-outline-variant p-2 rounded bg-surface-container-low disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">İlçe Seçin</option>
                    {selectedIlKod && LocationUtils.getIlcelerByIlKod(selectedIlKod).map(ilce => (
                      <option key={ilce.kod} value={ilce.ad}>{ilce.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input type="text" name="telefon" value={formData.telefon} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-posta</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Açık Adres</label>
                  <textarea name="adres" value={formData.adres} onChange={handleChange} rows={3} className="w-full border border-outline-variant bg-surface-container-low p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button type="button" onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-primary text-on-primary rounded font-medium hover:opacity-90 transition disabled:opacity-50">
                  {loading ? "Kaydediliyor..." : "Kurumu Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
