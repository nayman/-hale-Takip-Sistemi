import { prismaClient, withTenant } from './prisma-client'
import { storage } from './storage-adapter'
import { hesaplaHukukiSureler } from './hukuki-surec'
import { createAuditLog } from './audit-log'

async function notifyTenantUsers(
  tx: any,
  tenantId: string,
  input: { title: string; message: string; type: string; data?: any; userIds?: string[] }
) {
  const users = input.userIds
    ? await tx.user.findMany({
        where: { tenantId, id: { in: input.userIds } },
        select: { id: true },
      })
    : await tx.user.findMany({
        where: { tenantId, rol: { in: ['TENANT_ADMIN', 'SORUMLU', 'OPERASYON'] } },
        select: { id: true },
      })

  if (users.length === 0) return

  await tx.notification.createMany({
    data: users.map((u: { id: string }) => ({
      tenantId,
      userId: u.id,
      title: input.title,
      message: input.message,
      type: input.type,
      data: input.data ?? null,
      isRead: false,
      readAt: null,
    })),
  })
}

/**
 * Faz 6: BullMQ Worker İşlevleri ve Periyodik Görevler
 */

/**
 * 1. belge-alarm-job: Evrak bitiş tarihlerine 90, 60, 30 ve 7 gün kala bildirim tetikler.
 */
