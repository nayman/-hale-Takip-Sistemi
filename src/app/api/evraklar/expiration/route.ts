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
    const days = parseInt(searchParams.get('days') || '90')

    // Calculate expiration date
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + days)

    // Find documents expiring within the specified days
    const { expiringDocuments, expiredDocuments } = await withTenant(tenantId, async (tx) => {
      const [expiringDocuments, expiredDocuments] = await Promise.all([
        tx.sirketEvrak.findMany({
          where: {
            tenantId,
            durum: "AKTIF",
            sonGecerlilikTarihi: {
              lte: expirationDate,
              not: null,
            },
          },
          include: {
            yukleyenUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            sonGecerlilikTarihi: "asc",
          },
        }),
        tx.sirketEvrak.findMany({
          where: {
            tenantId,
            durum: "AKTIF",
            sonGecerlilikTarihi: {
              lt: new Date(),
            },
          },
          include: {
            yukleyenUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            sonGecerlilikTarihi: "asc",
          },
        }),
      ])

      if (expiredDocuments.length > 0) {
        await tx.sirketEvrak.updateMany({
          where: {
            id: {
              in: expiredDocuments.map((doc: { id: string }) => doc.id),
            },
            tenantId,
          },
          data: {
            durum: "PASIF",
          },
        })
      }

      return { expiringDocuments, expiredDocuments }
    })

    return NextResponse.json({
      expiring: expiringDocuments,
      expired: expiredDocuments,
      total: expiringDocuments.length + expiredDocuments.length,
      days
    })
  } catch (error) {
    console.error("Evrak süre kontrolü yapılırken hata:", error)
    return NextResponse.json(
      { error: "Evrak süre kontrolü yapılırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    // Manual status check request (trigger)
    await withTenant(tenantId, async (tx) =>
      tx.sirketEvrak.updateMany({
        where: {
          tenantId,
          durum: "AKTIF",
          sonGecerlilikTarihi: {
            lt: new Date(),
          },
        },
        data: {
          durum: "PASIF",
        },
      })
    )

    return NextResponse.json({ message: "Evrak durumları güncellendi" })
  } catch (error) {
    console.error("Evrak durum güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Evrak durumları güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
