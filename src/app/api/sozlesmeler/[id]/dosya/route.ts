import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { createAuditLog } from "@/lib/audit-log"
import { dosyaAdi, sozlesmeBasePath } from "@/lib/slug"
import * as path from "path"

function ihaleTuruKlasor(usul: string | null | undefined): "DT" | "IHALE" {
  return usul === "DOGRUDAN_TEMIN" ? "DT" : "IHALE"
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: { ihale: true, belgeler: { orderBy: { createdAt: "desc" } } },
      })
    )
    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const storage = await getStorageAdapter(tenantId)
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    if (fileId) {
      const belge = sozlesme.belgeler.find((b) => b.id === fileId)
      if (!belge) return NextResponse.json({ error: "Not found" }, { status: 404 })

      const exists = await storage.exists(belge.dosyaYolu)
      if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const fileBuffer = await storage.download(belge.dosyaYolu)
      const cleanFileName = path.basename(belge.dosyaYolu)

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(cleanFileName)}"`,
        },
      })
    }

    return NextResponse.json(sozlesme.belgeler)
  } catch (error) {
    console.error("Sözleşme dosyaları alınırken hata:", error)
    return NextResponse.json({ error: "Sözleşme dosyaları alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: { ihale: true },
      })
    )
    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 })

    const storage = await getStorageAdapter(tenantId)
    const year = sozlesme.bitisTarihi
      ? new Date(sozlesme.bitisTarihi).getFullYear()
      : new Date(sozlesme.ihale.teklifSonTarihi).getFullYear()

    const basePath = sozlesmeBasePath({
      year,
      ihaleTuruKlasor: ihaleTuruKlasor(sozlesme.ihale.usul),
      ihaleNo: sozlesme.ihale.ihaleNo,
      ihaleAdi: sozlesme.ihale.ad,
    })

    const safeFileName = dosyaAdi(file.name)
    const filePath = `${basePath}/${safeFileName}`

    await storage.upload(file, filePath)

    const belge = await withTenant(tenantId, async (tx) => {
      const belge = await tx.sozlesmeBelge.create({
        data: {
          sozlesmeId,
          ad: file.name,
          dosyaYolu: filePath,
        },
      })

      await createAuditLog(tx, tenantId, "SOZLESME", sozlesmeId, "UPDATE", userId, {
        action: "UPLOAD_FILE",
        fileName: safeFileName,
      })

      return belge
    })

    return NextResponse.json(belge, { status: 201 })
  } catch (error) {
    console.error("Sözleşme dosya yükleme hatası:", error)
    return NextResponse.json({ error: "Dosya yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")
    if (!fileId) return NextResponse.json({ error: "fileId zorunludur" }, { status: 400 })

    const belge = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId } })
      if (!sozlesme) return null
      const belge = await tx.sozlesmeBelge.findFirst({ where: { id: fileId, sozlesmeId } })
      if (!belge) return null
      await tx.sozlesmeBelge.delete({ where: { id: fileId } })
      return belge
    })
    if (!belge) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const storage = await getStorageAdapter(tenantId)
    const exists = await storage.exists(belge.dosyaYolu)
    if (exists) await storage.delete(belge.dosyaYolu)

    await withTenant(tenantId, (tx) =>
      createAuditLog(tx, tenantId, "SOZLESME", sozlesmeId, "UPDATE", userId, {
        action: "DELETE_FILE",
        fileName: path.basename(belge.dosyaYolu),
      })
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Sözleşme dosya silme hatası:", error)
    return NextResponse.json({ error: "Dosya silinirken hata oluştu" }, { status: 500 })
  }
}

