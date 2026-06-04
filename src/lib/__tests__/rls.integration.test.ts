import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import type { Prisma, PrismaClient } from "@prisma/client"
import type { Pool as PgPool } from "pg"

vi.unmock("@prisma/client")

describe("RLS integration", () => {
  const rlsDatabaseUrl = process.env.RLS_DATABASE_URL

  if (!rlsDatabaseUrl) {
    it.skip("requires RLS_DATABASE_URL", () => {})
    return
  }

  type PgModule = {
    Pool: new (options: { connectionString: string }) => PgPool
  }
  type PgModuleWithDefault = Partial<PgModule> & { default?: Partial<PgModule> }

  let prisma!: PrismaClient
  let pool!: PgPool

  beforeAll(async () => {
    const pgMod = await import("pg")
    const pg = pgMod as unknown as PgModuleWithDefault
    const PoolCtor = pg.Pool ?? pg.default?.Pool
    if (!PoolCtor) throw new Error("pg.Pool not found")
    pool = new PoolCtor({ connectionString: rlsDatabaseUrl })

    const { PrismaClient } = await import("@prisma/client")
    const { PrismaPg } = await import("@prisma/adapter-pg")
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter }) as unknown as PrismaClient
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await pool.end?.()
  })

  const withTenant = async <T,>(
    tenantId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> => {
    return prisma.$transaction(async (tx) => {
      try {
        await tx.$executeRaw`SET LOCAL ROLE authenticated_user`
      } catch {}
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
      return fn(tx)
    })
  }

  it("isolates tenants for parent and child tables", async () => {
    const t1 = `rls_it_${Date.now()}_1`
    const t2 = `rls_it_${Date.now()}_2`

    const createdTenantIds: string[] = []
    const createdKurumIds: Array<{ tenantId: string; kurumId: string }> = []
    const createdKisiIds: Array<{ tenantId: string; kisiId: string }> = []

    try {
      const tenant1 = await prisma.tenant.create({ data: { id: t1, name: `RLS IT ${t1}` } })
      const tenant2 = await prisma.tenant.create({ data: { id: t2, name: `RLS IT ${t2}` } })
      createdTenantIds.push(tenant1.id, tenant2.id)

      const kurum1 = await withTenant(t1, (tx) =>
        tx.kurum.create({ data: { ad: "RLS IT Kurum 1", tenantId: t1 } })
      )
      createdKurumIds.push({ tenantId: t1, kurumId: kurum1.id })

      const kurum2 = await withTenant(t2, (tx) =>
        tx.kurum.create({ data: { ad: "RLS IT Kurum 2", tenantId: t2 } })
      )
      createdKurumIds.push({ tenantId: t2, kurumId: kurum2.id })

      const kisi1 = await withTenant(t1, (tx) =>
        tx.kurumKisi.create({ data: { kurumId: kurum1.id, ad: "RLS", soyad: "IT 1" } })
      )
      createdKisiIds.push({ tenantId: t1, kisiId: kisi1.id })

      const kisi2 = await withTenant(t2, (tx) =>
        tx.kurumKisi.create({ data: { kurumId: kurum2.id, ad: "RLS", soyad: "IT 2" } })
      )
      createdKisiIds.push({ tenantId: t2, kisiId: kisi2.id })

      const withoutContextKurumCount = await prisma.kurum.count()
      expect(withoutContextKurumCount).toBe(0)

      const [
        t1KurumCount,
        t2KurumCount,
        invalidKurumCount,
        t1SeesT2KurumCount,
        t1KisiCount,
        t2KisiCount,
        invalidKisiCount,
        t1SeesT2KisiCount,
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

      expect(t1KurumCount).toBe(1)
      expect(t2KurumCount).toBe(1)
      expect(invalidKurumCount).toBe(0)
      expect(t1SeesT2KurumCount).toBe(0)

      expect(t1KisiCount).toBe(1)
      expect(t2KisiCount).toBe(1)
      expect(invalidKisiCount).toBe(0)
      expect(t1SeesT2KisiCount).toBe(0)
    } finally {
      for (const item of createdKisiIds) {
        await withTenant(item.tenantId, (tx) => tx.kurumKisi.delete({ where: { id: item.kisiId } }))
      }
      for (const item of createdKurumIds) {
        await withTenant(item.tenantId, (tx) => tx.kurum.delete({ where: { id: item.kurumId } }))
      }
      if (createdTenantIds.length > 0) {
        await prisma.tenant.deleteMany({ where: { id: { in: createdTenantIds } } })
      }
    }
  })
})
