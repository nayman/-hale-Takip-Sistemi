"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { useRouter } from "next/navigation"

export default function YaklasikMaliyetPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [liste, setListe] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch("/api/yaklasik-maliyetler")
        .then(res => res.json())
        .then(data => {
          setListe(data)
          setLoading(false)
        })
    }
  }, [session])

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  // Gruplama ve en günceli gösterme vs. yapılabilir, şu an hepsini listeliyoruz.
  const aktifOlanlar = liste.filter(y => y.aktifMi)

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Yaklaşık Maliyet / Teklifler</h2>
                <p className="text-sm text-gray-500">Kurumlara verilen tekliflerin versiyonları ve yaklaşık maliyet çalışmaları.</p>
              </div>
              <Link href="/yaklasik-maliyet/yeni" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
                + Yeni Teklif Oluştur
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b">
                    <th className="p-4 font-semibold text-sm">Kurum</th>
                    <th className="p-4 font-semibold text-sm">İlgili İhale</th>
                    <th className="p-4 font-semibold text-sm">Tutar</th>
                    <th className="p-4 font-semibold text-sm">Versiyon</th>
                    <th className="p-4 font-semibold text-sm">Durum</th>
                    <th className="p-4 font-semibold text-sm">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
                  ) : aktifOlanlar.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
                  ) : (
                    aktifOlanlar.map((ym) => (
                      <tr key={ym.id} className="border-b last:border-0 hover:bg-surface-container">
                        <td className="p-4 font-medium text-primary">
                          {ym.kurum?.ad} {ym.kurum?.il ? `(${ym.kurum.il})` : ""}
                        </td>
                        <td className="p-4 text-sm">
                          {ym.ihale ? ym.ihale.ad : <span className="text-gray-400 italic">Genel Teklif</span>}
                        </td>
                        <td className="p-4 font-mono font-medium">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(ym.tutar)}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                            {ym.versiyonNo}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Aktif</span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => router.push(`/yaklasik-maliyet/${ym.id}`)} className="text-sm bg-surface-container px-3 py-1 rounded hover:bg-surface-container-high">
                            Detay & Revizyon
                          </button>
                        </td>
                      </tr>
                    ))
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
