"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import FileUpload from '@/components/FileUpload'
import ParaInput from '@/components/ParaInput'
import { hesaplaSinirDeger, siralaTeklifler, TeklifSiralamaItem } from '@/lib/sinir-deger'
import { ONMADDE_TEMPLATES, BELGE_TIPI_ETIKETLER, type BelgeTipiKodu } from '@/lib/onmadde-templates'

interface Ihale {
  id: string
  ihaleNo: string
  ad: string
  aciklama: string | null
  tur: "MAL_ALIM" | "HIZMET_ALIM" | "YAPIM_ISI"
  usul: "ACIK_IHALE" | "BELLI_ISTEKLI" | "DOGRUDAN_TEMIN"
  butce: number
  sozlesmeBedeli: number | null
  baslangicTarihi: string | null
  bitisTarihi: string | null
  teklifSonTarihi: string
  durum: string
  ymTutar: number | null
  rKatsayisi: number | null
  sinirDeger: number | null
  teklifimiz: number | null
  kurumId: string
  kurum: {
    id: string
    ad: string
  }
  geciciTeminatlar: {
    id: string
    tutar: number
    banka: string | null
    bitisTarihi: string | null
    mektupNo: string | null
    createdAt: string
  }[]
  atamalar: {
    id: string
    rol: string | null
    kurumKisi: {
      id: string
      ad: string
      soyad: string
      unvan: string | null
      telefon: string | null
      email: string | null
    }
  }[]
  rakipAnalizleri: {
    id: string
    teklifTutar: number
    siralamasi: number | null
    bizimTeklifMi: boolean
    rakipFirma: {
      id: string
      ad: string
    }
  }[]
  notlar: {
    id: string
    not: string
    yazar: string
    createdAt: string
  }[]
  sozlesme: {
    id: string
    ekapNo: string | null
    bedel: number
    baslangicTarihi: string | null
    bitisTarihi: string | null
    damgaVergisi: number | null
    kararPulu: number | null
    kikPayi: number | null
    kesinTeminatTutari: number | null
  } | null
  yaklasikMaliyetler: {
    id: string
    versiyonNo: string
    tutar: number
    aktifMi: boolean
  }[]
}

interface KurumKisi {
  id: string
  ad: string
  soyad: string
  unvan: string | null
  telefon: string | null
  email: string | null
}

type IhaleDosyaItem = {
  id?: string
  dosyaAdi: string
  aciklama?: string | null
  createdAt?: string | null
  durum?: "AKTIF" | "PASIF"
  silinmeTarihi?: string | null
  source?: "db" | "storage"
}

interface RakipFirma {
  id: string
  ad: string
}

interface Banka {
  id: string
  ad: string
  sube: string | null
  toplamLimit: number
  kullanilanLimit: number
}

type IhaleItirazBelgeItem = {
  id: string
  ad: string
  dosyaYolu: string
  not: string | null
}

type IhaleItirazItem = {
  id: string
  tip: "IDAREYE_ITIRAZ" | "KIK_ITIRAZI"
  durum: "TASLAK" | "GONDERILDI" | "REDDEDILDI" | "KABUL_EDILDI"
  aciklama: string | null
  basvuruTarihi: string
  kararTarihi: string | null
  belgeler: IhaleItirazBelgeItem[]
}

type IhalePersonelParam = {
  id: string
  personelSayisi: number
  asgariUcretYuzde: number
}

type IhaleYanHakParam = {
  id: string
  yolGunluk: number
  yanHakGunSayisi: number
  yemekTip: "NAKDI" | "AYNI" | "IDARE_SAGLAR"
  yemekGunluk: number
  fazlaMesaiSaatUcreti: number
}

type PuantajItem = {
  id: string
  yil: number
  ay: number
  calismaGunu: number
  devamsizlikGunu: number
  fazlaMesaiSaat: number
  createdAt: string
}

type HakedisItem = {
  id: string
  yil: number
  ay: number
  brutTutar: number
  kdvOrani: number
  stopajOrani: number
  ceza: number
  digerKesinti: number
  kdvTutari: number
  stopajTutari: number
  netTutar: number
  durum: "TASLAK" | "ONAYLANDI" | "ODENDI"
  onayTarihi?: string | null
  vadeTarihi?: string | null
  odemeTarihi: string | null
  createdAt: string
}

type HakedisChecklistItem = {
  belgeKodu: string
  belgeAdi: string
  durum: "EKSIK" | "TAMAMLANDI" | "MUAF"
  not: string | null
  dosyaAdi: string | null
}

type OperasyonSozlesme = {
  id: string
  bedel: number
  cezaUstSinirYuzde: number
  kritikKesintiSaat: number
  kritikKesintiCezaYuzde: number
  donemSonlandirmaFesihTekrar: number
  ozelAykirilikFesihLimit: number
  altYukleniciKural: "YASAK" | "IZINLI"
  ihale: { id: string; ihaleNo: string; ad: string; kurum: { id: string; ad: string } }
}

type OperasyonIncident = {
  id: string
  tip: string
  sureSaat: number | null
  cezaTutar: number
  cezaYuzde: number | null
  riskSeviye: "INFO" | "WARNING" | "CRITICAL"
  fesihRiski: boolean
  aciklama: string | null
  createdAt: string
}

type OperasyonRapor = {
  id: string
  personelAdSoyad: string
  raporGun: number
  baslangicTarihi: string | null
  bitisTarihi: string | null
  ikameEdildi: boolean
  ikameNot: string | null
  createdAt: string
}

type OperasyonAltYuklenici = {
  id: string
  firmaAd: string
  vergiNo: string | null
  belgeDosyaAdi: string | null
  belgeDosyaYolu: string | null
  durum: "TASLAK" | "ONAY_BEKLIYOR" | "ONAYLANDI" | "REDDEDILDI"
  onayTarihi: string | null
  createdAt: string
}

type OperasyonResponse = {
  sozlesme: OperasyonSozlesme & {
    incidents: OperasyonIncident[]
    personelRaporlar: OperasyonRapor[]
    altYukleniciler: OperasyonAltYuklenici[]
  }
  stats: {
    totalCezaTutar: number
    totalCezaYuzde: number
    incidentCounts: Record<string, number>
  }
}

