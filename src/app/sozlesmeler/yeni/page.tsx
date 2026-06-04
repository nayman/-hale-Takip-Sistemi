"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"

export default function YeniSozlesmePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ihaleler, setIhaleler] = useState<any[]>([])
  const [formData, setFormData] = useState({
    ihaleId: "",
    ekapNo: "",
    bedel: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    // Yeni eklenen alanlar (P2.1)
    odemeVadesiGun: "30",
    cezaUstSinirYuzde: "30",
    kritikKesintiSaat: "12",
    kritikKesintiCezaYuzde: "2",
    donemSonlandirmaFesihTekrar: "2",
    ozelAykirilikFesihLimit: "30",
    altYukleniciKural: "YASAK",
    // P2.2 Alanları
    fikriMulkiyet: "",
    teslimHaklari: "",
    ortakGirisim: false
  })

  const [partners, setPartners] = useState<{ unvan: string; oran: number }[]>([])

  // Sihirbaz Modu
  const [wizardMode, setWizardMode] = useState(false)
  const [rawText, setRawText] = useState("")

  useEffect(() => {
    if (session) {
      fetch("/api/ihaleler?limit=100")
        .then(r => r.json())
        .then(d => setIhaleler(d.ihaleler || []))
    }
  }, [session])

  const handleSubmit = async () => {
    if (!formData.ihaleId) {
      alert("İhale seçimi zorunludur")
      return
    }
    if (!formData.bedel || Number.isNaN(parseFloat(formData.bedel))) {
      alert("Sözleşme bedeli zorunludur")
      return
    }
    
    const payload = {
      ...formData,
      bedel: parseFloat(formData.bedel),
      baslangicTarihi: formData.baslangicTarihi ? new Date(formData.baslangicTarihi).toISOString() : null,
      bitisTarihi: formData.bitisTarihi ? new Date(formData.bitisTarihi).toISOString() : null,
      odemeVadesiGun: parseInt(formData.odemeVadesiGun) || 30,
      cezaUstSinirYuzde: parseFloat(formData.cezaUstSinirYuzde) || 30,
      kritikKesintiSaat: parseInt(formData.kritikKesintiSaat) || 12,
      kritikKesintiCezaYuzde: parseFloat(formData.kritikKesintiCezaYuzde) || 2,
      donemSonlandirmaFesihTekrar: parseInt(formData.donemSonlandirmaFesihTekrar) || 2,
      ozelAykirilikFesihLimit: parseInt(formData.ozelAykirilikFesihLimit) || 30,
      // P2.2
      fikriMulkiyet: formData.fikriMulkiyet || null,
      teslimHaklari: formData.teslimHaklari || null,
      ortakGirisim: formData.ortakGirisim,
      ortaklikOranlari: formData.ortakGirisim ? partners : null
    }

    const res = await fetch("/api/sozlesmeler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const sozlesme = await res.json()
      router.push(`/sozlesmeler/${sozlesme.id}`)
    } else {
      alert("Hata oluştu")
    }
  }

  const handleParseText = async () => {
    if (!rawText.trim()) {
      alert("Lütfen sözleşme metnini veya özetini girin.")
      return
    }
    
    try {
      const res = await fetch("/api/sozlesmeler/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText })
      })

      if (res.ok) {
        const parsed = await res.json()
        setFormData(prev => ({
          ...prev,
          bedel: parsed.bedel ? String(parsed.bedel) : prev.bedel,
          ekapNo: parsed.ekapNo || prev.ekapNo,
          odemeVadesiGun: parsed.odemeVadesiGun ? String(parsed.odemeVadesiGun) : prev.odemeVadesiGun,
          cezaUstSinirYuzde: parsed.cezaUstSinirYuzde ? String(parsed.cezaUstSinirYuzde) : prev.cezaUstSinirYuzde,
          kritikKesintiSaat: parsed.kritikKesintiSaat ? String(parsed.kritikKesintiSaat) : prev.kritikKesintiSaat,
          kritikKesintiCezaYuzde: parsed.kritikKesintiCezaYuzde ? String(parsed.kritikKesintiCezaYuzde) : prev.kritikKesintiCezaYuzde,
          altYukleniciKural: parsed.altYukleniciKural || prev.altYukleniciKural,
          // P2.2 AI parse
          fikriMulkiyet: parsed.fikriMulkiyet || "",
          teslimHaklari: parsed.teslimHaklari || "",
          ortakGirisim: parsed.ortakGirisim ?? false
        }))
        if (parsed.ortaklikOranlari) {
          setPartners(parsed.ortaklikOranlari)
        } else {
          setPartners([])
        }
        alert("Metin başarıyla çözümlendi ve form alanlarına aktarıldı. Lütfen doğruluğunu kontrol edin.")
        setWizardMode(false)
      } else {
        alert("Metin çözümlenirken hata oluştu.")
      }
    } catch (e) {
      console.error(e)
      alert("Bağlantı hatası oluştu.")
    }
  }

  if (status === "loading") return <div className="p-8 text-center text-on-surface-variant">Yükleniyor...</div>
  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        <TopBar />
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-none w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Yeni Sözleşme Oluştur</h2>
              <button 
                onClick={() => setWizardMode(!wizardMode)} 
                className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg border border-outline-variant font-medium text-sm hover:opacity-90"
              >
                {wizardMode ? "Klasik Forma Dön" : "✨ Sözleşme Metninden Çıkar (Sihirbaz)"}
              </button>
            </div>

            {wizardMode && (
              <div className="bg-primary-container/20 border border-primary/30 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold text-primary mb-2">Sözleşme Veri Çıkarım Sihirbazı</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Sözleşme özetini veya pdf içeriğini buraya yapıştırın. Sistem kritik alanları otomatik çıkarıp formu dolduracaktır.
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full h-40 border border-outline-variant bg-surface-container-lowest rounded-lg p-3 text-sm mb-4 focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Sözleşme metnini buraya yapıştırın..."
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleParseText}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg hover:opacity-90 font-medium"
                  >
                    Metni Çözümle
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">İhale Seçin</label>
                  <select value={formData.ihaleId} onChange={e => setFormData({...formData, ihaleId: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                    <option value="">Seçiniz...</option>
                    {ihaleler.map(ih => (
                      <option key={ih.id} value={ih.id}>{ih.ihaleNo} - {ih.ad}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">EKAP Sözleşme No (Opsiyonel)</label>
                  <input type="text" value={formData.ekapNo} onChange={e => setFormData({...formData, ekapNo: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sözleşme Bedeli (TL)</label>
                  <input type="number" step="0.01" value={formData.bedel} onChange={e => setFormData({...formData, bedel: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  <p className="text-xs text-on-surface-variant mt-1">Bedel girildiğinde vergiler ve kesintiler otomatik hesaplanacaktır.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
                  <input type="date" value={formData.baslangicTarihi} onChange={e => setFormData({...formData, baslangicTarihi: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                  <input type="date" value={formData.bitisTarihi} onChange={e => setFormData({...formData, bitisTarihi: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                </div>
              </div>

              <div className="border-t border-outline-variant pt-6">
                <h3 className="text-lg font-bold mb-4">SLA ve Uyumluluk Parametreleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ödeme Vadesi (Gün)</label>
                    <input type="number" value={formData.odemeVadesiGun} onChange={e => setFormData({...formData, odemeVadesiGun: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ceza Üst Sınırı (%)</label>
                    <input type="number" step="0.1" value={formData.cezaUstSinirYuzde} onChange={e => setFormData({...formData, cezaUstSinirYuzde: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kritik Kesinti Eşiği (Saat)</label>
                    <input type="number" value={formData.kritikKesintiSaat} onChange={e => setFormData({...formData, kritikKesintiSaat: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kritik Kesinti Cezası (%)</label>
                    <input type="number" step="0.1" value={formData.kritikKesintiCezaYuzde} onChange={e => setFormData({...formData, kritikKesintiCezaYuzde: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dönem Fesih Tekrar Eşiği</label>
                    <input type="number" value={formData.donemSonlandirmaFesihTekrar} onChange={e => setFormData({...formData, donemSonlandirmaFesihTekrar: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Özel Aykırılık Limiti</label>
                    <input type="number" value={formData.ozelAykirilikFesihLimit} onChange={e => setFormData({...formData, ozelAykirilikFesihLimit: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alt Yüklenici Kuralı</label>
                    <select value={formData.altYukleniciKural} onChange={e => setFormData({...formData, altYukleniciKural: e.target.value})} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                      <option value="YASAK">Yasak</option>
                      <option value="IZINLI">İzinli</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-6">
                <h3 className="text-lg font-bold mb-4">Fikri Mülkiyet ve Teslim Şartları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fikri Mülkiyet Hakları</label>
                    <textarea value={formData.fikriMulkiyet} onChange={e => setFormData({...formData, fikriMulkiyet: e.target.value})} rows={3} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Telif hakları ve mülkiyet sınırlarını girin..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teslimat ve Kabul Hakları</label>
                    <textarea value={formData.teslimHaklari} onChange={e => setFormData({...formData, teslimHaklari: e.target.value})} rows={3} className="w-full border border-outline-variant bg-surface-container-low rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Kabul ve teslim koşullarını girin..." />
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input type="checkbox" id="ortakGirisim" checked={formData.ortakGirisim} onChange={e => setFormData({...formData, ortakGirisim: e.target.checked})} className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
                  <label htmlFor="ortakGirisim" className="text-sm font-medium select-none cursor-pointer">Bu Sözleşme Bir Ortak Girişimdir (JV)</label>
                </div>

                {formData.ortakGirisim && (
                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold">Ortaklık Oranları</h4>
                      <button type="button" onClick={() => setPartners([...partners, { unvan: "", oran: 0 }])} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        + Ortak Ekle
                      </button>
                    </div>
                    {partners.length === 0 && (
                      <p className="text-xs text-on-surface-variant">Kayıtlı ortak bulunmuyor. Lütfen ortak ekleyin.</p>
                    )}
                    {partners.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-1">
                          <input type="text" value={p.unvan} onChange={e => {
                            const newP = [...partners]
                            newP[idx].unvan = e.target.value
                            setPartners(newP)
                          }} className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ortak Firma Unvanı" />
                        </div>
                        <div className="w-24 flex items-center gap-1">
                          <input type="number" value={p.oran} onChange={e => {
                            const newP = [...partners]
                            newP[idx].oran = parseInt(e.target.value) || 0
                            setPartners(newP)
                          }} className="w-full border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Oran" />
                          <span className="text-xs">%</span>
                        </div>
                        <button type="button" onClick={() => setPartners(partners.filter((_, i) => i !== idx))} className="text-error hover:underline text-xs">
                          Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={handleSubmit} className="bg-primary text-on-primary px-4 py-2 rounded hover:opacity-90 transition-opacity">Kaydet ve Devam Et</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
