import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  const session = await auth()
  const headerAllow = request.headers.get("x-rls-test") === "1"
  const url = new URL(request.url)
  const queryTenantId = url.searchParams.get("tenantId")
  const runSelfTest = url.searchParams.get("selftest") === "1"

  const tenantId =
    session?.user?.tenantId ??
    (process.env.NODE_ENV === "development" && headerAllow ? queryTenantId : null)

  if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isDevBypass = process.env.NODE_ENV === "development" && headerAllow
  const userRole = session?.user?.rol ?? null
  const isPrivilegedRole = userRole === "SUPER_ADMIN" || userRole === "TENANT_ADMIN"
  if (!isPrivilegedRole && !isDevBypass) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const invalidTenantId = `__invalid_tenant_${Date.now()}__`

  try {
    const dbMeta = async (client: typeof prismaClient) => {
      const [settingRow] = await client.$queryRaw<{ value: string | null }[]>`
        SELECT current_setting('app.current_tenant_id', true) AS value
      `

      const [userRow] = await client.$queryRaw<
        { currentUser: string; isSuper: boolean; bypassRls: boolean }[]
      >`
        SELECT
          current_user::text AS "currentUser",
          r.rolsuper AS "isSuper",
          r.rolbypassrls AS "bypassRls"
        FROM pg_roles r
        WHERE r.rolname = current_user
      `

      const [rlsRow] = await client.$queryRaw<{ enabled: boolean; forced: boolean }[]>`
        SELECT c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'kurumlar'
      `

      const [policyRow] = await client.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'kurumlar'
      `

      return {
        currentTenantSetting: settingRow?.value ?? null,
        currentUser: userRow?.currentUser ?? null,
        currentUserIsSuper: userRow?.isSuper ?? false,
        currentUserBypassRls: userRow?.bypassRls ?? false,
        kurumlarRlsEnabled: rlsRow?.enabled ?? false,
        kurumlarRlsForced: rlsRow?.forced ?? false,
        kurumlarPolicyCount: policyRow?.count ?? 0,
      }
    }

    const withoutContext = await prismaClient.kurum.count()
    const withoutContextMeta = await dbMeta(prismaClient)

    const withValidTenantResult = await withTenant(tenantId, async (tx) => {
      const count = await tx.kurum.count()
      const meta = await dbMeta(tx as any)
      return { count, meta }
    })

    const withInvalidTenantResult = await withTenant(invalidTenantId, async (tx) => {
      const count = await tx.kurum.count()
      const meta = await dbMeta(tx as any)
      return { count, meta }
    })

    const rlsConfigured =
      withValidTenantResult.meta.kurumlarRlsEnabled && withValidTenantResult.meta.kurumlarPolicyCount > 0
    const rlsBypassed = withValidTenantResult.meta.currentUserIsSuper || withValidTenantResult.meta.currentUserBypassRls

    let selfTest: any = null
    if (process.env.NODE_ENV === "development" && headerAllow && runSelfTest) {
      const uuid =
        (globalThis as any).crypto?.randomUUID?.bind((globalThis as any).crypto) ??
        (() => `id_${Date.now()}_${Math.random().toString(16).slice(2)}`)

      const t1 = `rls_test_${uuid()}`
      const t2 = `rls_test_${uuid()}`

      const createdTenantIds: string[] = []
      const createdKurumIds: Array<{ tenantId: string; kurumId: string }> = []
      const createdKisiIds: Array<{ tenantId: string; kisiId: string }> = []

      try {
        await prismaClient.tenant.create({ data: { id: t1, name: `RLS Test ${t1}` } })
        await prismaClient.tenant.create({ data: { id: t2, name: `RLS Test ${t2}` } })
        createdTenantIds.push(t1, t2)

        const kurum1 = await withTenant(t1, (tx) =>
          tx.kurum.create({ data: { id: uuid(), ad: "RLS Test Kurum 1", tenantId: t1 } })
        )
        createdKurumIds.push({ tenantId: t1, kurumId: kurum1.id })

        const kurum2 = await withTenant(t2, (tx) =>
          tx.kurum.create({ data: { id: uuid(), ad: "RLS Test Kurum 2", tenantId: t2 } })
        )
        createdKurumIds.push({ tenantId: t2, kurumId: kurum2.id })

        const kisi1 = await withTenant(t1, (tx) =>
          tx.kurumKisi.create({
            data: { id: uuid(), kurumId: kurum1.id, ad: "RLS", soyad: "Test 1" },
          })
        )
        createdKisiIds.push({ tenantId: t1, kisiId: kisi1.id })

        const kisi2 = await withTenant(t2, (tx) =>
          tx.kurumKisi.create({
            data: { id: uuid(), kurumId: kurum2.id, ad: "RLS", soyad: "Test 2" },
          })
        )
        createdKisiIds.push({ tenantId: t2, kisiId: kisi2.id })

        const [
          t1Count,
          t2Count,
          invalidCount,
          t1SeesT2,
          kisiT1Count,
          kisiT2Count,
          kisiInvalidCount,
          kisiT1SeesT2,
        ] = await Promise.all([
          withTenant(t1, (tx) => tx.kurum.count()),
          withTenant(t2, (tx) => tx.kurum.count()),
          withTenant("__invalid__", (tx) => tx.kurum.count()),
          withTenant(t1, (tx) => tx.kurum.count({ where: { tenantId: t2 } })),
          withTenant(t1, (tx) => tx.kurumKisi.count()),
          withTenant(t2, (tx) => tx.kurumKisi.count()),
          withTenant("__invalid__", (tx) => tx.kurumKisi.count()),
          withTenant(t1, (tx) => tx.kurumKisi.count({ where: { kurumId: kurum2.id } })),
        ])

        selfTest = {
          created: { tenants: createdTenantIds.length, kurumlar: createdKurumIds.length },
          counts: {
            kurum: { t1: t1Count, t2: t2Count, invalid: invalidCount, t1SeesT2 },
            kisi: { t1: kisiT1Count, t2: kisiT2Count, invalid: kisiInvalidCount, t1SeesT2: kisiT1SeesT2 },
          },
          expected: {
            kurum: { t1: 1, t2: 1, invalid: 0, t1SeesT2: 0 },
            kisi: { t1: 1, t2: 1, invalid: 0, t1SeesT2: 0 },
          },
          ok:
            t1Count === 1 &&
            t2Count === 1 &&
            invalidCount === 0 &&
            t1SeesT2 === 0 &&
            kisiT1Count === 1 &&
            kisiT2Count === 1 &&
            kisiInvalidCount === 0 &&
            kisiT1SeesT2 === 0,
        }
      } finally {
        for (const item of createdKisiIds) {
          await withTenant(item.tenantId, (tx) => tx.kurumKisi.delete({ where: { id: item.kisiId } }))
        }
        for (const item of createdKurumIds) {
          await withTenant(item.tenantId, (tx) => tx.kurum.delete({ where: { id: item.kurumId } }))
        }
        if (createdTenantIds.length > 0) {
          await prismaClient.tenant.deleteMany({ where: { id: { in: createdTenantIds } } })
        }
      }
    }

    const rlsEnforced =
      rlsConfigured &&
      withoutContext === 0 &&
      withInvalidTenantResult.count === 0 &&
      (selfTest ? selfTest.ok === true : true)

    return NextResponse.json({
      ok: rlsEnforced,
      tenantId,
      checks: {
        kurumCount_withoutContext: withoutContext,
        kurumCount_withValidTenant: withValidTenantResult.count,
        kurumCount_withInvalidTenant: withInvalidTenantResult.count,
        meta_withoutContext: withoutContextMeta,
        meta_withValidTenant: withValidTenantResult.meta,
        meta_withInvalidTenant: withInvalidTenantResult.meta,
        rlsConfigured,
        selfTest,
      },
      expected: {
        kurumCount_withoutContext: 0,
        kurumCount_withInvalidTenant: 0,
      },
      hints: rlsEnforced
        ? []
        : !rlsConfigured
          ? ["kurumlar tablosunda RLS/policy aktif gorunmuyor. Migration deploy/dev calistirin."]
          : rlsBypassed
            ? [
                "RLS aktif ama DB kullanıcısı BYPASSRLS/superuser olduğu için kurallar uygulanmıyor.",
                "Çözüm: uygulamanın bağlandığı DATABASE_URL'ı superuser olmayan ve BYPASSRLS yetkisi olmayan bir role taşıyın.",
              ]
            : ["RLS aktif ama enforcement başarısız. app.current_tenant_id set_config aynı bağlantıda çalışmıyor olabilir."],
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        tenantId,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
