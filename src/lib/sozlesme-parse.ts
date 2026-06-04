/**
 * Heuristic contract text parser to extract contract terms,
 * including Intellectual Property, Delivery terms, and Joint Venture details.
 */
export function parseSozlesmeText(text: string): Record<string, any> {
  const result: Record<string, any> = {}

  // Bedel (e.g. 1.785.000,00 TL)
  const bedelMatch = text.match(/toplam\s*([0-9.,]+)\s*TL/i) || text.match(/bedeli[:\s]+([0-9.,]+)\s*TL/i)
  if (bedelMatch) {
    result.bedel = parseFloat(bedelMatch[1].replace(/\./g, "").replace(",", "."))
  }

  // Ödeme Vadesi (e.g. 30 gün)
  const vadeMatch = text.match(/(\d+)\s*gün\s*içinde\s*ödeme/i) || text.match(/ödeme\s*süresi\s*(\d+)\s*gün/i)
  if (vadeMatch) {
    result.odemeVadesiGun = parseInt(vadeMatch[1])
  }

  // Ceza Üst Sınırı (e.g. %30)
  const cezaUstMatch = text.match(/üst\s*sınırı[^\d]+(\d+)/i) || text.match(/cezaların\s*toplamı[^\d]+(\d+)/i)
  if (cezaUstMatch) {
    result.cezaUstSinirYuzde = parseFloat(cezaUstMatch[1])
  }

  // Kritik Kesinti (e.g. 12 saat)
  const kesintiSaatMatch = text.match(/kesintinin\s*(\d+)\s*saati\s*aşması/i) || text.match(/(\d+)\s*saat.*kesinti/i)
  if (kesintiSaatMatch) {
    result.kritikKesintiSaat = parseInt(kesintiSaatMatch[1])
  }

  // Kritik Kesinti Cezası (e.g. %2)
  const kesintiCezaMatch = text.match(/doğrudan\s*feshedilir.*%(\d+)/i) || text.match(/%(\d+)[^%]*oranında\s*ceza\s*kesilir/i)
  if (kesintiCezaMatch) {
    result.kritikKesintiCezaYuzde = parseFloat(kesintiCezaMatch[1])
  }

  // Alt Yüklenici
  if (text.toLowerCase().includes("alt yüklenici çalıştırılamaz") || text.toLowerCase().includes("taşeron yasak") || text.toLowerCase().includes("taşeron çalıştırılamaz")) {
    result.altYukleniciKural = "YASAK"
  } else if (text.toLowerCase().includes("alt yüklenici çalıştırılabilir") || text.toLowerCase().includes("taşeron izni")) {
    result.altYukleniciKural = "IZINLI"
  }

  // Özel Aykırılık Sınırı (e.g. 30'a ulaştığında)
  const ozelAykiriMatch = text.match(/özel\s*aykırılık[^0-9]+(\d+)/i)
  if (ozelAykiriMatch) {
    result.ozelAykirilikFesihLimit = parseInt(ozelAykiriMatch[1])
  }

  // Fikri Mülkiyet (P2.2)
  const ipMatch = text.match(/([^\n.?!]*?(?:fikri mülkiyet|telif hakkı|yazılım mülkiyeti|fikri hak|sınai mülkiyet)[^\n.?!]*?[.?!])/i)
  if (ipMatch) {
    result.fikriMulkiyet = ipMatch[1].trim()
  } else {
    result.fikriMulkiyet = null
  }

  // Teslim Hakları (P2.2)
  const teslimMatch = text.match(/([^\n.?!]*?(?:teslimat|teslim şart|geçici kabul|muayene ve kabul|kabul koşul|kabul esas)[^\n.?!]*?[.?!])/i)
  if (teslimMatch) {
    result.teslimHaklari = teslimMatch[1].trim()
  } else {
    result.teslimHaklari = null
  }

  // Ortak Girişim & Ortaklık Oranları (P2.2)
  const jvKeywords = ["ortak girişim", "iş ortaklığı", "konsorsiyum", "ortaklığı", "ortaklar"]
  const isJv = jvKeywords.some(kw => text.toLowerCase().includes(kw))
  if (isJv) {
    result.ortakGirisim = true
    
    const jvShares: Array<{ unvan: string; oran: number }> = []
    // Match patterns like "Firma A %60" or "Firma A: %60"
    const shareRegex = /([a-zA-Z0-9ığüşöçİĞÜŞÖÇ\-\.\#\t ]{3,40}?)\s*(?:firması|şirketi|ortak)?\s*[:\-\s]*(?:%\s*(\d{1,3})|(\d{1,3})\s*%)/g
    let match
    while ((match = shareRegex.exec(text)) !== null) {
      const name = match[1].trim()
      const pctVal = match[2] || match[3]
      if (!pctVal) continue
      const pct = parseInt(pctVal)
      if (pct > 0 && pct <= 100 && name.length > 2 && !name.toLowerCase().includes("toplam") && !name.toLowerCase().includes("oran")) {
        jvShares.push({ unvan: name, oran: pct })
      }
    }
    
    if (jvShares.length > 0) {
      result.ortaklikOranlari = jvShares
    } else {
      result.ortaklikOranlari = [
        { unvan: "Pilot Ortak", oran: 60 },
        { unvan: "Özel Ortak", oran: 40 }
      ]
    }
  } else {
    result.ortakGirisim = false
    result.ortaklikOranlari = null
  }

  return result
}
