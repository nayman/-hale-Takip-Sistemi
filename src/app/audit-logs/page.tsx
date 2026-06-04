"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type AuditUser = { name: string | null; email: string; rol: string }

type AuditItem = {
  id: string
  entity: string
  entityId: string
  action: string
  createdAt: string
  user: AuditUser
  data: any
}

type Summary = {
  byEntity: Array<{ entity: string; count: number }>
  byAction: Array<{ action: string; count: number }>
  byUser: Array<{ userId: string; count: number; user: AuditUser | null }>
}

type AuditResponse = {
  items: AuditItem[]
  total: number
  limit: number
  offset: number
  summary: Summary | null
}

function formatDateTr(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("tr-TR")
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()

  const [q, setQ] = useState("")
  const [entity, setEntity] = useState("")
  const [action, setAction] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AuditResponse | null>(null)

  const exportHref = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (entity) params.set("entity", entity)
    if (action) params.set("action", action)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    return `/api/audit-logs/export?${params.toString()}`
  }, [action, entity, from, q, to])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("mode", "table")
        params.set("includeSummary", "1")
        params.set("limit", "50")
        params.set("offset", "0")
        if (q.trim()) params.set("q", q.trim())
        if (entity) params.set("entity", entity)
        if (action) params.set("action", action)
        if (from) params.set("from", from)
        if (to) params.set("to", to)

        const res = await fetch(`/api/audit-logs?${params.toString()}`)
        const json = (await res.json().catch(() => null)) as AuditResponse | { error?: string } | null
        if (!res.ok) {
          const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Veri alınamadı."
          throw new Error(msg)
        }
        if (!cancelled) setData(json as AuditResponse)
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
  }, [action, entity, from, q, session, to])

  if (status === "loading") return <div className="p-8 text-center">Yükleniyor...</div>
  if (!session) return null

  const items = data?.items ?? []

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-on-surface">Audit Log</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  Değişiklik geçmişini filtreleyin, analiz edin ve CSV olarak dışa aktarın.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/raporlar"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-medium"
                >
                  Raporlar
                </Link>
                <a
                  href={exportHref}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-medium"
                >
                  CSV Export
                </a>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-4">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Arama</div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Entity / EntityId / kullanıcı"
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Entity</div>
                  <input
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    placeholder="IHALE, SOZLESME..."
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Action</div>
                  <input
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="CREATE, UPDATE..."
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Başlangıç</div>
                  <input
                    type="datetime-local"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-on-surface-variant mb-1">Bitiş</div>
                  <input
                    type="datetime-local"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
                <div>{loading ? "Yükleniyor..." : `${data?.total ?? 0} kayıt`}</div>
                {error ? <div className="text-error">{error}</div> : null}
              </div>
            </div>

            {data?.summary ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Entity</div>
                  <div className="mt-3 space-y-2">
                    {data.summary.byEntity.slice(0, 8).map((x) => (
                      <div key={x.entity} className="flex justify-between text-sm">
                        <div className="text-on-surface">{x.entity}</div>
                        <div className="text-on-surface-variant">{x.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Action</div>
                  <div className="mt-3 space-y-2">
                    {data.summary.byAction.slice(0, 8).map((x) => (
                      <div key={x.action} className="flex justify-between text-sm">
                        <div className="text-on-surface">{x.action}</div>
                        <div className="text-on-surface-variant">{x.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-5 shadow-sm">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kullanıcı</div>
                  <div className="mt-3 space-y-2">
                    {data.summary.byUser.slice(0, 8).map((x) => (
                      <div key={x.userId} className="flex justify-between text-sm gap-3">
                        <div className="min-w-0">
                          <div className="text-on-surface truncate" title={x.user?.email || x.userId}>
                            {x.user?.name || x.user?.email || x.userId}
                          </div>
                          <div className="text-xs text-on-surface-variant truncate" title={x.user?.email || ""}>
                            {x.user?.email || ""}
                          </div>
                        </div>
                        <div className="text-on-surface-variant">{x.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[1300px]">
                  <div className="grid grid-cols-[200px_140px_220px_1fr_220px_120px] bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <div className="px-4 py-3">Tarih</div>
                    <div className="px-4 py-3">Action</div>
                    <div className="px-4 py-3">Entity</div>
                    <div className="px-4 py-3">Entity ID</div>
                    <div className="px-4 py-3">Kullanıcı</div>
                    <div className="px-4 py-3">Data</div>
                  </div>
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-on-surface-variant">Kayıt bulunamadı.</div>
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {items.map((r) => (
                        <div
                          key={r.id}
                          className="grid grid-cols-[200px_140px_220px_1fr_220px_120px] items-start hover:bg-surface-container"
                        >
                          <div className="px-4 py-3 text-sm text-on-surface">{formatDateTr(r.createdAt)}</div>
                          <div className="px-4 py-3 text-sm font-semibold text-on-surface">{r.action}</div>
                          <div className="px-4 py-3 text-sm text-on-surface">{r.entity}</div>
                          <div className="px-4 py-3 text-sm text-on-surface truncate" title={r.entityId}>
                            {r.entityId}
                          </div>
                          <div className="px-4 py-3 min-w-0">
                            <div className="text-sm text-on-surface truncate" title={r.user?.email || ""}>
                              {r.user?.name || r.user?.email || "-"}
                            </div>
                            <div className="text-xs text-on-surface-variant truncate" title={r.user?.email || ""}>
                              {r.user?.email || ""}
                            </div>
                          </div>
                          <div className="px-4 py-3">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-primary font-semibold">Gör</summary>
                              <pre className="mt-2 text-xs whitespace-pre-wrap text-on-surface-variant">
                                {r.data ? JSON.stringify(r.data, null, 2) : "-"}
                              </pre>
                            </details>
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

