import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const now = new Date()
const addDays = (days: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return d
}
const subDays = (days: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return d
}

const dateOnlyUtc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day))
const haftaninGunuUtc = (d: Date) => {
  const w = d.getUTCDay()
  return w === 0 ? 7 : w
}
const haftaSonuMuUtc = (d: Date) => {
  const w = d.getUTCDay()
  return w === 0 || w === 6
}

async function main() {
  const tenantId = process.env.SEED_TENANT_ID || 'demo-tenant-1'
  const tenantName = process.env.SEED_TENANT_NAME || 'Demo Holding A.Ş.'
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@demo.local'
  const adminName = process.env.SEED_ADMIN_NAME || 'Demo Yönetici'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123'

  const resetRaw = (process.env.SEED_RESET || '').toLowerCase()
  const reset = resetRaw === '1' || resetRaw === 'true' || resetRaw === 'yes'
  const forcePasswordRaw = (process.env.SEED_FORCE_PASSWORD || '').toLowerCase()
  const forcePassword = forcePasswordRaw === '1' || forcePasswordRaw === 'true' || forcePasswordRaw === 'yes'

  if (process.env.NODE_ENV === 'production' && reset) {
    throw new Error('SEED_RESET is not allowed in production')
  }

  if (reset) {
    await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {})
  }

  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    create: { id: tenantId, name: tenantName },
    update: { name: tenantName },
  })

  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      rol: 'TENANT_ADMIN',
      tenantId: tenant.id,
    },
    update: {
      name: adminName,
      rol: 'TENANT_ADMIN',
      tenantId: tenant.id,
      ...(forcePassword ? { password: hashedPassword } : {}),
    },
  })

  const kurum1 = await prisma.kurum.upsert({
    where: { id: 'demo-kurum-1' },
    create: {
      id: 'demo-kurum-1',
      ad: 'T.C. Sağlık Bakanlığı',
      unvan: 'Sağlık Yatırımları Genel Müdürlüğü',
      vergiNo: '1234567890',
      vergiDairesi: 'Çankaya',
      il: 'Ankara',
      ilce: 'Çankaya',
      adres: 'Bilkent Yerleşkesi, Üniversiteler Mah. Dumlupınar Bulvarı 6001. Cad. No:9',
      telefon: '03125851000',
      email: 'saglik@bakanlik.gov.tr',
      tenantId: tenant.id,
    },
    update: {
      ad: 'T.C. Sağlık Bakanlığı',
      unvan: 'Sağlık Yatırımları Genel Müdürlüğü',
      vergiNo: '1234567890',
      vergiDairesi: 'Çankaya',
      il: 'Ankara',
      ilce: 'Çankaya',
      adres: 'Bilkent Yerleşkesi, Üniversiteler Mah. Dumlupınar Bulvarı 6001. Cad. No:9',
      telefon: '03125851000',
      email: 'saglik@bakanlik.gov.tr',
      tenantId: tenant.id,
    },
  })

  const kurum2 = await prisma.kurum.upsert({
    where: { id: 'demo-kurum-2' },
    create: {
      id: 'demo-kurum-2',
      ad: 'TCDD Genel Müdürlüğü',
      unvan: 'TCDD İşletmesi Genel Müdürlüğü Satın Alma Dairesi Başkanlığı',
      vergiNo: '9876543210',
      vergiDairesi: 'Ulus',
      il: 'Ankara',
      ilce: 'Altındağ',
      adres: 'Anafartalar Mah. Hipodrom Cad. No:3',
      telefon: '03123090515',
      email: 'satinalma@tcdd.gov.tr',
      tenantId: tenant.id,
    },
    update: {
      ad: 'TCDD Genel Müdürlüğü',
      unvan: 'TCDD İşletmesi Genel Müdürlüğü Satın Alma Dairesi Başkanlığı',
      vergiNo: '9876543210',
      vergiDairesi: 'Ulus',
      il: 'Ankara',
      ilce: 'Altındağ',
      adres: 'Anafartalar Mah. Hipodrom Cad. No:3',
      telefon: '03123090515',
      email: 'satinalma@tcdd.gov.tr',
      tenantId: tenant.id,
    },
  })

  const kurum3 = await prisma.kurum.upsert({
    where: { id: 'demo-kurum-3' },
    create: {
      id: 'demo-kurum-3',
      ad: 'Karayolları Genel Müdürlüğü',
      unvan: 'KGM Program ve İzleme Dairesi Başkanlığı',
      vergiNo: '5544332211',
      vergiDairesi: 'Maltepe',
      il: 'Ankara',
      ilce: 'Çankaya',
      adres: 'İnönü Bulvarı No:14 Yücetepe',
      telefon: '03124157000',
      email: 'kgm@kgm.gov.tr',
      tenantId: tenant.id,
    },
    update: {
      ad: 'Karayolları Genel Müdürlüğü',
      unvan: 'KGM Program ve İzleme Dairesi Başkanlığı',
      vergiNo: '5544332211',
      vergiDairesi: 'Maltepe',
      il: 'Ankara',
      ilce: 'Çankaya',
      adres: 'İnönü Bulvarı No:14 Yücetepe',
      telefon: '03124157000',
      email: 'kgm@kgm.gov.tr',
      tenantId: tenant.id,
    },
  })

  await prisma.banka.upsert({
    where: { id: 'demo-banka-1' },
    create: { id: 'demo-banka-1', ad: 'Ziraat Bankası', sube: 'Çankaya', toplamLimit: 20000000, kullanilanLimit: 3500000, komisyonOrani: 0.5, tenantId: tenant.id },
    update: { ad: 'Ziraat Bankası', sube: 'Çankaya', toplamLimit: 20000000, kullanilanLimit: 3500000, komisyonOrani: 0.5, tenantId: tenant.id },
  })
  await prisma.banka.upsert({
    where: { id: 'demo-banka-2' },
    create: { id: 'demo-banka-2', ad: 'VakıfBank', sube: 'Kızılay', toplamLimit: 15000000, kullanilanLimit: 7500000, komisyonOrani: 0.65, tenantId: tenant.id },
    update: { ad: 'VakıfBank', sube: 'Kızılay', toplamLimit: 15000000, kullanilanLimit: 7500000, komisyonOrani: 0.65, tenantId: tenant.id },
  })

  const rakip1 = await prisma.rakipFirma.upsert({
    where: { id: 'demo-rakip-1' },
    create: { id: 'demo-rakip-1', ad: 'Atlas İnşaat', unvan: 'Atlas İnşaat Taahhüt Sanayi A.Ş.', vergiNo: '1112223334', il: 'Ankara', telefon: '03120000001', tenantId: tenant.id },
    update: { ad: 'Atlas İnşaat', unvan: 'Atlas İnşaat Taahhüt Sanayi A.Ş.', vergiNo: '1112223334', il: 'Ankara', telefon: '03120000001', tenantId: tenant.id },
  })
  const rakip2 = await prisma.rakipFirma.upsert({
    where: { id: 'demo-rakip-2' },
    create: { id: 'demo-rakip-2', ad: 'Kuzey Teknik', unvan: 'Kuzey Teknik Hizmetler Ltd. Şti.', vergiNo: '5556667778', il: 'İstanbul', telefon: '02120000002', tenantId: tenant.id },
    update: { ad: 'Kuzey Teknik', unvan: 'Kuzey Teknik Hizmetler Ltd. Şti.', vergiNo: '5556667778', il: 'İstanbul', telefon: '02120000002', tenantId: tenant.id },
  })

  const ihale1 = await prisma.ihale.upsert({
    where: { ihaleNo: '2026/102030' },
    create: {
      ihaleNo: '2026/102030',
      ad: 'Ankara Şehir Hastanesi Acil Servis Altyapı Yenileme İşi',
      aciklama: 'Klinik ve acil servis girişleri, tretuvar, asfalt ve drenaj kanallarının yenilenmesi inşaat işi.',
      tur: 'YAPIM_ISI',
      usul: 'ACIK_IHALE',
      butce: 15450000,
      baslangicTarihi: addDays(30),
      bitisTarihi: addDays(180),
      teklifSonTarihi: addDays(3),
      durum: 'DEVAM_EDİYOR',
      kurumId: kurum1.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
    update: {
      ad: 'Ankara Şehir Hastanesi Acil Servis Altyapı Yenileme İşi',
      aciklama: 'Klinik ve acil servis girişleri, tretuvar, asfalt ve drenaj kanallarının yenilenmesi inşaat işi.',
      tur: 'YAPIM_ISI',
      usul: 'ACIK_IHALE',
      butce: 15450000,
      baslangicTarihi: addDays(30),
      bitisTarihi: addDays(180),
      teklifSonTarihi: addDays(3),
      durum: 'DEVAM_EDİYOR',
      kurumId: kurum1.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
  })

  const ihale2 = await prisma.ihale.upsert({
    where: { ihaleNo: '2026/98765' },
    create: {
      ihaleNo: '2026/98765',
      ad: 'Ankara-Sivas YHT Hattı Sinyalizasyon Bakım Onarım İşi',
      aciklama: 'Yüksek hızlı tren hattı sinyalizasyon ünitelerinin 1 yıllık periyodik bakımı ve arıza müdahale hizmeti.',
      tur: 'HIZMET_ALIM',
      usul: 'BELLI_ISTEKLI',
      butce: 42800000,
      baslangicTarihi: addDays(15),
      bitisTarihi: addDays(380),
      teklifSonTarihi: addDays(12),
      durum: 'DEVAM_EDİYOR',
      kurumId: kurum2.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
    update: {
      ad: 'Ankara-Sivas YHT Hattı Sinyalizasyon Bakım Onarım İşi',
      aciklama: 'Yüksek hızlı tren hattı sinyalizasyon ünitelerinin 1 yıllık periyodik bakımı ve arıza müdahale hizmeti.',
      tur: 'HIZMET_ALIM',
      usul: 'BELLI_ISTEKLI',
      butce: 42800000,
      baslangicTarihi: addDays(15),
      bitisTarihi: addDays(380),
      teklifSonTarihi: addDays(12),
      durum: 'DEVAM_EDİYOR',
      kurumId: kurum2.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
  })

  const ihale3 = await prisma.ihale.upsert({
    where: { ihaleNo: '2026/34567' },
    create: {
      ihaleNo: '2026/34567',
      ad: 'Karayolları 4. Bölge Köprü ve Sanat Yapıları Yapım İşi',
      aciklama: 'Bölge sınırları dahilinde yıpranmış menfez, köprü genleşme derzleri ve şev koruma duvarları yapımı.',
      tur: 'YAPIM_ISI',
      usul: 'ACIK_IHALE',
      butce: 28500000,
      teklifSonTarihi: addDays(25),
      durum: 'TASLAK',
      kurumId: kurum3.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
    update: {
      ad: 'Karayolları 4. Bölge Köprü ve Sanat Yapıları Yapım İşi',
      aciklama: 'Bölge sınırları dahilinde yıpranmış menfez, köprü genleşme derzleri ve şev koruma duvarları yapımı.',
      tur: 'YAPIM_ISI',
      usul: 'ACIK_IHALE',
      butce: 28500000,
      teklifSonTarihi: addDays(25),
      durum: 'TASLAK',
      kurumId: kurum3.id,
      tenantId: tenant.id,
      olusturanUserId: admin.id,
      sorumluUserId: admin.id,
    },
  })

  await prisma.ihaleRakip.upsert({
    where: { id: 'demo-ihale1-rakip1' },
    create: { id: 'demo-ihale1-rakip1', ihaleId: ihale1.id, rakipFirmaId: rakip1.id, teklifTutar: 14950000, siralamasi: 1, bizimTeklifMi: false },
    update: { ihaleId: ihale1.id, rakipFirmaId: rakip1.id, teklifTutar: 14950000, siralamasi: 1, bizimTeklifMi: false },
  })
  await prisma.ihaleRakip.upsert({
    where: { id: 'demo-ihale1-rakip2' },
    create: { id: 'demo-ihale1-rakip2', ihaleId: ihale1.id, rakipFirmaId: rakip2.id, teklifTutar: 15220000, siralamasi: 2, bizimTeklifMi: false },
    update: { ihaleId: ihale1.id, rakipFirmaId: rakip2.id, teklifTutar: 15220000, siralamasi: 2, bizimTeklifMi: false },
  })
  await prisma.ihaleRakip.upsert({
    where: { id: 'demo-ihale2-rakip1' },
    create: { id: 'demo-ihale2-rakip1', ihaleId: ihale2.id, rakipFirmaId: rakip2.id, teklifTutar: 40100000, siralamasi: 1, bizimTeklifMi: false },
    update: { ihaleId: ihale2.id, rakipFirmaId: rakip2.id, teklifTutar: 40100000, siralamasi: 1, bizimTeklifMi: false },
  })

  await prisma.sirketEvrak.upsert({
    where: { id: 'demo-evrak-1' },
    create: {
      id: 'demo-evrak-1',
      ad: 'SGK Borcu Yoktur Belgesi',
      tip: 'SIGORTA',
      kategori: 'MALI',
      aciklama: 'İhalelere katılım için SGK borçsuzluk durumunu gösterir güncel belge.',
      dosyaYolu: '/uploads/evraklar/sgk_borcu_yoktur.pdf',
      dosyaAdi: 'sgk_borcu_yoktur.pdf',
      dosyaBoyutu: 1450000,
      dosyaTipi: 'application/pdf',
      sonGecerlilikTarihi: addDays(4),
      yayinTarihi: subDays(26),
      versiyon: 1,
      durum: 'AKTIF',
      yukleyenUserId: admin.id,
      tenantId: tenant.id,
    },
    update: {
      ad: 'SGK Borcu Yoktur Belgesi',
      tip: 'SIGORTA',
      kategori: 'MALI',
      aciklama: 'İhalelere katılım için SGK borçsuzluk durumunu gösterir güncel belge.',
      dosyaYolu: '/uploads/evraklar/sgk_borcu_yoktur.pdf',
      dosyaAdi: 'sgk_borcu_yoktur.pdf',
      dosyaBoyutu: 1450000,
      dosyaTipi: 'application/pdf',
      sonGecerlilikTarihi: addDays(4),
      yayinTarihi: subDays(26),
      versiyon: 1,
      durum: 'AKTIF',
      yukleyenUserId: admin.id,
      tenantId: tenant.id,
    },
  })

  await prisma.sirketEvrak.upsert({
    where: { id: 'demo-evrak-2' },
    create: {
      id: 'demo-evrak-2',
      ad: 'Vergi Levhası 2025',
      tip: 'VERGI',
      kategori: 'MALI',
      aciklama: '2025 yılı vergilendirme dönemine ait resmi vergi levhası.',
      dosyaYolu: '/uploads/evraklar/vergi_levhasi_2025.pdf',
      dosyaAdi: 'vergi_levhasi_2025.pdf',
      dosyaBoyutu: 890000,
      dosyaTipi: 'application/pdf',
      sonGecerlilikTarihi: addDays(25),
      yayinTarihi: subDays(340),
      versiyon: 1,
      durum: 'AKTIF',
      yukleyenUserId: admin.id,
      tenantId: tenant.id,
    },
    update: {
      ad: 'Vergi Levhası 2025',
      tip: 'VERGI',
      kategori: 'MALI',
      aciklama: '2025 yılı vergilendirme dönemine ait resmi vergi levhası.',
      dosyaYolu: '/uploads/evraklar/vergi_levhasi_2025.pdf',
      dosyaAdi: 'vergi_levhasi_2025.pdf',
      dosyaBoyutu: 890000,
      dosyaTipi: 'application/pdf',
      sonGecerlilikTarihi: addDays(25),
      yayinTarihi: subDays(340),
      versiyon: 1,
      durum: 'AKTIF',
      yukleyenUserId: admin.id,
      tenantId: tenant.id,
    },
  })

  await prisma.auditLog.upsert({
    where: { id: 'demo-log-1' },
    create: {
      id: 'demo-log-1',
      tenantId: tenant.id,
      entity: 'USER',
      entityId: admin.id,
      action: 'LOGIN',
      userId: admin.id,
      data: { client: 'Web-Browser', ip: '127.0.0.1' },
      createdAt: subDays(1),
    },
    update: {
      tenantId: tenant.id,
      entity: 'USER',
      entityId: admin.id,
      action: 'LOGIN',
      userId: admin.id,
      data: { client: 'Web-Browser', ip: '127.0.0.1' },
      createdAt: subDays(1),
    },
  })

  await prisma.auditLog.upsert({
    where: { id: 'demo-log-2' },
    create: {
      id: 'demo-log-2',
      tenantId: tenant.id,
      entity: 'SIRKET_EVRAK',
      entityId: 'demo-evrak-1',
      action: 'CREATE',
      userId: admin.id,
      data: { ad: 'SGK Borcu Yoktur Belgesi', tip: 'SIGORTA' },
      createdAt: subDays(1),
    },
    update: {
      tenantId: tenant.id,
      entity: 'SIRKET_EVRAK',
      entityId: 'demo-evrak-1',
      action: 'CREATE',
      userId: admin.id,
      data: { ad: 'SGK Borcu Yoktur Belgesi', tip: 'SIGORTA' },
      createdAt: subDays(1),
    },
  })

  await prisma.auditLog.upsert({
    where: { id: 'demo-log-3' },
    create: {
      id: 'demo-log-3',
      tenantId: tenant.id,
      entity: 'IHALE',
      entityId: ihale1.id,
      action: 'CREATE',
      userId: admin.id,
      data: { ihaleNo: '2026/102030', ad: 'Ankara Şehir Hastanesi Acil Servis Altyapı Yenileme İşi' },
      createdAt: subDays(2),
    },
    update: {
      tenantId: tenant.id,
      entity: 'IHALE',
      entityId: ihale1.id,
      action: 'CREATE',
      userId: admin.id,
      data: { ihaleNo: '2026/102030', ad: 'Ankara Şehir Hastanesi Acil Servis Altyapı Yenileme İşi' },
      createdAt: subDays(2),
    },
  })

  await prisma.ihale.updateMany({
    where: { id: { in: [ihale1.id, ihale2.id, ihale3.id] } },
    data: { tenantId: tenant.id },
  })

  const year = now.getFullYear()
  const tatiller = [
    { tarih: dateOnlyUtc(year, 1, 1), aciklama: 'Yılbaşı', arefe: false },
    { tarih: dateOnlyUtc(year, 4, 23), aciklama: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', arefe: false },
    { tarih: dateOnlyUtc(year, 5, 19), aciklama: '19 Mayıs Atatürk’ü Anma, Gençlik ve Spor Bayramı', arefe: false },
    { tarih: dateOnlyUtc(year, 8, 30), aciklama: '30 Ağustos Zafer Bayramı', arefe: false },
    { tarih: dateOnlyUtc(year, 10, 29), aciklama: '29 Ekim Cumhuriyet Bayramı', arefe: false },
  ]

  for (const t of tatiller) {
    await prisma.dimTakvim.upsert({
      where: { tarih: t.tarih },
      create: {
        tarih: t.tarih,
        yil: t.tarih.getUTCFullYear(),
        ay: t.tarih.getUTCMonth() + 1,
        gun: t.tarih.getUTCDate(),
        haftaninGunu: haftaninGunuUtc(t.tarih),
        haftaSonuMu: haftaSonuMuUtc(t.tarih),
      },
      update: {
        yil: t.tarih.getUTCFullYear(),
        ay: t.tarih.getUTCMonth() + 1,
        gun: t.tarih.getUTCDate(),
        haftaninGunu: haftaninGunuUtc(t.tarih),
        haftaSonuMu: haftaSonuMuUtc(t.tarih),
      },
    })

    await prisma.resmiTatil.upsert({
      where: { tarih_tenantId: { tarih: t.tarih, tenantId: tenant.id } },
      create: { tarih: t.tarih, aciklama: t.aciklama, arefe: t.arefe, tenantId: tenant.id },
      update: { aciklama: t.aciklama, arefe: t.arefe },
    })
  }

  await prisma.onMaddeSablon.upsert({
    where: { id: 'demo-onmadde-1' },
    create: {
      id: 'demo-onmadde-1',
      ad: 'Vergi Borcu Yoktur',
      belgeTipi: 'VERGI_BORCU',
      aciklama: 'Vadesi geçmiş vergi borcu bulunmadığını gösterir belge.',
      tenantId: tenant.id,
    },
    update: {
      ad: 'Vergi Borcu Yoktur',
      belgeTipi: 'VERGI_BORCU',
      aciklama: 'Vadesi geçmiş vergi borcu bulunmadığını gösterir belge.',
      tenantId: tenant.id,
    },
  })

  await prisma.onMaddeSablon.upsert({
    where: { id: 'demo-onmadde-2' },
    create: {
      id: 'demo-onmadde-2',
      ad: 'SGK Borcu Yoktur',
      belgeTipi: 'SGK_BORCU',
      aciklama: 'Sosyal güvenlik prim borcu bulunmadığını gösterir belge.',
      tenantId: tenant.id,
    },
    update: {
      ad: 'SGK Borcu Yoktur',
      belgeTipi: 'SGK_BORCU',
      aciklama: 'Sosyal güvenlik prim borcu bulunmadığını gösterir belge.',
      tenantId: tenant.id,
    },
  })

  await prisma.onMaddeSablon.upsert({
    where: { id: 'demo-onmadde-3' },
    create: {
      id: 'demo-onmadde-3',
      ad: 'Ticaret Sicil Kaydı',
      belgeTipi: 'TICARET_SICIL',
      aciklama: 'Şirketin güncel ticaret sicil kayıtlarını gösteren belge.',
      tenantId: tenant.id,
    },
    update: {
      ad: 'Ticaret Sicil Kaydı',
      belgeTipi: 'TICARET_SICIL',
      aciklama: 'Şirketin güncel ticaret sicil kayıtlarını gösteren belge.',
      tenantId: tenant.id,
    },
  })

  const kisi1 = await prisma.kurumKisi.upsert({
    where: { id: 'demo-kisi-1' },
    create: { id: 'demo-kisi-1', kurumId: kurum1.id, ad: 'Ayşe', soyad: 'Yılmaz', unvan: 'Şube Müdürü', telefon: '05320000001', email: 'ayse.yilmaz@kurum.local' },
    update: { kurumId: kurum1.id, ad: 'Ayşe', soyad: 'Yılmaz', unvan: 'Şube Müdürü', telefon: '05320000001', email: 'ayse.yilmaz@kurum.local' },
  })

  const kisi2 = await prisma.kurumKisi.upsert({
    where: { id: 'demo-kisi-2' },
    create: { id: 'demo-kisi-2', kurumId: kurum2.id, ad: 'Mehmet', soyad: 'Kaya', unvan: 'Satınalma Uzmanı', telefon: '05320000002', email: 'mehmet.kaya@kurum.local' },
    update: { kurumId: kurum2.id, ad: 'Mehmet', soyad: 'Kaya', unvan: 'Satınalma Uzmanı', telefon: '05320000002', email: 'mehmet.kaya@kurum.local' },
  })

  await prisma.kurumHafizaNot.upsert({
    where: { id: 'demo-kurum1-not-1' },
    create: { id: 'demo-kurum1-not-1', kurumId: kurum1.id, not: 'Kurumda teknik şartname değişiklikleri son hafta gelebiliyor.', yazar: admin.name || 'Admin', createdAt: subDays(10) },
    update: { kurumId: kurum1.id, not: 'Kurumda teknik şartname değişiklikleri son hafta gelebiliyor.', yazar: admin.name || 'Admin', createdAt: subDays(10) },
  })

  await prisma.kurumAramaLog.upsert({
    where: { id: 'demo-kurum1-arama-1' },
    create: { id: 'demo-kurum1-arama-1', kurumId: kurum1.id, arananKisi: `${kisi1.ad} ${kisi1.soyad}`, modul: 'IHALE', not: 'İhale dokümanı teyidi alındı.', yazar: admin.name || 'Admin', tenantId: tenant.id, createdAt: subDays(3) },
    update: { kurumId: kurum1.id, arananKisi: `${kisi1.ad} ${kisi1.soyad}`, modul: 'IHALE', not: 'İhale dokümanı teyidi alındı.', yazar: admin.name || 'Admin', tenantId: tenant.id, createdAt: subDays(3) },
  })

  await prisma.yaklasikMaliyet.upsert({
    where: { id: 'demo-ym-1' },
    create: {
      id: 'demo-ym-1',
      ihaleId: ihale1.id,
      kurumId: kurum1.id,
      versiyonNo: 'v1',
      tutar: 16250000,
      aktifMi: true,
      sartnameNotu: 'Zemin iyileştirme kalemi opsiyonlu.',
      tenantId: tenant.id,
    },
    update: {
      ihaleId: ihale1.id,
      kurumId: kurum1.id,
      versiyonNo: 'v1',
      tutar: 16250000,
      aktifMi: true,
      sartnameNotu: 'Zemin iyileştirme kalemi opsiyonlu.',
      tenantId: tenant.id,
    },
  })

  const sozlesme = await prisma.sozlesme.upsert({
    where: { ihaleId: ihale1.id },
    create: {
      ihaleId: ihale1.id,
      ekapNo: 'EKAP-2026-DEMO-0001',
      bedel: 14800000,
      baslangicTarihi: addDays(40),
      bitisTarihi: addDays(220),
      damgaVergisi: 74000,
      kararPulu: 14800,
      kikPayi: 22200,
      kesinTeminatTutari: 444000,
      tenantId: tenant.id,
    },
    update: {
      ekapNo: 'EKAP-2026-DEMO-0001',
      bedel: 14800000,
      baslangicTarihi: addDays(40),
      bitisTarihi: addDays(220),
      damgaVergisi: 74000,
      kararPulu: 14800,
      kikPayi: 22200,
      kesinTeminatTutari: 444000,
      tenantId: tenant.id,
    },
  })

  await prisma.sozlesmeKesinTeminat.upsert({
    where: { id: 'demo-teminat-1' },
    create: { id: 'demo-teminat-1', sozlesmeId: sozlesme.id, bankaId: 'demo-banka-1', tutar: 444000, tip: 'MEKTUP', mektupNo: 'KT-2026-0001', vadeTarihi: addDays(365), durum: 'AKTIF' },
    update: { sozlesmeId: sozlesme.id, bankaId: 'demo-banka-1', tutar: 444000, tip: 'MEKTUP', mektupNo: 'KT-2026-0001', vadeTarihi: addDays(365), durum: 'AKTIF' },
  })

  await prisma.sozlesmeNot.upsert({
    where: { id: 'demo-sozlesme-not-1' },
    create: { id: 'demo-sozlesme-not-1', sozlesmeId: sozlesme.id, not: 'Kesin teminat mektubu teslim edildi.', yazar: admin.name || 'Admin', createdAt: subDays(1) },
    update: { sozlesmeId: sozlesme.id, not: 'Kesin teminat mektubu teslim edildi.', yazar: admin.name || 'Admin', createdAt: subDays(1) },
  })

  await prisma.ihaleGeciciTeminat.upsert({
    where: { id: 'demo-gecici-teminat-1' },
    create: { id: 'demo-gecici-teminat-1', ihaleId: ihale1.id, tutar: 300000, banka: 'Ziraat Bankası', bitisTarihi: addDays(60), mektupNo: 'GT-2026-0001' },
    update: { ihaleId: ihale1.id, tutar: 300000, banka: 'Ziraat Bankası', bitisTarihi: addDays(60), mektupNo: 'GT-2026-0001' },
  })

  await prisma.ihaleAtama.upsert({
    where: { id: 'demo-atama-1' },
    create: { id: 'demo-atama-1', ihaleId: ihale1.id, kurumKisiId: kisi2.id, rol: 'KOORDINATOR' },
    update: { ihaleId: ihale1.id, kurumKisiId: kisi2.id, rol: 'KOORDINATOR' },
  })

  process.stdout.write(`Seed ok: tenant=${tenant.id} admin=${admin.email}\n`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
