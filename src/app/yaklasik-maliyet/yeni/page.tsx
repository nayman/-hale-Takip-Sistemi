"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function YeniYaklasikMaliyetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [kurumlar, setKurumlar] = useState<any[]>([])
  const [ihaleler, setIhaleler] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    kurumId: "",
    ihaleId: "",
    tutar: ""
  })

  useEffect(() => {
    // Kurumları getir
    fetch("/api/kurumlar").then(res => res.json()).then(data => setKurumlar(data))
    // İhaleleri getir
    fetch("/api/ihaleler").then(res => res.json()).then(data => setIhaleler(data.ihaleler || []))
  }, [])

  const handleSubmit = async (e?: any) => {
    e?.preventDefault()
    setLoading(true)

    const res = await fetch("/api/yaklasik-maliyetler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    if (res.ok) {
      router.push("/yaklasik-maliyet")
    } else {
      alert("Hata oluştu.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Yeni Yaklaşık Maliyet / Teklif</h2>
              <Link href="/yaklasik-maliyet" className="px-4 py-2 bg-surface-container text-gray-800 rounded font-medium hover:bg-surface-container-high">İptal</Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kurum Seçin *</label>
                <select 
                  required
                  className="w-full border p-2 rounded" 
                  value={formData.kurumId} 
                  onChange={e => setFormData({...formData, kurumId: e.target.value})}
                >
                  <option value="">Seçiniz...</option>
                  {kurumlar.map(k => (
                    <option key={k.id} value={k.id}>{k.ad} {k.il ? `(${k.il})` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">İlgili İhale (İsteğe Bağlı)</label>
                <select 
                  className="w-full border p-2 rounded" 
                  value={formData.ihaleId} 
                  onChange={e => setFormData({...formData, ihaleId: e.target.value})}
                >
                  <option value="">İhale Bağımsız Genel Teklif</option>
                  {ihaleler
                    .filter(i => i.kurumId === formData.kurumId)
                    .map(i => (
                      <option key={i.id} value={i.id}>{i.ihaleNo} - {i.ad}</option>
                    ))}
                </select>
              </div>

              {/* İhale Özet Bilgisi */}
              {formData.ihaleId && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900 mt-2 space-y-1">
                  {(() => {
                    const seciliIhale = ihaleler.find(i => i.id === formData.ihaleId);
                    if (!seciliIhale) return null;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="font-semibold">İhale No:</span>
                          <span>{seciliIhale.ihaleNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Tür / Usul:</span>
                          <span>{seciliIhale.tur} / {seciliIhale.usul}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Bütçe:</span>
                          <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(seciliIhale.butce || 0)}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Teklif Tutarı (₺) *</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  className="w-full border p-2 rounded" 
                  value={formData.tutar} 
                  onChange={e => setFormData({...formData, tutar: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50">
                  {loading ? "Kaydediliyor..." : "Oluştur (v1)"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
