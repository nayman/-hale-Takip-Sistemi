"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type KurumOption = { id: string; ad: string }

type PersonelItem = {
  id: string
  ad: string
  soyad: string
  unvan: string | null
  telefon: string | null
  email: string | null
  kurum: { id: string; ad: string }
  createdAt: string
}

type AtamaItem = {
  id: string
  rol: string | null
  ihale: { id: string; ihaleNo: string; ad: string; kurum: { id: string; ad: string } }
  kurumKisi: { id: string; ad: string; soyad: string; unvan: string | null; kurum: { id: string; ad: string } }
}

function normalizeTrMobile(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replaceAll(/\D/g, "")
  if (!digits) return null
  if (digits.length === 11 && digits.startsWith("0") && digits[1] === "5") return digits.slice(1)
  if (digits.length === 10 && digits.startsWith("5")) return digits
  if (digits.length === 12 && digits.startsWith("90") && digits[2] === "5") return digits.slice(2)
  return null
}

function whatsappHref(phone: string | null | undefined) {
  const mobile = normalizeTrMobile(phone)
  if (!mobile) return null
  return `https://wa.me/90${mobile}`
}

export default function PersonelPage() {
  const { data: session, status } = useSession()

  const [activeTab, setActiveTab] = useState<"kisiler" | "atamalar">("kisiler")
  const [q, setQ] = useState("")
  const [kurumId, setKurumId] = useState("")

  const [kurumlar, setKurumlar] = useState<KurumOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kisiler, setKisiler] = useState<PersonelItem[]>([])
  const [atamalar, setAtamalar] = useState<AtamaItem[]>([])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetch("/api/kurumlar")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return
        setKurumlar(Array.isArray(data) ? data.map((k) => ({ id: k.id, ad: k.ad })) : [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [session])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set("q", q.trim())
        if (kurumId) params.set("kurumId", kurumId)

        if (activeTab === "kisiler") {
          const res = await fetch(`/api/personel?${params.toString()}`)
          const json = (await res.json().catch(() => null)) as PersonelItem[] | { error?: string } | null
          if (!res.ok) {
            const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Veri alınamadı."
            throw new Error(msg)
          }
          if (!cancelled) setKisiler(Array.isArray(json) ? (json as PersonelItem[]) : [])
        } else {
          const res = await fetch(`/api/personel/atamalar?${params.toString()}`)
          const json = (await res.json().catch(() => null)) as AtamaItem[] | { error?: string } | null
          if (!res.ok) {
            const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Veri alınamadı."
            throw new Error(msg)
          }
          if (!cancelled) setAtamalar(Array.isArray(json) ? (json as AtamaItem[]) : [])
        }
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
  }, [activeTab, kurumId, q, session])

  const rows = useMemo(() => (activeTab === "kisiler" ? kisiler.length : atamalar.length), [activeTab, atamalar.length, kisiler.length])

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
                <h1 className="text-2xl font-bold text-on-surface">Personel</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Kurum kişileri ve ihale atamaları.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/kurumlar"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                >
                  Kurumlar
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
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("kisiler")}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                    activeTab === "kisiler"
                      ? "bg-secondary-container text-on-secondary-container border-outline-variant"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  Kişiler
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("atamalar")}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                    activeTab === "atamalar"
                      ? "bg-secondary-container text-on-secondary-container border-outline-variant"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  Atamalar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-7">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Arama</div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={activeTab === "kisiler" ? "Ad / soyad / telefon / e-posta / kurum" : "Personel / ihale / IKN / kurum"}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-5">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Kurum</div>
                  <select
                    value={kurumId}
                    onChange={(e) => setKurumId(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Tümü</option>
                    {kurumlar.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.ad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
                <div>{loading ? "Yükleniyor..." : `${rows} kayıt`}</div>
                {error ? <div className="text-error">{error}</div> : null}
              </div>
            </div>

            {activeTab === "kisiler" ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <div className="min-w-[1040px]">
                    <div className="grid grid-cols-[240px_220px_220px_1fr_140px] bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <div className="px-4 py-3">Kişi</div>
                  <div className="px-4 py-3">Kurum</div>
                  <div className="px-4 py-3">Unvan</div>
                  <div className="px-4 py-3">İletişim</div>
                  <div className="px-4 py-3">Aksiyon</div>
                    </div>
                    {kisiler.length === 0 ? (
                  <div className="p-8 text-center text-sm text-on-surface-variant">Kayıt bulunamadı.</div>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {kisiler.map((p) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-[240px_220px_220px_1fr_140px] items-start hover:bg-surface-container"
                      >
                        <div className="px-4 py-3">
                          <div className="text-sm font-semibold text-on-surface">
                            {p.ad} {p.soyad}
                          </div>
                          <div className="text-xs text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString("tr-TR")}</div>
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-sm font-semibold text-on-surface truncate" title={p.kurum.ad}>
                            {p.kurum.ad}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-sm text-on-surface">{p.unvan || "-"}</div>
                        </div>
                        <div className="px-4 py-3 min-w-0">
                          <div className="text-sm text-on-surface">{p.telefon || "-"}</div>
                          <div className="text-xs text-on-surface-variant truncate" title={p.email || ""}>
                            {p.email || "-"}
                          </div>
                          {whatsappHref(p.telefon) ? (
                            <a
                              href={whatsappHref(p.telefon) as string}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-primary hover:underline inline-block mt-1"
                            >
                              WhatsApp
                            </a>
                          ) : null}
                        </div>
                        <div className="px-4 py-3">
                          <Link href={`/kurumlar/${p.kurum.id}`} className="text-sm font-semibold text-primary hover:underline">
                            Kurum
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <div className="min-w-[1060px]">
                    <div className="grid grid-cols-[260px_1fr_240px_220px_140px] bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <div className="px-4 py-3">Personel</div>
                  <div className="px-4 py-3">İhale</div>
                  <div className="px-4 py-3">Kurum</div>
                  <div className="px-4 py-3">Rol</div>
                  <div className="px-4 py-3">Aksiyon</div>
                    </div>
                    {atamalar.length === 0 ? (
                  <div className="p-8 text-center text-sm text-on-surface-variant">Kayıt bulunamadı.</div>
                ) : (
                  <div className="divide-y divide-outline-variant">
                    {atamalar.map((a) => (
                      <div
                        key={a.id}
                        className="grid grid-cols-[260px_1fr_240px_220px_140px] items-start hover:bg-surface-container"
                      >
                        <div className="px-4 py-3">
                          <div className="text-sm font-semibold text-on-surface">
                            {a.kurumKisi.ad} {a.kurumKisi.soyad}
                          </div>
                          <div className="text-xs text-on-surface-variant">{a.kurumKisi.unvan || "-"}</div>
                        </div>
                        <div className="px-4 py-3 min-w-0">
                          <div className="text-sm font-semibold text-on-surface truncate" title={a.ihale.ad}>
                            {a.ihale.ihaleNo} • {a.ihale.ad}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-sm text-on-surface truncate" title={a.ihale.kurum.ad}>
                            {a.ihale.kurum.ad}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <div className="text-sm text-on-surface">{a.rol || "-"}</div>
                        </div>
                        <div className="px-4 py-3">
                          <Link href={`/ihaleler/${a.ihale.id}`} className="text-sm font-semibold text-primary hover:underline">
                            İhale
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
