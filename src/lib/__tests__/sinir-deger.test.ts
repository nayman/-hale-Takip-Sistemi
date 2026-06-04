import { describe, it, expect } from 'vitest'
import { hesaplaSinirDeger, siralaTeklifler } from '../sinir-deger'

describe('Sınır Değer Motoru (Hizmet Alımı)', () => {
  it('should calculate border value correctly using SD = ((YM + sum(Tn)) / (n + 1)) * R formula', () => {
    const ymTutar = 1000000 // 1M TL Yaklaşık Maliyet
    const rKatsayisi = 0.79 // R katsayısı
    const teklifler = [
      800000,   // Tn
      900000,   // Tn
      1000000,  // Tn
      1100000,  // > YM (Filtrelenmeli)
      1200000   // > YM (Filtrelenmeli)
    ]

    const result = hesaplaSinirDeger(ymTutar, rKatsayisi, teklifler)

    // YM'den küçük veya eşit olanlar: [800000, 900000, 1000000] -> n = 3
    // Toplam Tn = 2700000
    // Formül: ((1000000 + 2700000) / (3 + 1)) * 0.79
    // = (3700000 / 4) * 0.79 = 925000 * 0.79 = 730750
    expect(result.n).toBe(3)
    expect(result.Tn).toEqual([800000, 900000, 1000000])
    expect(result.sinirDeger).toBe(730750)
  })

  it('should handle empty bidder lists gracefully', () => {
    const ymTutar = 500000
    const rKatsayisi = 0.85
    const teklifler: number[] = []

    const result = hesaplaSinirDeger(ymTutar, rKatsayisi, teklifler)

    // n = 0, sumTn = 0
    // ((500000 + 0) / (0 + 1)) * 0.85 = 500000 * 0.85 = 425000
    expect(result.n).toBe(0)
    expect(result.sinirDeger).toBe(425000)
  })

  it('should sort and classify bids correctly', () => {
    const ymTutar = 1000000
    const sinirDeger = 750000
    
    const inputBids = [
      { id: '1', ad: 'Rakip A', teklifTutar: 800000, bizimTeklifMi: false },
      { id: '2', ad: 'Bizim Firma', teklifTutar: 720000, bizimTeklifMi: true },
      { id: '3', ad: 'Rakip B', teklifTutar: 950000, bizimTeklifMi: false },
    ]

    const result = siralaTeklifler(ymTutar, sinirDeger, inputBids)

    // Sıralama (küçükten büyüğe): 
    // 1. Bizim Firma (720000) - durum: ASIRI_DUSUK (çünkü < 750000)
    // 2. Rakip A (800000) - durum: SIRALAMADA
    // 3. Rakip B (950000) - durum: SIRALAMADA
    // Not: Normalde en ucuz teklif "AVANTAJLI" olur ancak sınır değerin altındaysa "ASIRI_DUSUK" olarak sınıflandırılır.
    
    expect(result[0].id).toBe('2')
    expect(result[0].sira).toBe(1)
    expect(result[0].durum).toBe('ASIRI_DUSUK')
    expect(result[0].kirimOrani).toBe(28) // (1000000 - 720000) / 1000000 * 100

    expect(result[1].id).toBe('1')
    expect(result[1].sira).toBe(2)
    // Sınır değerin üzerindeki en ucuz teklif olduğundan (veya ilk sıradaki aşırı düşük olduğu için) bu teklif sıralamada
    expect(result[1].durum).toBe('SIRALAMADA') 
  })
})
