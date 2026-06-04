import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

function toCsvRow(values: Array<string | number | null | undefined>) {
  const escaped = values.map((v) => {
    const s = v === null || v === undefined ? "" : String(v)
    const safe = s.replaceAll('"', '""')
    return `"${safe}"`
  })
  return escaped.join(",")
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
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const entity = (searchParams.get("entity") || "").trim()
    const action = (searchParams.get("action") || "").trim()
    const userId = (searchParams.get("userId") || "").trim()
    const from = parseDateOrNull(searchParams.get("from"))
    const to = parseDateOrNull(searchParams.get("to"))

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

    const maxRows = 5000
    const rows = await withTenant(tenantId, (tx) =>
      tx.auditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, rol: true } },
        },
        orderBy: { createdAt: "desc" },
        take: maxRows,
      })
    )

    const header = toCsvRow([
      "Tarih",
      "Entity",
      "Entity ID",
      "Action",
      "User",
      "Email",
      "Rol",
      "Data",
    ])

    const lines = rows.map((r) =>
      toCsvRow([
        r.createdAt.toISOString(),
        r.entity,
        r.entityId,
        r.action,
        r.user?.name || "",
        r.user?.email || "",
        r.user?.rol || "",
        r.data ? JSON.stringify(r.data) : "",
      ])
    )

    const bom = "\uFEFF"
    const csv = bom + [header, ...lines].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent("audit_logs.csv")}"`,
      },
    })
  } catch (error) {
    console.error("Audit logs export error:", error)
    return NextResponse.json({ error: "Audit logs export failed" }, { status: 500 })
  }
}

