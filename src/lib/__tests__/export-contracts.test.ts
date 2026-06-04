import { describe, it, expect, vi } from 'vitest'
import { GET as hakedisExportGet } from '../../app/api/ihaleler/[id]/hakedis/export/route'
import { GET as analizExportGet } from '../../app/api/dashboard/analiz/export/route'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => ({
    user: {
      tenantId: 'mock-tenant-id'
    }
  }))
}))

vi.mock('@/lib/prisma-client', () => {
  const mockTx = {
    hakedis: {
      findMany: vi.fn(async () => [
        {
          id: 'hakedis-1',
          yil: 2026,
          ay: 6,
          brutTutar: 100000,
          kdvOrani: 20,
          kdvTutari: 20000,
          stopajOrani: 0,
          stopajTutari: 0,
          ceza: 0,
          digerKesinti: 0,
          netTutar: 120000,
          durum: 'ODENDI',
          odemeTarihi: new Date('2026-06-15'),
          createdAt: new Date('2026-06-02'),
        }
      ]),
    },
    hakedisChecklistItem: {
      findMany: vi.fn(async () => [
        {
          hakedisId: 'hakedis-1',
          belgeKodu: 'FATURA',
          durum: 'TAMAMLANDI'
        }
      ])
    },
    ihale: {
      findMany: vi.fn(async () => [
        {
          ihaleNo: '2026/1',
          ad: 'Test İhalesi',
          durum: 'DEVAM_EDIYOR',
          teklifSonTarihi: new Date('2026-06-10'),
          butce: 500000,
          ymTutar: 480000,
          sinirDeger: 450000,
          teklifimiz: 460000,
          kurum: { ad: 'Test Kurumu' }
        }
      ])
    },
    ihaleRakip: {
      findMany: vi.fn(async () => [
        {
          teklifTutar: 470000,
          ihaleId: 'ihale-1',
          rakipFirma: { id: 'rakip-1', ad: 'Rakip A' }
        }
      ])
    }
  }
  return {
    prismaClient: mockTx,
    withTenant: vi.fn(async (tenantId, fn) => {
      return fn(mockTx)
    })
  }
})

describe('CSV Dışa Aktarım Smoke Testleri (Story E2)', () => {
  it('Hakediş muhasebe CSV dışa aktarımı BOM ve doğru sütun başlıkları ile başlar', async () => {
    const mockReq = {
      url: 'http://localhost/api/ihaleler/ihale-1/hakedis/export?year=2026'
    } as any

    const params = Promise.resolve({ id: 'ihale-1' })

    const response = await hakedisExportGet(mockReq, { params })
    expect(response.status).toBe(200)

    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check UTF-8 BOM (0xEF, 0xBB, 0xBF)
    expect(bytes[0]).toBe(0xEF)
    expect(bytes[1]).toBe(0xBB)
    expect(bytes[2]).toBe(0xBF)

    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(buffer)

    // Contains headers
    expect(text).toContain('Yıl')
    expect(text).toContain('Ay')
    expect(text).toContain('Brüt')
    expect(text).toContain('Net')
    expect(text).toContain('Fatura (Checklist)')
  })

  it('Dashboard analiz ihale performansı CSV dışa aktarımı BOM ve doğru başlıkları içerir', async () => {
    const mockReq = {
      url: 'http://localhost/api/dashboard/analiz/export?type=ihale&months=6'
    } as any

    const response = await analizExportGet(mockReq)
    expect(response.status).toBe(200)

    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check UTF-8 BOM
    expect(bytes[0]).toBe(0xEF)
    expect(bytes[1]).toBe(0xBB)
    expect(bytes[2]).toBe(0xBF)

    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(buffer)

    expect(text).toContain('IKN')
    expect(text).toContain('İhale Adı')
    expect(text).toContain('Bütçe')
    expect(text).toContain('Teklif/YM (%)')
  })

  it('Dashboard analiz rakip performansı CSV dışa aktarımı BOM ve doğru başlıkları içerir', async () => {
    const mockReq = {
      url: 'http://localhost/api/dashboard/analiz/export?type=rakip&months=6'
    } as any

    const response = await analizExportGet(mockReq)
    expect(response.status).toBe(200)

    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check UTF-8 BOM
    expect(bytes[0]).toBe(0xEF)
    expect(bytes[1]).toBe(0xBB)
    expect(bytes[2]).toBe(0xBF)

    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(buffer)

    expect(text).toContain('Rakip Firma')
    expect(text).toContain('İhale Sayısı')
    expect(text).toContain('Ortalama Teklif')
  })
})
