CREATE TABLE IF NOT EXISTS "hakedis_checklist_items" (
  "id" TEXT NOT NULL,
  "hakedisId" TEXT NOT NULL,
  "belgeKodu" TEXT NOT NULL,
  "belgeAdi" TEXT NOT NULL,
  "durum" TEXT NOT NULL DEFAULT 'EKSIK',
  "not" TEXT,
  "dosyaAdi" TEXT,
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hakedis_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hakedis_checklist_items_tenantId_hakedisId_belgeKodu_key"
ON "hakedis_checklist_items"("tenantId", "hakedisId", "belgeKodu");

CREATE INDEX IF NOT EXISTS "hakedis_checklist_items_tenantId_idx" ON "hakedis_checklist_items"("tenantId");
CREATE INDEX IF NOT EXISTS "hakedis_checklist_items_hakedisId_idx" ON "hakedis_checklist_items"("hakedisId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated_user') THEN
    CREATE ROLE authenticated_user;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "hakedis_checklist_items" TO authenticated_user;

ALTER TABLE "hakedis_checklist_items"
  ADD CONSTRAINT "hakedis_checklist_items_hakedisId_fkey"
  FOREIGN KEY ("hakedisId") REFERENCES "hakedisler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hakedis_checklist_items"
  ADD CONSTRAINT "hakedis_checklist_items_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hakedis_checklist_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "hakedis_checklist_items";
CREATE POLICY tenant_isolation ON "hakedis_checklist_items"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());
