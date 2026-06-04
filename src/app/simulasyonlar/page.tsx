"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function SimulasyonSayfasi() {
  type JobType = 'MAL' | 'YAPIM' | 'HIZMET_PERSONEL' | 'HIZMET_PERSONELSIZ'

  // Input parameters
  const [approxCost, setApproxCost] = useState<number>(12500000)
  const [profitMargin, setProfitMargin] = useState<number>(15)
  const [riskMargin, setRiskMargin] = useState<number>(5)

  // İş modeli / stratejik kontrol parametreleri
  const [jobType, setJobType] = useState<JobType>('YAPIM')
  const [kurKontrolEnabled, setKurKontrolEnabled] = useState<boolean>(false)
  const [ucretEndekslemeEnabled, setUcretEndekslemeEnabled] = useState<boolean>(false)
  const [sarfAyrisimEnabled, setSarfAyrisimEnabled] = useState<boolean>(false)

  // Market Scenarios
  const [usdTryRate, setUsdTryRate] = useState<number>(12)
  const [laborCostRate, setLaborCostRate] = useState<number>(8)
  const [logisticsRate, setLogisticsRate] = useState<number>(5)

  // Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'doviz_soku':
        setUsdTryRate(25)
        setLaborCostRate(5)
        setLogisticsRate(10)
        break
      case 'enflasyon':
        setUsdTryRate(10)
        setLaborCostRate(20)
        setLogisticsRate(8)
        break
      case 'lojistik_krizi':
        setUsdTryRate(8)
        setLaborCostRate(5)
        setLogisticsRate(22)
        break
      case 'dengeli':
      default:
        setUsdTryRate(0)
        setLaborCostRate(0)
        setLogisticsRate(0)
        break
    }
  }

  // Outputs
  const [baseCost, setBaseCost] = useState<number>(0)
  const [simulatedCost, setSimulatedCost] = useState<number>(0)
  const [totalOffer, setTotalOffer] = useState<number>(0)
  const [discountRate, setDiscountRate] = useState<number>(0)
  const [winProbability, setWinProbability] = useState<number>(0)
  const [probLabel, setProbLabel] = useState<string>('Orta')
  const [probColor, setProbColor] = useState<string>('text-yellow-600 bg-yellow-100')

  const [effectiveRiskMargin, setEffectiveRiskMargin] = useState<number>(riskMargin)
  const [riskReductionPp, setRiskReductionPp] = useState<number>(0)
  const [weights, setWeights] = useState<{ usd: number; labor: number; logistics: number }>({
    usd: 0.35,
    labor: 0.4,
    logistics: 0.25,
  })

  // Real-time calculation engine
  useEffect(() => {
    const baseWeights = (() => {
      switch (jobType) {
        case 'MAL':
          return { usd: 0.6, labor: 0.15, logistics: 0.25 }
        case 'HIZMET_PERSONEL':
          return { usd: 0.1, labor: 0.75, logistics: 0.15 }
        case 'HIZMET_PERSONELSIZ':
          return { usd: 0.5, labor: 0.2, logistics: 0.3 }
        case 'YAPIM':
        default:
          return { usd: 0.35, labor: 0.4, logistics: 0.25 }
      }
    })()

    const adjustedWeights = (() => {
      if (!sarfAyrisimEnabled) return baseWeights
      const reduction = Math.min(0.05, Math.max(0, baseWeights.usd - 0.05))
      const newUsd = Math.max(0, baseWeights.usd - reduction)
      const delta = baseWeights.usd - newUsd
      if (delta <= 0) return baseWeights
      if (jobType === 'HIZMET_PERSONEL') {
        return { usd: newUsd, labor: baseWeights.labor + delta, logistics: baseWeights.logistics }
      }
      return { usd: newUsd, labor: baseWeights.labor, logistics: baseWeights.logistics + delta }
    })()

    const reductionPp = (kurKontrolEnabled ? 2 : 0) + (ucretEndekslemeEnabled ? 1 : 0)
    const currentEffectiveRisk = Math.max(0, riskMargin - reductionPp)

    const effectiveUsd = kurKontrolEnabled ? usdTryRate * 0.7 : usdTryRate
    const effectiveLabor = ucretEndekslemeEnabled ? laborCostRate * 0.7 : laborCostRate

    // Assuming base project cost is about 78% of the estimated cost under normal market conditions
    const initialBase = approxCost * 0.78

    // Calculate market price escalation
    const escalationFactor =
      (effectiveUsd * adjustedWeights.usd + effectiveLabor * adjustedWeights.labor + logisticsRate * adjustedWeights.logistics) / 100
    const currentCost = initialBase * (1 + escalationFactor)

    // Offer Price includes profit and risk margins
    const offer = currentCost * (1 + (profitMargin + currentEffectiveRisk) / 100)

    // Discount Rate (Kırım Oranı) relative to Yaklaşık Maliyet
    const discount = ((approxCost - offer) / approxCost) * 100

    // Win Probability Algorithm based on Law 4734 conditions:
    // - Under 0% discount (we bid over approx cost): very low win probability
    // - Between 5% and 15% discount: high win probability (best balance)
    // - Between 15% and 25% discount: very high probability
    // - Above 25% discount: probability drops because the bid will likely be flagged as "Abnormally Low Bid" (Aşırı Düşük Teklif), requiring extensive justification, or risking disqualification.
    let probability = 50
    if (discount <= 0) {
      probability = Math.max(5, Math.min(15, 10 + discount * 2))
    } else if (discount > 0 && discount <= 10) {
      probability = 15 + discount * 5 // 15% to 65%
    } else if (discount > 10 && discount <= 20) {
      probability = 65 + (discount - 10) * 2 // 65% to 85%
    } else if (discount > 20 && discount <= 26) {
      probability = 85 - (discount - 20) * 5 // Drops back down (85% to 55%) due to low-bid investigation risk
    } else {
      probability = Math.max(10, 55 - (discount - 26) * 8) // Sharp drop for extreme bids
    }

    // Ensure range [0, 100] and round
    const finalProb = Math.max(0, Math.min(100, Math.round(probability)))
    const probLabelNext = finalProb >= 75 ? 'Yüksek' : finalProb >= 40 ? 'Orta' : 'Düşük'
    const probColorNext =
      finalProb >= 75 ? 'text-green-800 bg-green-100' : finalProb >= 40 ? 'text-yellow-800 bg-yellow-100' : 'text-red-800 bg-red-100'

    const t = setTimeout(() => {
      setWeights(adjustedWeights)
      setRiskReductionPp(reductionPp)
      setEffectiveRiskMargin(currentEffectiveRisk)
      setBaseCost(initialBase)
      setSimulatedCost(currentCost)
      setTotalOffer(offer)
      setDiscountRate(discount)
      setWinProbability(finalProb)
      setProbLabel(probLabelNext)
      setProbColor(probColorNext)
    }, 0)

    return () => clearTimeout(t)
  }, [
    approxCost,
    profitMargin,
    riskMargin,
    usdTryRate,
    laborCostRate,
    logisticsRate,
    jobType,
    kurKontrolEnabled,
    ucretEndekslemeEnabled,
    sarfAyrisimEnabled,
  ])

  return (
    <div className="min-h-screen bg-background flex text-on-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-60">
        {/* TopBar */}
        <TopBar />

        {/* Main Canvas */}
        <main className="flex-1 p-gutter overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-stack-lg">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <nav className="flex gap-2 text-xs font-semibold text-on-surface-variant mb-2">
                  <span>İhaleler</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-primary font-bold">Maliyet-Fiyat Simülasyonu</span>
                </nav>
                <h1 className="font-display-lg text-headline-md font-bold text-primary">Senaryo Analiz Aracı</h1>
                <p className="text-body-lg text-on-surface-variant mt-1">Dinamik maliyet girdileriyle teklif projeksiyonu ve kârlılık testleri.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-xs font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simülasyonu Kaydet
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Teklife Dönüştür
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-gutter">
              
              {/* Left Side: Parameters Form (5/12 cols) */}
              <div className="col-span-12 lg:col-span-5 space-y-gutter">
                
                {/* Basic Parameters */}
                <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <h3 className="font-headline-sm text-sm font-bold text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">settings_input_component</span>
                    Temel Hesap Parametreleri
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Approx Cost Input */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2">Yaklaşık İhale Maliyeti (₺)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₺</span>
                        <input 
                          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-bold" 
                          type="number" 
                          value={approxCost}
                          onChange={(e) => setApproxCost(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Target Profit margin */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-on-surface-variant">Hedef Kâr Marjı (%)</label>
                        <span className="text-xs font-bold text-primary bg-secondary-container px-2.5 py-0.5 rounded-full">%{profitMargin}</span>
                      </div>
                      <input 
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
                        type="range" 
                        min="0" 
                        max="45" 
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Risk margin */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-on-surface-variant">Risk & Beklenmedik Gider Oranı (%)</label>
                        <span className="text-xs font-bold text-error bg-error-container px-2.5 py-0.5 rounded-full">%{riskMargin}</span>
                      </div>
                      <input 
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-error" 
                        type="range" 
                        min="0" 
                        max="25" 
                        value={riskMargin}
                        onChange={(e) => setRiskMargin(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </section>

                {/* İş Türü & Stratejik Kontroller */}
                <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <h3 className="font-headline-sm text-sm font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">model_training</span>
                    İş Türü & Stratejik Kontroller
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-2">İş Türü (Ağırlıklar otomatik)</label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value as JobType)}
                        className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                      >
                        <option value="MAL">Mal Alımı (malzeme/ekipman ağırlıklı)</option>
                        <option value="YAPIM">Yapım İşi (malzeme + işçilik)</option>
                        <option value="HIZMET_PERSONEL">Hizmet (personel çalıştırılmasına dayalı)</option>
                        <option value="HIZMET_PERSONELSIZ">Hizmet (personelsiz / lisans-yakıt-kiralama)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={kurKontrolEnabled}
                          onChange={(e) => setKurKontrolEnabled(e.target.checked)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">Kur Koruma (erken peşin alım / sabit TRY / kur bandı)</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">USD/TRY etkisini düşürür ve risk payını -2 puan azaltır.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ucretEndekslemeEnabled}
                          onChange={(e) => setUcretEndekslemeEnabled(e.target.checked)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">Ücret Endeksleme (asgari ücret/SGK/yol-yemek uyarlama)</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">İşçilik şokunu azaltır ve risk payını -1 puan düşürür.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sarfAyrisimEnabled}
                          onChange={(e) => setSarfAyrisimEnabled(e.target.checked)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">Sarf/Ekipman Ayrıştırma (hizmetten ayrı kalem)</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">Kur hassasiyetini ağırlık bazında düşürür (modelde USD ağırlığı azalır).</div>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">USD ağırlığı</div>
                        <div className="text-sm font-bold text-on-surface">%{Math.round(weights.usd * 100)}</div>
                      </div>
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">İşçilik</div>
                        <div className="text-sm font-bold text-on-surface">%{Math.round(weights.labor * 100)}</div>
                      </div>
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Lojistik</div>
                        <div className="text-sm font-bold text-on-surface">%{Math.round(weights.logistics * 100)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-outline-variant">
                      <div>
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Etkin Risk Oranı</div>
                        <div className="text-sm font-bold text-on-surface">%{effectiveRiskMargin.toFixed(1)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">İndirim</div>
                        <div className="text-sm font-bold text-primary">{riskReductionPp > 0 ? `-${riskReductionPp} puan` : '0 puan'}</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Macro Market Scenarios */}
                <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline-sm text-sm font-bold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">trending_up</span>
                      Piyasa ve Enflasyon Riskleri
                    </h3>
                  </div>

                  {/* Scenario Presets Quick Selector */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button 
                      onClick={() => applyPreset('doviz_soku')}
                      className="px-3 py-1.5 text-left border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer flex flex-col"
                    >
                      <span className="text-primary font-bold">Döviz Şoku</span>
                      <span className="text-[10px] text-on-surface-variant font-normal">USD/TRY artış senaryosu</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('enflasyon')}
                      className="px-3 py-1.5 text-left border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer flex flex-col"
                    >
                      <span className="text-primary font-bold">Yüksek Enflasyon</span>
                      <span className="text-[10px] text-on-surface-variant font-normal">Asgari ücret ve işçilik şoku</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('lojistik_krizi')}
                      className="px-3 py-1.5 text-left border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer flex flex-col"
                    >
                      <span className="text-primary font-bold">Lojistik Krizi</span>
                      <span className="text-[10px] text-on-surface-variant font-normal">Nakliye & tedarik zinciri artışı</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('dengeli')}
                      className="px-3 py-1.5 text-left border border-primary/30 bg-primary/5 rounded-lg text-xs font-semibold hover:bg-primary/10 transition-all cursor-pointer flex flex-col"
                    >
                      <span className="text-primary font-bold">Dengeli / Stabil</span>
                      <span className="text-[10px] text-on-surface-variant font-normal">Varsayılan makro hedefler</span>
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Dollar currency shock slider */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">attach_money</span>
                          USD/TRY Kur Artışı (%)
                        </label>
                        <span className="text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">%{usdTryRate}</span>
                      </div>
                      <input 
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
                        type="range" 
                        min="0" 
                        max="40" 
                        value={usdTryRate}
                        onChange={(e) => setUsdTryRate(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Labor wages shock slider */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">engineering</span>
                          Asgari Ücret / İşçilik Artış Hızı (%)
                        </label>
                        <span className="text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">%{laborCostRate}</span>
                      </div>
                      <input 
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
                        type="range" 
                        min="0" 
                        max="40" 
                        value={laborCostRate}
                        onChange={(e) => setLaborCostRate(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Logistics rate shock slider */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                          Lojistik ve Tedarik Risk Artışı (%)
                        </label>
                        <span className="text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded">%{logisticsRate}</span>
                      </div>
                      <input 
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" 
                        type="range" 
                        min="0" 
                        max="40" 
                        value={logisticsRate}
                        onChange={(e) => setLogisticsRate(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Side: Projections and Results (7/12 cols) */}
              <div className="col-span-12 lg:col-span-7 space-y-gutter">
                
                {/* Key Metrics Bento row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Final Offer card */}
                  <div className="bg-primary text-on-primary rounded-xl p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div>
                      <p className="text-[10px] font-bold text-primary-fixed-dim uppercase tracking-wider mb-2">Simüle Edilen Teklif Tutarı</p>
                      <h4 className="text-lg font-bold">₺{Math.round(totalOffer).toLocaleString('tr-TR')}</h4>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      <span>%{profitMargin} Hedef Kâr Dahil</span>
                    </div>
                  </div>

                  {/* Calculated Discount Rate card */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tahmini Kırım Oranı</p>
                      <h4 className={`text-lg font-bold ${discountRate > 0 ? 'text-green-800' : 'text-red-700'}`}>
                        {discountRate > 0 ? `-%${discountRate.toFixed(2)}` : `+%${Math.abs(discountRate).toFixed(2)}`}
                      </h4>
                    </div>
                    <div className="mt-4 w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${discountRate > 25 ? 'bg-red-500' : discountRate > 15 ? 'bg-amber-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.max(5, Math.min(100, (discountRate + 10) * 2))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Calculated Win Probability card */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Kazanma İhtimali</p>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-primary">%{winProbability}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${probColor}`}>
                          {probLabel}
                        </span>
                      </div>
                    </div>
                    
                    {/* Multi-step progress bars */}
                    <div className="mt-4 flex gap-1">
                      <div className={`h-2 flex-1 rounded-full ${winProbability > 15 ? 'bg-green-500' : 'bg-surface-container-highest'}`}></div>
                      <div className={`h-2 flex-1 rounded-full ${winProbability > 45 ? 'bg-green-500' : 'bg-surface-container-highest'}`}></div>
                      <div className={`h-2 flex-1 rounded-full ${winProbability > 75 ? 'bg-green-500' : 'bg-surface-container-highest'}`}></div>
                    </div>
                  </div>
                </div>

                {/* Projections Chart */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm min-h-[380px] flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="font-headline-sm text-sm font-bold text-primary">Maliyet Projeksiyonu & Değişkenlik</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">Parametrelere göre 6 aylık enflasyonist maliyet artış simülasyonu.</p>
                    </div>
                    <div className="flex bg-surface-container rounded-lg p-1 text-xs font-semibold">
                      <span className="px-3 py-1 bg-white shadow-sm rounded text-primary">Aylık Kümülatif</span>
                    </div>
                  </div>

                  {/* Chart bars represented in react */}
                  <div className="flex-1 flex items-end justify-between gap-3 px-2 pt-6 min-h-[180px]">
                    {[
                      { month: 'Haziran', scale: 1.0 },
                      { month: 'Temmuz', scale: 1.04 },
                      { month: 'Ağustos', scale: 1.09 },
                      { month: 'Eylül', scale: 1.13 },
                      { month: 'Ekim', scale: 1.17 },
                      { month: 'Kasım', scale: 1.22 }
                    ].map((bar, index) => {
                      // Apply inflation projection to simulated cost
                      const projectedCost = simulatedCost * bar.scale
                      const baseLineCost = baseCost * bar.scale
                      
                      // Calculate height relative to estimated budget max (e.g. approxCost * 1.5)
                      const maxPossible = approxCost * 1.5
                      const costHeightPercent = Math.min(95, Math.max(10, (projectedCost / maxPossible) * 100))
                      const baseHeightPercent = Math.min(95, Math.max(10, (baseLineCost / maxPossible) * 100))

                      return (
                        <div key={index} className="flex-1 flex flex-col justify-end h-full relative group">
                          {/* Hover Tooltip */}
                          <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 bg-primary text-white text-[10px] p-2 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                            <p className="font-bold">Maliyet: ₺{Math.round(projectedCost).toLocaleString('tr-TR')}</p>
                            <p className="text-[8px] text-primary-fixed-dim">Temel: ₺{Math.round(baseLineCost).toLocaleString('tr-TR')}</p>
                          </div>

                          <div className="flex items-end justify-center w-full gap-1 h-36">
                            {/* Base cost bar */}
                            <div 
                              className="bg-primary/20 rounded-t-sm w-3.5 hover:opacity-90 transition-opacity" 
                              style={{ height: `${baseHeightPercent}%` }}
                            />
                            {/* Simulated escalated cost bar */}
                            <div 
                              className="bg-primary rounded-t-sm w-2" 
                              style={{ height: `${costHeightPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-on-surface-variant text-center block mt-3 font-semibold truncate">
                            {bar.month}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Footnotes of risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline-variant pt-4 mt-6">
                    <div className="flex gap-3 items-start p-3 bg-surface rounded-lg">
                      <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                      <div>
                        <p className="text-xs font-bold text-primary">Kamu İhale Kanunu Risk Analizi</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {discountRate > 25 ? (
                            <span className="text-red-700 font-bold">UYARI: Kırım oranı %25 sınırını aşmıştır. Aşırı düşük teklif sorgulamasına tabi tutulabilirsiniz.</span>
                          ) : discountRate < 5 ? (
                            <span>Kırım oranı düşüktür. İhaleyi kazanma ihtimali zayıflayabilir.</span>
                          ) : (
                            <span className="text-green-700 font-semibold">Teklif dengeli aralıktadır. Law 4734 mevzuat sınırlarına uygundur.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start p-3 bg-surface rounded-lg">
                      <span className="material-symbols-outlined text-primary mt-0.5">lightbulb</span>
                      <div>
                        <p className="text-xs font-bold text-primary">Stratejik Optimizasyon Notu</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {jobType === 'HIZMET_PERSONEL'
                            ? 'Personel ağırlıklı hizmette ana risk ücret/SGK oynaklığıdır. Endeksleme/uyarlama ile belirsizliği düşürüp risk payını azaltabilirsiniz; sarf/ekipman varsa ayrı kalemle yönetebilirsiniz.'
                            : jobType === 'HIZMET_PERSONELSIZ'
                            ? 'Personelsiz hizmette (lisans/yakıt/kiralama) kur hassas kalemleri erken sabitleyip TRY/kur bandı ile yöneterek risk payını düşürebilirsiniz.'
                            : jobType === 'MAL'
                            ? 'Mal alımında kur hassas kalemleri erken peşin/ toplu alım ve sabit TRY ile sabitleyip risk payını düşürebilirsiniz.'
                            : 'Yapım işinde (A) malzeme/ekipman ve (B) işçiliği ayrıştırın: kur için erken alım/sabit fiyat, işçilik için endeksleme ile risk payını kontrollü düşürün.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor baseline card */}
                <div className="bg-secondary-container/20 border border-secondary-container/40 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-secondary">groups</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">Piyasa Ortalama Rekabet Notu</p>
                      <p className="text-[10px] text-on-surface-variant">Bu ölçekteki son 5 benzer ihalede rakiplerin ortalama kırım oranı %14.2 olarak kaydedilmiştir.</p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-1.5 bg-white text-secondary font-label-md text-xs font-bold rounded-lg border border-outline-variant hover:bg-secondary hover:text-white transition-all cursor-pointer">
                    Rakip Verilerini İncele
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
