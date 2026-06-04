import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

function parseIntOrNull(value: string | null) {
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function parseDateOrNull(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const mode = (searchParams.get("mode") || "").trim()
    const q = (searchParams.get("q") || "").trim()
    const entity = (searchParams.get("entity") || "").trim()
    const action = (searchParams.get("action") || "").trim()
    const userId = (searchParams.get("userId") || "").trim()
    const from = parseDateOrNull(searchParams.get("from"))
    const to = parseDateOrNull(searchParams.get("to"))
    const includeSummary = searchParams.get("includeSummary") === "1"
    const limit = Math.min(200, Math.max(1, parseIntOrNull(searchParams.get("limit")) || 20))
    const offset = Math.max(0, parseIntOrNull(searchParams.get("offset")) || 0)

    const hasFilters = Boolean(q || entity || action || userId || from || to || mode === "table" || includeSummary)

    if (!hasFilters) {
      const auditLogs = await withTenant(tenantId, async (tx) =>
        tx.auditLog.findMany({
          where: { tenantId },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                rol: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      )
      return NextResponse.json(auditLogs)
    }

    const where: any = {
      tenantId,
      ...(entity ? { entity } : {}),
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { entity: { contains: q, mode: "insensitive" } },
              { entityId: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const result = await withTenant(tenantId, async (tx) => {
      const [items, total] = await Promise.all([
        tx.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                rol: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        tx.auditLog.count({ where }),
      ])

      let summary: any = null
      if (includeSummary) {
        const [byEntity, byAction, byUser] = await Promise.all([
          tx.auditLog.groupBy({
            by: ["entity"],
            where,
            _count: { _all: true },
          }),
          tx.auditLog.groupBy({
            by: ["action"],
            where,
            _count: { _all: true },
          }),
          tx.auditLog.groupBy({
            by: ["userId"],
            where,
            _count: { _all: true },
          }),
        ])

        const topByEntity = byEntity
          .slice()
          .sort((a: any, b: any) => (b?._count?._all || 0) - (a?._count?._all || 0))
          .slice(0, 20)
        const topByAction = byAction
          .slice()
          .sort((a: any, b: any) => (b?._count?._all || 0) - (a?._count?._all || 0))
          .slice(0, 20)
        const topByUser = byUser
          .slice()
          .sort((a: any, b: any) => (b?._count?._all || 0) - (a?._count?._all || 0))
          .slice(0, 20)

        const userIds = topByUser.map((x: any) => x.userId)
        const users = userIds.length
          ? await tx.user.findMany({
              where: { id: { in: userIds } },
              select: { id: true, name: true, email: true, rol: true },
            })
          : []
        const userMap = new Map(users.map((u) => [u.id, u]))

        summary = {
          byEntity: topByEntity.map((x: any) => ({ entity: x.entity, count: x._count._all })),
          byAction: topByAction.map((x: any) => ({ action: x.action, count: x._count._all })),
          byUser: topByUser.map((x: any) => ({
            userId: x.userId,
            count: x._count._all,
            user: userMap.get(x.userId) || null,
          })),
        }
      }

      return { items, total, summary }
    })

    return NextResponse.json({ ...result, limit, offset })
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json(
      { error: "Audit logs fetch failed" },
      { status: 500 }
    )
  }
}
