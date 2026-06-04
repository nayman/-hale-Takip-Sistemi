/**
 * 4734 Sayılı Kamu İhale Kanunu Hukuki Süre Hesaplama Servisi
 */

/**
 * Bir tarihin resmi tatil veya arefe olup olmadığını denetler.
 * Hafta sonlarını (Cumartesi, Pazar) otomatik olarak tatil sayar.
 */
export function isIsGunu(date: Date, resmiTatiller: Date[] = []): boolean {
  const day = date.getDay()
  // 0: Pazar, 6: Cumartesi
  if (day === 0 || day === 6) {
    return false
  }

  // Tarihi YYYY-MM-DD formatında normalize et
  const dateStr = date.toISOString().split('T')[0]
  
  // Resmi tatil listesinde var mı kontrol et
  const isTatil = resmiTatiller.some(tatil => {
    const tatilStr = tatil.toISOString().split('T')[0]
    return tatilStr === dateStr
  })

  return !isTatil
}

/**
 * Belirli bir tarihten itibaren N iş günü öncesine gider.
 * DimTakvim ve ResmiTatil mantığıyla uyumludur.
 */
export function getIsGunuOnce(startDate: Date, isGunuSayisi: number, resmiTatiller: Date[] = []): Date {
  const result = new Date(startDate.getTime())
  let count = 0
  
  while (count < isGunuSayisi) {
    // 1 gün geriye git
    result.setDate(result.getDate() - 1)
    
    if (isIsGunu(result, resmiTatiller)) {
      count++
    }
  }
  
  return result
}

/**
 * İhale tarihine göre 4734 Kamu İhale Kanunu yasal sürelerini hesaplar.
 * - İtiraz Son Günü: İhale tarihinden 3 iş günü öncesi.
 * - Kritik Uyarı Günü: İhale tarihinden 4 iş günü öncesi.
 */
export function hesaplaHukukiSureler(ihaleTarihi: Date, resmiTatiller: Date[] = []) {
  const itirazSonGunu = getIsGunuOnce(ihaleTarihi, 3, resmiTatiller)
  const kritikUyariGunu = getIsGunuOnce(ihaleTarihi, 4, resmiTatiller)

  // Tarihleri saat 00:00:00 olarak sıfırla
  itirazSonGunu.setUTCHours(0, 0, 0, 0)
  kritikUyariGunu.setUTCHours(0, 0, 0, 0)

  return {
    itirazSonGunu,
    kritikUyariGunu
  }
}

/**
 * İki tarih arasındaki iş günü sayısını hesaplar.
 */
export function getIsGunuSayisi(startDate: Date, endDate: Date, resmiTatiller: Date[] = []): number {
  const start = new Date(Math.min(startDate.getTime(), endDate.getTime()))
  const end = new Date(Math.max(startDate.getTime(), endDate.getTime()))
  
  let count = 0
  const current = new Date(start.getTime())
  
  while (current <= end) {
    if (isIsGunu(current, resmiTatiller)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}
