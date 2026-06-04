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

    const where: any = {
      kurum: { tenantId },
      ...(kurumId ? { kurumId } : {}),
      ...(q
        ? {
            OR: [
              { ad: { contains: q, mode: "insensitive" } },
              { soyad: { contains: q, mode: "insensitive" } },
              { unvan: { contains: q, mode: "insensitive" } },
              { telefon: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { kurum: { ad: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    }

    const items = await withTenant(tenantId, (tx) =>
      tx.kurumKisi.findMany({
        where,
        select: {
          id: true,
          ad: true,
          soyad: true,
          unvan: true,
          telefon: true,
          email: true,
          createdAt: true,
          kurum: { select: { id: true, ad: true } },
        },
        orderBy: [{ soyad: "asc" }, { ad: "asc" }],
        take: 500,
      })
    )

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET personel hatası:", error)
    return NextResponse.json({ error: "Personel alınırken hata oluştu" }, { status: 500 })
  }
}

