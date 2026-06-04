"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

type ResmiTatilItem = {
  id: string
  tarih: string
  aciklama: string | null
  arefe: boolean
}

function isoDateInputValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function ResmiTatillerPage() {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const [year, setYear] = useState<number>(currentYear)
  const [items, setItems] = useState<ResmiTatilItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [tarih, setTarih] = useState(isoDateInputValue(new Date()))
  const [aciklama, setAciklama] = useState("")
  const [arefe, setArefe] = useState(false)
  const [importText, setImportText] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchItems = async (targetYear: number) => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(`/api/resmi-tatiller?year=${encodeURIComponent(String(targetYear))}`)
      if (!res.ok) throw new Error("Resmi tatiller alınamadı")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message || "Hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(year)
  }, [year])

  const handleAdd = async () => {
    if (!tarih) return
    try {
      setSaving(true)
      const res = await fetch("/api/resmi-tatiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ tarih, aciklama: aciklama.trim() ? aciklama.trim() : null, arefe }],
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Kayıt eklenemedi")
      }
      setAciklama("")
      setArefe(false)
      fetchItems(year)
    } catch (e: any) {
      alert(e.message || "Hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleImport = async () => {
    if (!importText.trim()) return
    try {
      setSaving(true)
      const res = await fetch("/api/resmi-tatiller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importText }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Import başarısız")
      }
      setImportText("")
      fetchItems(year)
    } catch (e: any) {
      alert(e.message || "Hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleArefe = async (id: string, nextValue: boolean) => {
    try {
      const res = await fetch("/api/resmi-tatiller", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, arefe: nextValue }),
      })
      if (!res.ok) throw new Error("Güncellenemedi")
      fetchItems(year)
    } catch (e: any) {
      alert(e.message || "Hata oluştu")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/api/resmi-tatiller?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Silinemedi")
      fetchItems(year)
    } catch (e: any) {
      alert(e.message || "Hata oluştu")
    }
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />

        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
                  <Link href="/ayarlar">Ayarlar</Link>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-primary font-bold">Resmi Tatiller</span>
                </nav>
                <h1 className="font-display-lg text-headline-md font-bold text-primary">Resmi Tatil Takvimi</h1>
                <p className="text-body-lg text-on-surface-variant mt-1">Yasal süre hesaplamalarında kullanılacak tatilleri tenant bazında yönetin.</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Yıl</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || currentYear)}
                  className="w-24 h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-gutter">
              <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-primary mb-1">Yeni Tatil Ekle</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tarih</label>
                      <input
                        type="date"
                        value={tarih}
                        onChange={(e) => setTarih(e.target.value)}
                        className="w-full h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arefe}
                          onChange={(e) => setArefe(e.target.checked)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-0"
                        />
                        <span className="text-xs font-bold text-on-surface">Arefe</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Açıklama</label>
                      <input
                        value={aciklama}
                        onChange={(e) => setAciklama(e.target.value)}
                        className="w-full h-10 px-3 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-semibold"
                        placeholder="Örn: Ramazan Bayramı"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={saving}
                    className="mt-4 w-full h-11 bg-primary text-white rounded-lg font-label-md text-xs font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Ekle"}
                  </button>
                </div>

                <div className="border-t border-outline-variant/30 pt-6">
                  <h2 className="text-sm font-bold text-primary mb-2">Toplu Import</h2>
                  <p className="text-[11px] text-on-surface-variant mb-3">Format: <span className="font-semibold">GG.AA.YYYY Açıklama</span> (satır satır)</p>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-outline-variant focus:border-primary focus:ring-0 text-sm rounded-lg bg-surface font-medium"
                    placeholder={`01.01.${year} Yılbaşı\n23.04.${year} Ulusal Egemenlik ve Çocuk Bayramı`}
                  />
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={saving || !importText.trim()}
                    className="mt-3 w-full h-11 border border-outline-variant rounded-lg font-label-md text-xs font-bold hover:bg-surface-container-low transition-all disabled:opacity-50"
                  >
                    {saving ? "İşleniyor..." : "Import Et"}
                  </button>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-primary">Kayıtlar</h2>
                  {loading ? (
                    <span className="text-xs font-bold text-on-surface-variant">Yükleniyor...</span>
                  ) : (
                    <span className="text-xs font-bold text-on-surface-variant">{items.length} kayıt</span>
                  )}
                </div>

                {error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-800">{error}</div>
                ) : null}

                {!loading && items.length === 0 ? (
                  <div className="p-6 bg-surface rounded-lg border border-outline-variant text-xs text-on-surface-variant">
                    Bu yıl için resmi tatil kaydı bulunamadı.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-start justify-between gap-4 p-3 bg-surface rounded-lg border border-outline-variant">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">
                              {new Date(it.tarih).toLocaleDateString("tr-TR")}
                            </span>
                            {it.arefe ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                AREFE
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-on-surface-variant font-medium truncate" title={it.aciklama || ""}>
                            {it.aciklama || "-"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={it.arefe}
                              onChange={(e) => handleToggleArefe(it.id, e.target.checked)}
                            />
                            Arefe
                          </label>
                          <button
                            type="button"
                            onClick={() => handleDelete(it.id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-red-700 hover:bg-red-50 transition-all"
                            title="Sil"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