export async function checkExpiringDocuments(tenantId: string) {
  console.log('Running document expiration checks...')
  const now = new Date()
  
  // Define notification thresholds in days
  const thresholds = [90, 60, 30, 15, 7]
  
  for (const days of thresholds) {
    const targetDate = new Date()
    targetDate.setDate(now.getDate() + days)
    
    // Normalize target date to match database dates (ignoring time)
    const startDate = new Date(targetDate)
    startDate.setUTCHours(0, 0, 0, 0)
    const endDate = new Date(targetDate)
    endDate.setUTCHours(23, 59, 59, 999)

    await withTenant(tenantId, async (tx) => {
      const expiringDocs = await tx.sirketEvrak.findMany({
        where: {
          tenantId,
          durum: 'AKTIF',
          sonGecerlilikTarihi: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      if (expiringDocs.length > 0) {
        const message = expiringDocs
          .map((doc: any) => `• ${doc.ad} - ${new Date(doc.sonGecerlilikTarihi).toLocaleDateString('tr-TR')}`)
          .join('\n')

        await notifyTenantUsers(tx, tenantId, {
          title: `Evrak uyarısı (${days} gün kala)`,
          message: `${days} gün içinde süresi dolacak evraklar:\n${message}`,
          type: 'EVRAK_EXPIRATION',
          data: { days, count: expiringDocs.length, ids: expiringDocs.map((d: any) => d.id) },
        })
      }

      for (const doc of expiringDocs) {
        console.log(`Document Expiring Alarm: ${doc.ad} expires in ${days} days!`)

        await createAuditLog(
          tx,
          doc.tenantId,
          'SIRKET_EVRAK',
          doc.id,
          'UPDATE',
          doc.yukleyenUserId,
          {
            message: `Evrak geçerlilik süresi bitimine ${days} gün kaldı!`,
            evrakAdi: doc.ad,
            sonGecerlilikTarihi: doc.sonGecerlilikTarihi
          }
        )
      }
    })
  }
}

/**
 * 2. hukuki-alarm-job: İtiraz veya şikayet süresi bitimine 2 gün kala uyarı oluşturur.
 */
export async function checkLegalDeadlines(tenantId: string) {
  console.log('Running legal deadline checks...')
  const now = new Date()
  
  await withTenant(tenantId, async (tx) => {
    const [activeTenders, holidays] = await Promise.all([
      tx.ihale.findMany({
        where: {
          tenantId,
          durum: {
            in: ['TASLAK', 'DEVAM_EDİYOR', 'AKTIF']
          }
        }
      }),
      tx.resmiTatil.findMany({
        where: {
          tenantId
        }
      })
    ])

    const holidayDates = holidays.map(h => new Date(h.tarih))

    for (const ihale of activeTenders) {
      const { itirazSonGunu } = hesaplaHukukiSureler(
        new Date(ihale.teklifSonTarihi),
        holidayDates
      )

      const diffTime = itirazSonGunu.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 2) {
        console.log(`Legal Deadline Alarm: Tender ${ihale.ad} (IKN: ${ihale.ihaleNo}) is 2 days away from its legal objection deadline!`)

        await notifyTenantUsers(tx, tenantId, {
          title: 'Hukuki süre uyarısı (2 gün)',
          message: `${ihale.ihaleNo} - ${ihale.ad}\nİtiraz son gününe 2 gün kaldı.`,
          type: 'HUKUKI_ALARM',
          data: { ihaleId: ihale.id, ihaleNo: ihale.ihaleNo, itirazSonGunu },
          userIds: [ihale.olusturanUserId, ihale.sorumluUserId].filter(Boolean) as string[],
        })

        await createAuditLog(
          tx,
          ihale.tenantId,
          'IHALE',
          ihale.id,
          'UPDATE',
          ihale.olusturanUserId,
          {
            message: `İhale yasal itiraz süresi bitimine 2 gün kaldı!`,
            ihaleNo: ihale.ihaleNo,
            ad: ihale.ad,
            itirazSonTarihi: itirazSonGunu
          }
        )
      }
    }
  })
}

/**
 * 3. kalici-silme-job: Çöp kutusundaki (durumu PASIF veya IPTAL olan) 30 günü dolan dosyaları kalıcı olarak siler.
 */
export async function deleteTrashDocuments(tenantId: string) {
  console.log('Running document trash cleanup...')
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const oldInactiveDocs = await withTenant(tenantId, async (tx) =>
    tx.sirketEvrak.findMany({
      where: {
        tenantId,
        durum: {
          in: ['PASIF', 'IPTAL']
        },
        updatedAt: {
          lte: thirtyDaysAgo
        }
      }
    })
  )

  for (const doc of oldInactiveDocs) {
    try {
      console.log(`Deleting file from storage: ${doc.dosyaYolu}`)
      // Check and delete from storage adapter
      const fileExists = await storage.exists(doc.dosyaYolu)
      if (fileExists) {
        await storage.delete(doc.dosyaYolu)
      }

      await withTenant(tenantId, async (tx) => tx.sirketEvrak.delete({ where: { id: doc.id } }))

      console.log(`Permanently deleted document ${doc.ad} (ID: ${doc.id})`)
    } catch (err) {
      console.error(`Failed to permanently delete document ID ${doc.id}:`, err)
    }
  }
}

/**
 * 4. ym-alarm-job: Yaklaşık Maliyet teklif (ihale) bitiş süresine 3 gün kala uyarı tetikler.
 */
export async function checkYmAlarms(tenantId: string) {
  console.log('Running Yaklaşık Maliyet (YM) alarm checks...')
  const now = new Date()
  
  await withTenant(tenantId, async (tx) => {
    const activeTenders = await tx.ihale.findMany({
      where: {
        tenantId,
        durum: {
          in: ['TASLAK', 'DEVAM_EDİYOR', 'AKTIF']
        }
      }
    })

    for (const ihale of activeTenders) {
      if (!ihale.teklifSonTarihi) continue;

      const bitisTarihi = new Date(ihale.teklifSonTarihi)
      const diffTime = bitisTarihi.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 3) {
        console.log(`YM Alarm: Tender ${ihale.ad} (IKN: ${ihale.ihaleNo}) is 3 days away from its deadline!`)

        await notifyTenantUsers(tx, tenantId, {
          title: 'YM uyarısı (3 gün)',
          message: `${ihale.ihaleNo} - ${ihale.ad}\nTeklif son tarihine 3 gün kaldı.`,
          type: 'YM_ALARM',
          data: { ihaleId: ihale.id, ihaleNo: ihale.ihaleNo, teklifSonTarihi: bitisTarihi },
          userIds: [ihale.olusturanUserId, ihale.sorumluUserId].filter(Boolean) as string[],
        })

        await createAuditLog(
          tx,
          ihale.tenantId,
          'IHALE',
          ihale.id,
          'UPDATE',
          ihale.olusturanUserId,
          {
            message: `İhale teklif son tarihine tam 3 gün kaldı! Yaklaşık Maliyet teklifini hazırlamayı unutmayın.`,
            ihaleNo: ihale.ihaleNo,
            ad: ihale.ad,
            teklifSonTarihi: bitisTarihi
          }
        )
      }
    }
  })
}

export async function checkSozlesmeAlarms(tenantId: string) {
  console.log('Running Sözleşme alarm checks...')
  const now = new Date()
  const thresholds = [60, 30, 15, 7, 0]

  await withTenant(tenantId, async (tx) => {
    const [sozlesmeler, teminatlar] = await Promise.all([
      tx.sozlesme.findMany({
        where: { tenantId },
        include: { ihale: true },
      }),
      tx.sozlesmeKesinTeminat.findMany({
        where: { durum: 'AKTIF' },
        include: { sozlesme: { include: { ihale: true } } },
      }),
    ])

    for (const sozlesme of sozlesmeler) {
      if (!sozlesme.bitisTarihi) continue
      const target = new Date(sozlesme.bitisTarihi)
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (!thresholds.includes(diffDays)) continue

      await notifyTenantUsers(tx, tenantId, {
        title: `Sözleşme bitiş uyarısı (${diffDays} gün)`,
        message: `${sozlesme.ihale.ihaleNo} - ${sozlesme.ihale.ad}\nSözleşme bitiş tarihine ${diffDays} gün kaldı.`,
        type: 'SOZLESME_ALARM',
        data: { sozlesmeId: sozlesme.id, ihaleId: sozlesme.ihaleId, diffDays, bitisTarihi: sozlesme.bitisTarihi },
        userIds: [sozlesme.ihale.olusturanUserId, sozlesme.ihale.sorumluUserId].filter(Boolean) as string[],
      })

      await createAuditLog(tx, tenantId, 'SOZLESME', sozlesme.id, 'UPDATE', sozlesme.ihale.olusturanUserId, {
        message: `Sözleşme bitiş tarihine ${diffDays} gün kaldı!`,
        ihaleNo: sozlesme.ihale.ihaleNo,
        ihaleAdi: sozlesme.ihale.ad,
        sozlesmeBitisTarihi: sozlesme.bitisTarihi,
      })
    }

    for (const teminat of teminatlar) {
      const sozlesme = teminat.sozlesme
      if (!sozlesme || sozlesme.tenantId !== tenantId) continue
      if (!teminat.vadeTarihi) continue
      const target = new Date(teminat.vadeTarihi)
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (!thresholds.includes(diffDays)) continue

      await notifyTenantUsers(tx, tenantId, {
        title: `Kesin teminat uyarısı (${diffDays} gün)`,
        message: `${sozlesme.ihale.ihaleNo} - ${sozlesme.ihale.ad}\nKesin teminat vadesine ${diffDays} gün kaldı.`,
        type: 'TEMINAT_ALARM',
        data: { sozlesmeId: sozlesme.id, ihaleId: sozlesme.ihaleId, teminatId: teminat.id, diffDays, vadeTarihi: teminat.vadeTarihi },
        userIds: [sozlesme.ihale.olusturanUserId, sozlesme.ihale.sorumluUserId].filter(Boolean) as string[],
      })

      await createAuditLog(tx, tenantId, 'SOZLESME', sozlesme.id, 'UPDATE', sozlesme.ihale.olusturanUserId, {
        message: `Kesin teminat vadesine ${diffDays} gün kaldı!`,
        ihaleNo: sozlesme.ihale.ihaleNo,
        ihaleAdi: sozlesme.ihale.ad,
        teminatId: teminat.id,
        vadeTarihi: teminat.vadeTarihi,
      })
    }
  })
}

export async function checkHakedisAcilis(tenantId: string, input?: { year?: number; month?: number }) {
  const now = new Date()
  const yil = input?.year ?? now.getFullYear()
  const ay = input?.month ?? now.getMonth() + 1

  await withTenant(tenantId, async (tx) => {
    const ihaleler = await tx.ihale.findMany({
      where: {
        tenantId,
        durum: { in: ['DEVAM_EDİYOR', 'KAZANILDI', 'AKTIF'] },
        personelParam: { isNot: null },
      },
      select: { id: true, ihaleNo: true, ad: true, olusturanUserId: true, sorumluUserId: true },
    })

    for (const ihale of ihaleler) {
      const hakedis = await tx.hakedis.upsert({
        where: { ihaleId_yil_ay: { ihaleId: ihale.id, yil, ay } },
        create: {
          ihaleId: ihale.id,
          yil,
          ay,
          brutTutar: 0,
          kdvOrani: 20,
          stopajOrani: 0,
          ceza: 0,
          digerKesinti: 0,
          kdvTutari: 0,
          stopajTutari: 0,
          netTutar: 0,
          durum: 'TASLAK',
          odemeTarihi: null,
        },
        update: {},
      })

      try {
        const delegate = (tx as any).hakedisChecklistItem
        if (delegate) {
          const template = [
            { belgeKodu: "FATURA", belgeAdi: "Fatura" },
            { belgeKodu: "SGK_PRIM_BORCSUZLUK", belgeAdi: "SGK Prim Borçsuzluk Yazısı" },
            { belgeKodu: "VERGI_BORCSUZLUK", belgeAdi: "Vergi Borcu Yoktur Yazısı" },
            { belgeKodu: "SGK_BILDIRGE_TAHAKKUK", belgeAdi: "SGK Bildirgeleri ve Tahakkuk Fişleri" },
            { belgeKodu: "MAAS_DEKONTLARI", belgeAdi: "Maaş Ödeme Dekontları (Önceki Ay)" },
          ]
          for (const item of template) {
            await delegate.upsert({
              where: { tenantId_hakedisId_belgeKodu: { tenantId, hakedisId: hakedis.id, belgeKodu: item.belgeKodu } },
              create: {
                tenantId,
                hakedisId: hakedis.id,
                belgeKodu: item.belgeKodu,
                belgeAdi: item.belgeAdi,
                durum: "EKSIK",
                not: null,
                dosyaAdi: null,
              },
              update: {},
            })
          }
        }
      } catch {}

      await notifyTenantUsers(tx, tenantId, {
        title: `Hakediş satırı açıldı (${String(ay).padStart(2, '0')}.${yil})`,
        message: `${ihale.ihaleNo} - ${ihale.ad}\nHakediş satırı açıldı.`,
        type: 'HAKEDIS_ACILIS',
        data: { ihaleId: ihale.id, ihaleNo: ihale.ihaleNo, yil, ay },
        userIds: [ihale.olusturanUserId, ihale.sorumluUserId].filter(Boolean) as string[],
      })

      await createAuditLog(tx, tenantId, 'IHALE', ihale.id, 'UPDATE', ihale.olusturanUserId, {
        message: `Hakediş satırı açıldı (${ay}.${yil})`,
        ihaleNo: ihale.ihaleNo,
        ihaleAdi: ihale.ad,
        yil,
        ay,
      })
    }
  })
}
