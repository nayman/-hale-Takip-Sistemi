-- DropIndex
DROP INDEX "hakedisler_vadeTarihi_idx";

-- AlterTable
ALTER TABLE "hakedis_checklist_items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ihale_yan_hak_param" ADD COLUMN     "yanHakGunSayisi" INTEGER NOT NULL DEFAULT 22,
ADD COLUMN     "yemekTip" TEXT NOT NULL DEFAULT 'NAKDI';

-- AlterTable
ALTER TABLE "sozlesme_onmadde_durumlari" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "sozlesmeler" ADD COLUMN     "altYukleniciKural" TEXT NOT NULL DEFAULT 'YASAK',
ADD COLUMN     "cezaUstSinirYuzde" DOUBLE PRECISION NOT NULL DEFAULT 30,
ADD COLUMN     "donemSonlandirmaFesihTekrar" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "fikriMulkiyet" TEXT,
ADD COLUMN     "kritikKesintiCezaYuzde" DOUBLE PRECISION NOT NULL DEFAULT 2,
ADD COLUMN     "kritikKesintiSaat" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "ortakGirisim" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ortaklikOranlari" JSONB,
ADD COLUMN     "ozelAykirilikFesihLimit" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "teslimHaklari" TEXT;

-- CreateTable
CREATE TABLE "sozlesme_incidents" (
    "id" TEXT NOT NULL,
    "sozlesmeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "baslangicTarihi" TIMESTAMP(3),
    "bitisTarihi" TIMESTAMP(3),
    "sureSaat" DOUBLE PRECISION,
    "cezaTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cezaYuzde" DOUBLE PRECISION,
    "riskSeviye" TEXT NOT NULL DEFAULT 'INFO',
    "fesihRiski" BOOLEAN NOT NULL DEFAULT false,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sozlesme_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sozlesme_personel_raporlar" (
    "id" TEXT NOT NULL,
    "sozlesmeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "personelAdSoyad" TEXT NOT NULL,
    "raporGun" INTEGER NOT NULL,
    "baslangicTarihi" TIMESTAMP(3),
    "bitisTarihi" TIMESTAMP(3),
    "ikameEdildi" BOOLEAN NOT NULL DEFAULT false,
    "ikameNot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sozlesme_personel_raporlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sozlesme_alt_yukleniciler" (
    "id" TEXT NOT NULL,
    "sozlesmeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firmaAd" TEXT NOT NULL,
    "vergiNo" TEXT,
    "belgeDosyaAdi" TEXT,
    "belgeDosyaYolu" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'TASLAK',
    "onayTarihi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sozlesme_alt_yukleniciler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sozlesme_incidents_tenantId_idx" ON "sozlesme_incidents"("tenantId");

-- CreateIndex
CREATE INDEX "sozlesme_incidents_sozlesmeId_idx" ON "sozlesme_incidents"("sozlesmeId");

-- CreateIndex
CREATE INDEX "sozlesme_personel_raporlar_tenantId_idx" ON "sozlesme_personel_raporlar"("tenantId");

-- CreateIndex
CREATE INDEX "sozlesme_personel_raporlar_sozlesmeId_idx" ON "sozlesme_personel_raporlar"("sozlesmeId");

-- CreateIndex
CREATE INDEX "sozlesme_alt_yukleniciler_tenantId_idx" ON "sozlesme_alt_yukleniciler"("tenantId");

-- CreateIndex
CREATE INDEX "sozlesme_alt_yukleniciler_sozlesmeId_idx" ON "sozlesme_alt_yukleniciler"("sozlesmeId");

-- AddForeignKey
ALTER TABLE "sozlesme_incidents" ADD CONSTRAINT "sozlesme_incidents_sozlesmeId_fkey" FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sozlesme_incidents" ADD CONSTRAINT "sozlesme_incidents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sozlesme_personel_raporlar" ADD CONSTRAINT "sozlesme_personel_raporlar_sozlesmeId_fkey" FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sozlesme_personel_raporlar" ADD CONSTRAINT "sozlesme_personel_raporlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sozlesme_alt_yukleniciler" ADD CONSTRAINT "sozlesme_alt_yukleniciler_sozlesmeId_fkey" FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sozlesme_alt_yukleniciler" ADD CONSTRAINT "sozlesme_alt_yukleniciler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
