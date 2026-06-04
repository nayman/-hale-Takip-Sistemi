import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = session.user.tenantId

    if (id) {
      const firma = await withTenant(tenantId, async (tx) =>
        tx.rakipFirma.findFirst({
          where: { id, tenantId },
        })
      )
      if (!firma) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json(firma)
    }

    const firmalar = await withTenant(tenantId, async (tx) =>
      tx.rakipFirma.findMany({
        where: { tenantId },
        orderBy: { ad: "asc" },
      })
    )

    return NextResponse.json(firmalar)
  } catch (error) {
    console.error("GET rakip-firmalar hatası:", error)
    return NextResponse.json({ error: "Veri getirilirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await request.json()
    const { ad, unvan, vergiNo, il, telefon } = body

    if (!ad) return NextResponse.json({ error: "Firma adı zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const yeniFirma = await withTenant(tenantId, async (tx) =>
      tx.rakipFirma.create({
        data: {
          ad,
          unvan,
          vergiNo,
          il,
          telefon,
          tenantId,
        },
      })
    )

    return NextResponse.json(yeniFirma, { status: 201 })
  } catch (error) {
    console.error("POST rakip-firma hatası:", error)
    return NextResponse.json({ error: "Firma oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const body = await request.json()
    const { ad, unvan, vergiNo, il, telefon } = body

    const tenantId = session.user.tenantId
    const existing = await withTenant(tenantId, async (tx) =>
      tx.rakipFirma.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const firma = await withTenant(tenantId, async (tx) =>
      tx.rakipFirma.update({
        where: { id },
        data: { ad, unvan, vergiNo, il, telefon },
      })
    )

    return NextResponse.json(firma)
  } catch (error) {
    console.error("PUT rakip-firma hatası:", error)
    return NextResponse.json({ error: "Firma güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const existing = await withTenant(tenantId, async (tx) =>
      tx.rakipFirma.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await withTenant(tenantId, async (tx) => tx.rakipFirma.delete({ where: { id } }))

    return NextResponse.json({ message: "Firma başarıyla silindi" })
  } catch (error) {
    console.error("DELETE rakip-firma hatası:", error)
    return NextResponse.json({ error: "Silinirken hata oluştu" }, { status: 500 })
  }
}