export default function IhaleDetay() {
  const params = useParams()
  const router = useRouter()
  const ihaleId = params.id as string

  // State
  const [ihale, setIhale] = useState<Ihale | null>(null)
  const [onmaddeFiles, setOnmaddeFiles] = useState<string[]>([])
  const [onmaddeFileUploading, setOnmaddeFileUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("genel")
  const [onmaddeSubTab, setOnmaddeSubTab] = useState(0)

  // Lists for dropdowns & forms
  const [kurumKisileri, setKurumKisileri] = useState<KurumKisi[]>([])
  const [rakipFirmalar, setRakipFirmalar] = useState<RakipFirma[]>([])
  const [bankalar, setBankalar] = useState<Banka[]>([])
  const [files, setFiles] = useState<IhaleDosyaItem[]>([])
  const [fileUploading, setFileUploading] = useState(false)
  const [fileAciklama, setFileAciklama] = useState("")
  const [showInactiveFiles, setShowInactiveFiles] = useState(false)
  const [backfillLoading, setBackfillLoading] = useState(false)

  // Modals & form states
  const [ymSource, setYmSource] = useState<"connected" | "manual">("manual")
  const [selectedYmId, setSelectedYmId] = useState("")
  const [availableYms, setAvailableYms] = useState<any[]>([])
  const [previewFile, setPreviewFile] = useState<IhaleDosyaItem | null>(null)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  
  // Basic info edit state
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [editFormData, setEditFormData] = useState({
    ad: "",
    ihaleNo: "",
    aciklama: "",
    butce: 0,
    durum: "TASLAK",
    tur: "HIZMET_ALIM",
    usul: "ACIK_IHALE",
    teklifSonTarihi: "",
    ymTutar: "",
    rKatsayisi: "",
    teklifimiz: ""
  })

  // Form: Teminat Ekle
  const [teminatFormData, setTeminatFormData] = useState({
    tutar: "",
    banka: "",
    bitisTarihi: "",
    mektupNo: "",
    isAutoCalc: false
  })

  // Form: Atama Ekle
  const [atamaFormData, setAtamaFormData] = useState({
    kurumKisiId: "",
    rol: ""
  })
  const [atamaKisiQuery, setAtamaKisiQuery] = useState("")
  const [showQuickKisiModal, setShowQuickKisiModal] = useState(false)
  const [quickKisiForm, setQuickKisiForm] = useState({
    ad: "",
    soyad: "",
    unvan: "",
    telefon: "",
    email: ""
  })

  // Form: Rakip Teklif Ekle
  const [rakipFormData, setRakipFormData] = useState({
    rakipFirmaId: "",
    teklifTutar: "",
    bizimTeklifMi: false
  })
  const [showQuickFirmaModal, setShowQuickFirmaModal] = useState(false)
  const [quickFirmaForm, setQuickFirmaForm] = useState({
    ad: "",
    unvan: "",
    vergiNo: "",
    il: "",
    telefon: ""
  })

  // Form: Not Ekle
  const [noteContent, setNoteContent] = useState("")
  
  // İtirazlar
  const [itirazlar, setItirazlar] = useState<IhaleItirazItem[]>([])
  const [itirazLoading, setItirazLoading] = useState(false)
  const [itirazError, setItirazError] = useState("")
  const [itirazForm, setItirazForm] = useState({
    tip: "IDAREYE_ITIRAZ" as const,
    durum: "TASLAK" as const,
    aciklama: "",
  })
  const [itirazFileNoteById, setItirazFileNoteById] = useState<Record<string, string>>({})
  const [editingItirazBelgeId, setEditingItirazBelgeId] = useState<string | null>(null)
  const [editingItirazBelgeNote, setEditingItirazBelgeNote] = useState("")
  const [itirazSaving, setItirazSaving] = useState(false)

  // Puantaj & Hakediş
  const [personelParam, setPersonelParam] = useState<IhalePersonelParam | null>(null)
  const [yanHakParam, setYanHakParam] = useState<IhaleYanHakParam | null>(null)
  const [personelForm, setPersonelForm] = useState({ personelSayisi: 0, asgariUcretYuzde: 0 })
  const [yanHakForm, setYanHakForm] = useState({
    yolGunluk: 0,
    yanHakGunSayisi: 22,
    yemekTip: "NAKDI" as "NAKDI" | "AYNI" | "IDARE_SAGLAR",
    yemekGunluk: 0,
    fazlaMesaiSaatUcreti: 0,
  })
  const [phase5Loading, setPhase5Loading] = useState(false)

  const [puantajlar, setPuantajlar] = useState<PuantajItem[]>([])
  const [puantajForm, setPuantajForm] = useState({
    yil: new Date().getFullYear(),
    ay: new Date().getMonth() + 1,
    calismaGunu: 0,
    devamsizlikGunu: 0,
    fazlaMesaiSaat: 0,
  })

  const [hakedisler, setHakedisler] = useState<HakedisItem[]>([])
  const [hakedisForm, setHakedisForm] = useState({
    yil: new Date().getFullYear(),
    ay: new Date().getMonth() + 1,
    brutTutar: 0,
    kdvOrani: 20,
    stopajOrani: 0,
    ceza: 0,
    digerKesinti: 0,
    durum: "TASLAK" as const,
  })
  const [hakedisFiles, setHakedisFiles] = useState<string[]>([])
  const [hakedisFileUploading, setHakedisFileUploading] = useState(false)
  const [hakedisSelectedFile, setHakedisSelectedFile] = useState<File | null>(null)
  const [hakedisChecklistItems, setHakedisChecklistItems] = useState<HakedisChecklistItem[]>([])
  const [hakedisChecklistLoading, setHakedisChecklistLoading] = useState(false)
  const [hakedisChecklistSaving, setHakedisChecklistSaving] = useState(false)
  const [hakedisChecklistError, setHakedisChecklistError] = useState("")
  const [hakedisChecklistMeta, setHakedisChecklistMeta] = useState({
    missingCount: 0,
    total: 0,
    persisted: false,
    message: "",
  })

  const [operasyonLoading, setOperasyonLoading] = useState(false)
  const [operasyonError, setOperasyonError] = useState("")
  const [operasyonData, setOperasyonData] = useState<OperasyonResponse | null>(null)

  const [uyumForm, setUyumForm] = useState({
    odemeVadesiGun: 30,
    cezaUstSinirYuzde: 30,
    kritikKesintiSaat: 12,
    kritikKesintiCezaYuzde: 2,
    donemSonlandirmaFesihTekrar: 2,
    ozelAykirilikFesihLimit: 30,
    altYukleniciKural: "YASAK" as "YASAK" | "IZINLI",
  })

  const [incidentForm, setIncidentForm] = useState({
    tip: "KESINTI" as const,
    sureSaat: 0,
    cezaTutar: 0,
    aciklama: "",
  })

  const [raporForm, setRaporForm] = useState({
    personelAdSoyad: "",
    raporGun: 0,
    baslangicTarihi: "",
    bitisTarihi: "",
  })

  const [altYukleniciForm, setAltYukleniciForm] = useState({
    firmaAd: "",
    vergiNo: "",
  })

  // Fetch Ihale details
  const fetchIhaleDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}`)
      if (!res.ok) throw new Error("İhale detayları alınamadı")
      const data: Ihale = await res.json()
      setIhale(data)
      
      // Initialize edit form
      setEditFormData({
        ad: data.ad,
        ihaleNo: data.ihaleNo,
        aciklama: data.aciklama || "",
        butce: data.butce,
        durum: data.durum,
        tur: data.tur,
        usul: data.usul,
        teklifSonTarihi: data.teklifSonTarihi ? new Date(data.teklifSonTarihi).toISOString().slice(0, 16) : "",
        ymTutar: data.ymTutar?.toString() || "",
        rKatsayisi: data.rKatsayisi?.toString() || "",
        teklifimiz: data.teklifimiz?.toString() || ""
      })

      // Determine YM Source
      const activeYm = data.yaklasikMaliyetler.find(y => y.aktifMi)
      if (activeYm && data.ymTutar === activeYm.tutar) {
        setYmSource("connected")
        setSelectedYmId(activeYm.id)
      } else {
        setYmSource("manual")
      }

      // Fetch related dropdown lists
      fetchKurumKisileri(data.kurumId)
      await fetchAvailableYms(data.kurumId)
      fetchRakipFirmalar()
      fetchBankalar()
      fetchFiles()
      fetchOnmaddeFiles()
      
      setLoading(false)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  const fetchItirazlar = async () => {
    try {
      setItirazLoading(true)
      setItirazError("")
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz`)
      if (!res.ok) throw new Error("İtirazlar alınamadı")
      const data = await res.json()
      setItirazlar(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setItirazError(e.message || "Hata oluştu")
    } finally {
      setItirazLoading(false)
    }
  }

  const fetchPersonelParam = async () => {
    const res = await fetch(`/api/ihaleler/${ihaleId}/personel`)
    if (!res.ok) return
    const data = await res.json()
    if (data && typeof data === "object") {
      setPersonelParam(data)
      setPersonelForm({
        personelSayisi: Number(data.personelSayisi || 0),
        asgariUcretYuzde: Number(data.asgariUcretYuzde || 0),
      })
    } else {
      setPersonelParam(null)
    }
  }

  const fetchYanHakParam = async () => {
    const res = await fetch(`/api/ihaleler/${ihaleId}/yan-hak`)
    if (!res.ok) return
    const data = await res.json()
    if (data && typeof data === "object") {
      setYanHakParam(data)
      setYanHakForm({
        yolGunluk: Number(data.yolGunluk || 0),
        yanHakGunSayisi: Number(data.yanHakGunSayisi ?? 22) || 0,
        yemekTip: data.yemekTip === "AYNI" || data.yemekTip === "IDARE_SAGLAR" ? data.yemekTip : "NAKDI",
        yemekGunluk: Number(data.yemekGunluk || 0),
        fazlaMesaiSaatUcreti: Number(data.fazlaMesaiSaatUcreti || 0),
      })
    } else {
      setYanHakParam(null)
    }
  }

  const fetchOperasyon = async (sozlesmeId: string) => {
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const res = await fetch(`/api/sozlesmeler/${encodeURIComponent(sozlesmeId)}/operasyon`)
      const json = (await res.json().catch(() => null)) as OperasyonResponse | { error?: string } | null
      if (!res.ok) {
        const msg = typeof (json as any)?.error === "string" ? (json as any).error : "Operasyon verisi alınamadı"
        throw new Error(msg)
      }
      const data = json as OperasyonResponse
      setOperasyonData(data)
      setUyumForm({
        odemeVadesiGun: Number((data as any)?.sozlesme?.odemeVadesiGun ?? 30) || 0,
        cezaUstSinirYuzde: Number(data.sozlesme.cezaUstSinirYuzde ?? 30) || 0,
        kritikKesintiSaat: Number(data.sozlesme.kritikKesintiSaat ?? 12) || 0,
        kritikKesintiCezaYuzde: Number(data.sozlesme.kritikKesintiCezaYuzde ?? 2) || 0,
        donemSonlandirmaFesihTekrar: Number(data.sozlesme.donemSonlandirmaFesihTekrar ?? 2) || 0,
        ozelAykirilikFesihLimit: Number(data.sozlesme.ozelAykirilikFesihLimit ?? 30) || 0,
        altYukleniciKural: data.sozlesme.altYukleniciKural === "IZINLI" ? "IZINLI" : "YASAK",
      })
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
      setOperasyonData(null)
    } finally {
      setOperasyonLoading(false)
    }
  }

  const handleSaveUyum = async () => {
    if (!ihale?.sozlesme?.id) return
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const res = await fetch(`/api/sozlesmeler`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ihale.sozlesme.id, ...uyumForm }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Uyumluluk ayarları kaydedilemedi")
      await fetchOperasyon(ihale.sozlesme.id)
      await fetchIhaleDetails()
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
    } finally {
      setOperasyonLoading(false)
    }
  }

  const handleAddIncident = async () => {
    if (!ihale?.sozlesme?.id) return
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const payload: any =
        incidentForm.tip === "KESINTI"
          ? { kind: "INCIDENT", tip: "KESINTI", sureSaat: incidentForm.sureSaat, aciklama: incidentForm.aciklama || null }
          : incidentForm.tip === "DONEM_SONLANDIRMA"
            ? { kind: "INCIDENT", tip: "DONEM_SONLANDIRMA", aciklama: incidentForm.aciklama || null }
            : incidentForm.tip === "OZEL_AYKIRILIK"
              ? { kind: "INCIDENT", tip: "OZEL_AYKIRILIK", aciklama: incidentForm.aciklama || null }
              : { kind: "INCIDENT", tip: "DIGER", cezaTutar: incidentForm.cezaTutar, aciklama: incidentForm.aciklama || null }

      const res = await fetch(`/api/sozlesmeler/${encodeURIComponent(ihale.sozlesme.id)}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Olay kaydedilemedi")
      setIncidentForm({ tip: "KESINTI", sureSaat: 0, cezaTutar: 0, aciklama: "" })
      await fetchOperasyon(ihale.sozlesme.id)
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
    } finally {
      setOperasyonLoading(false)
    }
  }

  const handleAddRapor = async () => {
    if (!ihale?.sozlesme?.id) return
    if (!raporForm.personelAdSoyad.trim()) return
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const res = await fetch(`/api/sozlesmeler/${encodeURIComponent(ihale.sozlesme.id)}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "RAPOR",
          personelAdSoyad: raporForm.personelAdSoyad.trim(),
          raporGun: raporForm.raporGun,
          baslangicTarihi: raporForm.baslangicTarihi ? new Date(raporForm.baslangicTarihi).toISOString() : null,
          bitisTarihi: raporForm.bitisTarihi ? new Date(raporForm.bitisTarihi).toISOString() : null,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Rapor kaydedilemedi")
      setRaporForm({ personelAdSoyad: "", raporGun: 0, baslangicTarihi: "", bitisTarihi: "" })
      await fetchOperasyon(ihale.sozlesme.id)
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
    } finally {
      setOperasyonLoading(false)
    }
  }

  const handleToggleIkame = async (id: string, next: boolean) => {
    if (!ihale?.sozlesme?.id) return
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const res = await fetch(`/api/sozlesmeler/${encodeURIComponent(ihale.sozlesme.id)}/operasyon`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "RAPOR_IKAME", id, ikameEdildi: next }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Güncellenemedi")
      await fetchOperasyon(ihale.sozlesme.id)
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
    } finally {
      setOperasyonLoading(false)
    }
  }

  const handleAddAltYuklenici = async () => {
    if (!ihale?.sozlesme?.id) return
    if (!altYukleniciForm.firmaAd.trim()) return
    try {
      setOperasyonLoading(true)
      setOperasyonError("")
      const res = await fetch(`/api/sozlesmeler/${encodeURIComponent(ihale.sozlesme.id)}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "ALT_YUKLENICI",
          firmaAd: altYukleniciForm.firmaAd.trim(),
          vergiNo: altYukleniciForm.vergiNo.trim() || null,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Alt yüklenici kaydedilemedi")
      setAltYukleniciForm({ firmaAd: "", vergiNo: "" })
      await fetchOperasyon(ihale.sozlesme.id)
    } catch (e) {
      setOperasyonError(e instanceof Error ? e.message : "Bilinmeyen hata")
    } finally {
      setOperasyonLoading(false)
    }
  }

  const fetchPuantajlar = async () => {
    const res = await fetch(`/api/ihaleler/${ihaleId}/puantaj`)
    if (!res.ok) return
    const data = await res.json()
    setPuantajlar(Array.isArray(data) ? data : [])
  }

  const fetchHakedisler = async () => {
    const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis`)
    if (!res.ok) return
    const data = await res.json()
    setHakedisler(Array.isArray(data) ? data : [])
  }

  const fetchHakedisFiles = async (yil: number, ay: number) => {
    const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis/dosya?yil=${encodeURIComponent(String(yil))}&ay=${encodeURIComponent(String(ay))}`)
    if (!res.ok) return
    const data = await res.json()
    setHakedisFiles(Array.isArray(data) ? data : [])
  }

  const fetchHakedisChecklist = async (yil: number, ay: number) => {
    try {
      setHakedisChecklistLoading(true)
      setHakedisChecklistError("")
      const res = await fetch(
        `/api/ihaleler/${ihaleId}/hakedis?mode=checklist&yil=${encodeURIComponent(String(yil))}&ay=${encodeURIComponent(String(ay))}`
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Checklist alınamadı")
      }
      const data = await res.json()
      const items = Array.isArray(data?.items) ? data.items : []
      setHakedisChecklistItems(
        items
          .map((x: any): HakedisChecklistItem | null => {
            if (!x || typeof x !== "object") return null
            const belgeKodu = String(x.belgeKodu || "")
            const belgeAdi = String(x.belgeAdi || belgeKodu)
            const durum = x.durum === "TAMAMLANDI" || x.durum === "MUAF" ? x.durum : "EKSIK"
            return {
              belgeKodu,
              belgeAdi,
              durum,
              not: typeof x.not === "string" ? x.not : null,
              dosyaAdi: typeof x.dosyaAdi === "string" ? x.dosyaAdi : null,
            }
          })
          .filter((y: any) => y && y.belgeKodu)
      )
      setHakedisChecklistMeta({
        missingCount: Number(data?.missingCount || 0),
        total: Number(data?.total || items.length || 0),
        persisted: Boolean(data?.persisted),
        message: typeof data?.message === "string" ? data.message : "",
      })
    } catch (e: any) {
      setHakedisChecklistError(e?.message || "Hata oluştu")
      setHakedisChecklistItems([])
      setHakedisChecklistMeta({ missingCount: 0, total: 0, persisted: false, message: "" })
    } finally {
      setHakedisChecklistLoading(false)
    }
  }

  // Fetch institution contacts
  const fetchKurumKisileri = async (kurumId: string) => {
    try {
      const res = await fetch(`/api/kurumlar?id=${kurumId}`)
      if (res.ok) {
        const data = await res.json()
        setKurumKisileri(data.kisiler || [])
      }
    } catch (e) {
      console.error("Kurum kişileri yüklenirken hata:", e)
    }
  }

  // Fetch available YMs for the institution
  const fetchAvailableYms = async (kurumId: string) => {
    try {
      const res = await fetch(`/api/yaklasik-maliyetler?kurumId=${kurumId}`)
      if (res.ok) {
        const data = await res.json()
        setAvailableYms(data || [])
      }
    } catch (e) {
      console.error("Yaklaşık maliyetler yüklenirken hata:", e)
    }
  }

  // Fetch competitor firms
  const fetchRakipFirmalar = async () => {
    try {
      const res = await fetch(`/api/rakip-firmalar`)
      if (res.ok) {
        const data = await res.json()
        setRakipFirmalar(data)
      }
    } catch (e) {
      console.error("Rakip firmalar yüklenirken hata:", e)
    }
  }

  // Fetch banks
  const fetchBankalar = async () => {
    try {
      const res = await fetch(`/api/bankalar`)
      if (res.ok) {
        const data = await res.json()
        setBankalar(data || [])
      }
    } catch (e) {
      console.error("Bankalar yüklenirken hata:", e)
    }
  }

  // Fetch uploaded files
  const fetchFiles = async () => {
    try {
      const url = showInactiveFiles
        ? `/api/ihaleler/${ihaleId}/dosya?meta=1&includeInactive=1`
        : `/api/ihaleler/${ihaleId}/dosya?meta=1`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const normalized: IhaleDosyaItem[] = Array.isArray(data)
          ? data
              .map((item: any): IhaleDosyaItem | null => {
                if (typeof item === "string") return { dosyaAdi: item, aciklama: null, createdAt: null, source: "storage" as const }
                if (item && typeof item === "object") {
                  return {
                    id: typeof item.id === "string" ? item.id : undefined,
                    dosyaAdi: String(item.dosyaAdi || item.fileName || ""),
                    aciklama: typeof item.aciklama === "string" ? item.aciklama : null,
                    createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
                    durum: item.durum === "AKTIF" || item.durum === "PASIF" ? item.durum : undefined,
                    silinmeTarihi: typeof item.silinmeTarihi === "string" ? item.silinmeTarihi : null,
                    source: item.source === "db" || item.source === "storage" ? item.source : undefined,
                  }
                }
                return null
              })
              .filter((x): x is IhaleDosyaItem => x !== null)
          : []
        setFiles(normalized.filter((f) => f.dosyaAdi))
      }
    } catch (e) {
      console.error("Dosyalar yüklenirken hata:", e)
    }
  }

  // 10. Madde files
  const fetchOnmaddeFiles = async () => {
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/onmadde`)
      if (res.ok) {
        const data = await res.json()
        setOnmaddeFiles(data)
      }
    } catch (e) {
      console.error("OnMadde dosyalar yüklenirken hata:", e)
    }
  }

  useEffect(() => {
    if (ihaleId) {
      fetchIhaleDetails()
    }
  }, [ihaleId])

  useEffect(() => {
    if (ihaleId) {
      fetchFiles()
    }
  }, [ihaleId, showInactiveFiles])

  useEffect(() => {
    if (ihaleId && activeTab === "itiraz") {
      fetchItirazlar()
    }
  }, [ihaleId, activeTab])

  useEffect(() => {
    if (!ihaleId) return
    if (activeTab !== "puantaj" && activeTab !== "hakedis") return
    fetchPersonelParam()
    fetchYanHakParam()
    fetchPuantajlar()
    fetchHakedisler()
  }, [ihaleId, activeTab])

  useEffect(() => {
    if (!ihaleId) return
    if (activeTab !== "hakedis") return
    fetchHakedisFiles(hakedisForm.yil, hakedisForm.ay)
    fetchHakedisChecklist(hakedisForm.yil, hakedisForm.ay)
  }, [ihaleId, activeTab, hakedisForm.yil, hakedisForm.ay])

  useEffect(() => {
    if (activeTab !== "operasyon") return
    const sozlesmeId = ihale?.sozlesme?.id
    if (!sozlesmeId) return
    fetchOperasyon(sozlesmeId)
  }, [activeTab, ihale?.sozlesme?.id])

  // Form handlers
  const handleUpdateInfo = async () => {
    if (!ihale) return

    let finalYmTutar: number | null = editFormData.ymTutar ? parseFloat(editFormData.ymTutar) : null
    
    // Connected YM logic
    if (ymSource === "connected" && selectedYmId) {
      const activeYm = availableYms.find(y => y.id === selectedYmId)
      if (activeYm) {
        finalYmTutar = activeYm.tutar
      }
    }

    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          ymTutar: finalYmTutar,
          rKatsayisi: editFormData.rKatsayisi ? parseFloat(editFormData.rKatsayisi) : null,
          teklifimiz: editFormData.teklifimiz ? parseFloat(editFormData.teklifimiz) : null,
          selectedYmId: ymSource === "connected" ? selectedYmId : null
        })
      })

      if (!res.ok) throw new Error("İhale bilgileri güncellenemedi")
      setIsEditingInfo(false)
      fetchIhaleDetails()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Quick update ihale status
  const updateIhaleStatus = async (newStatus: string) => {
    if (!ihale) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durum: newStatus
        })
      })
      if (!res.ok) throw new Error("İhale durumu güncellenemedi")
      fetchIhaleDetails()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // File operations
  const handleFileUpload = async (file: File) => {
    try {
      setFileUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      if (fileAciklama.trim()) formData.append("aciklama", fileAciklama.trim())

      const res = await fetch(`/api/ihaleler/${ihaleId}/dosya`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error("Dosya yüklenemedi")
      setFileAciklama("")
      fetchFiles()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setFileUploading(false)
    }
  }

  const handleOnmaddeUpload = async (file: File) => {
    try {
      setOnmaddeFileUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`/api/ihaleler/${ihaleId}/onmadde`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("OnMadde dosya yüklenemedi")
      fetchOnmaddeFiles()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setOnmaddeFileUploading(false)
    }
  }

  const handleOnmaddeDownload = (fileName: string) => {
    window.open(`/api/ihaleler/${ihaleId}/onmadde?file=${encodeURIComponent(fileName)}`, "_blank")
  }

  const handleOnmaddeDelete = async (fileName: string) => {
    if (!confirm(`${fileName} dosyasını silmek istediğinize emin misiniz?`)) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/onmadde?file=${encodeURIComponent(fileName)}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("OnMadde dosya silinemedi")
      fetchOnmaddeFiles()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleFileDelete = async (file: IhaleDosyaItem) => {
    if (!confirm(`${file.dosyaAdi} dosyasını pasife almak istediğinize emin misiniz?`)) return
    try {
      const url = file.id
        ? `/api/ihaleler/${ihaleId}/dosya?fileId=${encodeURIComponent(file.id)}`
        : `/api/ihaleler/${ihaleId}/dosya?file=${encodeURIComponent(file.dosyaAdi)}`
      const res = await fetch(url, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Dosya silinemedi")
      fetchFiles()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleFileRestore = async (file: IhaleDosyaItem) => {
    if (!file.id) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/dosya?fileId=${encodeURIComponent(file.id)}`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error("Dosya geri alınamadı")
      fetchFiles()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleBackfillFiles = async () => {
    const storageOnly = files.filter((f) => f.source === "storage").map((f) => f.dosyaAdi)
    if (storageOnly.length === 0) return
    try {
      setBackfillLoading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/dosya`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileNames: storageOnly }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Metaveri oluşturulamadı")
      }
      fetchFiles()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setBackfillLoading(false)
    }
  }

  const handleFileDownload = (file: IhaleDosyaItem) => {
    const url = file.id
      ? `/api/ihaleler/${ihaleId}/dosya?fileId=${encodeURIComponent(file.id)}`
      : `/api/ihaleler/${ihaleId}/dosya?file=${encodeURIComponent(file.dosyaAdi)}`
    window.open(url, "_blank")
  }

  const handleSavePersonelParam = async () => {
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/personel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personelForm),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Personel parametreleri kaydedilemedi")
      }
      await fetchPersonelParam()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleSaveYanHakParam = async () => {
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/yan-hak`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yanHakForm),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Yan hak parametreleri kaydedilemedi")
      }
      await fetchYanHakParam()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleUpsertPuantaj = async () => {
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/puantaj`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(puantajForm),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Puantaj kaydedilemedi")
      }
      await fetchPuantajlar()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleDeletePuantaj = async (id: string) => {
    if (!confirm("Bu puantaj kaydını silmek istediğinize emin misiniz?")) return
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/puantaj?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Puantaj silinemedi")
      }
      await fetchPuantajlar()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleUpsertHakedis = async () => {
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hakedisForm),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Hakediş kaydedilemedi")
      }
      await fetchHakedisler()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleUpdateHakedisDurum = async (id: string, durum: HakedisItem["durum"]) => {
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durum }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Hakediş güncellenemedi")
      }
      await fetchHakedisler()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleDeleteHakedis = async (id: string) => {
    if (!confirm("Bu hakediş kaydını silmek istediğinize emin misiniz?")) return
    try {
      setPhase5Loading(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Hakediş silinemedi")
      }
      await fetchHakedisler()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPhase5Loading(false)
    }
  }

  const handleUploadHakedisFile = async () => {
    if (!hakedisSelectedFile) return
    try {
      setHakedisFileUploading(true)
      const formData = new FormData()
      formData.append("file", hakedisSelectedFile)
      const res = await fetch(
        `/api/ihaleler/${ihaleId}/hakedis/dosya?yil=${encodeURIComponent(String(hakedisForm.yil))}&ay=${encodeURIComponent(String(hakedisForm.ay))}`,
        { method: "POST", body: formData }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Dosya yüklenemedi")
      }
      setHakedisSelectedFile(null)
      await fetchHakedisFiles(hakedisForm.yil, hakedisForm.ay)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setHakedisFileUploading(false)
    }
  }

  const handleDownloadHakedisFile = (fileName: string) => {
    window.open(
      `/api/ihaleler/${ihaleId}/hakedis/dosya?yil=${encodeURIComponent(String(hakedisForm.yil))}&ay=${encodeURIComponent(String(hakedisForm.ay))}&file=${encodeURIComponent(fileName)}`,
      "_blank"
    )
  }

  const handleDeleteHakedisFile = async (fileName: string) => {
    if (!confirm("Bu dosyayı silmek istediğinize emin misiniz?")) return
    const res = await fetch(
      `/api/ihaleler/${ihaleId}/hakedis/dosya?yil=${encodeURIComponent(String(hakedisForm.yil))}&ay=${encodeURIComponent(String(hakedisForm.ay))}&file=${encodeURIComponent(fileName)}`,
      { method: "DELETE" }
    )
    if (res.ok) fetchHakedisFiles(hakedisForm.yil, hakedisForm.ay)
  }

  const handleSaveHakedisChecklist = async () => {
    try {
      setHakedisChecklistSaving(true)
      setHakedisChecklistError("")
      const res = await fetch(`/api/ihaleler/${ihaleId}/hakedis?mode=checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yil: hakedisForm.yil,
          ay: hakedisForm.ay,
          items: hakedisChecklistItems.map((x) => ({
            belgeKodu: x.belgeKodu,
            durum: x.durum,
            not: x.not,
            dosyaAdi: x.dosyaAdi,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Checklist kaydedilemedi")
      }
      await fetchHakedisChecklist(hakedisForm.yil, hakedisForm.ay)
    } catch (e: any) {
      setHakedisChecklistError(e?.message || "Hata oluştu")
    } finally {
      setHakedisChecklistSaving(false)
    }
  }

  const handleAddItiraz = async () => {
    try {
      setItirazSaving(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tip: itirazForm.tip,
          durum: itirazForm.durum,
          aciklama: itirazForm.aciklama.trim() ? itirazForm.aciklama.trim() : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "İtiraz eklenemedi")
      }
      setItirazForm({ tip: "IDAREYE_ITIRAZ", durum: "TASLAK", aciklama: "" })
      fetchItirazlar()
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setItirazSaving(false)
    }
  }

  const handleUpdateItirazDurum = async (id: string, nextDurum: IhaleItirazItem["durum"]) => {
    try {
      setItirazSaving(true)
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, durum: nextDurum }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Güncellenemedi")
      }
      fetchItirazlar()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setItirazSaving(false)
    }
  }

  const handleDeleteItiraz = async (id: string) => {
    if (!confirm("Bu itiraz kaydını silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Silinemedi")
      }
      fetchItirazlar()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleItirazFileUpload = async (itirazId: string, file: File) => {
    try {
      const note = (itirazFileNoteById[itirazId] || "").trim()
      const formData = new FormData()
      formData.append("file", file)
      if (note) formData.append("not", note)

      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz/${encodeURIComponent(itirazId)}/dosya`, {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Dosya yüklenemedi")
      }
      setItirazFileNoteById((prev) => ({ ...prev, [itirazId]: "" }))
      fetchItirazlar()
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleItirazFileDownload = (itirazId: string, fileId: string) => {
    window.open(`/api/ihaleler/${ihaleId}/itiraz/${encodeURIComponent(itirazId)}/dosya?fileId=${encodeURIComponent(fileId)}`, "_blank")
  }

  const handleDeleteItirazFile = async (itirazId: string, id: string) => {
    if (!confirm("Bu dosya kaydını silmek istediğinize emin misiniz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz/${encodeURIComponent(itirazId)}/dosya?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Silinemedi")
      }
      fetchItirazlar()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleSaveItirazFileNote = async (itirazId: string, id: string) => {
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/itiraz/${encodeURIComponent(itirazId)}/dosya?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ not: editingItirazBelgeNote }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Not güncellenemedi")
      }
      setEditingItirazBelgeId(null)
      setEditingItirazBelgeNote("")
      fetchItirazlar()
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Bid bond calculation / submit
  const handleAddTeminat = async () => {
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/gecici-teminat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutar: parseFloat(teminatFormData.tutar),
          banka: teminatFormData.banka,
          bitisTarihi: teminatFormData.bitisTarihi || null,
          mektupNo: teminatFormData.mektupNo
        })
      })

      if (!res.ok) throw new Error("Teminat eklenemedi")
      setTeminatFormData({ tutar: "", banka: "", bitisTarihi: "", mektupNo: "", isAutoCalc: false })
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDeleteTeminat = async (id: string) => {
    if (!confirm("Bu geçici teminatı kaldırmak istiyor musunuz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/gecici-teminat?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Teminat silinemedi")
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Auto calculate bid bond based on 3%
  useEffect(() => {
    if (teminatFormData.isAutoCalc && ihale) {
      const baseVal = editFormData.teklifimiz ? parseFloat(editFormData.teklifimiz) : (ihale.butce || 0)
      const autoVal = (baseVal * 0.03).toFixed(2)
      setTeminatFormData(prev => ({ ...prev, tutar: autoVal }))
    }
  }, [teminatFormData.isAutoCalc, editFormData.teklifimiz, ihale])

  // Assignment handlers
  const handleAddAtama = async () => {
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/atama`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(atamaFormData)
      })

      if (!res.ok) throw new Error("Görevli atanamadı")
      setAtamaFormData({ kurumKisiId: "", rol: "" })
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDeleteAtama = async (kurumKisiId: string) => {
    if (!confirm("Bu personeli görevden çıkarmak istiyor musunuz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/atama?kurumKisiId=${kurumKisiId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Atama kaldırılamadı")
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleQuickAddKisi = async () => {
    if (!ihale) return
    try {
      const res = await fetch(`/api/kurumlar/${ihale.kurumId}/kisiler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickKisiForm)
      })

      if (!res.ok) throw new Error("Kişi eklenemedi")
      const newKisi = await res.json()
      setKurumKisileri(prev => [newKisi, ...prev])
      setAtamaFormData(prev => ({ ...prev, kurumKisiId: newKisi.id }))
      setQuickKisiForm({ ad: "", soyad: "", unvan: "", telefon: "", email: "" })
      setShowQuickKisiModal(false)
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Competitor bid handlers
  const handleAddRakip = async () => {
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/rakip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rakipFirmaId: rakipFormData.rakipFirmaId,
          teklifTutar: parseFloat(rakipFormData.teklifTutar),
          bizimTeklifMi: rakipFormData.bizimTeklifMi
        })
      })

      if (!res.ok) throw new Error("Teklif eklenemedi")
      setRakipFormData({ rakipFirmaId: "", teklifTutar: "", bizimTeklifMi: false })
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDeleteRakip = async (id: string) => {
    if (!confirm("Bu teklifi kaldırmak istiyor musunuz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/rakip?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Teklif silinemedi")
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleQuickAddFirma = async () => {
    try {
      const res = await fetch(`/api/rakip-firmalar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickFirmaForm)
      })

      if (!res.ok) throw new Error("Rakip firma eklenemedi")
      const newFirma = await res.json()
      setRakipFirmalar(prev => [newFirma, ...prev])
      setRakipFormData(prev => ({ ...prev, rakipFirmaId: newFirma.id }))
      setQuickFirmaForm({ ad: "", unvan: "", vergiNo: "", il: "", telefon: "" })
      setShowQuickFirmaModal(false)
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Notes handler
  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/not`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ not: noteContent })
      })

      if (!res.ok) throw new Error("Not eklenemedi")
      setNoteContent("")
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Bu notu silmek istiyor musunuz?")) return
    try {
      const res = await fetch(`/api/ihaleler/${ihaleId}/not?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Not silinemedi")
      fetchIhaleDetails()
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Calculate sorted rankings for Tab 4
  const sortedBids = useMemo(() => {
    if (!ihale) return []
    const bidsList = ihale.rakipAnalizleri.map(r => ({
      id: r.id,
      ad: r.rakipFirma.ad,
      teklifTutar: r.teklifTutar,
      bizimTeklifMi: r.bizimTeklifMi
    }))
    
    // Include our bid from `teklifimiz` field if it exists and is not already in the list
    if (ihale.teklifimiz && !ihale.rakipAnalizleri.some(r => r.bizimTeklifMi)) {
      bidsList.push({
        id: "OUR_BID",
        ad: "Bizim Teklifimiz (ProBiddr)",
        teklifTutar: ihale.teklifimiz,
        bizimTeklifMi: true
      })
    }

    return siralaTeklifler(ihale.ymTutar || 0, ihale.sinirDeger, bidsList)
  }, [ihale])

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "-"
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(val)
  }

  const filteredKurumKisileri = useMemo(() => {
    const q = atamaKisiQuery.trim().toLowerCase()
    if (!q) return kurumKisileri
    return kurumKisileri.filter((k) => {
      const full = `${k.ad} ${k.soyad} ${k.unvan || ""} ${k.telefon || ""} ${k.email || ""}`.toLowerCase()
      return full.includes(q)
    })
  }, [atamaKisiQuery, kurumKisileri])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-on-surface-variant">İhale detayları yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error || !ihale) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm max-w-md w-full text-center space-y-4">
          <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
          <h2 className="text-xl font-bold text-on-surface">İhale Yüklenemedi</h2>
          <p className="text-on-surface-variant text-sm">{error || "Aradığınız ihale kaydı bulunamadı veya yetkiniz yok."}</p>
          <Link href="/ihaleler" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
            İhalelere Geri Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex text-on-surface font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60 pb-20">
        <TopBar />

        <main className="flex-1 p-gutter overflow-y-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-xs font-semibold text-on-surface-variant">
            <Link href="/ihaleler" className="hover:text-indigo-600 transition-colors">İhaleler</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-indigo-600 font-bold">{ihale.ihaleNo}</span>
          </nav>

          <div className="max-w-none w-full space-y-6">
            {/* Header Area */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                <span className="material-symbols-outlined text-[200px]">assignment</span>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-700/60 text-indigo-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {ihale.tur === "MAL_ALIM" ? "Mal Alımı" : ihale.tur === "HIZMET_ALIM" ? "Hizmet Alımı" : "Yapım İşi"}
                    </span>
                    <span className="bg-indigo-700/60 text-indigo-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {ihale.usul === "ACIK_IHALE" ? "Açık İhale" : ihale.usul === "BELLI_ISTEKLI" ? "Belli İstekliler" : "Doğrudan Temin"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold mt-2">{ihale.ad}</h1>
                  <p className="text-indigo-200 text-sm mt-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">corporate_fare</span>
                    {ihale.kurum.ad}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                    ihale.durum === "TASLAK" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                    ihale.durum === "DEVAM_EDİYOR" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                    ihale.durum === "KAZANILDI" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                    ihale.durum === "KAYBEDİLDİ" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                    "bg-surface-container-low text-on-surface-variant border-outline-variant"
                  }`}>
                    {ihale.durum}
                  </span>
                  <div className="text-right">
                    <span className="text-indigo-200 text-xs block">İhale Bütçesi</span>
                    <span className="text-lg font-bold">{formatCurrency(ihale.butce)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-xl p-1 shadow-sm overflow-x-auto">
              <button 
                onClick={() => setActiveTab("genel")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "genel" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                Genel Bilgiler
              </button>
              <button 
                onClick={() => setActiveTab("teminat")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "teminat" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                Geçici Teminatlar
              </button>
              <button 
                onClick={() => setActiveTab("atamalar")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "atamalar" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">groups</span>
                Atamalar
              </button>
              <button 
                onClick={() => setActiveTab("degerlendirme")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "degerlendirme" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">query_stats</span>
                Değerlendirme & Sınır Değer
              </button>
              <button 
                onClick={() => setActiveTab("notlar")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "notlar" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Notlar
              </button>
              <button 
                onClick={() => setActiveTab("itiraz")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "itiraz" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                İtirazlar
              </button>
              <button 
                onClick={() => setActiveTab("puantaj")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "puantaj" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Puantaj
              </button>
              <button 
                onClick={() => setActiveTab("hakedis")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                  activeTab === "hakedis" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Hakediş
              </button>
              {ihale.durum === "KAZANILDI" && (
                <button 
                  onClick={() => setActiveTab("sozlesme")}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                    activeTab === "sozlesme" ? "bg-indigo-50 text-indigo-700 shadow-sm animate-pulse" : "text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Sözleşme Detayları
                </button>
              )}
              {ihale.durum === "KAZANILDI" && ihale.sozlesme ? (
                <button 
                  onClick={() => setActiveTab("operasyon")}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                    activeTab === "operasyon" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                  Operasyon
                </button>
              ) : null}
              {/* 10. Madde Tab */}
              {ihale.durum === "KAZANILDI" && (
                <button 
                  onClick={() => setActiveTab("onmadde")}
                  className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[120px] ${
                    activeTab === "onmadde" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">article</span>
                  10. Madde Belgeleri
                </button>
              )}
            </div>

            {/* TAB CONTENTS */}

            {/* TAB 1: GENEL BİLGİLER */}
            {activeTab === "genel" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Details form/card */}
                <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">description</span>
                      İhale Temel Bilgileri
                    </h3>
                    <button 
                      onClick={() => setIsEditingInfo(!isEditingInfo)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">{isEditingInfo ? "close" : "edit"}</span>
                      {isEditingInfo ? "İptal Et" : "Düzenle"}
                    </button>
                  </div>

                  {!isEditingInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">İhale İKN (No)</span>
                        <span className="font-semibold text-on-surface">{ihale.ihaleNo}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">İhale Türü</span>
                        <span className="font-semibold text-on-surface">
                          {ihale.tur === "MAL_ALIM" ? "Mal Alımı" : ihale.tur === "HIZMET_ALIM" ? "Hizmet Alımı" : "Yapım İşi"}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">İhale Usulü</span>
                        <span className="font-semibold text-on-surface">
                          {ihale.usul === "ACIK_IHALE" ? "Açık İhale" : ihale.usul === "BELLI_ISTEKLI" ? "Belli İstekli" : "Doğrudan Temin"}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">Teklif Son Tarihi</span>
                        <span className="font-semibold text-on-surface">
                          {ihale.teklifSonTarihi ? new Date(ihale.teklifSonTarihi).toLocaleString("tr-TR") : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">Yaklaşık Maliyet</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-on-surface">{formatCurrency(ihale.ymTutar)}</span>
                          {ihale.ymTutar && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              ymSource === "connected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {ymSource === "connected" ? "⇠ YM (Bağlı)" : "⇠ Manuel"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">Bizim Teklifimiz</span>
                        <span className="font-bold text-indigo-700">{formatCurrency(ihale.teklifimiz)}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">R Katsayısı (Katsayı R)</span>
                        <span className="font-bold text-on-surface">{ihale.rKatsayisi !== null ? ihale.rKatsayisi : "-"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-on-surface-variant text-xs block font-bold uppercase tracking-wider">İşin Açıklaması</span>
                        <p className="text-on-surface-variant mt-1 whitespace-pre-line leading-relaxed">{ihale.aciklama || "Açıklama girilmemiş."}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">İhale Adı</label>
                          <input 
                            type="text" 
                            required
                            value={editFormData.ad}
                            onChange={e => setEditFormData(prev => ({ ...prev, ad: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">İhale İKN (No)</label>
                          <input 
                            type="text" 
                            required
                            value={editFormData.ihaleNo}
                            onChange={e => setEditFormData(prev => ({ ...prev, ihaleNo: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Bütçe (TL)</label>
                          <input 
                            type="number" 
                            required
                            value={editFormData.butce}
                            onChange={e => setEditFormData(prev => ({ ...prev, butce: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-right"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Durum</label>
                          <select 
                            value={editFormData.durum}
                            onChange={e => setEditFormData(prev => ({ ...prev, durum: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="TASLAK">TASLAK</option>
                            <option value="DEVAM_EDİYOR">DEVAM EDİYOR</option>
                            <option value="KAZANILDI">KAZANILDI</option>
                            <option value="KAYBEDİLDİ">KAYBEDİLDİ</option>
                            <option value="İPTAL">İPTAL</option>
                          </select>
                        </div>

                        {/* YM Source Switcher */}
                        <div className="md:col-span-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-4">
                          <label className="text-xs font-bold text-on-surface-variant uppercase block">Yaklaşık Maliyet (YM) Kaynağı</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                              <input 
                                type="radio" 
                                checked={ymSource === "manual"}
                                onChange={() => setYmSource("manual")}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              Manuel Giriş
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                              <input 
                                type="radio" 
                                checked={ymSource === "connected"}
                                onChange={() => setYmSource("connected")}
                                className="text-indigo-600 focus:ring-indigo-500"
                                disabled={availableYms.length === 0}
                              />
                              Bağlı Yaklaşık Maliyet Modülü {availableYms.length === 0 && <span className="text-[10px] text-amber-600 font-normal">(Aktif kayıt yok)</span>}
                            </label>
                          </div>

                          {ymSource === "manual" ? (
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Manuel Yaklaşık Maliyet Tutarı (TL)</label>
                              <input 
                                type="number" 
                                placeholder="Tutar girin"
                                value={editFormData.ymTutar}
                                onChange={e => setEditFormData(prev => ({ ...prev, ymTutar: e.target.value }))}
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-right"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Aktif Yaklaşık Maliyet Seçin</label>
                              <select 
                                value={selectedYmId}
                                onChange={e => setSelectedYmId(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                              >
                                <option value="">-- YM Seçin --</option>
                                {availableYms.map(y => (
                                  <option key={y.id} value={y.id}>
                                    {y.versiyonNo} - {formatCurrency(y.tutar)} {y.aktifMi ? "(Aktif)" : ""} {y.ihale ? `(İhale: ${y.ihale.ihaleNo})` : "(Boşta)"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">R Katsayısı (Limit Değer R)</label>
                          <input 
                            type="number" 
                            step="0.0001"
                            placeholder="Örn: 0.79"
                            value={editFormData.rKatsayisi}
                            onChange={e => setEditFormData(prev => ({ ...prev, rKatsayisi: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Bizim Teklifimiz (TL)</label>
                          <input 
                            type="number" 
                            placeholder="Tutar girin"
                            value={editFormData.teklifimiz}
                            onChange={e => setEditFormData(prev => ({ ...prev, teklifimiz: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-right"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Teklif Son Tarihi</label>
                          <input 
                            type="datetime-local" 
                            value={editFormData.teklifSonTarihi}
                            onChange={e => setEditFormData(prev => ({ ...prev, teklifSonTarihi: e.target.value }))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Açıklama</label>
                          <textarea 
                            value={editFormData.aciklama}
                            onChange={e => setEditFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                            rows={3}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setIsEditingInfo(false)}
                          className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded-lg text-sm font-semibold transition-colors"
                        >
                          İptal
                        </button>
                        <button 
                          type="button"
                          onClick={handleUpdateInfo}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          Değişiklikleri Kaydet
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* File/Document Depository (5/12 cols) */}
                <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">folder_open</span>
                    İhale Dosya Arşivi
                  </h3>
                  
                  <div className="space-y-4">
                    {/* File Upload Zone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Dosya Açıklaması (Opsiyonel)</label>
                      <input
                        type="text"
                        value={fileAciklama}
                        onChange={(e) => setFileAciklama(e.target.value)}
                        placeholder="Örn: İdari Şartname, Teknik Şartname, EKAP Çıktısı..."
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <FileUpload 
                      onFileSelect={handleFileUpload} 
                      disabled={fileUploading} 
                      maxSize={20 * 1024 * 1024} 
                    />
                    
                    {fileUploading && (
                      <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Dosya yükleniyor, lütfen bekleyin...
                      </p>
                    )}

                    {/* Files List */}
                    <div className="space-y-2 pt-2 max-h-[300px] overflow-y-auto pr-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Yüklenen Evraklar ({files.length})</span>
                        <div className="flex items-center gap-3">
                          {files.some((f) => f.source === "storage") ? (
                            <button
                              type="button"
                              onClick={handleBackfillFiles}
                              disabled={backfillLoading}
                              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-60 disabled:cursor-not-allowed"
                              title="Storage'da bulunan ama DB kaydı olmayan dosyalar için metaveri oluştur"
                            >
                              {backfillLoading ? "Metaveri Oluşturuluyor..." : "Metaveri Oluştur"}
                            </button>
                          ) : null}
                          <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={showInactiveFiles}
                              onChange={(e) => setShowInactiveFiles(e.target.checked)}
                            />
                            Pasifleri Göster
                          </label>
                        </div>
                      </div>
                      {files.length === 0 ? (
                        <div className="text-center py-8 bg-surface-container-low rounded-lg border border-dashed border-outline-variant text-on-surface-variant text-xs">
                          Bu ihaleye ait yüklenmiş dosya bulunmamaktadır.
                        </div>
                      ) : (
                        files.map((file, idx) => (
                          <div key={file.id || `${file.dosyaAdi}_${idx}`} className="flex justify-between items-center p-3 bg-surface-container-low hover:bg-surface-container rounded-lg border border-outline-variant transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-indigo-600 flex-shrink-0">article</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="text-xs font-semibold text-on-surface truncate max-w-[200px]" title={file.dosyaAdi}>
                                    {file.dosyaAdi}
                                  </div>
                                  {file.durum === "PASIF" ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex-shrink-0">
                                      PASİF
                                    </span>
                                  ) : null}
                                </div>
                                {file.aciklama ? (
                                  <div className="text-[10px] text-on-surface-variant truncate max-w-[220px]" title={file.aciklama}>
                                    {file.aciklama}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {file.durum === "PASIF" && file.id ? (
                                <button 
                                  onClick={() => handleFileRestore(file)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                  title="Geri Al"
                                >
                                  <span className="material-symbols-outlined text-[18px]">restore</span>
                                </button>
                              ) : null}
                              <button 
                                onClick={() => setPreviewFile(file)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Önizleme"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              <button 
                                onClick={() => handleFileDownload(file)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="İndir"
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                              </button>
                              <button 
                                onClick={() => handleFileDelete(file)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Pasife Al"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GEÇİCİ TEMİNATLAR */}
            {activeTab === "teminat" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Addition Form */}
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">add_card</span>
                    Geçici Teminat Ekle
                  </h3>

                  <div className="space-y-4">
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant space-y-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Tutar Hesaplama Modu</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input 
                            type="radio" 
                            checked={!teminatFormData.isAutoCalc}
                            onChange={() => setTeminatFormData(p => ({ ...p, isAutoCalc: false }))}
                          />
                          Manuel Tutar
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input 
                            type="radio" 
                            checked={teminatFormData.isAutoCalc}
                            onChange={() => setTeminatFormData(p => ({ ...p, isAutoCalc: true }))}
                          />
                          Otomatik (%3 Hesapla)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Teminat Tutarı (TL)</label>
                      <input 
                        type="number" 
                        required
                        disabled={teminatFormData.isAutoCalc}
                        placeholder="0.00"
                        value={teminatFormData.tutar}
                        onChange={e => setTeminatFormData(prev => ({ ...prev, tutar: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-right"
                      />
                      {teminatFormData.isAutoCalc && (
                        <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                          * Bizim teklifimiz (%3) baz alınarak otomatik hesaplandı.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Banka Adı</label>
                      <select 
                        required
                        value={teminatFormData.banka}
                        onChange={e => setTeminatFormData(prev => ({ ...prev, banka: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">-- Banka Seçin --</option>
                        {bankalar.map(b => {
                          const remainingLimit = b.toplamLimit - b.kullanilanLimit;
                          return (
                            <option key={b.id} value={b.ad}>
                              {b.ad} (Toplam: {formatCurrency(b.toplamLimit)} / Kalan: {formatCurrency(remainingLimit)})
                            </option>
                          );
                        })}
                      </select>
                      {(() => {
                        const selectedBankaObj = bankalar.find(b => b.ad === teminatFormData.banka);
                        if (selectedBankaObj && teminatFormData.tutar) {
                          const remainingLimit = selectedBankaObj.toplamLimit - selectedBankaObj.kullanilanLimit;
                          const isLimitExceeded = parseFloat(teminatFormData.tutar) > remainingLimit;
                          if (isLimitExceeded) {
                            return (
                              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                Yetersiz banka limiti! (Kalan Limit: {formatCurrency(remainingLimit)})
                              </div>
                            );
                          } else {
                            return (
                              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Limit yeterli. (Kalan Limit: {formatCurrency(remainingLimit)})
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Mektup No</label>
                      <input 
                        type="text" 
                        placeholder="Örn: MKT-12345"
                        value={teminatFormData.mektupNo}
                        onChange={e => setTeminatFormData(prev => ({ ...prev, mektupNo: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Geçerlilik Tarihi</label>
                      <input 
                        type="date" 
                        value={teminatFormData.bitisTarihi}
                        onChange={e => setTeminatFormData(prev => ({ ...prev, bitisTarihi: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddTeminat}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
                    >
                      Geçici Teminat Ekle
                    </button>
                  </div>
                </div>

                {/* List Table */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">list_alt</span>
                      Geçici Teminat Mektupları Listesi
                    </h3>
                    <div className="text-right">
                      <span className="text-on-surface-variant text-xs block font-semibold">Toplam Geçici Teminat</span>
                      <span className="text-base font-bold text-indigo-700">
                        {formatCurrency(ihale.geciciTeminatlar.reduce((sum, item) => sum + item.tutar, 0))}
                      </span>
                    </div>
                  </div>

                  {ihale.geciciTeminatlar.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant text-sm space-y-2">
                      <span className="material-symbols-outlined text-4xl block text-on-surface-variant">credit_card_off</span>
                      <p>Bu ihale için henüz geçici teminat tanımlanmamış.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Banka</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Mektup No</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Vade</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider text-right">Tutar</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider text-center">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-semibold text-on-surface">
                          {ihale.geciciTeminatlar.map((teminat) => (
                            <tr key={teminat.id} className="hover:bg-surface-container transition-colors">
                              <td className="px-4 py-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-600">account_balance</span>
                                {teminat.banka || "-"}
                              </td>
                              <td className="px-4 py-4">{teminat.mektupNo || "-"}</td>
                              <td className="px-4 py-4">
                                {teminat.bitisTarihi ? new Date(teminat.bitisTarihi).toLocaleDateString("tr-TR") : "-"}
                              </td>
                              <td className="px-4 py-4 text-right text-indigo-700 font-bold">{formatCurrency(teminat.tutar)}</td>
                              <td className="px-4 py-4 text-center">
                                <button 
                                  onClick={() => handleDeleteTeminat(teminat.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all mx-auto"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ATAMALAR */}
            {activeTab === "atamalar" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Assigner Picker Card */}
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">person_add</span>
                    Görevli Ata
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase">Kişi Seçin</label>
                        <button 
                          type="button"
                          onClick={() => setShowQuickKisiModal(true)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          + Yeni Kişi Ekle
                        </button>
                      </div>
                      <input
                        type="text"
                        value={atamaKisiQuery}
                        onChange={(e) => setAtamaKisiQuery(e.target.value)}
                        placeholder="Ara (ad, soyad, unvan, telefon...)"
                        className="w-full mb-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <select 
                        required
                        value={atamaFormData.kurumKisiId}
                        onChange={e => setAtamaFormData(prev => ({ ...prev, kurumKisiId: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">-- Kişi Seçin --</option>
                        {filteredKurumKisileri.map(kisi => (
                          <option key={kisi.id} value={kisi.id}>
                            {kisi.ad} {kisi.soyad} {kisi.unvan ? `(${kisi.unvan})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Komisyon Rolü / Görevi</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Komisyon Başkanı, Mali Üye vb."
                        value={atamaFormData.rol}
                        onChange={e => setAtamaFormData(prev => ({ ...prev, rol: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddAtama}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
                    >
                      Kişiyi İhaleye Ata
                    </button>
                  </div>
                </div>

                {/* List Table */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">badge</span>
                    Atanan İhale Komisyonu & Sorumlular
                  </h3>

                  {ihale.atamalar.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant text-sm space-y-2">
                      <span className="material-symbols-outlined text-4xl block text-on-surface-variant">group_off</span>
                      <p>Bu ihale için henüz görev ataması yapılmamış.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ihale.atamalar.map((atama) => (
                        <div key={atama.id} className="flex justify-between items-center p-4 bg-surface-container-low border border-outline-variant rounded-xl relative overflow-hidden">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                              {atama.kurumKisi.ad[0]}{atama.kurumKisi.soyad[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-on-surface">{atama.kurumKisi.ad} {atama.kurumKisi.soyad}</h4>
                              <p className="text-xs text-indigo-600 font-semibold">{atama.rol || "Üye"}</p>
                              {atama.kurumKisi.telefon && <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">phone</span> {atama.kurumKisi.telefon}</p>}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteAtama(atama.kurumKisi.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Atamayı Kaldır"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DEĞERLENDİRME & SINIR DEĞER */}
            {activeTab === "degerlendirme" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Border Value Formula Banner */}
                <div className="lg:col-span-12 bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-indigo-600">calculate</span>
                      Kanun 4734’e göre Hizmet Alımı Sınır Değer Hesabı Formülü
                    </h4>
                    <p className="text-xs text-indigo-700 font-medium">
                      SD = ((YM + Σ Tn) / (n + 1)) * R
                    </p>
                    <p className="text-[10px] text-indigo-600/80 italic font-semibold">
                      * Tn: Yaklaşık Maliyet’e (YM) eşit veya daha düşük olan geçerli teklifler. n: Tn’e giren teklif sayısı. R: Katsayı.
                    </p>
                  </div>
                  <div className="bg-indigo-900 text-white rounded-lg px-4 py-3 text-right">
                    <span className="text-[10px] block font-bold tracking-wider text-indigo-200">HESAPLANAN SINIR DEĞER</span>
                    <span className="text-xl font-bold">{formatCurrency(ihale.sinirDeger)}</span>
                  </div>
                </div>

                {(!ihale.ymTutar || !ihale.rKatsayisi) && (
                  <div className="lg:col-span-12 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                      <span>
                        {!ihale.ymTutar && !ihale.rKatsayisi 
                          ? "Sınır değer hesaplanabilmesi için Yaklaşık Maliyet (YM) ve Katsayı (R) tanımlanmalıdır."
                          : !ihale.ymTutar 
                            ? "Sınır değer hesaplanabilmesi için Yaklaşık Maliyet (YM) tanımlanmalıdır."
                            : "Sınır değer hesaplanabilmesi için Katsayı (R) tanımlanmalıdır."
                        }
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab("genel");
                        setIsEditingInfo(true);
                      }}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors ml-auto md:ml-0"
                    >
                      Şimdi Tanımla
                    </button>
                  </div>
                )}

                {/* Left Side: Bid Adder */}
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">add_circle</span>
                    Teklif Girişi Yap
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase">Firma Seçin</label>
                        <button 
                          type="button"
                          onClick={() => setShowQuickFirmaModal(true)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          + Yeni Firma Ekle
                        </button>
                      </div>
                      <select 
                        required
                        value={rakipFormData.rakipFirmaId}
                        onChange={e => setRakipFormData(prev => ({ ...prev, rakipFirmaId: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">-- Firma Seçin --</option>
                        {rakipFirmalar.map(firma => (
                          <option key={firma.id} value={firma.id}>
                            {firma.ad}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Teklif Tutarı (TL)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Tutar girin"
                        value={rakipFormData.teklifTutar}
                        onChange={e => setRakipFormData(prev => ({ ...prev, teklifTutar: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-right"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="bizimTeklifMi"
                        checked={rakipFormData.bizimTeklifMi}
                        onChange={e => setRakipFormData(prev => ({ ...prev, bizimTeklifMi: e.target.checked }))}
                        className="text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <label htmlFor="bizimTeklifMi" className="text-xs font-bold text-on-surface cursor-pointer">
                        Bizim Teklifimiz mi? (ProBiddr)
                      </label>
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddRakip}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-2"
                    >
                      Teklifi Kaydet
                    </button>
                  </div>
                </div>

                {/* Right Side: Interactive Table */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-outline-variant gap-2">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">table_view</span>
                      Birim Fiyat Teklif Cetveli & Sıralama
                    </h3>
                    <div className="flex items-center gap-2">
                      {ihale.durum !== "İPTAL" ? (
                        <button 
                          onClick={() => {
                            if (confirm("İhaleyi İptal etmek istediğinize emin misiniz?")) {
                              updateIhaleStatus("İPTAL");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[15px]">block</span>
                          İptal Et
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-surface-container-low text-on-surface text-xs font-bold rounded-lg border border-outline-variant">
                          İptal Edildi
                        </span>
                      )}
                      {(ihale.durum === "KAZANILDI" || ihale.durum === "KAYBEDİLDİ" || ihale.durum === "İPTAL") && (
                        <button 
                          onClick={() => updateIhaleStatus("DEVAM_EDİYOR")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[15px]">settings_backup_restore</span>
                          Geri Al (Aktifleştir)
                        </button>
                      )}
                    </div>
                  </div>

                  {sortedBids.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant text-sm space-y-2">
                      <span className="material-symbols-outlined text-4xl block text-on-surface-variant">format_list_bulleted</span>
                      <p>Sıralanacak teklif bulunmamaktadır. Soldan teklif girişi yapabilirsiniz.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider w-16">Sıra</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Teklif Veren Firma</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider text-right">Teklif Tutarı</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider text-right">Kırım</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Sınır Değer Durumu</th>
                            <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider text-center">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-semibold text-on-surface">
                          {sortedBids.map((bidder) => {
                            const isBelowSD = ihale.sinirDeger !== null && bidder.teklifTutar < ihale.sinirDeger
                            return (
                              <tr key={bidder.id} className={`hover:bg-surface-container transition-colors ${bidder.bizimTeklifMi ? "bg-indigo-50/60 font-bold" : ""}`}>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    bidder.sira === 1 ? "bg-emerald-100 text-emerald-800" : "bg-surface-container-low text-on-surface-variant"
                                  }`}>
                                    {bidder.sira}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="flex items-center gap-1.5">
                                    {bidder.firmaAdi}
                                    {bidder.bizimTeklifMi && (
                                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">BİZ</span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">{formatCurrency(bidder.teklifTutar)}</td>
                                <td className="px-4 py-4 text-right text-emerald-700">% {bidder.kirimOrani}%</td>
                                <td className="px-4 py-4">
                                  {isBelowSD ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      Aşırı Düşük Sorgu
                                    </span>
                                  ) : bidder.sira === 1 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      En Avantajlı Teklif
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-low text-on-surface-variant border border-outline-variant">
                                      Sıralamada
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex justify-center items-center gap-2">
                                    {bidder.bizimTeklifMi ? (
                                      ihale.durum !== "KAZANILDI" && (
                                        <button 
                                          onClick={() => {
                                            if (confirm("İhaleyi KAZANILDI olarak sonlandırmak istiyor musunuz?")) {
                                              updateIhaleStatus("KAZANILDI");
                                            }
                                          }}
                                          title="İhaleyi Kazanıldı Olarak Sonlandır"
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">emoji_events</span>
                                          Kazanıldı
                                        </button>
                                      )
                                    ) : (
                                      <>
                                        {ihale.durum !== "KAYBEDİLDİ" && (
                                          <button 
                                            onClick={() => {
                                              if (confirm("İhaleyi KAYBEDİLDİ olarak sonlandırmak istiyor musunuz?")) {
                                                updateIhaleStatus("KAYBEDİLDİ");
                                              }
                                            }}
                                            title="İhaleyi Kaybedildi Olarak Sonlandır"
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition-all"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">trending_down</span>
                                            Kaybedildi
                                          </button>
                                        )}
                                        {bidder.id !== "OUR_BID" && (
                                          <button 
                                            onClick={() => handleDeleteRakip(bidder.id)}
                                            title="Teklifi Sil"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                          >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: NOTLAR */}
            {activeTab === "notlar" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Note Adder */}
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">rate_review</span>
                    Yeni Not Ekle
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Not İçeriği</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="İhale süreciyle ilgili notlarınızı buraya yazın..."
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddNote}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Notu Kaydet
                    </button>
                  </div>
                </div>

                {/* Notes Chronology Timeline */}
                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">timeline</span>
                    Zaman Tüneli / Not Geçmişi
                  </h3>

                  {ihale.notlar.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant text-sm space-y-2">
                      <span className="material-symbols-outlined text-4xl block text-on-surface-variant">chat_bubble_outline</span>
                      <p>Bu ihale için henüz herhangi bir not eklenmemiş.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {ihale.notlar.map((not) => (
                        <div key={not.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2 relative group hover:bg-surface-container transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-indigo-700">{not.yazar}</span>
                              <span className="text-[10px] text-on-surface-variant font-semibold block mt-0.5">
                                {new Date(not.createdAt).toLocaleString("tr-TR")}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleDeleteNote(not.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                              title="Sil"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                          <p className="text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed">{not.not}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: İTİRAZLAR */}
            {activeTab === "itiraz" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <h3 className="text-lg font-bold text-indigo-900 pb-4 border-b border-outline-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined">gavel</span>
                    Yeni İtiraz Ekle
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Tip</label>
                      <select
                        value={itirazForm.tip}
                        onChange={(e) => setItirazForm((p) => ({ ...p, tip: e.target.value as any }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="IDAREYE_ITIRAZ">İdareye İtiraz</option>
                        <option value="KIK_ITIRAZI">KİK İtirazı</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Durum</label>
                      <select
                        value={itirazForm.durum}
                        onChange={(e) => setItirazForm((p) => ({ ...p, durum: e.target.value as any }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="TASLAK">Taslak</option>
                        <option value="GONDERILDI">Gönderildi</option>
                        <option value="REDDEDILDI">Reddedildi</option>
                        <option value="KABUL_EDILDI">Kabul Edildi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Açıklama (Opsiyonel)</label>
                      <textarea
                        rows={3}
                        value={itirazForm.aciklama}
                        onChange={(e) => setItirazForm((p) => ({ ...p, aciklama: e.target.value }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Örn: Süre/ilan itirazı, zeyilname talebi..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItiraz}
                      disabled={itirazSaving}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      {itirazSaving ? "Kaydediliyor..." : "İtirazı Kaydet"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">folder</span>
                      İtiraz Kayıtları
                    </h3>
                    <button
                      type="button"
                      onClick={fetchItirazlar}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      title="Yenile"
                    >
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                      Yenile
                    </button>
                  </div>

                  {itirazLoading ? (
                    <div className="text-center py-12 text-on-surface-variant text-sm">Yükleniyor...</div>
                  ) : itirazError ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800">{itirazError}</div>
                  ) : itirazlar.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-sm">
                      Bu ihaleye ait itiraz kaydı bulunmamaktadır.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                      {itirazlar.map((it) => (
                        <div key={it.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-700">
                                  {it.tip === "IDAREYE_ITIRAZ" ? "İdareye İtiraz" : "KİK İtirazı"}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface">
                                  {it.durum}
                                </span>
                              </div>
                              <div className="text-[10px] text-on-surface-variant font-semibold mt-0.5">
                                Başvuru: {new Date(it.basvuruTarihi).toLocaleString("tr-TR")}
                                {it.kararTarihi ? ` • Karar: ${new Date(it.kararTarihi).toLocaleDateString("tr-TR")}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <select
                                value={it.durum}
                                onChange={(e) => handleUpdateItirazDurum(it.id, e.target.value as any)}
                                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                title="Durumu Güncelle (Yetkili)"
                              >
                                <option value="TASLAK">Taslak</option>
                                <option value="GONDERILDI">Gönderildi</option>
                                <option value="REDDEDILDI">Reddedildi</option>
                                <option value="KABUL_EDILDI">Kabul Edildi</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteItiraz(it.id)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Sil (Yetkili)"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {it.aciklama ? (
                            <div className="text-xs text-on-surface whitespace-pre-wrap">{it.aciklama}</div>
                          ) : null}

                          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Belgeler</span>
                              <span className="text-[10px] font-bold text-on-surface-variant">{it.belgeler.length} dosya</span>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Dosya Notu (Opsiyonel)</label>
                              <input
                                type="text"
                                value={itirazFileNoteById[it.id] || ""}
                                onChange={(e) => setItirazFileNoteById((p) => ({ ...p, [it.id]: e.target.value }))}
                                placeholder="Örn: EKAP ekran görüntüsü, dilekçe taslağı..."
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>

                            <FileUpload onFileSelect={(file) => handleItirazFileUpload(it.id, file)} disabled={false} maxSize={20 * 1024 * 1024} />

                            {it.belgeler.length === 0 ? (
                              <div className="text-center py-6 bg-surface-container-low rounded-lg border border-dashed border-outline-variant text-on-surface-variant text-xs">
                                Bu itiraza ait dosya bulunmamaktadır.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {it.belgeler.map((b) => (
                                  <div key={b.id} className="flex items-start justify-between gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-on-surface truncate" title={b.ad}>
                                        {b.ad}
                                      </div>
                                      {editingItirazBelgeId === b.id ? (
                                        <div className="mt-2 space-y-2">
                                          <textarea
                                            rows={2}
                                            value={editingItirazBelgeNote}
                                            onChange={(e) => setEditingItirazBelgeNote(e.target.value)}
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                            placeholder="Dosya notu..."
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleSaveItirazFileNote(it.id, b.id)}
                                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                                            >
                                              Kaydet
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingItirazBelgeId(null)
                                                setEditingItirazBelgeNote("")
                                              }}
                                              className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-lowest"
                                            >
                                              Vazgeç
                                            </button>
                                          </div>
                                        </div>
                                      ) : b.not ? (
                                        <div className="text-[10px] text-on-surface-variant mt-1 whitespace-pre-wrap">{b.not}</div>
                                      ) : (
                                        <div className="text-[10px] text-on-surface-variant mt-1">Not yok</div>
                                      )}
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleItirazFileDownload(it.id, b.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="İndir"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingItirazBelgeId(b.id)
                                          setEditingItirazBelgeNote(b.not || "")
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="Not Düzenle"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItirazFile(it.id, b.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                        title="Sil (Yetkili)"
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "puantaj" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">settings</span>
                      Personel Parametreleri
                    </h3>
                    <button
                      type="button"
                      onClick={() => { fetchPersonelParam(); fetchYanHakParam() }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                      Yenile
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Toplam Personel Sayısı</label>
                      <input
                        type="number"
                        value={personelForm.personelSayisi}
                        onChange={(e) => setPersonelForm((p) => ({ ...p, personelSayisi: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Asgari Ücret Yüzdesi (%)</label>
                      <input
                        type="number"
                        value={personelForm.asgariUcretYuzde}
                        onChange={(e) => setPersonelForm((p) => ({ ...p, asgariUcretYuzde: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSavePersonelParam}
                      disabled={phase5Loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      {phase5Loading ? "Kaydediliyor..." : personelParam ? "Güncelle" : "Kaydet"}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-outline-variant space-y-4">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">paid</span>
                      Yan Hak Parametreleri
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Gün Sayısı</label>
                        <input
                          type="number"
                          value={yanHakForm.yanHakGunSayisi}
                          onChange={(e) =>
                            setYanHakForm((p) => ({
                              ...p,
                              yanHakGunSayisi: Math.max(0, Math.min(31, Number(e.target.value) || 0)),
                            }))
                          }
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          min={0}
                          max={31}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Yemek Tipi</label>
                        <select
                          value={yanHakForm.yemekTip}
                          onChange={(e) =>
                            setYanHakForm((p) => {
                              const yemekTip =
                                e.target.value === "AYNI" || e.target.value === "IDARE_SAGLAR" ? e.target.value : "NAKDI"
                              return { ...p, yemekTip, yemekGunluk: yemekTip === "NAKDI" ? p.yemekGunluk : 0 }
                            })
                          }
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        >
                          <option value="NAKDI">Nakdi</option>
                          <option value="AYNI">Ayni</option>
                          <option value="IDARE_SAGLAR">İdare Sağlar</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Yol (Günlük)</label>
                        <input
                          type="number"
                          value={yanHakForm.yolGunluk}
                          onChange={(e) => setYanHakForm((p) => ({ ...p, yolGunluk: Number(e.target.value) || 0 }))}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          min={0}
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Yemek (Günlük)</label>
                        <input
                          type="number"
                          value={yanHakForm.yemekGunluk}
                          onChange={(e) => setYanHakForm((p) => ({ ...p, yemekGunluk: Number(e.target.value) || 0 }))}
                          disabled={yanHakForm.yemekTip !== "NAKDI"}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-60"
                          min={0}
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">Fazla Mesai Saat Ücreti</label>
                        <input
                          type="number"
                          value={yanHakForm.fazlaMesaiSaatUcreti}
                          onChange={(e) => setYanHakForm((p) => ({ ...p, fazlaMesaiSaatUcreti: Number(e.target.value) || 0 }))}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveYanHakParam}
                      disabled={phase5Loading}
                      className="w-full border border-outline-variant text-on-surface hover:bg-surface-container-low disabled:opacity-60 font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      {phase5Loading ? "Kaydediliyor..." : yanHakParam ? "Güncelle" : "Kaydet"}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">calendar_today</span>
                      Puantaj Kayıtları
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(`/api/ihaleler/${ihaleId}/puantaj/export`, "_blank")}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                        title="Excel (CSV) indir"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Excel (CSV)
                      </button>
                      <button
                        type="button"
                        onClick={fetchPuantajlar}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Yenile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Yıl</label>
                      <input
                        type="number"
                        value={puantajForm.yil}
                        onChange={(e) => setPuantajForm((p) => ({ ...p, yil: Number(e.target.value) || new Date().getFullYear() }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Ay</label>
                      <input
                        type="number"
                        value={puantajForm.ay}
                        onChange={(e) => setPuantajForm((p) => ({ ...p, ay: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={1}
                        max={12}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Çalışma Günü</label>
                      <input
                        type="number"
                        value={puantajForm.calismaGunu}
                        onChange={(e) => setPuantajForm((p) => ({ ...p, calismaGunu: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Devamsızlık</label>
                      <input
                        type="number"
                        value={puantajForm.devamsizlikGunu}
                        onChange={(e) => setPuantajForm((p) => ({ ...p, devamsizlikGunu: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Fazla Mesai (saat)</label>
                      <input
                        type="number"
                        value={puantajForm.fazlaMesaiSaat}
                        onChange={(e) => setPuantajForm((p) => ({ ...p, fazlaMesaiSaat: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.5"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={handleUpsertPuantaj}
                        disabled={phase5Loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>

                  {puantajlar.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-sm">Henüz puantaj kaydı yok.</div>
                  ) : (
                    <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                      {puantajlar.map((p) => (
                        <div key={p.id} className="p-4 border border-outline-variant rounded-xl bg-surface-container-lowest flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-indigo-900">{p.ay}.{p.yil}</div>
                            <div className="text-xs text-on-surface-variant mt-1">
                              Çalışma: <span className="font-semibold">{p.calismaGunu}</span> • Devamsızlık:{" "}
                              <span className="font-semibold">{p.devamsizlikGunu}</span> • Fazla Mesai:{" "}
                              <span className="font-semibold">{p.fazlaMesaiSaat}</span>
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                              Oluşturma: {new Date(p.createdAt).toLocaleString("tr-TR")}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePuantaj(p.id)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Sil"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "hakedis" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">tune</span>
                      Parametreler
                    </h3>
                    <button
                      type="button"
                      onClick={() => { fetchPersonelParam(); fetchYanHakParam() }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                      Yenile
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                      <span className="text-on-surface-variant font-semibold">Personel</span>
                      <span className="font-bold text-on-surface">{personelForm.personelSayisi}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                      <span className="text-on-surface-variant font-semibold">Asgari Ücret %</span>
                      <span className="font-bold text-on-surface">{personelForm.asgariUcretYuzde}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                      <span className="text-on-surface-variant font-semibold">Yol (Günlük)</span>
                      <span className="font-bold text-on-surface">{yanHakForm.yolGunluk}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                      <span className="text-on-surface-variant font-semibold">Yemek (Günlük)</span>
                      <span className="font-bold text-on-surface">{yanHakForm.yemekGunluk}</span>
                    </div>
                    <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                      <span className="text-on-surface-variant font-semibold">Fazla Mesai Saat Ücreti</span>
                      <span className="font-bold text-on-surface">{yanHakForm.fazlaMesaiSaatUcreti}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant space-y-3">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">calculate</span>
                      Hakediş Önizleme (Form)
                    </h4>
                    <div className="text-xs text-on-surface-variant space-y-1">
                      <div className="flex justify-between"><span>KDV Tutarı</span><span className="font-bold">{formatCurrency((hakedisForm.brutTutar * hakedisForm.kdvOrani) / 100)}</span></div>
                      <div className="flex justify-between"><span>Stopaj Tutarı</span><span className="font-bold">{formatCurrency((hakedisForm.brutTutar * hakedisForm.stopajOrani) / 100)}</span></div>
                      <div className="flex justify-between"><span>Net</span><span className="font-bold text-emerald-700">{formatCurrency(hakedisForm.brutTutar + (hakedisForm.brutTutar * hakedisForm.kdvOrani) / 100 - (hakedisForm.brutTutar * hakedisForm.stopajOrani) / 100 - hakedisForm.ceza - hakedisForm.digerKesinti)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">receipt_long</span>
                      Hakediş Kayıtları
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(`/api/ihaleler/${ihaleId}/hakedis/export`, "_blank")}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                        title="Muhasebe listesi (CSV) indir"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Muhasebe (CSV)
                      </button>
                      <button
                        type="button"
                        onClick={fetchHakedisler}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Yenile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-10 gap-3 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Yıl</label>
                      <input
                        type="number"
                        value={hakedisForm.yil}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, yil: Number(e.target.value) || new Date().getFullYear() }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Ay</label>
                      <input
                        type="number"
                        value={hakedisForm.ay}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, ay: Math.min(12, Math.max(1, Number(e.target.value) || 1)) }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={1}
                        max={12}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Brüt (TL)</label>
                      <input
                        type="number"
                        value={hakedisForm.brutTutar}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, brutTutar: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">KDV %</label>
                      <input
                        type="number"
                        value={hakedisForm.kdvOrani}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, kdvOrani: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Stopaj %</label>
                      <input
                        type="number"
                        value={hakedisForm.stopajOrani}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, stopajOrani: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Ceza</label>
                      <input
                        type="number"
                        value={hakedisForm.ceza}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, ceza: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Diğer</label>
                      <input
                        type="number"
                        value={hakedisForm.digerKesinti}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, digerKesinti: Number(e.target.value) || 0 }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Durum</label>
                      <select
                        value={hakedisForm.durum}
                        onChange={(e) => setHakedisForm((p) => ({ ...p, durum: e.target.value as any }))}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      >
                        <option value="TASLAK">Taslak</option>
                        <option value="ONAYLANDI">Onaylandı</option>
                        <option value="ODENDI">Ödendi</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={handleUpsertHakedis}
                        disabled={phase5Loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg text-sm"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">folder</span>
                        Hakediş Evrakları ({String(hakedisForm.ay).padStart(2, "0")}.{hakedisForm.yil})
                      </h4>
                      <button
                        type="button"
                        onClick={() => fetchHakedisFiles(hakedisForm.yil, hakedisForm.ay)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Yenile
                      </button>
                    </div>

                    <div className="mt-3 flex flex-col md:flex-row gap-3 md:items-center">
                      <input type="file" onChange={(e) => setHakedisSelectedFile(e.target.files?.[0] || null)} />
                      <button
                        type="button"
                        onClick={handleUploadHakedisFile}
                        disabled={!hakedisSelectedFile || hakedisFileUploading}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg text-sm"
                      >
                        {hakedisFileUploading ? "Yükleniyor..." : "Yükle"}
                      </button>
                    </div>

                    {hakedisFiles.length === 0 ? (
                      <div className="text-center py-6 text-on-surface-variant text-sm">Bu ay için evrak yok.</div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {hakedisFiles.map((f) => (
                          <div key={f} className="flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-on-surface truncate" title={f}>{f}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleDownloadHakedisFile(f)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="İndir"
                              >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHakedisFile(f)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
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

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">checklist</span>
                        Zorunlu Belgeler Checklist
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className={
                            "text-[11px] font-bold px-2.5 py-1 rounded-full border " +
                            (hakedisChecklistMeta.missingCount > 0
                              ? "text-error border-error bg-surface-container-low"
                              : "text-emerald-700 border-emerald-200 bg-surface-container-low")
                          }
                          title="Eksik belge sayısı"
                        >
                          {hakedisChecklistMeta.total > 0
                            ? `${hakedisChecklistMeta.total - hakedisChecklistMeta.missingCount}/${hakedisChecklistMeta.total} Tam`
                            : "—"}
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveHakedisChecklist}
                          disabled={hakedisChecklistLoading || hakedisChecklistSaving || hakedisChecklistItems.length === 0}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-3 py-2 rounded-lg text-xs"
                          title="Checklist kaydet (Yetkili)"
                        >
                          {hakedisChecklistSaving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                      </div>
                    </div>

                    {hakedisChecklistMeta.message ? (
                      <div className="mt-2 text-xs text-on-surface-variant">{hakedisChecklistMeta.message}</div>
                    ) : null}
                    {hakedisChecklistError ? (
                      <div className="mt-2 text-xs font-semibold text-error">{hakedisChecklistError}</div>
                    ) : null}

                    {hakedisChecklistLoading ? (
                      <div className="text-center py-6 text-on-surface-variant text-sm">Yükleniyor...</div>
                    ) : hakedisChecklistItems.length === 0 ? (
                      <div className="text-center py-6 text-on-surface-variant text-sm">Checklist yok.</div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {hakedisChecklistItems.map((item) => (
                          <div
                            key={item.belgeKodu}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant"
                          >
                            <div className="md:col-span-4 min-w-0">
                              <div className="text-xs font-bold text-on-surface truncate" title={item.belgeAdi}>
                                {item.belgeAdi}
                              </div>
                              <div className="text-[10px] text-on-surface-variant font-semibold">{item.belgeKodu}</div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Durum</label>
                              <select
                                value={item.durum}
                                onChange={(e) =>
                                  setHakedisChecklistItems((prev) =>
                                    prev.map((x) => (x.belgeKodu === item.belgeKodu ? { ...x, durum: e.target.value as any } : x))
                                  )
                                }
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                              >
                                <option value="EKSIK">Eksik</option>
                                <option value="TAMAMLANDI">Tamamlandı</option>
                                <option value="MUAF">Muaf</option>
                              </select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Dosya (Opsiyonel)</label>
                              <select
                                value={item.dosyaAdi || ""}
                                onChange={(e) =>
                                  setHakedisChecklistItems((prev) =>
                                    prev.map((x) =>
                                      x.belgeKodu === item.belgeKodu ? { ...x, dosyaAdi: e.target.value ? e.target.value : null } : x
                                    )
                                  )
                                }
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                              >
                                <option value="">Seçilmedi</option>
                                {hakedisFiles.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Not</label>
                              <input
                                value={item.not || ""}
                                onChange={(e) =>
                                  setHakedisChecklistItems((prev) =>
                                    prev.map((x) => (x.belgeKodu === item.belgeKodu ? { ...x, not: e.target.value } : x))
                                  )
                                }
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                placeholder="Kısa not..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {hakedisler.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-sm">Henüz hakediş kaydı yok.</div>
                  ) : (
                    <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                      {hakedisler.map((h) => (
                        <div key={h.id} className="p-4 border border-outline-variant rounded-xl bg-surface-container-lowest space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-indigo-900">{h.ay}.{h.yil}</div>
                              <div className="text-xs text-on-surface-variant mt-1">
                                Brüt: <span className="font-semibold">{formatCurrency(h.brutTutar)}</span> • Net:{" "}
                                <span className="font-bold text-emerald-700">{formatCurrency(h.netTutar)}</span>
                              </div>
                              <div className="text-[10px] text-on-surface-variant font-semibold mt-1">
                                Oluşturma: {new Date(h.createdAt).toLocaleString("tr-TR")}
                              </div>
                              {h.vadeTarihi ? (
                                <div className="text-[10px] text-on-surface-variant font-semibold mt-1 flex items-center gap-2 flex-wrap">
                                  <span>
                                    Vade: {new Date(h.vadeTarihi).toLocaleDateString("tr-TR")}
                                  </span>
                                  {(() => {
                                    const vade = new Date(h.vadeTarihi as any)
                                    const now = new Date()
                                    const diffDays = Math.floor((vade.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                    if (h.durum !== "ODENDI" && now.getTime() > vade.getTime()) {
                                      return (
                                        <span className="px-2 py-0.5 rounded-full border border-error text-error bg-surface-container-low text-[10px] font-bold">
                                          Gecikti
                                        </span>
                                      )
                                    }
                                    if (h.durum !== "ODENDI" && diffDays <= 7) {
                                      return (
                                        <span className="px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 bg-surface-container-low text-[10px] font-bold">
                                          {diffDays <= 0 ? "Bugün" : `${diffDays} gün`}
                                        </span>
                                      )
                                    }
                                    return null
                                  })()}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => window.open(`/ihaleler/${ihaleId}/hakedis/${h.id}/rapor`, "_blank")}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="PDF (Yazdır)"
                              >
                                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                              </button>
                              <select
                                value={h.durum}
                                onChange={(e) => handleUpdateHakedisDurum(h.id, e.target.value as any)}
                                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                title="Durumu Güncelle (Yetkili)"
                              >
                                <option value="TASLAK">Taslak</option>
                                <option value="ONAYLANDI">Onaylandı</option>
                                <option value="ODENDI">Ödendi</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteHakedis(h.id)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Sil"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                              <div className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">KDV</div>
                              <div className="font-semibold text-on-surface">{formatCurrency(h.kdvTutari)}</div>
                            </div>
                            <div className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                              <div className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Stopaj</div>
                              <div className="font-semibold text-on-surface">{formatCurrency(h.stopajTutari)}</div>
                            </div>
                            <div className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                              <div className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Ceza</div>
                              <div className="font-semibold text-on-surface">{formatCurrency(h.ceza)}</div>
                            </div>
                            <div className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                              <div className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Diğer</div>
                              <div className="font-semibold text-on-surface">{formatCurrency(h.digerKesinti)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SÖZLEŞME (YALNIZCA KAZANILDI İSE) */}
            {activeTab === "sozlesme" && ihale.durum === "KAZANILDI" && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                  <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600">verified_user</span>
                    İhale Sözleşme Detayları
                  </h3>
                  {ihale.sozlesme ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                      Sözleşme İmzalandı
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold animate-pulse">
                      Sözleşme Bekleniyor
                    </span>
                  )}
                </div>

                {!ihale.sozlesme ? (
                  <div className="text-center py-16 max-w-xl mx-auto space-y-4">
                    <span className="material-symbols-outlined text-emerald-500 text-6xl block">gavel</span>
                    <h4 className="text-lg font-bold text-on-surface">Sözleşme Süreci Başlatılmadı</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      İhale başarıyla **KAZANILDI** durumuna alınmıştır. Bu aşamada Sözleşme ve Kesin Teminat takibini başlatmak için Sözleşme Yönetim sayfasına yönlendirebiliriz.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <Link 
                        href={`/sozlesmeler/yeni?ihaleId=${ihaleId}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Yeni Sözleşme Oluştur (Yönlendir)
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contract Details Card */}
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 space-y-4">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-1.5 border-b border-outline-variant pb-2">
                        <span className="material-symbols-outlined">receipt_long</span>
                        Sözleşme Kartı
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">EKAP No</span>
                          <span className="font-semibold text-on-surface">{ihale.sozlesme.ekapNo || "-"}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Sözleşme Bedeli</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(ihale.sozlesme.bedel)}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Başlangıç Tarihi</span>
                          <span className="font-semibold text-on-surface">
                            {ihale.sozlesme.baslangicTarihi ? new Date(ihale.sozlesme.baslangicTarihi).toLocaleDateString("tr-TR") : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Bitiş Tarihi</span>
                          <span className="font-semibold text-on-surface">
                            {ihale.sozlesme.bitisTarihi ? new Date(ihale.sozlesme.bitisTarihi).toLocaleDateString("tr-TR") : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Taxes & Financials Card */}
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 space-y-4">
                      <h4 className="font-bold text-indigo-900 flex items-center gap-1.5 border-b border-outline-variant pb-2">
                        <span className="material-symbols-outlined">percent</span>
                        Mali Kesintiler & Teminat
                      </h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Damga Vergisi</span>
                          <span className="font-semibold text-on-surface">{formatCurrency(ihale.sozlesme.damgaVergisi)}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Karar Pulu</span>
                          <span className="font-semibold text-on-surface">{formatCurrency(ihale.sozlesme.kararPulu)}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">KİK Payı</span>
                          <span className="font-semibold text-on-surface">{formatCurrency(ihale.sozlesme.kikPayi)}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant font-bold block uppercase">Kesin Teminat Tutarı</span>
                          <span className="font-bold text-indigo-700">{formatCurrency(ihale.sozlesme.kesinTeminatTutari)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-center pt-2">
                      <Link 
                        href={`/sozlesmeler`}
                        className="inline-flex items-center gap-1.5 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-2.5 rounded-lg text-xs transition-colors"
                      >
                        Sözleşme Listesi ve Detayına Git
                        <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: 10. MADDE BELGELERİ */}
            {activeTab === "onmadde" && ihale.durum === "KAZANILDI" && (
              <div className="space-y-6">
                {/* Üst Bilgi Kartı */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined">article</span>
                        10. Madde Belgeleri
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        4734 Sayılı Kamu İhale Kanunu Madde 10 kapsamında sözleşme imzalanmadan önce sunulması gereken yasal belgeler.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">upload_file</span>
                        {onmaddeFiles.length} Dosya Yüklendi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alt Sekmeler */}
                <div className="flex bg-surface-container-lowest rounded-xl p-1 shadow-sm border border-outline-variant overflow-x-auto">
                  {ONMADDE_TEMPLATES.map((kategori, idx) => {
                    const colors = [
                      { active: "bg-blue-50 text-blue-700 shadow-sm", icon: "account_balance", iconColor: "text-blue-600" },
                      { active: "bg-emerald-50 text-emerald-700 shadow-sm", icon: "engineering", iconColor: "text-emerald-600" },
                      { active: "bg-amber-50 text-amber-700 shadow-sm", icon: "gavel", iconColor: "text-amber-600" },
                    ]
                    const color = colors[idx] || colors[0]
                    const isActive = onmaddeSubTab === idx
                    // Kısa başlıklar
                    const kisaBaslik = idx === 0 ? "Ekonomik ve Mali" : idx === 1 ? "Mesleki ve Teknik" : "İhale Dışı Bırakılma"
                    return (
                      <button
                        key={kategori.fikra}
                        onClick={() => setOnmaddeSubTab(idx)}
                        className={`flex-1 py-3 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[140px] ${
                          isActive ? color.active : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? color.iconColor : ""}`}>{color.icon}</span>
                        <span className="hidden sm:inline">{kisaBaslik}</span>
                        <span className="sm:hidden">{kategori.fikra}</span>
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          isActive
                            ? idx === 0 ? "bg-blue-200 text-blue-800" : idx === 1 ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                            : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {kategori.sablonlar.length}
                        </span>
                      </button>
                    )
                  })}
                  {/* Dosyalar Sekmesi */}
                  <button
                    onClick={() => setOnmaddeSubTab(3)}
                    className={`flex-1 py-3 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-w-[140px] ${
                      onmaddeSubTab === 3 ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${onmaddeSubTab === 3 ? "text-indigo-600" : ""}`}>folder_open</span>
                    <span className="hidden sm:inline">Yüklenen Dosyalar</span>
                    <span className="sm:hidden">Dosyalar</span>
                    {onmaddeFiles.length > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        onmaddeSubTab === 3 ? "bg-indigo-200 text-indigo-800" : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {onmaddeFiles.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Belge Kategorisi İçerikleri (Sub Tab 0, 1, 2) */}
                {onmaddeSubTab < 3 && (() => {
                  const kategori = ONMADDE_TEMPLATES[onmaddeSubTab]
                  if (!kategori) return null
                  const colorScheme = onmaddeSubTab === 0
                    ? { bg: "bg-blue-50", badge: "bg-blue-600", border: "border-blue-200" }
                    : onmaddeSubTab === 1
                    ? { bg: "bg-emerald-50", badge: "bg-emerald-600", border: "border-emerald-200" }
                    : { bg: "bg-amber-50", badge: "bg-amber-600", border: "border-amber-200" }

                  return (
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                      {/* Kategori Başlığı */}
                      <div className={`px-6 py-4 border-b border-outline-variant ${colorScheme.bg}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${colorScheme.badge}`}>
                            {kategori.fikra.split("/")[1]?.charAt(0) || "?"}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-on-surface">{kategori.category}</h4>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">
                              {kategori.fikra} • {kategori.sablonlar.length} belge • {kategori.aciklama}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Belge Listesi */}
                      <div className="divide-y divide-outline-variant">
                        {kategori.sablonlar.map((sablon) => (
                          <div key={sablon.belgeTipiKodu} className="px-6 py-5 hover:bg-surface-container transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">draft</span>
                                  <h5 className="text-sm font-bold text-on-surface">{sablon.ad}</h5>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-container text-on-surface-variant">
                                    {sablon.bentRef}
                                  </span>
                                  {sablon.asama === "TEKLIF" && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]">description</span>
                                      Teklif Aşaması
                                    </span>
                                  )}
                                  {sablon.asama === "SOZLESME_ONCESI" && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]">gavel</span>
                                      Sözleşme Öncesi
                                    </span>
                                  )}
                                  {sablon.asama === "HER_IKI" && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]">done_all</span>
                                      Her İki Aşama
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">{sablon.aciklama}</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-[10px] bg-surface-container-low rounded-lg p-3 border border-outline-variant">
                                  <div>
                                    <span className="text-on-surface-variant font-bold uppercase block mb-0.5">Veren Makam</span>
                                    <span className="text-on-surface font-semibold">{sablon.verenMakam}</span>
                                  </div>
                                  <div>
                                    <span className="text-on-surface-variant font-bold uppercase block mb-0.5">Geçerlilik Süresi</span>
                                    <span className="text-on-surface font-semibold">{sablon.gecerlilikSuresi}</span>
                                  </div>
                                  <div>
                                    <span className="text-on-surface-variant font-bold uppercase block mb-0.5">Yasal Dayanak</span>
                                    <span className="text-on-surface font-semibold">{sablon.yasalDayanak}</span>
                                  </div>
                                </div>
                                {/* Gerekli Alanlar */}
                                <div className="mt-2.5">
                                  <span className="text-[9px] text-on-surface-variant font-bold uppercase">Gerekli Alanlar: </span>
                                  {sablon.alanlar.filter(a => a.zorunlu).map((alan) => (
                                    <span
                                      key={alan.anahtar}
                                      className="inline-block px-1.5 py-0.5 mr-1 mt-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-600 border border-red-100"
                                    >
                                      {alan.etiket}
                                    </span>
                                  ))}
                                  {sablon.alanlar.filter(a => !a.zorunlu).length > 0 && (
                                    <span className="text-[9px] text-on-surface-variant ml-1">
                                      +{sablon.alanlar.filter(a => !a.zorunlu).length} opsiyonel
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Dosyalar Sekmesi (Sub Tab 3) */}
                {onmaddeSubTab === 3 && (
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">cloud_upload</span>
                        10. Madde Belge Yükleme
                      </h4>
                      <span className="text-[10px] font-bold text-on-surface-variant">
                        {onmaddeFiles.length} dosya yüklendi
                      </span>
                    </div>

                    <FileUpload
                      onFileSelect={handleOnmaddeUpload}
                      disabled={onmaddeFileUploading}
                      maxSize={20 * 1024 * 1024}
                    />
                    {onmaddeFileUploading && (
                      <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Dosya yükleniyor, lütfen bekleyin...
                      </p>
                    )}

                    {/* Yüklenen Dosyalar */}
                    {onmaddeFiles.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          Yüklenen 10. Madde Evrakları
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {onmaddeFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-surface-container-low hover:bg-surface-container rounded-lg border border-outline-variant transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-indigo-600 flex-shrink-0 text-[18px]">description</span>
                                <span className="text-xs font-semibold text-on-surface truncate max-w-[200px]" title={file}>
                                  {file}
                                </span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleOnmaddeDownload(file)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                  title="İndir"
                                >
                                  <span className="material-symbols-outlined text-[16px]">download</span>
                                </button>
                                <button
                                  onClick={() => handleOnmaddeDelete(file)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                                  title="Sil"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface-variant text-5xl">folder_off</span>
                        <p className="text-sm text-on-surface-variant mt-2 font-semibold">Henüz yüklenmiş belge bulunmuyor</p>
                        <p className="text-[11px] text-on-surface-variant mt-1">Yukarıdaki alanı kullanarak 10. madde belgelerinizi yükleyebilirsiniz.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODAL: QUICK ADD KISI */}
      {showQuickKisiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-sm border border-outline-variant space-y-4">
            <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600">person_add</span>
              Yeni Komisyon Üyesi Ekle
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Ad</label>
                  <input 
                    type="text" 
                    required
                    value={quickKisiForm.ad}
                    onChange={e => setQuickKisiForm(p => ({ ...p, ad: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Soyad</label>
                  <input 
                    type="text" 
                    required
                    value={quickKisiForm.soyad}
                    onChange={e => setQuickKisiForm(p => ({ ...p, soyad: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Unvan</label>
                <input 
                  type="text" 
                  placeholder="Örn: Şube Müdürü, Hukukçu vb."
                  value={quickKisiForm.unvan}
                  onChange={e => setQuickKisiForm(p => ({ ...p, unvan: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Telefon</label>
                  <input 
                    type="tel" 
                    placeholder="05..."
                    value={quickKisiForm.telefon}
                    onChange={e => setQuickKisiForm(p => ({ ...p, telefon: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">E-Posta</label>
                  <input 
                    type="email" 
                    placeholder="ad@email.com"
                    value={quickKisiForm.email}
                    onChange={e => setQuickKisiForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowQuickKisiModal(false)}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-lg text-xs font-semibold transition-colors"
                >
                  Kapat
                </button>
                <button 
                  type="button"
                  onClick={handleQuickAddKisi}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD FIRMA */}
      {showQuickFirmaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-sm border border-outline-variant space-y-4">
            <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600">business</span>
              Yeni Rakip Firma Ekle
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Firma Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Atlas Ltd. Şti."
                  value={quickFirmaForm.ad}
                  onChange={e => setQuickFirmaForm(p => ({ ...p, ad: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Ticari Unvan</label>
                <input 
                  type="text" 
                  placeholder="Resmi Ticari Unvanı"
                  value={quickFirmaForm.unvan}
                  onChange={e => setQuickFirmaForm(p => ({ ...p, unvan: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Vergi No</label>
                  <input 
                    type="text" 
                    placeholder="Vergi Numarası"
                    value={quickFirmaForm.vergiNo}
                    onChange={e => setQuickFirmaForm(p => ({ ...p, vergiNo: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Bulunduğu İl</label>
                  <input 
                    type="text" 
                    placeholder="Şehir"
                    value={quickFirmaForm.il}
                    onChange={e => setQuickFirmaForm(p => ({ ...p, il: e.target.value }))}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowQuickFirmaModal(false)}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-lg text-xs font-semibold transition-colors"
                >
                  Kapat
                </button>
                <button 
                  type="button"
                  onClick={handleQuickAddFirma}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT PREVIEW */}
      {previewFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-surface-container-lowest rounded-2xl max-w-4xl w-full p-6 shadow-sm border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600">visibility</span>
                Evrak Önizleme: <span className="text-indigo-700">{previewFile.dosyaAdi}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFileDownload(previewFile)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  title="İndir"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Kapat"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-surface-container-low border border-outline-variant rounded-xl p-4 min-h-[400px] flex items-center justify-center">
              {(() => {
                const lowerName = previewFile.dosyaAdi.toLowerCase();
                const isPdf = lowerName.endsWith('.pdf');
                const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.gif') || lowerName.endsWith('.webp');
                
                const previewUrl = previewFile.id
                  ? `/api/ihaleler/${ihaleId}/dosya?fileId=${encodeURIComponent(previewFile.id)}`
                  : `/api/ihaleler/${ihaleId}/dosya?file=${encodeURIComponent(previewFile.dosyaAdi)}`;

                if (isPdf) {
                  return (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[60vh] border-0 rounded-lg"
                      title={previewFile.dosyaAdi}
                    />
                  );
                } else if (isImage) {
                  return (
                    <img
                      src={previewUrl}
                      alt={previewFile.dosyaAdi}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm mx-auto"
                    />
                  );
                } else {
                  return (
                    <div className="text-center p-8 space-y-4">
                      <span className="material-symbols-outlined text-on-surface-variant text-6xl">draft</span>
                      <p className="text-sm text-on-surface-variant">Bu dosya türü için (.xls, .docx vb.) doğrudan önizleme desteklenmemektedir.</p>
                      <button
                        onClick={() => handleFileDownload(previewFile)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Dosyayı İndir ve Görüntüle
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
