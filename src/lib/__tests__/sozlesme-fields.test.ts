import { describe, it, expect, vi } from 'vitest'
import { resolvePathForLegacy } from '../storage-adapter'
import { prismaClient } from '../prisma-client'
import { parseSozlesmeText } from '../sozlesme-parse'

// Mock prismaClient
vi.mock('../prisma-client', () => ({
  prismaClient: {
    ihale: {
      findMany: vi.fn(),
    },
  },
  withTenant: vi.fn((tenantId, fn) => fn(prismaClient)),
}))

describe('Sözleşme Fikri Mülkiyet, Teslim Hakları ve Ortak Girişim Alanları', () => {
  it('resolvePathForLegacy legacy ihale yolunu doğru çözümlüyor', async () => {
    const mockIhale = {
      id: 'ihale-123',
      ihaleNo: '2026/100',
      ad: 'Yol Yapım İşi',
      teklifSonTarihi: new Date('2026-06-01'),
      kurum: {
        ad: 'Karayolları Genel Müdürlüğü'
      }
    }
    ;(prismaClient.ihale.findMany as any).mockResolvedValue([mockIhale])

    const legacyPath = '02_Ihale/2026/2026_100_Yol_Yapim_Isi/teklif.pdf'
    const resolved = await resolvePathForLegacy(legacyPath)

    // Target folder template: Ihaleler/2026_2026_100_Karayolları_Genel_Mü
    expect(resolved).toContain('Ihaleler/2026_')
    expect(resolved).toContain('02_Teklif_ve_Yeterlik_Belgeleri/teklif.pdf')
  })

  it('Sözleşme metninden Fikri Mülkiyet, Teslim Hakları ve Ortak Girişim oranlarını doğru parse ediyor', async () => {
    const contractText = `
      Bu sözleşmenin konusu Yol Yapım İşidir.
      Sözleşme bedeli 5.000.000 TL olarak belirlenmiştir.
      İşbu sözleşme kapsamında geliştirilen yazılım mülkiyeti ve tüm fikri mülkiyet hakları idareye ait olacaktır.
      Teslimat ve geçici kabul işlemleri şartnamede belirtilen esaslara göre 30 gün içinde yapılacaktır.
      Bu ihale bir ortak girişim olarak üstlenilmiştir.
      İş ortaklığı ortaklık oranları şu şekildedir:
      Pilot Firma A %65 oranında,
      Ortak Firma B %35 oranında paya sahiptir.
    `

    const data = parseSozlesmeText(contractText)
    expect(data.fikriMulkiyet).toContain('fikri mülkiyet hakları idareye ait olacaktır')
    expect(data.teslimHaklari).toContain('geçici kabul işlemleri şartnamede belirtilen esaslara göre')
    expect(data.ortakGirisim).toBe(true)
    expect(data.ortaklikOranlari).toEqual(expect.arrayContaining([
      expect.objectContaining({ unvan: 'Pilot Firma A', oran: 65 }),
      expect.objectContaining({ unvan: 'Ortak Firma B', oran: 35 }),
    ]))
  })
})
