"use client"

import { useSession } from "next-auth/react"
import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import { getSablonlarByAsama } from "@/lib/onmadde-templates"
import OperasyonTab from "./OperasyonTab"

type OnMaddeDurum = "EKSIK" | "TAMAMLANDI" | "MUAF"

type SozlesmeBelge = {
  id: string
  ad: string
  dosyaYolu: string
  createdAt: string
}

type SozlesmeNot = {
  id: string
  not: string
  yazar: string
  createdAt: string
}

type Teminat = {
  id: string
  tutar: number
  tip: "NAKIT" | "MEKTUP"
  bankaId: string | null
  mektupNo: string | null
  vadeTarihi: string | null
  durum: "AKTIF" | "IADE_EDILDI" | "NAKDE_CEVRILDI"
  banka?: { id: string; ad: string; komisyonOrani: number } | null
}

export default function SozlesmeDetayPage() {
  const { data: session, status } = useSession()
  const { id } = useParams()
  const router = useRouter()
  const [sozlesme, setSozlesme] = useState<any>(null)
  const [bankalar, setBankalar] = useState<any[]>([])

  const sozlesmeId = useMemo(() => (Array.isArray(id) ? id[0] : id) || "", [id])

  const [showTeminatForm, setShowTeminatForm] = useState(false)
  const [teminatForm, setTeminatForm] = useState({
    tutar: "",
    tip: "NAKIT",
    bankaId: "",
    mektupNo: "",
    vadeTarihi: ""
  })

  const [sozlesmeBelgeleri, setSozlesmeBelgeleri] = useState<SozlesmeBelge[]>([])
  const [selectedSozlesmeFile, setSelectedSozlesmeFile] = useState<File | null>(null)
  const [sozlesmeFileUploading, setSozlesmeFileUploading] = useState(false)

  const [noteText, setNoteText] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteText, setEditingNoteText] = useState("")
  const [noteSaving, setNoteSaving] = useState(false)

  const sablonlar = useMemo(() => getSablonlarByAsama("SOZLESME_ONCESI"), [])
  const [selectedBelgeAdi, setSelectedBelgeAdi] = useState<string>(() => sablonlar[0]?.ad || "")
  const [onmaddeFiles, setOnmaddeFiles] = useState<string[]>([])
  const [onmaddeUploading, setOnmaddeUploading] = useState(false)
  const [onmaddeDurumMap, setOnmaddeDurumMap] = useState<Record<string, OnMaddeDurum>>({})
  const [showOnMaddeUpload, setShowOnMaddeUpload] = useState(false)

  // P2.2 Alanları Edit State ve Handlers
  const [isEditingIpJv, setIsEditingIpJv] = useState(false)
  const [editIpJvForm, setEditIpJvForm] = useState({
    fikriMulkiyet: "",
    teslimHaklari: "",
    ortakGirisim: false
  })
  const [editPartners, setEditPartners] = useState<{ unvan: string; oran: number }[]>([])

  const handleSaveIpJv = async () => {
    if (!sozlesmeId) return
    try {
      const res = await fetch(`/api/sozlesmeler`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sozlesmeId,
          fikriMulkiyet: editIpJvForm.fikriMulkiyet || null,
          teslimHaklari: editIpJvForm.teslimHaklari || null,
          ortakGirisim: editIpJvForm.ortakGirisim,
          ortaklikOranlari: editIpJvForm.ortakGirisim ? editPartners : null
        })
      })
      if (!res.ok) throw new Error("Güncelleme başarısız")
      setIsEditingIpJv(false)
      fetchSozlesme()
    } catch (e: any) {
      alert(e.message)
    }
  }
  
  const [activeTab, setActiveTab] = useState<"genel" | "operasyon">("genel")

  const isAdmin = useMemo(() => {
    const role = (session?.user as any)?.rol
    return role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
  }, [session])

  const fetchSozlesme = async () => {
    if (!sozlesmeId) return
    const res = await fetch(`/api/sozlesmeler/${sozlesmeId}`)
    if (!res.ok) return
    const data = await res.json()
    setSozlesme(data)
  }

  const fetchSozlesmeBelgeleri = async () => {
    if (!sozlesmeId) return
    const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/dosya`)
    if (!res.ok) return
    const data = await res.json()
    setSozlesmeBelgeleri(Array.isArray(data) ? data : [])
  }

  const fetchOnMaddeFiles = async (belgeAdi: string) => {
    if (!sozlesmeId || !belgeAdi) return
    const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde?belgeAdi=${encodeURIComponent(belgeAdi)}`)
    if (!res.ok) return
    const data = await res.json()
    setOnmaddeFiles(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    if (!session || !sozlesmeId) return
    let isActive = true

    Promise.all([
      fetch(`/api/sozlesmeler/${sozlesmeId}`).then((res) => (res.ok ? res.json() : null)),
      fetch(`/api/sozlesmeler/${sozlesmeId}/dosya`).then((res) => (res.ok ? res.json() : [])),
      fetch("/api/bankalar").then((res) => (res.ok ? res.json() : [])),
      fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde?mode=checklist`).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([sozlesmeData, dosyaData, bankalarData, durumRows]) => {
        if (!isActive) return
        if (sozlesmeData) setSozlesme(sozlesmeData)
        setSozlesmeBelgeleri(Array.isArray(dosyaData) ? dosyaData : [])
        setBankalar(Array.isArray(bankalarData) ? bankalarData : [])
        if (Array.isArray(durumRows)) {
          const map: Record<string, OnMaddeDurum> = {}
          for (const r of durumRows) {
            if (r && typeof r.belgeAdi === "string" && typeof r.durum === "string") {
              if (r.durum === "EKSIK" || r.durum === "TAMAMLANDI" || r.durum === "MUAF") {
                map[r.belgeAdi] = r.durum
              }
            }
          }
          setOnmaddeDurumMap(map)
        }
      })
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [session, sozlesmeId])

  useEffect(() => {
    if (!session || !sozlesmeId || !selectedBelgeAdi) return
    let isActive = true
    fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde?belgeAdi=${encodeURIComponent(selectedBelgeAdi)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isActive) return
        setOnmaddeFiles(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde?mode=checklist&belgeAdi=${encodeURIComponent(selectedBelgeAdi)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive) return
        const durum = data?.durum
        if (durum === "EKSIK" || durum === "TAMAMLANDI" || durum === "MUAF") {
          setOnmaddeDurumMap((prev) => ({ ...prev, [selectedBelgeAdi]: durum }))
        }
      })
      .catch(() => {})
    return () => {
      isActive = false
    }
  }, [session, sozlesmeId, selectedBelgeAdi])

  const handleUpdateOnMaddeDurum = async (belgeAdi: string, durum: OnMaddeDurum) => {
    if (!sozlesmeId || !belgeAdi) return
    const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ belgeAdi, durum }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const msg = typeof data?.error === "string" ? data.error : "Güncelleme başarısız"
      alert(msg)
      return
    }
    const data = await res.json().catch(() => null)
    const nextDurum = data?.durum
    if (nextDurum === "EKSIK" || nextDurum === "TAMAMLANDI" || nextDurum === "MUAF") {
      setOnmaddeDurumMap((prev) => ({ ...prev, [belgeAdi]: nextDurum }))
    } else {
      setOnmaddeDurumMap((prev) => ({ ...prev, [belgeAdi]: durum }))
    }
  }

  const handleAddTeminat = async () => {
    if (!teminatForm.tutar || Number.isNaN(parseFloat(teminatForm.tutar))) {
      alert("Tutar zorunludur")
      return
    }
    if (teminatForm.tip === "MEKTUP" && !teminatForm.bankaId) {
      alert("Banka seçimi zorunludur")
      return
    }
    await fetch("/api/sozlesmeler/teminatlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sozlesmeId: sozlesmeId,
        tutar: parseFloat(teminatForm.tutar),
        tip: teminatForm.tip,
        bankaId: teminatForm.tip === "MEKTUP" ? teminatForm.bankaId : null,
        mektupNo: teminatForm.tip === "MEKTUP" ? teminatForm.mektupNo : null,
        vadeTarihi: teminatForm.vadeTarihi || null
      })
    })
    setShowTeminatForm(false)
    setTeminatForm({ tutar: "", tip: "NAKIT", bankaId: "", mektupNo: "", vadeTarihi: "" })
    fetchSozlesme()
  }

  const handleDeleteTeminat = async (teminatId: string) => {
    if (!confirm("Emin misiniz?")) return
    await fetch(`/api/sozlesmeler/teminatlar?id=${teminatId}`, { method: "DELETE" })
    fetchSozlesme()
  }

  const handleUpdateTeminatDurum = async (teminatId: string, durum: Teminat["durum"]) => {
    await fetch("/api/sozlesmeler/teminatlar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: teminatId, durum }),
    })
    fetchSozlesme()
    fetch("/api/bankalar").then(res => res.json()).then(data => setBankalar(data))
  }

  const handleSozlesmeFileUpload = async () => {
    if (!selectedSozlesmeFile || !sozlesmeId) return
    try {
      setSozlesmeFileUploading(true)
      const formData = new FormData()
      formData.append("file", selectedSozlesmeFile)
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/dosya`, { method: "POST", body: formData })
      if (!res.ok) throw new Error("Dosya yüklenemedi")
      setSelectedSozlesmeFile(null)
      fetchSozlesmeBelgeleri()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSozlesmeFileUploading(false)
    }
  }

  const handleSozlesmeFileDownload = (fileId: string) => {
    if (!sozlesmeId) return
    window.open(`/api/sozlesmeler/${sozlesmeId}/dosya?fileId=${encodeURIComponent(fileId)}`, "_blank")
  }

  const handleSozlesmeFileDelete = async (fileId: string) => {
    if (!sozlesmeId) return
    if (!confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/dosya?fileId=${encodeURIComponent(fileId)}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Dosya silinemedi")
      fetchSozlesmeBelgeleri()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !sozlesmeId) return
    try {
      setNoteSaving(true)
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/not`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ not: noteText }),
      })
      if (!res.ok) throw new Error("Not eklenemedi")
      setNoteText("")
      fetchSozlesme()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setNoteSaving(false)
    }
  }

  const handleSaveNote = async (noteId: string) => {
    if (!sozlesmeId) return
    if (!editingNoteText.trim()) return
    try {
      setNoteSaving(true)
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/not?id=${encodeURIComponent(noteId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ not: editingNoteText }),
      })
      if (!res.ok) throw new Error("Not güncellenemedi")
      setEditingNoteId(null)
      setEditingNoteText("")
      fetchSozlesme()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setNoteSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!sozlesmeId) return
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return
    const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/not?id=${encodeURIComponent(noteId)}`, { method: "DELETE" })
    if (res.ok) fetchSozlesme()
  }

  const handleOnMaddeUpload = async (file: File) => {
    if (!sozlesmeId || !selectedBelgeAdi) return
    try {
      setOnmaddeUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/onmadde?belgeAdi=${encodeURIComponent(selectedBelgeAdi)}`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Dosya yüklenemedi")
      fetchOnMaddeFiles(selectedBelgeAdi)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setOnmaddeUploading(false)
    }
  }

  const handleOnMaddeDownload = (fileName: string) => {
    if (!sozlesmeId || !selectedBelgeAdi) return
    window.open(
      `/api/sozlesmeler/${sozlesmeId}/onmadde?belgeAdi=${encodeURIComponent(selectedBelgeAdi)}&file=${encodeURIComponent(fileName)}`,
      "_blank"
    )
  }

  const handleOnMaddeDelete = async (fileName: string) => {
    if (!sozlesmeId || !selectedBelgeAdi) return
    if (!confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return
    const res = await fetch(
      `/api/sozlesmeler/${sozlesmeId}/onmadde?belgeAdi=${encodeURIComponent(selectedBelgeAdi)}&file=${encodeURIComponent(fileName)}`,
      { method: "DELETE" }
    )
    if (res.ok) fetchOnMaddeFiles(selectedBelgeAdi)
  }

  if (status === "loading" || !sozlesme) return <div className="p-8 text-center text-on-surface-variant">Yükleniyor...</div>

  const onMaddeTamamlanan = sablonlar.filter((s) => onmaddeDurumMap[s.ad] === "TAMAMLANDI").length
  const onMaddeMuaf = sablonlar.filter((s) => onmaddeDurumMap[s.ad] === "MUAF").length

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sözleşme Detayı: {sozlesme.ihale?.ad}</h2>
              <button onClick={() => router.push("/sozlesmeler")} className="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-2 rounded hover:bg-surface-container transition-colors">Geri Dön</button>
            </div>

            <div className="flex border-b border-outline-variant mb-6">
              <button
                onClick={() => setActiveTab("genel")}
                className={`px-4 py-2 font-bold ${activeTab === "genel" ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Genel Bilgiler
              </button>
              <button
                onClick={() => setActiveTab("operasyon")}
                className={`px-4 py-2 font-bold ${activeTab === "operasyon" ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Operasyon & Uyumluluk
              </button>
            </div>

            {activeTab === "genel" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hesaplamalar Kartı */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                <h3 className="text-lg font-bold border-b border-outline-variant pb-2 mb-4">Otomatik Kesintiler ve Vergiler</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-surface-container-low rounded">
                    <span className="font-medium">Sözleşme Bedeli:</span>
                    <span className="text-lg font-bold">{sozlesme.bedel.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Kesin Teminat (%6):</span>
                    <span className="font-medium">{sozlesme.kesinTeminatTutari.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Damga Vergisi (‰9.48):</span>
                    <span className="font-medium">{sozlesme.damgaVergisi.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Karar Pulu (‰5.69):</span>
                    <span className="font-medium">{sozlesme.kararPulu.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">KİK Payı (Sınır üstü ise onbinde 5):</span>
                    <span className="font-medium">{sozlesme.kikPayi.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center font-bold text-error">
                    <span>Toplam Kesinti (Nakit Ödenecekse):</span>
                    <span>{(sozlesme.damgaVergisi + sozlesme.kararPulu + sozlesme.kikPayi).toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
              </div>

              {/* Teminatlar Kartı */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
                  <h3 className="text-lg font-bold">Kesin Teminatlar</h3>
                  <button onClick={() => setShowTeminatForm(!showTeminatForm)} className="bg-primary-container text-on-primary-container border border-outline-variant px-3 py-1 text-sm rounded hover:opacity-90 transition-opacity">
                    + Teminat Ekle
                  </button>
                </div>

                {showTeminatForm && (
                  <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-4 text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium mb-1">Tip</label>
                        <select value={teminatForm.tip} onChange={e => setTeminatForm({...teminatForm, tip: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                          <option value="NAKIT">Nakit</option>
                          <option value="MEKTUP">Banka Mektubu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Tutar (TL)</label>
                        <input type="number" step="0.01" value={teminatForm.tutar} onChange={e => setTeminatForm({...teminatForm, tutar: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                    </div>
                    
                    {teminatForm.tip === "MEKTUP" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block font-medium mb-1">Banka Seçin</label>
                          <select value={teminatForm.bankaId} onChange={e => setTeminatForm({...teminatForm, bankaId: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                            <option value="">Seçiniz...</option>
                            {bankalar.map(b => (
                              <option key={b.id} value={b.id}>{b.ad} (Boş Limit: {(b.toplamLimit - b.kullanilanLimit).toLocaleString()} ₺)</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Mektup No</label>
                          <input type="text" value={teminatForm.mektupNo} onChange={e => setTeminatForm({...teminatForm, mektupNo: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Vade Tarihi</label>
                          <input type="date" value={teminatForm.vadeTarihi} onChange={e => setTeminatForm({...teminatForm, vadeTarihi: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowTeminatForm(false)} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded hover:bg-surface-container transition-colors">İptal</button>
                      <button type="button" onClick={handleAddTeminat} className="px-3 py-2 bg-primary text-on-primary rounded hover:opacity-90 transition-opacity">Kaydet</button>
                    </div>
                  </div>
                )}

                {!sozlesme.kesinTeminatlar || sozlesme.kesinTeminatlar.length === 0 ? (
                  <div className="text-center py-8 bg-surface-container-low rounded border border-dashed border-outline-variant text-on-surface-variant">
                    Henüz teminat eklenmemiş.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {sozlesme.kesinTeminatlar.map((t: Teminat) => (
                      <li key={t.id} className="border border-outline-variant p-3 rounded flex justify-between items-center text-sm">
                        <div>
                          <p className="font-bold">{t.tutar.toLocaleString('tr-TR')} ₺ <span className="text-on-surface-variant font-normal">({t.tip})</span></p>
                          {t.tip === "MEKTUP" && <p className="text-xs text-on-surface-variant">Banka Mektubu No: {t.mektupNo || "-"}</p>}
                          {t.tip === "MEKTUP" && t.banka ? (
                            <p className="text-xs text-on-surface-variant">
                              Banka: {t.banka.ad} • Komisyon: {(t.tutar * (t.banka.komisyonOrani || 0) / 100).toLocaleString("tr-TR")} ₺
                            </p>
                          ) : null}
                          <p className="text-xs text-on-surface-variant">Durum: {t.durum}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={t.durum}
                            onChange={(e) => handleUpdateTeminatDurum(t.id, e.target.value as any)}
                            className="border border-outline-variant bg-surface-container-low rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            disabled={!isAdmin}
                            title={isAdmin ? "Durum güncelle" : "Yetkiniz yok"}
                          >
                            <option value="AKTIF">Aktif</option>
                            <option value="IADE_EDILDI">İade Edildi</option>
                            <option value="NAKDE_CEVRILDI">Nakde Çevrildi</option>
                          </select>
                          <button onClick={() => handleDeleteTeminat(t.id)} className="text-error hover:opacity-90">Sil</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Fikri Mülkiyet, Teslim Hakları & Ortak Girişim (JV) (P2.2) */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg md:col-span-2">
                <h3 className="text-lg font-bold border-b border-outline-variant pb-2 mb-4">Fikri Mülkiyet, Teslim Hakları & Ortak Girişim (JV)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase">Fikri Mülkiyet Hakları</label>
                    {isEditingIpJv ? (
                      <textarea value={editIpJvForm.fikriMulkiyet} onChange={e => setEditIpJvForm({...editIpJvForm, fikriMulkiyet: e.target.value})} rows={3} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    ) : (
                      <p className="text-sm bg-surface-container-low p-3 rounded border border-outline-variant min-h-[60px] whitespace-pre-wrap">{sozlesme.fikriMulkiyet || "Tanımlanmamış"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase">Teslim ve Kabul Hakları</label>
                    {isEditingIpJv ? (
                      <textarea value={editIpJvForm.teslimHaklari} onChange={e => setEditIpJvForm({...editIpJvForm, teslimHaklari: e.target.value})} rows={3} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    ) : (
                      <p className="text-sm bg-surface-container-low p-3 rounded border border-outline-variant min-h-[60px] whitespace-pre-wrap">{sozlesme.teslimHaklari || "Tanımlanmamış"}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-outline-variant pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    {isEditingIpJv ? (
                      <input type="checkbox" id="editOrtakGirisim" checked={editIpJvForm.ortakGirisim} onChange={e => setEditIpJvForm({...editIpJvForm, ortakGirisim: e.target.checked})} className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    ) : (
                      <span className={`material-symbols-outlined text-[20px] ${sozlesme.ortakGirisim ? "text-emerald-600" : "text-on-surface-variant"}`}>
                        {sozlesme.ortakGirisim ? "check_circle" : "cancel"}
                      </span>
                    )}
                    <label htmlFor="editOrtakGirisim" className="text-sm font-bold select-none cursor-pointer">Bu Sözleşme Bir Ortak Girişimdir (JV)</label>
                  </div>

                  {/* Ortaklık Oranları Listesi */}
                  {(isEditingIpJv ? editIpJvForm.ortakGirisim : sozlesme.ortakGirisim) && (
                    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-on-surface-variant">Ortaklık Oranları (JV)</span>
                        {isEditingIpJv && (
                          <button type="button" onClick={() => setEditPartners([...editPartners, { unvan: "", oran: 0 }])} className="text-xs text-primary font-bold hover:underline">
                            + Ortak Ekle
                          </button>
                        )}
                      </div>
                      
                      {isEditingIpJv ? (
                        <div className="space-y-3">
                          {editPartners.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <input type="text" value={p.unvan} onChange={e => {
                                const newP = [...editPartners]
                                newP[idx].unvan = e.target.value
                                setEditPartners(newP)
                              }} className="flex-1 border border-outline-variant bg-surface-container-lowest rounded px-2.5 py-1 text-xs" placeholder="Ortak Firma Unvanı" />
                              <div className="w-20 flex items-center gap-1">
                                <input type="number" value={p.oran} onChange={e => {
                                  const newP = [...editPartners]
                                  newP[idx].oran = parseInt(e.target.value) || 0
                                  setEditPartners(newP)
                                }} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2.5 py-1 text-xs" />
                                <span className="text-xs">%</span>
                              </div>
                              <button type="button" onClick={() => setEditPartners(editPartners.filter((_, i) => i !== idx))} className="text-error text-xs hover:underline">Sil</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="divide-y divide-outline-variant/60">
                          {Array.isArray(sozlesme.ortaklikOranlari) && sozlesme.ortaklikOranlari.length > 0 ? (
                            sozlesme.ortaklikOranlari.map((p: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center py-2 text-xs">
                                <span className="font-semibold">{p.unvan || `Ortak #${idx + 1}`}</span>
                                <span className="font-bold text-primary">%{p.oran || 0}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-on-surface-variant py-1">Kayıtlı ortaklık oranı bulunmamaktadır.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2 mt-4 border-t border-outline-variant pt-4">
                    {isEditingIpJv ? (
                      <>
                        <button type="button" onClick={() => { setIsEditingIpJv(false); setEditPartners([]) }} className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant text-on-surface rounded text-xs hover:bg-surface-container transition-colors">Vazgeç</button>
                        <button type="button" onClick={handleSaveIpJv} className="px-3 py-1.5 bg-primary text-on-primary rounded text-xs hover:opacity-90 transition-opacity">Kaydet</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => {
                        setIsEditingIpJv(true)
                        setEditIpJvForm({
                          fikriMulkiyet: sozlesme.fikriMulkiyet || "",
                          teslimHaklari: sozlesme.teslimHaklari || "",
                          ortakGirisim: sozlesme.ortakGirisim || false
                        })
                        setEditPartners(Array.isArray(sozlesme.ortaklikOranlari) ? [...sozlesme.ortaklikOranlari] : [])
                      }} className="bg-primary text-on-primary px-3 py-1.5 rounded text-xs hover:opacity-90 transition-opacity">Düzenle</button>
                    )}
                  </div>
                )}
              </div>

              {/* Sözleşme Evrakları */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg md:col-span-2">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
                  <h3 className="text-lg font-bold">Sözleşme Evrakları</h3>
                  <button onClick={fetchSozlesmeBelgeleri} className="text-xs font-bold text-primary hover:opacity-90">Yenile</button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <input type="file" onChange={(e) => setSelectedSozlesmeFile(e.target.files?.[0] || null)} />
                  <button
                    type="button"
                    onClick={handleSozlesmeFileUpload}
                    disabled={!selectedSozlesmeFile || sozlesmeFileUploading}
                    className="bg-primary text-on-primary px-3 py-1 rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {sozlesmeFileUploading ? "Yükleniyor..." : "Yükle"}
                  </button>
                </div>

                {sozlesmeBelgeleri.length === 0 ? (
                  <div className="text-center py-8 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm text-on-surface-variant">
                    Henüz evrak yüklenmemiş.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {sozlesmeBelgeleri.map((b) => (
                      <li key={b.id} className="border border-outline-variant p-3 rounded flex justify-between items-center text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold truncate" title={b.ad}>{b.ad}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(b.createdAt).toLocaleString("tr-TR")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleSozlesmeFileDownload(b.id)} className="text-primary hover:opacity-90">İndir</button>
                          <button onClick={() => handleSozlesmeFileDelete(b.id)} className="text-error hover:opacity-90">Sil</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Sözleşme Notları */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg md:col-span-2">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
                  <h3 className="text-lg font-bold">Sözleşme Notları</h3>
                  <button onClick={fetchSozlesme} className="text-xs font-bold text-primary hover:opacity-90">Yenile</button>
                </div>

                <div className="space-y-3 mb-6">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Not ekle..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || noteSaving}
                      className="bg-primary text-on-primary px-3 py-2 rounded text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {noteSaving ? "Kaydediliyor..." : "Not Ekle"}
                    </button>
                  </div>
                </div>

                {!sozlesme.notlar || sozlesme.notlar.length === 0 ? (
                  <div className="text-center py-8 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm text-on-surface-variant">
                    Henüz not eklenmemiş.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sozlesme.notlar.map((n: SozlesmeNot) => (
                      <div key={n.id} className="border border-outline-variant rounded p-3 bg-surface-container-low">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-on-surface-variant font-semibold">{n.yazar} • {new Date(n.createdAt).toLocaleString("tr-TR")}</p>
                            {editingNoteId === n.id ? (
                              <textarea
                                rows={3}
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                              />
                            ) : (
                              <p className="text-sm whitespace-pre-wrap mt-2">{n.not}</p>
                            )}
                          </div>
                          {isAdmin ? (
                            <div className="flex gap-2 flex-shrink-0">
                              {editingNoteId === n.id ? (
                                <>
                                  <button onClick={() => handleSaveNote(n.id)} className="text-primary hover:opacity-90 text-xs font-bold">Kaydet</button>
                                  <button
                                    onClick={() => { setEditingNoteId(null); setEditingNoteText("") }}
                                    className="text-on-surface-variant hover:opacity-90 text-xs font-bold"
                                  >
                                    Vazgeç
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => { setEditingNoteId(n.id); setEditingNoteText(n.not) }}
                                    className="text-primary hover:opacity-90 text-xs font-bold"
                                  >
                                    Düzenle
                                  </button>
                                  <button onClick={() => handleDeleteNote(n.id)} className="text-error hover:opacity-90 text-xs font-bold">Sil</button>
                                </>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 10. Madde Belgeleri */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg md:col-span-2">
                <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-lg font-bold">10. Madde Belgeleri</h3>
                    <span className="text-xs text-on-surface-variant">
                      {onMaddeTamamlanan}/{sablonlar.length} tamamlandı{onMaddeMuaf > 0 ? ` • ${onMaddeMuaf} muaf` : ""}
                    </span>
                  </div>
                  <button onClick={() => selectedBelgeAdi && fetchOnMaddeFiles(selectedBelgeAdi)} className="text-xs font-bold text-primary hover:opacity-90">
                    Yenile
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">Sözleşme imzalanmadan önce kuruma sunulması gereken yasal belgeler.</p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <div className="border border-outline-variant rounded overflow-hidden">
                      <div className="grid grid-cols-[1fr_160px_120px] bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase">
                        <div className="px-3 py-2">Belge</div>
                        <div className="px-3 py-2">Durum</div>
                        <div className="px-3 py-2">Dosya</div>
                      </div>
                      <div className="max-h-[340px] overflow-auto">
                        {sablonlar.map((s) => {
                          const durum = onmaddeDurumMap[s.ad] ?? "EKSIK"
                          const isSelected = selectedBelgeAdi === s.ad
                          return (
                            <div
                              key={s.belgeTipiKodu}
                              className={`grid grid-cols-[1fr_160px_120px] items-center border-t border-outline-variant/60 ${isSelected ? "bg-surface-container-low" : "bg-surface-container-lowest"}`}
                            >
                              <button
                                type="button"
                                onClick={() => { setSelectedBelgeAdi(s.ad); setShowOnMaddeUpload(false) }}
                                className="text-left px-3 py-2 text-sm hover:opacity-90"
                              >
                                {s.ad}
                              </button>
                              <div className="px-3 py-2">
                                <select
                                  value={durum}
                                  onChange={(e) => handleUpdateOnMaddeDurum(s.ad, e.target.value as OnMaddeDurum)}
                                  className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                >
                                  <option value="EKSIK">Eksik</option>
                                  <option value="TAMAMLANDI">Tamamlandı</option>
                                  <option value="MUAF">Muaf</option>
                                </select>
                              </div>
                              <div className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => { setSelectedBelgeAdi(s.ad); setShowOnMaddeUpload(true) }}
                                  className="text-xs font-bold text-primary hover:opacity-90"
                                >
                                  Yükle
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Seçili Belge</label>
                        <select
                          value={selectedBelgeAdi}
                          onChange={(e) => { setSelectedBelgeAdi(e.target.value); setShowOnMaddeUpload(false) }}
                          className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          {sablonlar.map((s) => (
                            <option key={s.belgeTipiKodu} value={s.ad}>{s.ad}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-40">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Durum</label>
                        <select
                          value={onmaddeDurumMap[selectedBelgeAdi] ?? "EKSIK"}
                          onChange={(e) => handleUpdateOnMaddeDurum(selectedBelgeAdi, e.target.value as OnMaddeDurum)}
                          className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          <option value="EKSIK">Eksik</option>
                          <option value="TAMAMLANDI">Tamamlandı</option>
                          <option value="MUAF">Muaf</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border border-outline-variant rounded px-3 py-2 bg-surface-container-low">
                      <span className="text-sm text-on-surface-variant">Dosya yüklemek ister misiniz?</span>
                      <button
                        type="button"
                        onClick={() => setShowOnMaddeUpload((v) => !v)}
                        className="text-sm font-bold text-primary hover:opacity-90"
                      >
                        {showOnMaddeUpload ? "Kapat" : "Dosya yükle"}
                      </button>
                    </div>

                    {showOnMaddeUpload ? (
                      <div className="border border-outline-variant rounded p-3 space-y-3">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleOnMaddeUpload(file)
                          }}
                          disabled={onmaddeUploading}
                        />

                        {onmaddeFiles.length === 0 ? (
                          <div className="text-center py-6 bg-surface-container-low rounded border border-dashed border-outline-variant text-sm text-on-surface-variant">
                            Bu belge için dosya bulunmamaktadır.
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {onmaddeFiles.map((f) => (
                              <li key={f} className="border border-outline-variant p-3 rounded flex justify-between items-center text-sm">
                                <span className="truncate" title={f}>{f}</span>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleOnMaddeDownload(f)} className="text-primary hover:opacity-90">İndir</button>
                                  {isAdmin ? (
                                    <button onClick={() => handleOnMaddeDelete(f)} className="text-error hover:opacity-90">Sil</button>
                                  ) : null}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-on-surface-variant">
                        Dosya yüklemek zorunlu değil. Checklist üzerinden ilerleyebilirsiniz.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
            ) : (
              <OperasyonTab sozlesmeId={sozlesmeId} isAdmin={isAdmin} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
