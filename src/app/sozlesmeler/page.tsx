"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function SozlesmelerPage() {
  const { data: session, status } = useSession()
  const [sozlesmeler, setSozlesmeler] = useState<any[]>([])

  useEffect(() => {
    if (!session) return
    let isActive = true
    fetch("/api/sozlesmeler")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isActive) return
        setSozlesmeler(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => {
      isActive = false
    }
  }, [session])

  const reloadSozlesmeler = async () => {
    const res = await fetch("/api/sozlesmeler")
    if (res.ok) {
      const data = await res.json()
      setSozlesmeler(Array.isArray(data) ? data : [])
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Emin misiniz?")) return
    await fetch(`/api/sozlesmeler?id=${id}`, { method: "DELETE" })
    reloadSozlesmeler()
  }

  if (status === "loading") return <div className="p-8 text-center text-on-surface-variant">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-stack-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sözleşmeler</h2>
              <Link href="/sozlesmeler/yeni" className="bg-primary text-on-primary px-4 py-2 rounded hover:opacity-90 transition-opacity">
                Yeni Sözleşme Ekle
              </Link>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-outline-variant">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">EKAP No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">İhale Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Sözleşme Bedeli</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Başlangıç</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Bitiş</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                  {sozlesmeler.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{s.ekapNo || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{s.ihale?.ad} ({s.ihale?.ihaleNo})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{s.bedel.toLocaleString('tr-TR')} ₺</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{s.baslangicTarihi ? new Date(s.baslangicTarihi).toLocaleDateString("tr-TR") : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{s.bitisTarihi ? new Date(s.bitisTarihi).toLocaleDateString("tr-TR") : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <Link href={`/sozlesmeler/${s.id}`} className="text-primary hover:opacity-90 mr-3">Detay</Link>
                        <button onClick={() => handleDelete(s.id)} className="text-error hover:opacity-90">Sil</button>
                      </td>
                    </tr>
                  ))}
                  {sozlesmeler.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-on-surface-variant">Kayıtlı sözleşme bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
