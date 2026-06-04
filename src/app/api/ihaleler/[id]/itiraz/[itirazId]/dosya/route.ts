import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { createAuditLog } from "@/lib/audit-log"
import { dosyaAdi, iknIsKlasorAdi } from "@/lib/slug"
import * as path from "path"

function getIhaleFolderPath(ihale: { ihaleNo: string; ad: string; teklifSonTarihi: Date }) {
  const yil = new Date(ihale.teklifSonTarihi).getFullYear()
  const folder = iknIsKlasorAdi(ihale.ihaleNo, ihale.ad)
  return `02_Ihale/${yil}/${folder}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itirazId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const { id: ihaleId, itirazId } = await params

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    const storage = await getStorageAdapter(tenantId)

    if (fileId) {
      const belge = await withTenant(tenantId, (tx) =>
        tx.ihaleItirazBelge.findFirst({
          where: {
            id: fileId,
            itirazId,
            itiraz: { ihaleId, ihale: { tenantId } },
          },
        })
      )
      if (!belge) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const exists = await storage.exists(belge.dosyaYolu)
      if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const fileBuffer = await storage.download(belge.dosyaYolu)
      const cleanFileName = path.basename(belge.dosyaYolu)

      let contentType = "application/octet-stream"
      let contentDisposition = `attachment; filename="${encodeURIComponent(cleanFileName)}"`
      const lowerName = cleanFileName.toLowerCase()
      if (lowerName.endsWith(".pdf")) {
        contentType = "application/pdf"
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      })
    }

    const items = await withTenant(tenantId, (tx) =>
      tx.ihaleItirazBelge.findMany({
        where: {
          itirazId,
          itiraz: { ihaleId, ihale: { tenantId } },
        },
        orderBy: { ad: "asc" },
        select: { id: true, ad: true, dosyaYolu: true, not: true },
      })
    )

    return NextResponse.json(items)
  } catch (error) {
    console.error("GET itiraz dosyaları hatası:", error)
    return NextResponse.json({ error: "İtiraz dosyaları alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itirazId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const { id: ihaleId, itirazId } = await params
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const not = formData.get("not")

    if (!file) return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 })

    const storage = await getStorageAdapter(tenantId)

    const created = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const itiraz = await tx.ihaleItiraz.findFirst({ where: { id: itirazId, ihaleId } })
      if (!itiraz) return null

      const baseFolder = getIhaleFolderPath(ihale)
      const safeFileName = dosyaAdi(file.name)
      const filePath = `${baseFolder}/06_Itirazlar/${itirazId}/${safeFileName}`

      await storage.upload(file, filePath)

      const belge = await tx.ihaleItirazBelge.create({
        data: {
          itirazId,
          ad: safeFileName,
          dosyaYolu: filePath,
          not: typeof not === "string" && not.trim() ? not.trim() : null,
        },
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "UPLOAD_ITIRAZ_FILE",
        itirazId,
        belgeId: belge.id,
        fileName: safeFileName,
      })

      return belge
    })

    if (!created) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("POST itiraz dosya yükleme hatası:", error)
    return NextResponse.json({ error: "İtiraz dosyası yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itirazId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const { id: ihaleId, itirazId } = await params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const body = await request.json()
    const rawNote = typeof body?.not === "string" ? body.not : ""
    const nextNote = rawNote.trim() ? rawNote.trim() : null

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleItirazBelge.findFirst({
        where: { id, itirazId, itiraz: { ihaleId, ihale: { tenantId } } },
      })
      if (!existing) return null

      const updated = await tx.ihaleItirazBelge.update({ where: { id }, data: { not: nextNote } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "UPDATE_ITIRAZ_FILE_NOTE", itirazId, belgeId: id })
      return updated
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT itiraz dosya notu hatası:", error)
    return NextResponse.json({ error: "Dosya notu güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itirazId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }

    const { id: ihaleId, itirazId } = await params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleItirazBelge.findFirst({
        where: { id, itirazId, itiraz: { ihaleId, ihale: { tenantId } } },
      })
      if (!existing) return false
      await tx.ihaleItirazBelge.delete({ where: { id } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "DELETE_ITIRAZ_FILE", itirazId, belgeId: id })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE itiraz dosya hatası:", error)
    return NextResponse.json({ error: "Dosya silinirken hata oluştu" }, { status: 500 })
  }
}

