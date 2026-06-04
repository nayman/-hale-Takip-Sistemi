"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type HakedisRow = {
  id: string
  yil: number
  ay: number
  brutTutar: number
  netTutar: number
  durum: "TASLAK" | "ONAYLANDI" | "ODENDI" | string
  odemeTarihi: string | null
  createdAt: string
  ihale: { id: string; ihaleNo: string; ad: string; kurum: { id: string; ad: string } }
}

type HakedisResponse = {
  items: HakedisRow[]
  total: number
  limit: number
  offset: number
}

function formatMoney(v: number) {
  return `${v.toLocaleString("tr-TR")} ₺`
}

function monthLabel(ay: number) {
  const names = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ]
  return names[ay - 1] ? `${String(ay).padStart(2, "0")} • ${names[ay - 1]}` : String(ay)
}

export default function HakedisMerkeziPage() {
  const { data: session, status } = useSession()

  const now = useMemo(() => new Date(), [])
  const yearOptions = useMemo(() => {
    const y = now.getFullYear()
    return [y + 1, y, y - 1, y - 2, y - 3]
  }, [now])

  const [q, setQ] = useState("")
  const [yil, setYil] = useState<number | "">("")
  const [ay, setAy] = useState<number | "">("")
  const [durum, setDurum] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HakedisResponse | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set("q", q.trim())
        if (yil !== "") params.set("yil", String(yil))
        if (ay !== "") params.set("ay", String(ay))
        if (durum) params.set("durum", durum)
        params.set("limit", "50")
        params.set("offset", "0")

        const res = await fetch(`/api/hakedis?${params.toString()}`)
        const json = (await res.json().catch(() => null)) as HakedisResponse | { error?: string } | null
        if (!res.ok) {
          const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Veri alınamadı."
          throw new Error(msg)
        }
        if (!cancelled) setData(json as HakedisResponse)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Bilinmeyen hata")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [ay, durum, q, session, yil])

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Hakediş</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Tenant genel hakediş görünümü, filtreleme ve hızlı erişim.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/raporlar"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                >
                  Raporlar
                </Link>
                <Link
                  href="/ihaleler"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                >
                  İhaleler
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Arama</div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="IKN / ihale adı / kurum"
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Yıl</div>
                  <select
                    value={yil === "" ? "" : String(yil)}
                    onChange={(e) => setYil(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Ay</div>
                  <select
                    value={ay === "" ? "" : String(ay)}
                    onChange={(e) => setAy(e.target.value ? Number(e.target.value) : "")}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Durum</div>
                  <select
                    value={durum}
                    onChange={(e) => setDurum(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    <option value="TASLAK">Taslak</option>
                    <option value="ONAYLANDI">Onaylandı</option>
                    <option value="ODENDI">Ödendi</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
                <div>{loading ? "Yükleniyor..." : `${data?.total ?? 0} kayıt`}</div>
                {error ? <div className="text-error">{error}</div> : null}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[1080px]">
                  <div className="grid grid-cols-[220px_1fr_220px_160px_160px_140px] bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <div className="px-4 py-3">İhale</div>
                    <div className="px-4 py-3">Kurum / İş</div>
                    <div className="px-4 py-3">Dönem</div>
                    <div className="px-4 py-3">Brüt</div>
                    <div className="px-4 py-3">Net</div>
                    <div className="px-4 py-3">Aksiyon</div>
                  </div>
                  {(data?.items ?? []).length === 0 ? (
                    <div className="p-8 text-center text-sm text-on-surface-variant">Kayıt bulunamadı.</div>
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {(data?.items ?? []).map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[220px_1fr_220px_160px_160px_140px] items-start hover:bg-surface-container"
                        >
                      <div className="px-4 py-3">
                        <div className="text-sm font-semibold text-on-surface">{row.ihale.ihaleNo}</div>
                        <div className="text-xs text-on-surface-variant">{row.durum}</div>
                      </div>
                      <div className="px-4 py-3 min-w-0">
                        <div className="text-sm font-semibold text-on-surface truncate" title={row.ihale.kurum.ad}>
                          {row.ihale.kurum.ad}
                        </div>
                        <div className="text-xs text-on-surface-variant truncate" title={row.ihale.ad}>
                          {row.ihale.ad}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-sm font-semibold text-on-surface">
                          {row.yil} • {monthLabel(row.ay)}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {row.odemeTarihi ? new Date(row.odemeTarihi).toLocaleDateString("tr-TR") : "-"}
                        </div>
                      </div>
                      <div className="px-4 py-3 text-sm font-semibold text-on-surface">{formatMoney(row.brutTutar)}</div>
                      <div className="px-4 py-3 text-sm font-semibold text-on-surface">{formatMoney(row.netTutar)}</div>
                      <div className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/ihaleler/${row.ihale.id}`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            İhale
                          </Link>
                          <Link
                            href={`/ihaleler/${row.ihale.id}/hakedis/${row.id}/rapor`}
                            className="text-sm font-semibold text-primary hover:underline"
                          >
                            Rapor
                          </Link>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
