import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id: kurumId } = await params
    const body = await request.json()
    const { arananKisi, modul, not } = body

    if (!not) return NextResponse.json({ error: "Görüşme notu boş olamaz" }, { status: 400 })

    const tenantId = session.user.tenantId
    const result = await withTenant(tenantId, async (tx) => {
      const kurum = await tx.kurum.findFirst({ where: { id: kurumId, tenantId } })
      if (!kurum) return null
      return tx.kurumAramaLog.create({
        data: {
          kurumId,
          arananKisi,
          modul,
          not,
          yazar: session.user.name || session.user.email || "Bilinmeyen Kullanıcı",
          tenantId,
        },
      })
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const yeniLog = result

    return NextResponse.json(yeniLog, { status: 201 })
  } catch (error) {
    console.error("POST arama logu hatası:", error)
    return NextResponse.json({ error: "Görüşme kaydı eklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const logId = searchParams.get('logId')
    
    if (!logId) return NextResponse.json({ error: "logId zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.kurumAramaLog.findFirst({ where: { id: logId, tenantId } })
      if (!existing) return false
      await tx.kurumAramaLog.delete({ where: { id: logId } })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Başarıyla silindi" })
  } catch (error) {
    console.error("DELETE arama logu hatası:", error)
    return NextResponse.json({ error: "Görüşme kaydı silinirken hata oluştu" }, { status: 500 })
  }
}
