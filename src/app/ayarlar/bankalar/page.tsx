"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function BankalarPage() {
  const { data: session, status } = useSession()
  const [bankalar, setBankalar] = useState<any[]>([])
  const [bankaRapor, setBankaRapor] = useState<{ banks: any[]; activeLetters: any[] } | null>(null)
  const [raporLoading, setRaporLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ ad: "", sube: "", toplamLimit: "", komisyonOrani: "" })

  const fetchBankalar = async () => {
    const res = await fetch("/api/bankalar")
    if (res.ok) {
      const data = await res.json()
      setBankalar(data)
    }
  }

  const fetchBankaRapor = async () => {
    try {
      setRaporLoading(true)
      const res = await fetch("/api/bankalar/rapor")
      if (res.ok) {
        const data = await res.json()
        setBankaRapor(data)
      }
    } finally {
      setRaporLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchBankalar()
      fetchBankaRapor()
    }
  }, [session])

  const handleSubmit = async (e?: any) => {
    e?.preventDefault()
    
    const payload = {
      ad: formData.ad,
      sube: formData.sube,
      toplamLimit: parseFloat(formData.toplamLimit),
      komisyonOrani: formData.komisyonOrani ? parseFloat(formData.komisyonOrani) : 0
    }

    if (editingId) {
      await fetch("/api/bankalar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload })
      })
    } else {
      await fetch("/api/bankalar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
    
    setShowForm(false)
    setEditingId(null)
    setFormData({ ad: "", sube: "", toplamLimit: "", komisyonOrani: "" })
    fetchBankalar()
    fetchBankaRapor()
  }

  const handleEdit = (banka: any) => {
    setEditingId(banka.id)
    setFormData({
      ad: banka.ad,
      sube: banka.sube || "",
      toplamLimit: banka.toplamLimit.toString(),
      komisyonOrani: banka.komisyonOrani.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Emin misiniz?")) return
    await fetch(`/api/bankalar?id=${id}`, { method: "DELETE" })
    fetchBankalar()
    fetchBankaRapor()
  }

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Banka ve Teminat Limitleri</h2>
              <button onClick={() => {
                setEditingId(null)
                setFormData({ ad: "", sube: "", toplamLimit: "", komisyonOrani: "" })
                setShowForm(true)
              }} className="bg-blue-600 text-white px-4 py-2 rounded">
                Yeni Banka Ekle
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">{editingId ? "Banka Düzenle" : "Yeni Banka"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Banka Adı</label>
                    <input required type="text" value={formData.ad} onChange={e => setFormData({...formData, ad: e.target.value})} className="mt-1 w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Şube</label>
                    <input type="text" value={formData.sube} onChange={e => setFormData({...formData, sube: e.target.value})} className="mt-1 w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Toplam Limit (TL)</label>
                    <input required type="number" step="0.01" value={formData.toplamLimit} onChange={e => setFormData({...formData, toplamLimit: e.target.value})} className="mt-1 w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Komisyon Oranı (%)</label>
                    <input type="number" step="0.01" value={formData.komisyonOrani} onChange={e => setFormData({...formData, komisyonOrani: e.target.value})} className="mt-1 w-full border p-2 rounded" />
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="bg-surface-container px-4 py-2 rounded">İptal</button>
                    <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Güncelle" : "Kaydet"}</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banka Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şube</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Limit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanılan Limit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boş Limit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bankalar.map((banka) => {
                    const bosLimit = banka.toplamLimit - banka.kullanilanLimit;
                    return (
                      <tr key={banka.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{banka.ad}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{banka.sube || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{banka.toplamLimit.toLocaleString('tr-TR')} ₺</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{banka.kullanilanLimit.toLocaleString('tr-TR')} ₺</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{bosLimit.toLocaleString('tr-TR')} ₺</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <button onClick={() => handleEdit(banka)} className="text-blue-600 mr-3">Düzenle</button>
                          <button onClick={() => handleDelete(banka.id)} className="text-red-600">Sil</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold">Merkezi Banka Raporu</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open("/api/bankalar/rapor?format=csv", "_blank")}
                    className="border px-3 py-2 rounded text-sm font-semibold hover:bg-surface-container"
                  >
                    Banka CSV
                  </button>
                  <button
                    onClick={() => window.open("/api/bankalar/rapor?format=csv&section=teminat", "_blank")}
                    className="border px-3 py-2 rounded text-sm font-semibold hover:bg-surface-container"
                  >
                    Teminat CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="border px-3 py-2 rounded text-sm font-semibold hover:bg-surface-container"
                  >
                    PDF (Yazdır)
                  </button>
                  <button
                    onClick={fetchBankaRapor}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold hover:opacity-90"
                  >
                    Yenile
                  </button>
                </div>
              </div>

              {raporLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Yükleniyor...</div>
              ) : !bankaRapor ? (
                <div className="py-8 text-center text-sm text-gray-500">Rapor bulunamadı.</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded p-4 bg-surface-container-low">
                      <div className="text-xs font-bold text-gray-500 uppercase">Aktif Mektup Sayısı</div>
                      <div className="text-2xl font-bold">
                        {Array.isArray(bankaRapor.activeLetters) ? bankaRapor.activeLetters.length : 0}
                      </div>
                    </div>
                    <div className="border rounded p-4 bg-surface-container-low">
                      <div className="text-xs font-bold text-gray-500 uppercase">Toplam Komisyon Maliyeti</div>
                      <div className="text-2xl font-bold">
                        {(Array.isArray(bankaRapor.activeLetters)
                          ? bankaRapor.activeLetters.reduce((sum: number, x: any) => sum + (x.komisyonMaliyeti || 0), 0)
                          : 0
                        ).toLocaleString("tr-TR")} ₺
                      </div>
                    </div>
                    <div className="border rounded p-4 bg-surface-container-low">
                      <div className="text-xs font-bold text-gray-500 uppercase">Toplam Aktif Mektup Tutarı</div>
                      <div className="text-2xl font-bold">
                        {(Array.isArray(bankaRapor.activeLetters)
                          ? bankaRapor.activeLetters.reduce((sum: number, x: any) => sum + (x.tutar || 0), 0)
                          : 0
                        ).toLocaleString("tr-TR")} ₺
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banka</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam Limit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kullanılan</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Boş</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Komisyon %</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktif Mektup</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Komisyon</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(bankaRapor.banks || []).map((b: any) => (
                          <tr key={b.id}>
                            <td className="px-4 py-3 text-sm font-semibold">{b.ad}{b.sube ? ` / ${b.sube}` : ""}</td>
                            <td className="px-4 py-3 text-sm text-right">{(b.toplamLimit || 0).toLocaleString("tr-TR")} ₺</td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">{(b.kullanilanLimit || 0).toLocaleString("tr-TR")} ₺</td>
                            <td className="px-4 py-3 text-sm text-right text-green-700 font-semibold">{(b.bosLimit || 0).toLocaleString("tr-TR")} ₺</td>
                            <td className="px-4 py-3 text-sm text-right">{(b.komisyonOrani || 0).toLocaleString("tr-TR")}</td>
                            <td className="px-4 py-3 text-sm text-right">{b.aktifMektupSayisi || 0}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold">{(b.komisyonMaliyeti || 0).toLocaleString("tr-TR")} ₺</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
