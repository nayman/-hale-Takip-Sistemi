CREATE TABLE "ihale_belgeleri" (
  "id" TEXT NOT NULL,
  "ihaleId" TEXT NOT NULL,
  "dosyaAdi" TEXT NOT NULL,
  "dosyaYolu" TEXT NOT NULL,
  "dosyaBoyutu" INTEGER NOT NULL,
  "dosyaTipi" TEXT NOT NULL,
  "aciklama" TEXT,
  "yukleyenUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenantId" TEXT NOT NULL,

  CONSTRAINT "ihale_belgeleri_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ihale_belgeleri_tenantId_idx" ON "ihale_belgeleri"("tenantId");
CREATE INDEX "ihale_belgeleri_ihaleId_idx" ON "ihale_belgeleri"("ihaleId");
CREATE INDEX "ihale_belgeleri_createdAt_idx" ON "ihale_belgeleri"("createdAt");

ALTER TABLE "ihale_belgeleri"
ADD CONSTRAINT "ihale_belgeleri_ihaleId_fkey"
FOREIGN KEY ("ihaleId") REFERENCES "ihaleler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_belgeleri"
ADD CONSTRAINT "ihale_belgeleri_yukleyenUserId_fkey"
FOREIGN KEY ("yukleyenUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_belgeleri"
ADD CONSTRAINT "ihale_belgeleri_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ihale_belgeleri" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ihale_belgeleri" FORCE ROW LEVEL SECURITY;

CREATE POLICY "ihale_belgeleri_tenant_isolation" ON "ihale_belgeleri"
FOR ALL TO PUBLIC
USING ("tenantId" = get_current_tenant_id())
WITH CHECK ("tenantId" = get_current_tenant_id());
