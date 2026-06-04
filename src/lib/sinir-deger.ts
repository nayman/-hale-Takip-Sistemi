/**
 * Kanun 4734'e göre Hizmet Alımı Sınır Değer Hesabı
 * SD = ((YM + Σ Tn) / (n + 1)) * R
 * 
 * Tn: Yaklaşık Maliyete (YM) eşit veya daha düşük olan geçerli tekliflerin tutarı.
 * n: Tn'e giren tekliflerin sayısı.
 * R: Sınır değer katsayısı (örneğin 0.79, 0.82 vb.)
 */
export function hesaplaSinirDeger(
  ymTutar: number,
  rKatsayisi: number,
  teklifler: number[]
): { sinirDeger: number; Tn: number[]; n: number } {
  // YM'den küçük veya eşit olan teklifleri filtrele
  const Tn = teklifler.filter(t => t <= ymTutar);
  const n = Tn.length;
  const sumTn = Tn.reduce((sum, val) => sum + val, 0);
  
  // Formül: ((YM + sumTn) / (n + 1)) * R
  const sinirDeger = ((ymTutar + sumTn) / (n + 1)) * rKatsayisi;
  
  return {
    sinirDeger: Math.round(sinirDeger * 100) / 100, // 2 basamak hassasiyet
    Tn,
    n
  };
}

/**
 * Teklifleri sıralar ve sınır değere göre durum belirler.
 * Fiyat bazlı artan sıralama (en düşük fiyat en avantajlıdır).
 * Sınır değerin altındaki teklifler "Aşırı Düşük Teklif Sorgulaması"na tabidir.
 */
export interface TeklifSiralamaItem {
  id: string;
  firmaAdi: string;
  teklifTutar: number;
  bizimTeklifMi: boolean;
  sira?: number;
  kirimOrani: number;
  durum: 'AVANTAJLI' | 'SIRALAMADA' | 'ASIRI_DUSUK';
}

export function siralaTeklifler(
  ymTutar: number,
  sinirDeger: number | null,
  teklifler: { id: string; ad: string; teklifTutar: number; bizimTeklifMi: boolean }[]
): TeklifSiralamaItem[] {
  // Teklif tutarına göre küçükten büyüğe sırala
  const sorted = [...teklifler].sort((a, b) => a.teklifTutar - b.teklifTutar);
  
  return sorted.map((t, index) => {
    const kirimOrani = ymTutar > 0 ? ((ymTutar - t.teklifTutar) / ymTutar) * 100 : 0;
    
    let durum: 'AVANTAJLI' | 'SIRALAMADA' | 'ASIRI_DUSUK' = 'SIRALAMADA';
    if (sinirDeger !== null && t.teklifTutar < sinirDeger) {
      durum = 'ASIRI_DUSUK';
    } else if (index === 0) {
      durum = 'AVANTAJLI';
    }
    
    return {
      id: t.id,
      firmaAdi: t.ad,
      teklifTutar: t.teklifTutar,
      bizimTeklifMi: t.bizimTeklifMi,
      sira: index + 1,
      kirimOrani: Math.round(kirimOrani * 100) / 100,
      durum
    };
  });
}
