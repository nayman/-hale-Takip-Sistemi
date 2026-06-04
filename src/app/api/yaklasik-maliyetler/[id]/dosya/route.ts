import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { dosyaAdi, kurumIsKlasorAdi, klasorAdi } from "@/lib/slug"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })

    const tenantId = session.user.tenantId
    const ym = await withTenant(tenantId, async (tx) =>
      tx.yaklasikMaliyet.findFirst({
        where: { id, tenantId },
        include: { kurum: true, ihale: true },
      })
    )

    if (!ym) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 })

    // Storage adapter'ı al (Yandex Disk veya Local Storage)
    const storageAdapter = await getStorageAdapter(tenantId)
    
    // Klasör hiyerarşisi: 01_Teklifler/{YIL}/{KURUM_ADI}/{VERSİYON}
    const year = ym.ihale?.teklifSonTarihi ? new Date(ym.ihale.teklifSonTarihi).getFullYear() : new Date().getFullYear()
    const kurumIs = ym.ihale?.ad ? kurumIsKlasorAdi(ym.kurum.ad, ym.ihale.ad) : klasorAdi(ym.kurum.ad)
    const safeFileName = dosyaAdi(file.name)
    const targetFilePath = `01_Teklifler/${year}/${kurumIs}/${ym.versiyonNo}/${safeFileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Yükleme işlemini gerçekleştir (ensurePath otomatik içeride çağrılır)
    const uploadResult = await storageAdapter.upload(buffer, targetFilePath)

    if (!uploadResult) {
      return NextResponse.json({ error: "Dosya yüklenirken hata oluştu" }, { status: 500 })
    }

    // Veritabanını güncelle
    const updated = await withTenant(tenantId, async (tx) =>
      tx.yaklasikMaliyet.update({
        where: { id },
        data: { dosyaYolu: targetFilePath },
      })
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Upload hatası:", error)
    return NextResponse.json({ error: "Dosya yüklenirken sunucu hatası oluştu" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { id } = await params
    const tenantId = session.user.tenantId
    const ym = await withTenant(tenantId, async (tx) =>
      tx.yaklasikMaliyet.findFirst({
        where: { id, tenantId },
      })
    )

    if (!ym || !ym.dosyaYolu) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
    }

    const storageAdapter = await getStorageAdapter(tenantId)
    const fileBuffer = await storageAdapter.download(ym.dosyaYolu)
    
    const filename = ym.dosyaYolu.split('/').pop() || 'dosya'
    
    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Type": "application/octet-stream",
      }
    })
  } catch (error) {
    console.error("Dosya indirme hatası:", error)
    return NextResponse.json({ error: "Dosya indirilirken hata oluştu" }, { status: 500 })
  }
}
