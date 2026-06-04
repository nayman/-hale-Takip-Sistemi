import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id: kurumId } = await params
    const body = await request.json()
    const { ad, soyad, unvan, telefon, email } = body

    if (!ad || !soyad) return NextResponse.json({ error: "Ad ve Soyad zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const result = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return null
      return tx.kurumKisi.create({
        data: {
          kurumId,
          ad,
          soyad,
          unvan,
          telefon,
          email,
        },
      })
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const yeniKisi = result

    return NextResponse.json(yeniKisi, { status: 201 })
  } catch (error) {
    console.error("POST kurum kisi hatası:", error)
    return NextResponse.json({ error: "Kişi eklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id: kurumId } = await params
    
    const { searchParams } = new URL(request.url)
    const kisiId = searchParams.get('kisiId')
    
    if (!kisiId) return NextResponse.json({ error: "kisiId zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const deleted = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return false
      const kisi = await tx.kurumKisi.findFirst({ where: { id: kisiId, kurumId } })
      if (!kisi) return false
      await tx.kurumKisi.delete({ where: { id: kisiId } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Başarıyla silindi" })
  } catch (error) {
    console.error("DELETE kurum kisi hatası:", error)
    return NextResponse.json({ error: "Kişi silinirken hata oluştu" }, { status: 500 })
  }
}
