CREATE TABLE IF NOT EXISTS "sozlesme_onmadde_durumlari" (
  "id" TEXT NOT NULL,
  "sozlesmeId" TEXT NOT NULL,
  "belgeAdi" TEXT NOT NULL,
  "durum" TEXT NOT NULL DEFAULT 'EKSIK',
  "tenantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sozlesme_onmadde_durumlari_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "sozlesme_onmadde_durumlari_tenantId_sozlesmeId_belgeAdi_key"
ON "sozlesme_onmadde_durumlari"("tenantId", "sozlesmeId", "belgeAdi");

CREATE INDEX IF NOT EXISTS "sozlesme_onmadde_durumlari_tenantId_idx" ON "sozlesme_onmadde_durumlari"("tenantId");
CREATE INDEX IF NOT EXISTS "sozlesme_onmadde_durumlari_sozlesmeId_idx" ON "sozlesme_onmadde_durumlari"("sozlesmeId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated_user') THEN
    CREATE ROLE authenticated_user;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "sozlesme_onmadde_durumlari" TO authenticated_user;

ALTER TABLE "sozlesme_onmadde_durumlari"
  ADD CONSTRAINT "sozlesme_onmadde_durumlari_sozlesmeId_fkey"
  FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sozlesme_onmadde_durumlari"
  ADD CONSTRAINT "sozlesme_onmadde_durumlari_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sozlesme_onmadde_durumlari" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "sozlesme_onmadde_durumlari";
CREATE POLICY tenant_isolation ON "sozlesme_onmadde_durumlari"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());
