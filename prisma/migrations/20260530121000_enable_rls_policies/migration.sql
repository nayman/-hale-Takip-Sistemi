DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated_user') THEN
    CREATE ROLE authenticated_user;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO authenticated_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated_user;

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE "kurumlar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rakip_firmalar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ihaleler" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yaklasik_maliyetler" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resmi_tatiller" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sirket_evraklari" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sozlesmeler" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bankalar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "on_madde_sablonlar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurum_arama_loglari" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation ON "kurumlar";
CREATE POLICY tenant_isolation ON "kurumlar"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "rakip_firmalar";
CREATE POLICY tenant_isolation ON "rakip_firmalar"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "ihaleler";
CREATE POLICY tenant_isolation ON "ihaleler"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "yaklasik_maliyetler";
CREATE POLICY tenant_isolation ON "yaklasik_maliyetler"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "resmi_tatiller";
CREATE POLICY tenant_isolation ON "resmi_tatiller"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "sirket_evraklari";
CREATE POLICY tenant_isolation ON "sirket_evraklari"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "audit_logs";
CREATE POLICY tenant_isolation ON "audit_logs"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "sozlesmeler";
CREATE POLICY tenant_isolation ON "sozlesmeler"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "bankalar";
CREATE POLICY tenant_isolation ON "bankalar"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "on_madde_sablonlar";
CREATE POLICY tenant_isolation ON "on_madde_sablonlar"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON "kurum_arama_loglari";
CREATE POLICY tenant_isolation ON "kurum_arama_loglari"
  FOR ALL TO PUBLIC
  USING ("tenantId" = get_current_tenant_id())
  WITH CHECK ("tenantId" = get_current_tenant_id());
