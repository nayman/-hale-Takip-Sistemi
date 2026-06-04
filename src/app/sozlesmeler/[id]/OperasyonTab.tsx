"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

type OperasyonTabProps = {
  sozlesmeId: string
  isAdmin: boolean
}

export default function OperasyonTab({ sozlesmeId, isAdmin }: OperasyonTabProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Incident form
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentForm, setIncidentForm] = useState({
    tip: "KESINTI",
    baslangicTarihi: "",
    bitisTarihi: "",
    sureSaat: "",
    cezaTutar: "",
    aciklama: ""
  })

  // Rapor form
  const [showRaporForm, setShowRaporForm] = useState(false)
  const [raporForm, setRaporForm] = useState({
    personelAdSoyad: "",
    raporGun: "",
    baslangicTarihi: "",
    bitisTarihi: ""
  })

  // Alt Yüklenici form
  const [showAltForm, setShowAltForm] = useState(false)
  const [altForm, setAltForm] = useState({
    firmaAd: "",
    vergiNo: "",
    durum: "TASLAK"
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [sozlesmeId])

  const handleCreateIncident = async () => {
    try {
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "INCIDENT",
          tip: incidentForm.tip,
          baslangicTarihi: incidentForm.baslangicTarihi ? new Date(incidentForm.baslangicTarihi).toISOString() : null,
          bitisTarihi: incidentForm.bitisTarihi ? new Date(incidentForm.bitisTarihi).toISOString() : null,
          sureSaat: incidentForm.sureSaat ? Number(incidentForm.sureSaat) : null,
          cezaTutar: incidentForm.cezaTutar ? Number(incidentForm.cezaTutar) : null,
          aciklama: incidentForm.aciklama || null
        })
      })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Hata oluştu")
        return
      }
      setShowIncidentForm(false)
      setIncidentForm({ tip: "KESINTI", baslangicTarihi: "", bitisTarihi: "", sureSaat: "", cezaTutar: "", aciklama: "" })
      fetchData()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleCreateRapor = async () => {
    try {
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "RAPOR",
          personelAdSoyad: raporForm.personelAdSoyad,
          raporGun: Number(raporForm.raporGun),
          baslangicTarihi: raporForm.baslangicTarihi ? new Date(raporForm.baslangicTarihi).toISOString() : null,
          bitisTarihi: raporForm.bitisTarihi ? new Date(raporForm.bitisTarihi).toISOString() : null
        })
      })
      if (!res.ok) throw new Error("Hata oluştu")
      setShowRaporForm(false)
      setRaporForm({ personelAdSoyad: "", raporGun: "", baslangicTarihi: "", bitisTarihi: "" })
      fetchData()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleCreateAltYuklenici = async () => {
    try {
      const res = await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "ALT_YUKLENICI",
          firmaAd: altForm.firmaAd,
          vergiNo: altForm.vergiNo || null,
          durum: altForm.durum
        })
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Hata oluştu")
        return
      }
      setShowAltForm(false)
      setAltForm({ firmaAd: "", vergiNo: "", durum: "TASLAK" })
      fetchData()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleIkame = async (id: string, currentIkame: boolean) => {
    try {
      await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "RAPOR_IKAME", id, ikameEdildi: !currentIkame })
      })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (kind: string, id: string) => {
    if (!confirm("Emin misiniz?")) return
    try {
      await fetch(`/api/sozlesmeler/${sozlesmeId}/operasyon?kind=${kind}&id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="text-center py-8">Yükleniyor...</div>
  if (!data) return <div className="text-center py-8 text-error">Veri yüklenemedi</div>

  const sozlesme = data.sozlesme
  const stats = data.stats

  return (
    <div className="space-y-6 mt-6">
      {/* SLA ve Risk Özeti */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded bg-surface-container-low border border-outline-variant">
          <p className="text-xs text-on-surface-variant uppercase font-bold mb-1">Toplam Ceza</p>
          <p className="text-2xl font-bold">{stats.totalCezaTutar.toLocaleString("tr-TR")} ₺</p>
          <p className="text-sm text-on-surface-variant mt-1">% {stats.totalCezaYuzde.toFixed(2)} (Limit: %{sozlesme.cezaUstSinirYuzde})</p>
        </div>
        <div className="p-4 rounded bg-surface-container-low border border-outline-variant">
          <p className="text-xs text-on-surface-variant uppercase font-bold mb-1">Kritik Kesinti Eşiği</p>
          <p className="text-2xl font-bold">{sozlesme.kritikKesintiSaat} Saat</p>
          <p className="text-sm text-on-surface-variant mt-1">Aşım cezası: %{sozlesme.kritikKesintiCezaYuzde}</p>
        </div>
        <div className="p-4 rounded bg-surface-container-low border border-outline-variant">
          <p className="text-xs text-on-surface-variant uppercase font-bold mb-1">Alt Yüklenici Kuralı</p>
          <p className="text-2xl font-bold">{sozlesme.altYukleniciKural === "YASAK" ? "Yasak" : "İzinli"}</p>
        </div>
      </div>

      {/* Olaylar / Incidents */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
          <h3 className="text-lg font-bold">Olaylar ve Uyarılar (SLA)</h3>
          {isAdmin && (
            <button onClick={() => setShowIncidentForm(!showIncidentForm)} className="bg-primary-container text-on-primary-container px-3 py-1 text-sm rounded border border-outline-variant hover:opacity-90">
              + Olay Ekle
            </button>
          )}
        </div>

        {showIncidentForm && (
          <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-4 text-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Tip</label>
                <select value={incidentForm.tip} onChange={e => setIncidentForm({...incidentForm, tip: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2">
                  <option value="KESINTI">Kesinti (SLA)</option>
                  <option value="DONEM_SONLANDIRMA">Dönem Sonlandırma</option>
                  <option value="OZEL_AYKIRILIK">Özel Aykırılık</option>
                  <option value="ALT_YUKLENICI_IHLAL">Alt Yüklenici İhlali</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Ceza Tutar (TL)</label>
                <input type="number" step="0.01" value={incidentForm.cezaTutar} onChange={e => setIncidentForm({...incidentForm, cezaTutar: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2" />
              </div>
              {incidentForm.tip === "KESINTI" && (
                <div>
                  <label className="block font-medium mb-1">Süre (Saat)</label>
                  <input type="number" step="0.1" value={incidentForm.sureSaat} onChange={e => setIncidentForm({...incidentForm, sureSaat: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2" />
                </div>
              )}
              <div className="col-span-2">
                <label className="block font-medium mb-1">Açıklama</label>
                <input type="text" value={incidentForm.aciklama} onChange={e => setIncidentForm({...incidentForm, aciklama: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowIncidentForm(false)} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded">İptal</button>
              <button type="button" onClick={handleCreateIncident} className="px-3 py-2 bg-primary text-on-primary rounded">Kaydet</button>
            </div>
          </div>
        )}

        {(!sozlesme.incidents || sozlesme.incidents.length === 0) ? (
          <div className="text-center py-6 text-on-surface-variant border border-dashed border-outline-variant rounded bg-surface-container-low text-sm">Olay kaydı bulunmuyor.</div>
        ) : (
          <div className="space-y-3">
            {sozlesme.incidents.map((i: any) => (
              <div key={i.id} className={`border p-3 rounded flex justify-between items-center text-sm ${i.riskSeviye === 'CRITICAL' ? 'border-error bg-error-container text-on-error-container' : i.riskSeviye === 'WARNING' ? 'border-orange-500 bg-orange-50' : 'border-outline-variant bg-surface-container-low'}`}>
                <div>
                  <p className="font-bold">{i.tip} {i.riskSeviye === 'CRITICAL' && '(Fesih Riski)'}</p>
                  {i.aciklama && <p className="text-xs mt-1">{i.aciklama}</p>}
                  <div className="flex gap-4 mt-2 text-xs opacity-80">
                    {i.sureSaat != null && <span>Süre: {i.sureSaat} Saat</span>}
                    {i.cezaTutar > 0 && <span>Ceza: {Number(i.cezaTutar).toLocaleString("tr-TR")} ₺</span>}
                    <span>{new Date(i.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete("INCIDENT", i.id)} className="text-error hover:opacity-80 font-bold ml-4">Sil</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personel Raporları */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
            <h3 className="text-lg font-bold">Personel Raporları</h3>
            {isAdmin && (
              <button onClick={() => setShowRaporForm(!showRaporForm)} className="text-xs bg-primary-container text-on-primary-container px-2 py-1 rounded border border-outline-variant hover:opacity-90">
                + Rapor Ekle
              </button>
            )}
          </div>

          {showRaporForm && (
            <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-4 text-sm space-y-3">
              <div>
                <label className="block font-medium mb-1">Personel Ad Soyad</label>
                <input type="text" value={raporForm.personelAdSoyad} onChange={e => setRaporForm({...raporForm, personelAdSoyad: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2 py-1" />
              </div>
              <div>
                <label className="block font-medium mb-1">Rapor Süresi (Gün)</label>
                <input type="number" value={raporForm.raporGun} onChange={e => setRaporForm({...raporForm, raporGun: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRaporForm(false)} className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded">İptal</button>
                <button type="button" onClick={handleCreateRapor} className="px-2 py-1 bg-primary text-on-primary rounded">Kaydet</button>
              </div>
            </div>
          )}

          {(!sozlesme.personelRaporlar || sozlesme.personelRaporlar.length === 0) ? (
            <div className="text-center py-6 text-on-surface-variant border border-dashed border-outline-variant rounded bg-surface-container-low text-sm">Rapor kaydı bulunmuyor.</div>
          ) : (
            <div className="space-y-3">
              {sozlesme.personelRaporlar.map((r: any) => (
                <div key={r.id} className={`border p-3 rounded text-sm ${r.raporGun > 7 && !r.ikameEdildi ? 'border-error bg-error-container text-on-error-container' : 'border-outline-variant bg-surface-container-low'}`}>
                  <div className="flex justify-between">
                    <p className="font-bold">{r.personelAdSoyad}</p>
                    <p className="font-bold">{r.raporGun} Gün</p>
                  </div>
                  {r.raporGun > 7 && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={r.ikameEdildi} onChange={() => handleIkame(r.id, r.ikameEdildi)} disabled={!isAdmin} />
                      <label className="font-medium">İkame edildi</label>
                      {!r.ikameEdildi && <span className="text-error font-bold ml-auto">İkame zorunlu!</span>}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="mt-2 text-right">
                      <button onClick={() => handleDelete("RAPOR", r.id)} className="text-error hover:opacity-80 text-xs font-bold">Sil</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Yükleniciler */}
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
            <h3 className="text-lg font-bold">Alt Yükleniciler</h3>
            {isAdmin && (
              <button onClick={() => setShowAltForm(!showAltForm)} className="text-xs bg-primary-container text-on-primary-container px-2 py-1 rounded border border-outline-variant hover:opacity-90">
                + Alt Yüklenici Ekle
              </button>
            )}
          </div>

          {showAltForm && (
            <div className="bg-surface-container-low p-4 rounded border border-outline-variant mb-4 text-sm space-y-3">
              <div>
                <label className="block font-medium mb-1">Firma Adı</label>
                <input type="text" value={altForm.firmaAd} onChange={e => setAltForm({...altForm, firmaAd: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2 py-1" />
              </div>
              <div>
                <label className="block font-medium mb-1">Vergi No</label>
                <input type="text" value={altForm.vergiNo} onChange={e => setAltForm({...altForm, vergiNo: e.target.value})} className="w-full border border-outline-variant bg-surface-container-lowest rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAltForm(false)} className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded">İptal</button>
                <button type="button" onClick={handleCreateAltYuklenici} className="px-2 py-1 bg-primary text-on-primary rounded">Kaydet</button>
              </div>
            </div>
          )}

          {(!sozlesme.altYukleniciler || sozlesme.altYukleniciler.length === 0) ? (
            <div className="text-center py-6 text-on-surface-variant border border-dashed border-outline-variant rounded bg-surface-container-low text-sm">Alt yüklenici kaydı bulunmuyor.</div>
          ) : (
            <div className="space-y-3">
              {sozlesme.altYukleniciler.map((a: any) => (
                <div key={a.id} className="border border-outline-variant bg-surface-container-low p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <p className="font-bold">{a.firmaAd}</p>
                    <span className="text-xs px-2 py-1 bg-surface-container-highest rounded">{a.durum}</span>
                  </div>
                  {a.vergiNo && <p className="text-xs mt-1 text-on-surface-variant">VN: {a.vergiNo}</p>}
                  {isAdmin && (
                    <div className="mt-2 text-right">
                      <button onClick={() => handleDelete("ALT_YUKLENICI", a.id)} className="text-error hover:opacity-80 text-xs font-bold">Sil</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
