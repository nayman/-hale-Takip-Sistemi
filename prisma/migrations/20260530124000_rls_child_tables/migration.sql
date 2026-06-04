ALTER TABLE "kurum_kisileri" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "kurum_kisileri";
CREATE POLICY tenant_isolation ON "kurum_kisileri"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "kurumlar" k
      WHERE k.id = "kurumId"
        AND k."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "kurumlar" k
      WHERE k.id = "kurumId"
        AND k."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "kurum_kisileri" FORCE ROW LEVEL SECURITY;

ALTER TABLE "kurum_hafiza_notlari" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "kurum_hafiza_notlari";
CREATE POLICY tenant_isolation ON "kurum_hafiza_notlari"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "kurumlar" k
      WHERE k.id = "kurumId"
        AND k."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "kurumlar" k
      WHERE k.id = "kurumId"
        AND k."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "kurum_hafiza_notlari" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_gecici_teminatlar" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_gecici_teminatlar";
CREATE POLICY tenant_isolation ON "ihale_gecici_teminatlar"
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
ALTER TABLE "ihale_gecici_teminatlar" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_atamalari" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_atamalari";
CREATE POLICY tenant_isolation ON "ihale_atamalari"
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
ALTER TABLE "ihale_atamalari" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_rakip_analizleri" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_rakip_analizleri";
CREATE POLICY tenant_isolation ON "ihale_rakip_analizleri"
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
ALTER TABLE "ihale_rakip_analizleri" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_notlari" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_notlari";
CREATE POLICY tenant_isolation ON "ihale_notlari"
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
ALTER TABLE "ihale_notlari" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_itirazlari" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_itirazlari";
CREATE POLICY tenant_isolation ON "ihale_itirazlari"
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
ALTER TABLE "ihale_itirazlari" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ihale_itiraz_belgeleri" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ihale_itiraz_belgeleri";
CREATE POLICY tenant_isolation ON "ihale_itiraz_belgeleri"
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1
      FROM "ihale_itirazlari" it
      JOIN "ihaleler" i ON i.id = it."ihaleId"
      WHERE it.id = "itirazId"
        AND i."tenantId" = get_current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "ihale_itirazlari" it
      JOIN "ihaleler" i ON i.id = it."ihaleId"
      WHERE it.id = "itirazId"
        AND i."tenantId" = get_current_tenant_id()
    )
  );
ALTER TABLE "ihale_itiraz_belgeleri" FORCE ROW LEVEL SECURITY;

ALTER TABLE "sozlesme_kesin_teminatlar" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "sozlesme_kesin_teminatlar";
CREATE POLICY tenant_isolation ON "sozlesme_kesin_teminatlar"
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
ALTER TABLE "sozlesme_kesin_teminatlar" FORCE ROW LEVEL SECURITY;

ALTER TABLE "sozlesme_belgeleri" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "sozlesme_belgeleri";
CREATE POLICY tenant_isolation ON "sozlesme_belgeleri"
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
ALTER TABLE "sozlesme_belgeleri" FORCE ROW LEVEL SECURITY;
