CREATE TABLE IF NOT EXISTS "sozlesme_notlari" (
  "id" TEXT NOT NULL,
  "sozlesmeId" TEXT NOT NULL,
  "not" TEXT NOT NULL,
  "yazar" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sozlesme_notlari_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sozlesme_notlari_sozlesmeId_idx" ON "sozlesme_notlari"("sozlesmeId");

ALTER TABLE "sozlesme_notlari"
ADD CONSTRAINT "sozlesme_notlari_sozlesmeId_fkey"
FOREIGN KEY ("sozlesmeId") REFERENCES "sozlesmeler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sozlesme_notlari" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "sozlesme_notlari";
CREATE POLICY tenant_isolation ON "sozlesme_notlari"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "sozlesmeler" s
      WHERE s.id = "sozlesmeId"
        AND s."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sozlesmeler" s
      WHERE s.id = "sozlesmeId"
        AND s."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "sozlesme_notlari" FORCE ROW LEVEL SECURITY;
