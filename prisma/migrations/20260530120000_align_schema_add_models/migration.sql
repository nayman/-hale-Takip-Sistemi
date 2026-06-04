ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "yandexToken" TEXT;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;

CREATE TABLE IF NOT EXISTS "kurumlar" (
  "id" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "unvan" TEXT,
  "vergiNo" TEXT,
  "vergiDairesi" TEXT,
  "il" TEXT,
  "ilce" TEXT,
  "adres" TEXT,
  "telefon" TEXT,
  "email" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "kurumlar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "kurumlar_tenantId_idx" ON "kurumlar"("tenantId");

ALTER TABLE "kurumlar"
  ADD CONSTRAINT "kurumlar_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "rakip_firmalar" (
  "id" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "unvan" TEXT,
  "vergiNo" TEXT,
  "il" TEXT,
  "telefon" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "rakip_firmalar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rakip_firmalar_tenantId_idx" ON "rakip_firmalar"("tenantId");

ALTER TABLE "rakip_firmalar"
  ADD CONSTRAINT "rakip_firmalar_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "kurum_kisileri" (
  "id" TEXT NOT NULL,
  "kurumId" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "soyad" TEXT NOT NULL,
  "unvan" TEXT,
  "telefon" TEXT,
  "email" TEXT,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "kurum_kisileri_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "kurum_kisileri_kurumId_idx" ON "kurum_kisileri"("kurumId");

ALTER TABLE "kurum_kisileri"
  ADD CONSTRAINT "kurum_kisileri_kurumId_fkey"
  FOREIGN KEY ("kurumId") REFERENCES "kurumlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "kurum_hafiza_notlari" (
  "id" TEXT NOT NULL,
  "kurumId" TEXT NOT NULL,
  "not" TEXT NOT NULL,
  "yazar" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "kurum_hafiza_notlari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "kurum_hafiza_notlari_kurumId_idx" ON "kurum_hafiza_notlari"("kurumId");

ALTER TABLE "kurum_hafiza_notlari"
  ADD CONSTRAINT "kurum_hafiza_notlari_kurumId_fkey"
  FOREIGN KEY ("kurumId") REFERENCES "kurumlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "kurumId" TEXT;
ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "ilanTarihi" TIMESTAMP(3);
ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "ymTutar" DOUBLE PRECISION;
ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "rKatsayisi" DOUBLE PRECISION;
ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "sinirDeger" DOUBLE PRECISION;
ALTER TABLE "ihaleler" ADD COLUMN IF NOT EXISTS "teklifimiz" DOUBLE PRECISION;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ihaleler'
      AND column_name = 'kurumId'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM "ihaleler" WHERE "kurumId" IS NULL) THEN
      EXECUTE 'ALTER TABLE "ihaleler" ALTER COLUMN "kurumId" SET NOT NULL';
    END IF;
  END IF;
END $$;

ALTER TABLE "ihaleler" ALTER COLUMN "baslangicTarihi" DROP NOT NULL;
ALTER TABLE "ihaleler" ALTER COLUMN "bitisTarihi" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "ihaleler_tenantId_idx" ON "ihaleler"("tenantId");
CREATE INDEX IF NOT EXISTS "ihaleler_kurumId_idx" ON "ihaleler"("kurumId");

ALTER TABLE "ihaleler"
  ADD CONSTRAINT "ihaleler_kurumId_fkey"
  FOREIGN KEY ("kurumId") REFERENCES "kurumlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "yaklasik_maliyetler" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT,
  "kurumId" TEXT NOT NULL,
  "versiyonNo" TEXT NOT NULL DEFAULT 'v1',
  "tutar" DOUBLE PRECISION NOT NULL,
  "aktifMi" BOOLEAN NOT NULL DEFAULT true,
  "dosyaYolu" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "yaklasik_maliyetler_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "yaklasik_maliyetler_tenantId_idx" ON "yaklasik_maliyetler"("tenantId");
CREATE INDEX IF NOT EXISTS "yaklasik_maliyetler_ihaleId_idx" ON "yaklasik_maliyetler"("ihaleId");
CREATE INDEX IF NOT EXISTS "yaklasik_maliyetler_kurumId_idx" ON "yaklasik_maliyetler"("kurumId");

ALTER TABLE "yaklasik_maliyetler"
  ADD CONSTRAINT "yaklasik_maliyetler_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "yaklasik_maliyetler"
  ADD CONSTRAINT "yaklasik_maliyetler_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "yaklasik_maliyetler"
  ADD CONSTRAINT "yaklasik_maliyetler_kurumId_fkey"
  FOREIGN KEY ("kurumId") REFERENCES "kurumlar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_gecici_teminatlar" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "tutar" DOUBLE PRECISION NOT NULL,
  "banka" TEXT,
  "bitisTarihi" TIMESTAMP(3),
  "mektupNo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ihale_gecici_teminatlar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ihale_gecici_teminatlar_ihaleId_idx" ON "ihale_gecici_teminatlar"("ihaleId");

