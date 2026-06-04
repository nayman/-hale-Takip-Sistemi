import { describe, it, expect } from 'vitest'
import { isIsGunu, getIsGunuOnce, hesaplaHukukiSureler, getIsGunuSayisi } from '../hukuki-surec'

describe('Hukuki Süre ve İş Günü Hesaplayıcı', () => {

  it('hafta sonlarını iş günü saymamalıdır', () => {
    const cumartesi = new Date('2026-05-16') // Cumartesi
    const pazar = new Date('2026-05-17') // Pazar
    const pazartesi = new Date('2026-05-18') // Pazartesi

    expect(isIsGunu(cumartesi)).toBe(false)
    expect(isIsGunu(pazar)).toBe(false)
    expect(isIsGunu(pazartesi)).toBe(true)
  })

  it('resmi tatilleri iş günü saymamalıdır', () => {
    const tatil = new Date('2026-05-19') // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
    const tatiller = [tatil]

    expect(isIsGunu(tatil, tatiller)).toBe(false)
  })

  it('ihale tarihinden 3 iş günü öncesini doğru hesaplamalıdır', () => {
    // 20 Mayis 2026 Çarşamba
    const ihaleTarihi = new Date('2026-05-20T10:00:00.000Z')

    // Tatil yokken:
    // 1 iş günü önce: 19 Mayıs Salı
    // 2 iş günü önce: 18 Mayıs Pazartesi
    // 3 iş günü önce: 15 Mayıs Cuma (hafta sonu atlanır)
    const { itirazSonGunu, kritikUyariGunu } = hesaplaHukukiSureler(ihaleTarihi)

    expect(itirazSonGunu.toISOString().split('T')[0]).toBe('2026-05-15')
    expect(kritikUyariGunu.toISOString().split('T')[0]).toBe('2026-05-14')
  })

  it('resmi tatil varken süreleri doğru kaydırmalıdır', () => {
    // 20 Mayis 2026 Çarşamba
    const ihaleTarihi = new Date('2026-05-20T10:00:00.000Z')
    // 19 Mayıs resmi tatil
    const tatiller = [new Date('2026-05-19')]

    // 19 Mayıs tatil olduğundan:
    // 1 iş günü önce: 18 Mayıs Pazartesi
    // 2 iş günü önce: 15 Mayıs Cuma
    // 3 iş günü önce: 14 Mayıs Perşembe
    // 4 iş günü önce: 13 Mayıs Çarşamba
    const { itirazSonGunu, kritikUyariGunu } = hesaplaHukukiSureler(ihaleTarihi, tatiller)

    expect(itirazSonGunu.toISOString().split('T')[0]).toBe('2026-05-14')
    expect(kritikUyariGunu.toISOString().split('T')[0]).toBe('2026-05-13')
  })

  it('iki tarih arasındaki iş günü sayısını doğru bulmalıdır', () => {
    const baslangic = new Date('2026-05-11') // Pazartesi
    const bitis = new Date('2026-05-15') // Cuma
    // Arada 5 gün var (11, 12, 13, 14, 15)

    expect(getIsGunuSayisi(baslangic, bitis)).toBe(5)
  })
})
