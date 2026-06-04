import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

function parseIntOrNull(value: string | null) {
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const yil = parseIntOrNull(searchParams.get("yil"))
    const ay = parseIntOrNull(searchParams.get("ay"))
    const durum = (searchParams.get("durum") || "").trim()
    const limit = Math.min(200, Math.max(1, parseIntOrNull(searchParams.get("limit")) || 50))
    const offset = Math.max(0, parseIntOrNull(searchParams.get("offset")) || 0)

    const where: any = {
      ihale: { tenantId },
      ...(yil ? { yil } : {}),
      ...(ay ? { ay } : {}),
      ...(durum ? { durum } : {}),
      ...(q
        ? {
            OR: [
              { ihale: { ihaleNo: { contains: q, mode: "insensitive" } } },
              { ihale: { ad: { contains: q, mode: "insensitive" } } },
              { ihale: { kurum: { ad: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    }

    const { items, total } = await withTenant(tenantId, async (tx) => {
      const [items, total] = await Promise.all([
        tx.hakedis.findMany({
          where,
          select: {
            id: true,
            yil: true,
            ay: true,
            brutTutar: true,
            netTutar: true,
            durum: true,
            odemeTarihi: true,
            createdAt: true,
            ihale: {
              select: {
                id: true,
                ihaleNo: true,
                ad: true,
                kurum: { select: { id: true, ad: true } },
              },
            },
          },
          orderBy: [{ yil: "desc" }, { ay: "desc" }, { createdAt: "desc" }],
          take: limit,
          skip: offset,
        }),
        tx.hakedis.count({ where }),
      ])
      return { items, total }
    })

    return NextResponse.json({ items, total, limit, offset })
  } catch (error) {
    console.error("GET hakedis merkezi hatası:", error)
    return NextResponse.json({ error: "Hakedişler alınırken hata oluştu" }, { status: 500 })
  }
}