ALTER TABLE "ihale_gecici_teminatlar"
  ADD CONSTRAINT "ihale_gecici_teminatlar_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_atamalari" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "kurumKisiId" TEXT NOT NULL,
  "rol" TEXT,
  CONSTRAINT "ihale_atamalari_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ihale_atamalari_ihaleId_kurumKisiId_key" ON "ihale_atamalari"("ihaleId", "kurumKisiId");

ALTER TABLE "ihale_atamalari"
  ADD CONSTRAINT "ihale_atamalari_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_atamalari"
  ADD CONSTRAINT "ihale_atamalari_kurumKisiId_fkey"
  FOREIGN KEY ("kurumKisiId") REFERENCES "kurum_kisileri"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_rakip_analizleri" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "rakipFirmaId" TEXT NOT NULL,
  "teklifTutar" DOUBLE PRECISION NOT NULL,
  "siralamasi" INTEGER,
  "bizimTeklifMi" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "ihale_rakip_analizleri_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ihale_rakip_analizleri_ihaleId_idx" ON "ihale_rakip_analizleri"("ihaleId");
CREATE INDEX IF NOT EXISTS "ihale_rakip_analizleri_rakipFirmaId_idx" ON "ihale_rakip_analizleri"("rakipFirmaId");

ALTER TABLE "ihale_rakip_analizleri"
  ADD CONSTRAINT "ihale_rakip_analizleri_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_rakip_analizleri"
  ADD CONSTRAINT "ihale_rakip_analizleri_rakipFirmaId_fkey"
  FOREIGN KEY ("rakipFirmaId") REFERENCES "rakip_firmalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_notlari" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "not" TEXT NOT NULL,
  "yazar" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ihale_notlari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ihale_notlari_ihaleId_idx" ON "ihale_notlari"("ihaleId");

ALTER TABLE "ihale_notlari"
  ADD CONSTRAINT "ihale_notlari_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_itirazlari" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "tip" TEXT NOT NULL,
  "durum" TEXT NOT NULL,
  "aciklama" TEXT,
  "basvuruTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "kararTarihi" TIMESTAMP(3),
  CONSTRAINT "ihale_itirazlari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ihale_itirazlari_ihaleId_idx" ON "ihale_itirazlari"("ihaleId");

