"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type ReportCard = {
  title: string
  description: string
  tone: "primary" | "neutral"
  ctaLabel: string
  href: string
  hint?: string
}

export default function RaporlarPage() {
  const { data: session, status } = useSession()
  const [months, setMonths] = useState(12)
  const [analizType, setAnalizType] = useState<"ihale" | "rakip">("ihale")
  const [bankSection, setBankSection] = useState<"bankalar" | "teminat">("bankalar")

  const cards = useMemo<ReportCard[]>(() => {
    const analizHref = `/api/dashboard/analiz/export?type=${encodeURIComponent(analizType)}&months=${encodeURIComponent(String(months))}`
    const bankaHref = `/api/bankalar/rapor?format=csv&section=${encodeURIComponent(bankSection)}`

    return [
      {
        title: "Analiz Export",
        description: "İhale ve rakip analizlerini CSV olarak indir.",
        tone: "primary",
        ctaLabel: "CSV indir",
        href: analizHref,
        hint: "Kaynak: /dashboard/analiz",
      },
      {
        title: "Banka Raporu",
        description: "Limit, risk ve aktif mektup teminat özetini CSV indir.",
        tone: "neutral",
        ctaLabel: "CSV indir",
        href: bankaHref,
        hint: "Yetki: Admin",
      },
      {
        title: "Audit Log",
        description: "Değişiklik geçmişini filtreleyin ve CSV olarak dışa aktarın.",
        tone: "neutral",
        ctaLabel: "Audit log’a git",
        href: "/audit-logs",
      },
      {
        title: "Hakediş Raporları",
        description: "İhale bazlı hakediş export ve rapor sayfalarına eriş.",
        tone: "neutral",
        ctaLabel: "Hakediş merkezine git",
        href: "/hakedis",
      },
      {
        title: "Puantaj Export",
        description: "Puantaj ve hakediş verileri ihale detayından dışa aktarılır.",
        tone: "neutral",
        ctaLabel: "İhalelere git",
        href: "/ihaleler",
      },
    ]
  }, [analizType, bankSection, months])

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  const handleDownload = (href: string) => {
    window.open(href, "_blank")
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Raporlar</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Export ve analiz çıktıları için tek merkez.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/analiz"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                >
                  Analiz
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                >
                  Kontrol Paneli
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Analiz Tipi</div>
                  <select
                    value={analizType}
                    onChange={(e) => setAnalizType(e.target.value === "rakip" ? "rakip" : "ihale")}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="ihale">İhale</option>
                    <option value="rakip">Rakip</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Ay Aralığı</div>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Math.min(24, Math.max(3, Number(e.target.value) || 12)))}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value={3}>3 ay</option>
                    <option value={6}>6 ay</option>
                    <option value={12}>12 ay</option>
                    <option value={18}>18 ay</option>
                    <option value={24}>24 ay</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Banka Rapor Bölümü</div>
                  <select
                    value={bankSection}
                    onChange={(e) => setBankSection(e.target.value === "teminat" ? "teminat" : "bankalar")}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="bankalar">Bankalar</option>
                    <option value="teminat">Mektup Teminatlar</option>
                  </select>
                </div>
                <div className="lg:col-span-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        `/api/dashboard/analiz/export?type=${encodeURIComponent(analizType)}&months=${encodeURIComponent(String(months))}`
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                  >
                    Analiz CSV
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        `/api/bankalar/rapor?format=csv&section=${encodeURIComponent(bankSection)}`
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                  >
                    Banka CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {cards.map((c) => (
                <div
                  key={c.title}
                  className={`col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        {c.tone === "primary" ? "Önerilen" : "Rapor"}
                      </div>
                      <div className="text-lg font-bold text-on-surface mt-1">{c.title}</div>
                      <div className="text-sm text-on-surface-variant mt-1">{c.description}</div>
                      {c.hint ? (
                        <div className="text-xs text-on-surface-variant mt-2">{c.hint}</div>
                      ) : null}
                    </div>
                    <div className="flex-shrink-0">
                      {c.href.startsWith("/api/") ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(c.href)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            c.tone === "primary"
                              ? "bg-primary text-on-primary hover:opacity-90 transition-opacity"
                              : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                          }`}
                        >
                          {c.ctaLabel}
                        </button>
                      ) : (
                        <Link
                          href={c.href}
                          className={`inline-flex px-4 py-2 rounded-lg font-medium ${
                            c.tone === "primary"
                              ? "bg-primary text-on-primary hover:opacity-90 transition-opacity"
                              : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
                          }`}
                        >
                          {c.ctaLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
