/**
 * Sözleşme Bedeli girildiğinde yasal kesinti ve teminat tutarlarını hesaplar.
 */

export interface SozlesmeHesapSonucu {
  kesinTeminatTutari: number
  damgaVergisi: number
  kararPulu: number
  kikPayi: number
}

export function hesaplaSozlesmeKesintileri(bedel: number): SozlesmeHesapSonucu {
  if (!bedel || bedel <= 0) {
    return {
      kesinTeminatTutari: 0,
      damgaVergisi: 0,
      kararPulu: 0,
      kikPayi: 0
    }
  }

  // Kurallar:
  // Kesin Teminat: %6
  const kesinTeminatTutari = bedel * 0.06

  // Damga Vergisi: Binde 9.48
  const damgaVergisi = bedel * 0.00948

  // Karar Pulu: Binde 5.69
  const kararPulu = bedel * 0.00569

  // KİK Payı: 2026 yılı için belirlenen eşik değer 6.813.294 TL. Üzerinde ise onbinde 5.
  const KIK_LIMITI = 6813294
  const kikPayi = bedel > KIK_LIMITI ? bedel * 0.0005 : 0

  return {
    kesinTeminatTutari: parseFloat(kesinTeminatTutari.toFixed(2)),
    damgaVergisi: parseFloat(damgaVergisi.toFixed(2)),
    kararPulu: parseFloat(kararPulu.toFixed(2)),
    kikPayi: parseFloat(kikPayi.toFixed(2))
  }
}