ALTER TABLE "ihale_itirazlari"
  ADD CONSTRAINT "ihale_itirazlari_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ihale_itiraz_belgeleri" (
  "id" TEXT NOT NULL,
  "itirazId" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "dosyaYolu" TEXT NOT NULL,
  "not" TEXT,
  CONSTRAINT "ihale_itiraz_belgeleri_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ihale_itiraz_belgeleri_itirazId_idx" ON "ihale_itiraz_belgeleri"("itirazId");

ALTER TABLE "ihale_itiraz_belgeleri"
  ADD CONSTRAINT "ihale_itiraz_belgeleri_itirazId_fkey"
  FOREIGN KEY ("itirazId") REFERENCES "ihale_itirazlari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "dim_takvim" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY,
  "tarih" TIMESTAMP(3) NOT NULL,
  "yil" INTEGER NOT NULL,
  "ay" INTEGER NOT NULL,
  "gun" INTEGER NOT NULL,
  "haftaninGunu" INTEGER NOT NULL,
  "haftaSonuMu" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "dim_takvim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "dim_takvim_tarih_key" ON "dim_takvim"("tarih");

CREATE TABLE IF NOT EXISTS "resmi_tatiller" (
  "id" TEXT NOT NULL,
  "tarih" TIMESTAMP(3) NOT NULL,
  "aciklama" TEXT,
  "arefe" BOOLEAN NOT NULL DEFAULT false,
  "tenantId" TEXT NOT NULL,
  CONSTRAINT "resmi_tatiller_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resmi_tatiller_tarih_tenantId_key" ON "resmi_tatiller"("tarih", "tenantId");

ALTER TABLE "resmi_tatiller"
  ADD CONSTRAINT "resmi_tatiller_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "resmi_tatiller"
  ADD CONSTRAINT "resmi_tatiller_tarih_fkey"
  FOREIGN KEY ("tarih") REFERENCES "dim_takvim"("tarih") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "sirket_evraklari" (
  "id" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "tip" TEXT NOT NULL,
  "kategori" TEXT NOT NULL,
  "aciklama" TEXT,
  "dosyaYolu" TEXT NOT NULL,
  "dosyaAdi" TEXT NOT NULL,
  "dosyaBoyutu" INTEGER NOT NULL,
  "dosyaTipi" TEXT NOT NULL,
  "yukleyenUserId" TEXT NOT NULL,
  "sonGecerlilikTarihi" TIMESTAMP(3),
  "yayinTarihi" TIMESTAMP(3),
  "iptalTarihi" TIMESTAMP(3),
  "versiyon" INTEGER NOT NULL DEFAULT 1,
  "durum" TEXT NOT NULL DEFAULT 'AKTIF',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "tenantId" TEXT NOT NULL,
  CONSTRAINT "sirket_evraklari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sirket_evraklari_tenantId_idx" ON "sirket_evraklari"("tenantId");

ALTER TABLE "sirket_evraklari"
  ADD CONSTRAINT "sirket_evraklari_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sirket_evraklari"
  ADD CONSTRAINT "sirket_evraklari_yukleyenUserId_fkey"
  FOREIGN KEY ("yukleyenUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "sozlesmeler" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "ekapNo" TEXT,
  "bedel" DOUBLE PRECISION NOT NULL,
  "baslangicTarihi" TIMESTAMP(3),
  "bitisTarihi" TIMESTAMP(3),
  "damgaVergisi" DOUBLE PRECISION,
  "kararPulu" DOUBLE PRECISION,
  "kikPayi" DOUBLE PRECISION,
  "kesinTeminatTutari" DOUBLE PRECISION,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sozlesmeler_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sozlesmeler_ihaleId_key" ON "sozlesmeler"("ihaleId");
CREATE INDEX IF NOT EXISTS "sozlesmeler_tenantId_idx" ON "sozlesmeler"("tenantId");

ALTER TABLE "sozlesmeler"
  ADD CONSTRAINT "sozlesmeler_ihaleId_fkey"
  FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sozlesmeler"
  ADD CONSTRAINT "sozlesmeler_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "bankalar" (
  "id" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "sube" TEXT,
  "toplamLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kullanilanLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "komisyonOrani" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bankalar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "bankalar_tenantId_idx" ON "bankalar"("tenantId");

ALTER TABLE "bankalar"
  ADD CONSTRAINT "bankalar_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "sozlesme_kesin_teminatlar" (
  "id" TEXT NOT NULL,
  "sozlesmeId" TEXT NOT NULL,
  "bankaId" TEXT,
  "tutar" DOUBLE PRECISION NOT NULL,
  "tip" TEXT NOT NULL,
  "mektupNo" TEXT,
  "vadeTarihi" TIMESTAMP(3),
  "durum" TEXT NOT NULL DEFAULT 'AKTIF',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sozlesme_kesin_teminatlar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sozlesme_kesin_teminatlar_sozlesmeId_idx" ON "sozlesme_kesin_teminatlar"("sozlesmeId");
CREATE INDEX IF NOT EXISTS "sozlesme_kesin_teminatlar_bankaId_idx" ON "sozlesme_kesin_teminatlar"("bankaId");

ALTER TABLE "sozlesme_kesin_teminatlar"
  ADD CONSTRAINT "sozlesme_kesin_teminatlar_sozlesmeId_fkey"
  FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sozlesme_kesin_teminatlar"
  ADD CONSTRAINT "sozlesme_kesin_teminatlar_bankaId_fkey"
  FOREIGN KEY ("bankaId") REFERENCES "bankalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "sozlesme_belgeleri" (
  "id" TEXT NOT NULL,
  "sozlesmeId" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "dosyaYolu" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sozlesme_belgeleri_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sozlesme_belgeleri_sozlesmeId_idx" ON "sozlesme_belgeleri"("sozlesmeId");

ALTER TABLE "sozlesme_belgeleri"
  ADD CONSTRAINT "sozlesme_belgeleri_sozlesmeId_fkey"
  FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "on_madde_sablonlar" (
  "id" TEXT NOT NULL,
  "ad" TEXT NOT NULL,
  "belgeTipi" TEXT NOT NULL,
  "aciklama" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "on_madde_sablonlar_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "on_madde_sablonlar_tenantId_idx" ON "on_madde_sablonlar"("tenantId");

ALTER TABLE "on_madde_sablonlar"
  ADD CONSTRAINT "on_madde_sablonlar_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "kurum_arama_loglari" (
  "id" TEXT NOT NULL,
  "kurumId" TEXT NOT NULL,
  "arananKisi" TEXT,
  "modul" TEXT,
  "not" TEXT NOT NULL,
  "yazar" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenantId" TEXT NOT NULL,
  CONSTRAINT "kurum_arama_loglari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "kurum_arama_loglari_kurumId_idx" ON "kurum_arama_loglari"("kurumId");
CREATE INDEX IF NOT EXISTS "kurum_arama_loglari_tenantId_idx" ON "kurum_arama_loglari"("tenantId");

ALTER TABLE "kurum_arama_loglari"
  ADD CONSTRAINT "kurum_arama_loglari_kurumId_fkey"
  FOREIGN KEY ("kurumId") REFERENCES "kurumlar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kurum_arama_loglari"
  ADD CONSTRAINT "kurum_arama_loglari_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
