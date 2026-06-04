import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

// GET is handled inside /api/kurumlar?id=... (with include)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id: kurumId } = await params
    const body = await request.json()
    const { not } = body

    if (!not) return NextResponse.json({ error: "Not boş olamaz" }, { status: 400 })

    const tenantId = session.user.tenantId
    const result = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return null

      return tx.kurumHafizaNot.create({
        data: {
          kurumId,
          not,
          yazar: session.user.name || session.user.email || "Bilinmeyen Kullanıcı",
        },
      })
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const yeniNot = result

    return NextResponse.json(yeniNot, { status: 201 })
  } catch (error) {
    console.error("POST hafıza notu hatası:", error)
    return NextResponse.json({ error: "Not eklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id: kurumId } = await params
    
    const { searchParams } = new URL(request.url)
    const notId = searchParams.get('notId')
    
    if (!notId) return NextResponse.json({ error: "notId zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const deleted = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return false
      const note = await tx.kurumHafizaNot.findFirst({ where: { id: notId, kurumId } })
      if (!note) return false
      await tx.kurumHafizaNot.delete({ where: { id: notId } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Başarıyla silindi" })
  } catch (error) {
    console.error("DELETE hafıza notu hatası:", error)
    return NextResponse.json({ error: "Not silinirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: kurumId } = await params
    const { searchParams } = new URL(request.url)
    const notId = searchParams.get('notId')
    if (!notId) return NextResponse.json({ error: "notId zorunludur" }, { status: 400 })

    const body = await request.json()
    const { not } = body
    if (typeof not !== "string" || !not.trim()) {
      return NextResponse.json({ error: "Not boş olamaz" }, { status: 400 })
    }

    const tenantId = session.user.tenantId
    const updated = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return null
      const note = await tx.kurumHafizaNot.findFirst({ where: { id: notId, kurumId } })
      if (!note) return null

      return tx.kurumHafizaNot.update({
        where: { id: notId },
        data: { not },
      })
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT hafıza notu hatası:", error)
    return NextResponse.json({ error: "Not güncellenirken hata oluştu" }, { status: 500 })
  }
}
