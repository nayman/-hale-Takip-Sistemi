"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function YaklasikMaliyetDetayPage() {
  const { data: session, status } = useSession()
  const { id } = useParams()
  const router = useRouter()
  
  const [data, setData] = useState<any>(null)
  const [yeniTutar, setYeniTutar] = useState("")
  const [yeniSartnameNotu, setYeniSartnameNotu] = useState("")
  const [isEditingSartnameNotu, setIsEditingSartnameNotu] = useState(false)
  const [editSartnameNotu, setEditSartnameNotu] = useState("")
  const [loading, setLoading] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchData = async () => {
    const res = await fetch(`/api/yaklasik-maliyetler?id=${id}`)
    if (res.ok) {
      const payload = await res.json()
      setData(payload)
      setEditSartnameNotu(payload?.sartnameNotu || "")
    }
  }

  useEffect(() => {
    if (!session || !id) return
    let isActive = true
    fetch(`/api/yaklasik-maliyetler?id=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isActive || !payload) return
        setData(payload)
        setEditSartnameNotu(payload?.sartnameNotu || "")
      })
      .catch(() => {})
    return () => {
      isActive = false
    }
  }, [session, id])

  const handleRevizyon = async (e?: any) => {
    e?.preventDefault()
    if (!yeniTutar) return
    setLoading(true)

    const res = await fetch(`/api/yaklasik-maliyetler`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        kurumId: data.kurumId, 
        ihaleId: data.ihaleId,
        tutar: yeniTutar,
        sartnameNotu: yeniSartnameNotu,
        parentId: id // Bu parametre api'de revizyon olduğunu belirtecek
      })
    })

    setLoading(false)
    if (res.ok) {
      const yeniKayit = await res.json()
      // Yeni versiyona yönlendir
      router.push(`/yaklasik-maliyet/${yeniKayit.id}`)
    } else {
      alert("Revizyon oluşturulamadı")
    }
  }

  const handleSaveSartnameNotu = async () => {
    const res = await fetch(`/api/yaklasik-maliyetler`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, sartnameNotu: editSartnameNotu }),
    })

    if (res.ok) {
      setIsEditingSartnameNotu(false)
      fetchData()
    } else {
      alert("Şartname notu güncellenemedi.")
    }
  }

  const handleFileUpload = async (e?: any) => {
    e?.preventDefault()
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`/api/yaklasik-maliyetler/${id}/dosya`, {
      method: "POST",
      body: formData
    })

    setUploading(false)
    if (res.ok) {
      alert("Dosya başarıyla yüklendi!")
      setFile(null)
      fetchData()
    } else {
      alert("Dosya yüklenirken hata oluştu.")
    }
  }

  if (status === "loading" || !data) return <div className="p-8 text-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Teklif Detayı: {data.versiyonNo}</h2>
                <p className="text-sm text-gray-500">{data.kurum?.ad} {data.ihale ? `- ${data.ihale.ad}` : "(İhale Bağımsız Genel Teklif)"}</p>
              </div>
              <Link href="/yaklasik-maliyet" className="bg-surface-container px-4 py-2 rounded text-sm font-medium hover:bg-surface-container-high transition">
                Geri Dön
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 shadow-sm rounded-lg border">
                  <h3 className="text-lg font-bold border-b pb-2 mb-4">Mevcut Teklif Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-gray-500 text-xs">Versiyon</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-1">{data.versiyonNo}</span>
                      {!data.aktifMi && <span className="ml-2 text-red-500 text-xs font-bold">(Pasif / Eski Sürüm)</span>}
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Tutar</span>
                      <span className="font-medium text-lg">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.tutar)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Oluşturulma Tarihi</span>
                      <span className="font-medium">{new Date(data.createdAt).toLocaleString("tr-TR")}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs">Ekli Dosya</span>
                      {data.dosyaYolu ? (
                        <a 
                          href={`/api/yaklasik-maliyetler/${id}/dosya`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 underline"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Dosyayı İndir
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 mt-1 inline-block">Dosya yok</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-gray-500 text-xs">Teknik Şartname Değişiklik Notu</span>
                      {data.aktifMi && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSartnameNotu((v) => !v)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {isEditingSartnameNotu ? "Vazgeç" : "Düzenle"}
                        </button>
                      )}
                    </div>

                    {isEditingSartnameNotu ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={editSartnameNotu}
                          onChange={(e) => setEditSartnameNotu(e.target.value)}
                          className="w-full border p-3 rounded-lg text-sm resize-none focus:ring-1 focus:ring-primary focus:outline-none"
                          placeholder="Bu revizyondaki teknik şartname değişikliklerini not edin..."
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveSartnameNotu}
                            className="bg-primary text-on-primary px-4 py-2 rounded font-medium hover:bg-primary/90 transition text-sm"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap bg-surface-container-low border border-outline-variant rounded-lg p-3">
                        {data.sartnameNotu?.trim() ? data.sartnameNotu : "Not eklenmemiş."}
                      </div>
                    )}
                  </div>

                  {/* Dosya Yükleme Alanı (Eğer henüz dosya yoksa ve aktifse) */}
                  {data.aktifMi && !data.dosyaYolu && (
                    <div className="mt-6 p-4 bg-surface-container-low border border-dashed border-outline-variant rounded-lg">
                      <h4 className="text-sm font-bold mb-2">Teklif Dosyası Ekle</h4>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          required
                          onChange={e => setFile(e.target.files?.[0] || null)}
                          className="text-sm flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <button type="button" onClick={handleFileUpload} disabled={uploading || !file} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                          {uploading ? "Yükleniyor..." : "Dosyayı Yükle"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {data.aktifMi && (
                  <div className="bg-blue-50 p-6 shadow-sm rounded-lg border border-blue-100">
                    <h3 className="text-lg font-bold border-b border-blue-200 pb-2 mb-4 text-blue-800">Yeni Revizyon (Versiyon) Oluştur</h3>
                    <p className="text-sm text-blue-700 mb-4">Bu teklif üzerinde değişiklik yapmak istiyorsanız yeni bir revizyon numarasıyla (örn: v2) güncel tutarı girebilirsiniz. Eski versiyon <b>Salt Okunur (Read-Only)</b> olarak saklanacaktır.</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1 text-blue-900">Yeni Teklif Tutarı (₺)</label>
                        <input 
                          required 
                          type="number" 
                          step="0.01" 
                          className="w-full border border-blue-300 p-2 rounded" 
                          value={yeniTutar} 
                          onChange={e => setYeniTutar(e.target.value)} 
                        />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-blue-900">Teknik Şartname Değişiklik Notu</label>
                          <textarea
                            rows={3}
                            className="w-full border border-blue-300 p-2 rounded"
                            value={yeniSartnameNotu}
                            onChange={(e) => setYeniSartnameNotu(e.target.value)}
                            placeholder="Bu revizyonun teknik şartname değişiklikleri..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={handleRevizyon} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Oluşturuluyor..." : "Revizyonu Kaydet"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Geçmiş Versiyonlar */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 shadow-sm rounded-lg border h-full">
                  <h3 className="text-lg font-bold border-b pb-2 mb-4">Versiyon Geçmişi</h3>
                  <div className="space-y-3">
                    {data.versiyonlar?.map((v: any) => (
                      <div 
                        key={v.id} 
                        className={`p-3 rounded border cursor-pointer transition ${v.id === id ? 'border-blue-500 bg-blue-50' : 'hover:bg-surface-container'} ${!v.aktifMi && v.id !== id ? 'opacity-70' : ''}`}
                        onClick={() => router.push(`/yaklasik-maliyet/${v.id}`)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{v.versiyonNo}</span>
                          {v.aktifMi ? (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Aktif</span>
                          ) : (
                            <span className="text-xs bg-surface-container text-on-surface px-1.5 py-0.5 rounded">Geçmiş</span>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v.tutar)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(v.createdAt).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
