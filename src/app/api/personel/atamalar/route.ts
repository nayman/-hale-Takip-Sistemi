import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const kurumId = (searchParams.get("kurumId") || "").trim()
    const ihaleId = (searchParams.get("ihaleId") || "").trim()

    const where: any = {
      ihale: { tenantId },
      ...(ihaleId ? { ihaleId } : {}),
      ...(kurumId ? { kurumKisi: { kurumId } } : {}),
      ...(q
        ? {
            OR: [
              { ihale: { ihaleNo: { contains: q, mode: "insensitive" } } },
              { ihale: { ad: { contains: q, mode: "insensitive" } } },
              { ihale: { kurum: { ad: { contains: q, mode: "insensitive" } } } },
              { kurumKisi: { ad: { contains: q, mode: "insensitive" } } },
              { kurumKisi: { soyad: { contains: q, mode: "insensitive" } } },
              { kurumKisi: { unvan: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const items = await withTenant(tenantId, (tx) =>
      tx.ihaleAtama.findMany({
        where,
        select: {
          id: true,
          rol: true,
          ihale: {
            select: {
              id: true,
              ihaleNo: true,
              ad: true,
              kurum: { select: { id: true, ad: true } },
            },
          },
          kurumKisi: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              unvan: true,
              kurum: { select: { id: true, ad: true } },
            },
          },
        },
        take: 500,
      })
    )

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET personel atamalar hatası:", error)
    return NextResponse.json({ error: "Atamalar alınırken hata oluştu" }, { status: 500 })
  }
}

