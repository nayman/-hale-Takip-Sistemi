CREATE TABLE "ihale_personel_param" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "personelSayisi" INTEGER NOT NULL,
  "asgariUcretYuzde" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ihale_personel_param_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ihale_personel_param_ihaleId_key" ON "ihale_personel_param"("ihaleId");

ALTER TABLE "ihale_personel_param"
ADD CONSTRAINT "ihale_personel_param_ihaleId_fkey"
FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ihale_yan_hak_param" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "yolGunluk" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "yemekGunluk" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fazlaMesaiSaatUcreti" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ihale_yan_hak_param_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ihale_yan_hak_param_ihaleId_key" ON "ihale_yan_hak_param"("ihaleId");

ALTER TABLE "ihale_yan_hak_param"
ADD CONSTRAINT "ihale_yan_hak_param_ihaleId_fkey"
FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "puantajlar" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "yil" INTEGER NOT NULL,
  "ay" INTEGER NOT NULL,
  "calismaGunu" INTEGER NOT NULL,
  "devamsizlikGunu" INTEGER NOT NULL DEFAULT 0,
  "fazlaMesaiSaat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "puantajlar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "puantajlar_ihaleId_yil_ay_key" ON "puantajlar"("ihaleId", "yil", "ay");
CREATE INDEX "puantajlar_ihaleId_idx" ON "puantajlar"("ihaleId");

ALTER TABLE "puantajlar"
ADD CONSTRAINT "puantajlar_ihaleId_fkey"
FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "hakedisler" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "yil" INTEGER NOT NULL,
  "ay" INTEGER NOT NULL,
  "brutTutar" DOUBLE PRECISION NOT NULL,
  "kdvOrani" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "stopajOrani" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ceza" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "digerKesinti" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "kdvTutari" DOUBLE PRECISION NOT NULL,
  "stopajTutari" DOUBLE PRECISION NOT NULL,
  "netTutar" DOUBLE PRECISION NOT NULL,
  "durum" TEXT NOT NULL DEFAULT 'TASLAK',
  "odemeTarihi" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "hakedisler_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hakedisler_ihaleId_yil_ay_key" ON "hakedisler"("ihaleId", "yil", "ay");
CREATE INDEX "hakedisler_ihaleId_idx" ON "hakedisler"("ihaleId");

ALTER TABLE "hakedisler"
ADD CONSTRAINT "hakedisler_ihaleId_fkey"
FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_personel_param" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_personel_param";
CREATE POLICY tenant_isolation ON "ihale_personel_param"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "ihale_personel_param" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_yan_hak_param" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_yan_hak_param";
CREATE POLICY tenant_isolation ON "ihale_yan_hak_param"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "ihale_yan_hak_param" FORCE ROW LEVEL SECURITY;

ALTER TABLE "puantajlar" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "puantajlar";
CREATE POLICY tenant_isolation ON "puantajlar"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "puantajlar" FORCE ROW LEVEL SECURITY;

ALTER TABLE "hakedisler" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "hakedisler";
CREATE POLICY tenant_isolation ON "hakedisler"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "ihaleler" i
      WHERE i.id = "ihaleId"
        AND i."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "hakedisler" FORCE ROW LEVEL SECURITY;
