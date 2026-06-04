"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

interface FileUploadItem {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'uploading' | 'completed' | 'failed'
}

export default function YeniIhale() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Step 1: General Info
  const [formData, setFormData] = useState({
    ihaleNo: "",
    ad: "",
    aciklama: "",
    tur: "MAL_ALIM",
    usul: "ACIK_IHALE",
    kurumId: "",
    butce: "",
    sozlesmeBedeli: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    teklifSonTarihi: "",
  })

  // Step 3: Files state
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([
    { id: '1', name: 'teknik_sartname_v2.pdf', size: 2450000, type: 'application/pdf', progress: 100, status: 'completed' },
    { id: '2', name: 'idari_sartname.pdf', size: 1820000, type: 'application/pdf', progress: 100, status: 'completed' }
  ])

  // Step 4: Team & Review
  const [assignedTeam, setAssignedTeam] = useState({
    technicalExpert: "Dr. Elena Rodriguez",
    legalCounsel: "Marcus Vance",
    financialAuditor: ""
  })
  const [confirmDetails, setConfirmDetails] = useState(false)
  const [kurumlar, setKurumlar] = useState<{ id: string; ad: string }[]>([])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.replace("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchKurumlar = async () => {
      try {
        const response = await fetch("/api/kurumlar")
        if (response.ok) {
          const data = await response.json()
          setKurumlar(data)
          if (data.length > 0) {
            setFormData(prev => ({
              ...prev,
              kurumId: data[0].id
            }))
          }
        }
      } catch (err) {
        console.error("Kurumlar yüklenirken hata:", err)
      }
    }
    if (session) {
      fetchKurumlar()
    }
  }, [session])

  const handleNextStep = () => {
    // Basic validation per step
    if (currentStep === 1) {
      if (!formData.ihaleNo || !formData.ad) {
        setError("Lütfen zorunlu alanları doldurunuz (İhale No, İhale Adı).")
        return
      }
    } else if (currentStep === 2) {
      if (!formData.butce || !formData.baslangicTarihi || !formData.bitisTarihi || !formData.teklifSonTarihi) {
        setError("Lütfen tarih ve bütçe alanlarını doldurunuz.")
        return
      }
    }
    setError("")
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handleBackStep = () => {
    setError("")
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    const newItems: FileUploadItem[] = filesArray.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newItems])

    // Simulate upload progress
    newItems.forEach(item => {
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 20
        setUploadedFiles(prev => 
          prev.map(f => f.id === item.id ? { ...f, progress: currentProgress, status: currentProgress >= 100 ? 'completed' : 'uploading' } : f)
        )
        if (currentProgress >= 100) {
          clearInterval(interval)
        }
      }, 300)
    })
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleSubmit = async () => {
    if (!confirmDetails) {
      setError("Lütfen ihale ayrıntılarının doğruluğunu onaylayın.")
      return
    }
    if (!formData.kurumId) {
      setError("Lütfen geçerli bir kurum seçin.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ihaleler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ihaleNo: formData.ihaleNo,
          ad: formData.ad,
          aciklama: formData.aciklama,
          tur: formData.tur,
          usul: formData.usul,
          kurumId: formData.kurumId,
          butce: parseFloat(formData.butce),
          sozlesmeBedeli: formData.sozlesmeBedeli ? parseFloat(formData.sozlesmeBedeli) : undefined,
          baslangicTarihi: formData.baslangicTarihi,
          bitisTarihi: formData.bitisTarihi,
          teklifSonTarihi: formData.teklifSonTarihi,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/ihaleler")
        }, 2000)
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "İhale oluşturulurken bir hata oluştu")
      }
    } catch (err) {
      console.error("İhale oluşturulurken hata:", err)
      setError("İhale oluşturulurken bir bağlantı hatası oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-on-surface-variant font-label-md uppercase tracking-wider">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Kurumlar state'i yukarıda useEffect ile veritabanından çekiliyor.

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60 pb-24">
        {/* TopBar */}
        <TopBar />

        {/* Wizard Main Content */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-stack-lg">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-stack-lg px-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-outline-variant -z-10 -translate-y-1/2"></div>
              
              {/* Step 1 indicator */}
              <div className="flex flex-col items-center gap-2 bg-background px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep > 1 ? 'bg-primary text-white' : currentStep === 1 ? 'border-4 border-primary bg-background text-primary' : 'border border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 1 ? <span className="material-symbols-outlined text-[18px]">check</span> : '1'}
                </div>
                <span className={`font-label-md text-xs font-semibold uppercase tracking-wider ${currentStep === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Genel Bilgiler</span>
              </div>

              {/* Step 2 indicator */}
              <div className="flex flex-col items-center gap-2 bg-background px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep > 2 ? 'bg-primary text-white' : currentStep === 2 ? 'border-4 border-primary bg-background text-primary' : 'border border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 2 ? <span className="material-symbols-outlined text-[18px]">check</span> : '2'}
                </div>
                <span className={`font-label-md text-xs font-semibold uppercase tracking-wider ${currentStep === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Şartlar & Bütçe</span>
              </div>

              {/* Step 3 indicator */}
              <div className="flex flex-col items-center gap-2 bg-background px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep > 3 ? 'bg-primary text-white' : currentStep === 3 ? 'border-4 border-primary bg-background text-primary' : 'border border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  {currentStep > 3 ? <span className="material-symbols-outlined text-[18px]">check</span> : '3'}
                </div>
                <span className={`font-label-md text-xs font-semibold uppercase tracking-wider ${currentStep === 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Evrak Yükleme</span>
              </div>

              {/* Step 4 indicator */}
              <div className="flex flex-col items-center gap-2 bg-background px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep === 4 ? 'border-4 border-primary bg-background text-primary' : 'border border-outline-variant bg-surface-container text-on-surface-variant'
                }`}>
                  4
                </div>
                <span className={`font-label-md text-xs font-semibold uppercase tracking-wider ${currentStep === 4 ? 'text-primary' : 'text-on-surface-variant'}`}>Ekip & Onay</span>
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="bg-error-container border border-error text-on-error-container rounded-xl p-4 flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-error">error</span>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-200 text-green-800 rounded-xl p-4 flex items-center gap-2 shadow-sm animate-bounce">
                <span className="material-symbols-outlined text-green-700">check_circle</span>
                <span className="text-sm font-bold">İhale başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
              </div>
            )}

            {/* Step Body */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden p-6 min-h-[420px]">
              
              {/* Step 1: General Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="font-headline-sm text-sm font-bold text-primary pb-3 border-b border-outline-variant">
                    Adım 1: İhale Genel Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="ihaleNo" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İhale Kayıt No (IKN) <span className="text-error">*</span></label>
                      <input
                        type="text"
                        id="ihaleNo"
                        name="ihaleNo"
                        value={formData.ihaleNo}
                        onChange={handleChange}
                        required
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="Örn: 2024/984321"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ad" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İşin Adı <span className="text-error">*</span></label>
                      <input
                        type="text"
                        id="ad"
                        name="ad"
                        value={formData.ad}
                        onChange={handleChange}
                        required
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="Örn: Ankara Medikal Malzeme Alımı"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="tur" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İhale Alım Türü</label>
                      <select
                        id="tur"
                        name="tur"
                        value={formData.tur}
                        onChange={handleChange}
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      >
                        <option value="MAL_ALIM">Mal Alımı</option>
                        <option value="HIZMET_ALIM">Hizmet Alımı</option>
                        <option value="YAPIM_ISI">Yapım İşleri</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="usul" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İhale Usulü</label>
                      <select
                        id="usul"
                        name="usul"
                        value={formData.usul}
                        onChange={handleChange}
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      >
                        <option value="ACIK_IHALE">Açık İhale</option>
                        <option value="BELLI_ISTEKLI">Belli İstekliler Arasında</option>
                        <option value="DOGRUDAN_TEMIN">Doğrudan Temin</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="kurumId" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İhale Yapan Kurum</label>
                      <select
                        id="kurumId"
                        name="kurumId"
                        value={formData.kurumId}
                        onChange={handleChange}
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      >
                        {kurumlar.map(k => (
                          <option key={k.id} value={k.id}>{k.ad}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="aciklama" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Açıklama / İş Kapsamı</label>
                      <textarea
                        id="aciklama"
                        name="aciklama"
                        value={formData.aciklama}
                        onChange={handleChange}
                        rows={3}
                        className="block w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="İhaleye ait genel detaylar ve açıklamalar..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specs & Calendar */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="font-headline-sm text-sm font-bold text-primary pb-3 border-b border-outline-variant">
                    Adım 2: Teknik Şartlar, Süreç ve Yaklaşık Maliyet Bütçesi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="butce" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Yaklaşık Maliyet / Bütçe (TL) <span className="text-error">*</span></label>
                      <input
                        type="number"
                        id="butce"
                        name="butce"
                        value={formData.butce}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="₺0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sozlesmeBedeli" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Öngörülen Sözleşme Bedeli (TL)</label>
                      <input
                        type="number"
                        id="sozlesmeBedeli"
                        name="sozlesmeBedeli"
                        value={formData.sozlesmeBedeli}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                        placeholder="₺0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="baslangicTarihi" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İş Başlangıç Tarihi <span className="text-error">*</span></label>
                      <input
                        type="datetime-local"
                        id="baslangicTarihi"
                        name="baslangicTarihi"
                        value={formData.baslangicTarihi}
                        onChange={handleChange}
                        required
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bitisTarihi" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">İş Bitiş Tarihi <span className="text-error">*</span></label>
                      <input
                        type="datetime-local"
                        id="bitisTarihi"
                        name="bitisTarihi"
                        value={formData.bitisTarihi}
                        onChange={handleChange}
                        required
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="teklifSonTarihi" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Son Teklif Verme Tarihi <span className="text-error">*</span></label>
                      <input
                        type="datetime-local"
                        id="teklifSonTarihi"
                        name="teklifSonTarihi"
                        value={formData.teklifSonTarihi}
                        onChange={handleChange}
                        required
                        className="block w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="font-headline-sm text-sm font-bold text-primary pb-3 border-b border-outline-variant">
                    Adım 3: İhale İdari ve Teknik Şartnameleri / Evrak Havuzu
                  </h3>
                  
                  {/* Drag and Drop Box */}
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-container-low hover:bg-surface-container transition-all relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-[48px] text-primary bg-surface-container-lowest p-4 rounded-full shadow-sm mb-4">
                      cloud_upload
                    </span>
                    <p className="font-headline-sm text-sm font-bold text-primary">Dosyaları sürükleyip bırakın veya buraya tıklayın</p>
                    <p className="text-xs text-on-surface-variant mt-1">PDF, Word veya Excel dosyaları (Maksimum 25MB)</p>
                  </div>

                  {/* Upload List */}
                  <div className="space-y-3 mt-4">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Yüklenen Belgeler</label>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-sm text-on-surface-variant italic">Henüz herhangi bir şartname veya belge yüklenmedi.</p>
                    ) : (
                      <div className="divide-y divide-outline-variant border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
                        {uploadedFiles.map(file => (
                          <div key={file.id} className="flex justify-between items-center p-3 hover:bg-surface-container-low transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                              <div>
                                <p className="text-sm font-semibold text-primary">{file.name}</p>
                                <p className="text-[11px] text-on-surface-variant">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {file.status === 'uploading' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-surface-container h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: `${file.progress}%` }} />
                                  </div>
                                  <span className="text-[11px] text-on-surface-variant font-bold">% {file.progress}</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">YÜKLENDİ</span>
                              )}
                              <button 
                                onClick={() => handleRemoveFile(file.id)}
                                className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer text-[18px]"
                              >
                                delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Team & Review */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                  {/* Left Column: Team Assignment */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="border border-outline-variant rounded-xl p-5 bg-surface-container-low shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-headline-sm text-sm font-bold text-primary">Komisyon / Ekip Görevlendirme</h4>
                        <span className="material-symbols-outlined text-primary hover:scale-110 transition-transform cursor-pointer">
                          person_add
                        </span>
                      </div>
                      <div className="space-y-4">
                        {/* Technical Expert */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Teknik Uzman</label>
                          <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg">
                            <div>
                              <p className="text-xs font-bold text-primary">{assignedTeam.technicalExpert}</p>
                              <p className="text-[10px] text-on-surface-variant">Altyapı Kıdemli Mühendisi</p>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer">swap_horiz</span>
                          </div>
                        </div>

                        {/* Legal Counsel */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Hukuk Danışmanı (Law 4734)</label>
                          <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg">
                            <div>
                              <p className="text-xs font-bold text-primary">{assignedTeam.legalCounsel}</p>
                              <p className="text-[10px] text-on-surface-variant">Mevzuat Uyum Müşaviri</p>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-pointer">swap_horiz</span>
                          </div>
                        </div>

                        {/* Financial Auditor */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Finansal Denetçi</label>
                          <div className="flex justify-between items-center p-2.5 bg-surface-container-lowest border border-outline border-dashed rounded-lg cursor-pointer">
                            <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">add</span>
                              Finansal Analist Ata
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Final Summary Card */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-primary-container p-4">
                        <h4 className="font-headline-sm text-sm font-bold text-white">İhale Nihai Özeti</h4>
                        <p className="text-on-primary-container text-xs mt-0.5">Lütfen göndermeden önce tüm bilgileri son kez kontrol edin.</p>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-surface-container-low p-3 rounded-lg">
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Yaklaşık Maliyet / Bütçe</p>
                            <p className="text-base font-bold text-primary">₺{parseFloat(formData.butce || '0').toLocaleString('tr-TR')}</p>
                          </div>
                          <div className="bg-surface-container-low p-3 rounded-lg">
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Son Teklif Tarihi</p>
                            <p className="text-base font-bold text-primary">{formData.teklifSonTarihi ? new Date(formData.teklifSonTarihi).toLocaleDateString('tr-TR') : '-'}</p>
                          </div>
                        </div>

                        <dl className="grid grid-cols-3 gap-y-2 border-t border-outline-variant/30 pt-3 text-xs">
                          <dt className="text-on-surface-variant font-semibold">İhale Kayıt No:</dt>
                          <dd className="text-primary font-bold col-span-2">{formData.ihaleNo}</dd>

                          <dt className="text-on-surface-variant font-semibold">İhale Adı:</dt>
                          <dd className="text-primary font-bold col-span-2">{formData.ad}</dd>

                          <dt className="text-on-surface-variant font-semibold">Alım Türü:</dt>
                          <dd className="text-primary col-span-2">{formData.tur === 'MAL_ALIM' ? 'Mal Alımı' : formData.tur === 'HIZMET_ALIM' ? 'Hizmet Alımı' : 'Yapım İşi'}</dd>

                          <dt className="text-on-surface-variant font-semibold">Yüklenen Evraklar:</dt>
                          <dd className="text-primary col-span-2">{uploadedFiles.length} adet dosya yüklenmiştir.</dd>
                        </dl>

                        {/* Legal Note */}
                        <div className="bg-tertiary-container/10 border border-tertiary/20 rounded-xl p-3 flex gap-3 mt-4">
                          <span className="material-symbols-outlined text-tertiary text-[20px]">priority_high</span>
                          <div>
                            <p className="text-xs font-bold text-tertiary">Mevzuat Bilgilendirmesi</p>
                            <p className="text-[10px] text-on-tertiary-container leading-normal">Bu ihale kartı oluşturulduğunda, atanan ekip üyelerine otomatik tebligat gönderilecek ve Law 4734 resmi itiraz süreçleri takvime eklenecektir.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-surface-container border-t border-outline-variant">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="confirmDetails"
                            checked={confirmDetails}
                            onChange={(e) => setConfirmDetails(e.target.checked)}
                            className="mt-0.5 h-4.5 w-4.5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                          />
                          <label htmlFor="confirmDetails" className="text-xs font-semibold text-primary cursor-pointer leading-tight">
                            İhale komisyonu atamalarının ve yukarıda girilen şartname/detayların doğruluğunu onaylıyorum.
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Navigation Footer Bar */}
            <div className="flex justify-between items-center p-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={handleBackStep}
                    className="px-5 py-2 border border-outline text-secondary font-label-md rounded-xl hover:bg-surface-container transition-colors font-bold cursor-pointer"
                  >
                    Geri
                  </button>
                )}
                <Link 
                  href="/ihaleler" 
                  className="px-5 py-2 border border-outline text-secondary font-label-md rounded-xl hover:bg-surface-container transition-colors font-bold"
                >
                  Kapat / İptal Et
                </Link>
              </div>
              
              <div>
                {currentStep < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-label-md hover:opacity-90 transition-opacity font-bold cursor-pointer"
                  >
                    İleri
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !confirmDetails}
                    className="bg-[#005c6e] text-white px-8 py-2.5 rounded-xl font-label-md hover:brightness-110 disabled:opacity-50 transition-all font-bold cursor-pointer flex items-center gap-2"
                  >
                    {loading ? 'Gönderiliyor...' : 'İhaleyi Oluştur ve Gönder'}
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
