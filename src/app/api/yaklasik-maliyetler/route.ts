import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const ihaleId = searchParams.get('ihaleId')
    const kurumId = searchParams.get('kurumId')
    const aktifMi = searchParams.get('aktifMi')
    const id = searchParams.get('id')
    const tenantId = session.user.tenantId

    if (id) {
      const ym = await withTenant(tenantId, async (tx) =>
        tx.yaklasikMaliyet.findFirst({
          where: { id, tenantId },
          include: { kurum: true, ihale: true },
        })
      )
      if (!ym) return NextResponse.json({ error: "Not found" }, { status: 404 })
      
      // Aynı ihaleye (veya kuruma) ait geçmiş/gelecek versiyonları bulalım
      const versiyonlar = await withTenant(tenantId, async (tx) =>
        tx.yaklasikMaliyet.findMany({
          where: {
            tenantId,
            ihaleId: ym.ihaleId,
            kurumId: ym.kurumId,
          },
          orderBy: { createdAt: "desc" },
        })
      )

      return NextResponse.json({ ...ym, versiyonlar })
    }

    const whereClause: any = { tenantId }
    if (ihaleId) whereClause.ihaleId = ihaleId
    if (kurumId) whereClause.kurumId = kurumId
    if (aktifMi !== null) whereClause.aktifMi = aktifMi === 'true'

    const liste = await withTenant(tenantId, async (tx) =>
      tx.yaklasikMaliyet.findMany({
        where: whereClause,
        include: {
          kurum: { select: { id: true, ad: true, il: true } },
          ihale: { select: { id: true, ad: true, ihaleNo: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    )

    return NextResponse.json(liste)
  } catch (error) {
    console.error("GET yaklasik-maliyet hatası:", error)
    return NextResponse.json({ error: "Veri getirilirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    
    const body = await request.json()
    const { kurumId, ihaleId, tutar, parentId, sartnameNotu } = body

    if (!kurumId || tutar === undefined) {
      return NextResponse.json({ error: "Kurum ve Tutar zorunludur" }, { status: 400 })
    }

    let yeniVersiyonNo = "v1"

    // Eğer bu bir revizyonsa (parentId geliyorsa)
    if (parentId) {
      const parent = await withTenant(tenantId, async (tx) =>
        tx.yaklasikMaliyet.findFirst({ where: { id: parentId, tenantId } })
      )
      if (!parent) return NextResponse.json({ error: "Eski versiyon bulunamadı" }, { status: 404 })

      // Eski versiyon(lar)u pasife çek
      await withTenant(tenantId, async (tx) =>
        tx.yaklasikMaliyet.updateMany({
          where: {
            tenantId,
            ihaleId: parent.ihaleId,
            kurumId: parent.kurumId,
          },
          data: { aktifMi: false },
        })
      )

      // Yeni versiyon numarasını belirle
      const mevcutVersiyonlar = await withTenant(tenantId, async (tx) =>
        tx.yaklasikMaliyet.findMany({
          where: { tenantId, ihaleId: parent.ihaleId, kurumId: parent.kurumId },
        })
      )
      yeniVersiyonNo = `v${mevcutVersiyonlar.length + 1}`
    }

    const yeniYM = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return null

      if (ihaleId) {
        const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
        if (!ihale) return null
      }

      return tx.yaklasikMaliyet.create({
        data: {
          kurumId,
          ihaleId: ihaleId || null,
          tutar: parseFloat(tutar),
          aktifMi: true,
          versiyonNo: yeniVersiyonNo,
          sartnameNotu: typeof sartnameNotu === "string" && sartnameNotu.trim() ? sartnameNotu : null,
          tenantId,
        },
      })
    })

    if (!yeniYM) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(yeniYM, { status: 201 })
  } catch (error) {
    console.error("POST yaklasik-maliyet hatası:", error)
    return NextResponse.json({ error: "Oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const body = await request.json()
    const { id, sartnameNotu } = body

    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.yaklasikMaliyet.findFirst({ where: { id, tenantId } })
      if (!existing) return null

      return tx.yaklasikMaliyet.update({
        where: { id },
        data: {
          sartnameNotu: typeof sartnameNotu === "string" && sartnameNotu.trim() ? sartnameNotu : null,
        },
      })
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT yaklasik-maliyet hatası:", error)
    return NextResponse.json({ error: "Güncellenirken hata oluştu" }, { status: 500 })
  }
}
