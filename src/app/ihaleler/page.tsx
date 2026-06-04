"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type IhaleListItem = {
  id: string
  ihaleNo: string
  ad: string
  durum: string
  bitisTarihi: string | Date | null
  teklifSonTarihi: string | Date | null
  butce: number | null
  olusturanUser?: { id: string; name: string | null; email: string }
  sorumluUser?: { id: string; name: string | null; email: string }
}

export default function Ihaleler() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ihaleler, setIhaleler] = useState<IhaleListItem[]>([])
  const [listStatus, setListStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [listError, setListError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingIhale, setEditingIhale] = useState<IhaleListItem | null>(null)
  const [formData, setFormData] = useState({
    ihaleNo: "",
    ad: "",
    durum: "TASLAK",
    butce: "",
    teklifSonTarihi: "",
    bitisTarihi: ""
  })

  const fetchIhaleler = async () => {
    try {
      setListStatus("loading")
      const response = await fetch("/api/ihaleler?durum=AKTIF&limit=50&offset=0")
      if (!response.ok) throw new Error("İhale listesi alınamadı")
      const data = await response.json()
      setIhaleler(Array.isArray(data?.ihaleler) ? data.ihaleler : [])
      setListStatus("success")
    } catch (e) {
      setListStatus("error")
      setListError("İhale listesi alınamadı")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ihaleyi silmek istediğinize emin misiniz?")) return
    try {
      const response = await fetch(`/api/ihaleler?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("İhale silinemedi")
      fetchIhaleler()
    } catch (error) {
      alert("İhale silinirken bir hata oluştu")
    }
  }

  const handleEdit = (ihale: IhaleListItem) => {
    setEditingIhale(ihale)
    setFormData({
      ihaleNo: ihale.ihaleNo,
      ad: ihale.ad,
      durum: ihale.durum,
      butce: ihale.butce?.toString() || "",
      teklifSonTarihi: ihale.teklifSonTarihi ? new Date(ihale.teklifSonTarihi).toISOString().slice(0, 16) : "",
      bitisTarihi: ihale.bitisTarihi ? new Date(ihale.bitisTarihi).toISOString().slice(0, 16) : ""
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!editingIhale) return
    if (!formData.ihaleNo.trim() || !formData.ad.trim()) {
      alert("İhale No ve Ad alanları zorunludur")
      return
    }

    try {
      const submitData = {
        id: editingIhale.id,
        ihaleNo: formData.ihaleNo,
        ad: formData.ad,
        durum: formData.durum,
        butce: formData.butce ? parseFloat(formData.butce) : 0,
        teklifSonTarihi: formData.teklifSonTarihi ? new Date(formData.teklifSonTarihi).toISOString() : undefined,
        bitisTarihi: formData.bitisTarihi ? new Date(formData.bitisTarihi).toISOString() : undefined
      }

      const response = await fetch("/api/ihaleler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) throw new Error("İhale güncellenemedi")
      
      setShowForm(false)
      fetchIhaleler()
    } catch (error) {
      alert("İhale güncellenirken hata oluştu")
    }
  }

  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })
    } catch {
      return null
    }
  }, [])

  const sortedIhaleler = useMemo(() => {
    const now = new Date()
    const toDate = (value: any) => {
      if (!value) return null
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }

    const dueDate = (i: IhaleListItem) => toDate(i.teklifSonTarihi) || toDate(i.bitisTarihi)

    return [...ihaleler].sort((a, b) => {
      const da = dueDate(a)
      const db = dueDate(b)
      const aPast = da ? da.getTime() < now.getTime() : false
      const bPast = db ? db.getTime() < now.getTime() : false
      if (aPast !== bPast) return aPast ? 1 : -1

      if (!aPast) {
        if (da && db) return da.getTime() - db.getTime()
        if (da) return -1
        if (db) return 1
        return 0
      }

      if (da && db) return db.getTime() - da.getTime()
      if (da) return -1
      if (db) return 1
      return 0
    })
  }, [ihaleler])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.replace("/auth/signin")
      return
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        setListStatus("loading")
        setListError("")

        const response = await fetch("/api/ihaleler?limit=50&offset=0", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setListStatus("error")
          setListError(data?.error || "İhale listesi alınamadı")
          return
        }

        const data = await response.json()
        setIhaleler(Array.isArray(data?.ihaleler) ? data.ihaleler : [])
        setListStatus("success")
      } catch (e) {
        if ((e as any)?.name === "AbortError") return
        setListStatus("error")
        setListError("İhale listesi alınamadı")
      }
    })()

    return () => controller.abort()
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-stack-lg">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-on-surface">İhale Listesi</h2>
                <Link
                  href="/ihaleler/yeni-ihale"
                  className="bg-primary text-on-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity inline-block"
                >
                  Yeni İhale Oluştur
                </Link>
              </div>
            </div>

            {/* Edit Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)}></div>
                  <div className="relative bg-surface-container-lowest border border-outline-variant shadow-sm rounded-lg max-w-md w-full p-6">
                    <h3 className="text-lg font-medium text-on-surface mb-4">İhale Düzenle</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">İhale No</label>
                        <input
                          type="text"
                          required
                          value={formData.ihaleNo}
                          onChange={(e) => setFormData({ ...formData, ihaleNo: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">Ad</label>
                        <input
                          type="text"
                          required
                          value={formData.ad}
                          onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">Durum</label>
                        <select
                          value={formData.durum}
                          onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          <option value="TASLAK">Taslak</option>
                          <option value="DEVAM_EDİYOR">Devam Ediyor</option>
                          <option value="TAMAMLANDI">Tamamlandı</option>
                          <option value="IPTAL">İptal Edildi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">Bütçe</label>
                        <input
                          type="number"
                          value={formData.butce}
                          onChange={(e) => setFormData({ ...formData, butce: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">Son Teklif Tarihi</label>
                        <input
                          type="datetime-local"
                          value={formData.teklifSonTarihi}
                          onChange={(e) => setFormData({ ...formData, teklifSonTarihi: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant">Bitiş Tarihi</label>
                        <input
                          type="datetime-local"
                          value={formData.bitisTarihi}
                          onChange={(e) => setFormData({ ...formData, bitisTarihi: e.target.value })}
                          className="mt-1 block w-full border border-outline-variant bg-surface-container-low rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-2 rounded-md hover:bg-surface-container transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="bg-primary text-on-primary px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                        >
                          Güncelle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {listStatus === "loading" ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg">
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-lg text-on-surface-variant">Yükleniyor...</div>
                </div>
              </div>
            </div>
          ) : listStatus === "error" ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg">
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-error">{listError}</div>
                </div>
              </div>
            </div>
          ) : sortedIhaleler.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg">
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-on-surface-variant mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-on-surface mb-2">Henüz ihale kaydı bulunmuyor</h3>
                  <p className="text-on-surface-variant mb-4">İlk ihale kaydınızı oluşturarak başlayın.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">İhale No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ad</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Teklif Son</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Bitiş</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Bütçe</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                    {sortedIhaleler.map((ihale) => {
                      const teklifSon = ihale.teklifSonTarihi ? new Date(ihale.teklifSonTarihi) : null
                      const bitis = ihale.bitisTarihi ? new Date(ihale.bitisTarihi) : null
                      return (
                        <tr key={ihale.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-on-surface">{ihale.ihaleNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface">
                            <Link href={`/ihaleler/${ihale.id}`} className="text-primary hover:opacity-90 font-semibold">
                              {ihale.ad}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{ihale.durum}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                            {teklifSon ? teklifSon.toLocaleDateString("tr-TR") : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                            {bitis ? bitis.toLocaleDateString("tr-TR") : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                            {typeof ihale.butce === "number"
                              ? formatter
                                ? formatter.format(ihale.butce)
                                : ihale.butce.toString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <button
                              onClick={() => handleEdit(ihale)}
                              className="text-primary hover:opacity-90 mr-3"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(ihale.id)}
                              className="text-error hover:opacity-90"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
              <h4 className="text-on-surface font-semibold mb-2">İhale Modülü Hakkında</h4>
              <ul className="text-on-surface-variant text-sm space-y-1">
                <li>• 4734 sayılı Kamu İhale Kanunu’na uygun süreçler</li>
                <li>• Mal/Hizmet alım ve yapım işleri</li>
                <li>• Doğrudan temin, açık ihale, belli istekliler</li>
                <li>• Doküman yönetimi ve takip</li>
                <li>• Raporlama ve analiz</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  )
}
