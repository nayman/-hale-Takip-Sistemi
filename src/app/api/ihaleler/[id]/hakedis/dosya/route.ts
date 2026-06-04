import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { dosyaAdi, iknIsKlasorAdi } from "@/lib/slug"
import * as path from "path"

const MONTH_NAMES = [
  "Ocak",
  "Subat",
  "Mart",
  "Nisan",
  "Mayis",
  "Haziran",
  "Temmuz",
  "Agustos",
  "Eylul",
  "Ekim",
  "Kasim",
  "Aralik",
] as const

function monthFolder(ay: number) {
  const idx = ay - 1
  const name = MONTH_NAMES[idx] || "Ay"
  return `${String(ay).padStart(2, "0")}_${name}`
}

function hakedisFolderPath(input: { yil: number; ay: number; ihaleNo: string; ihaleAdi: string; kurumAdi: string }) {
  const cleanKurum = input.kurumAdi.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').substring(0, 20)
  const cleanIkn = input.ihaleNo.replace(/[^a-zA-Z0-9]/g, '_')
  return `Ihaleler/${input.yil}_${cleanIkn}_${cleanKurum}/05_Hakedişler/${monthFolder(input.ay)}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: ihaleId } = await params

    const { searchParams } = new URL(request.url)
    const yil = Number(searchParams.get("yil"))
    const ay = Number(searchParams.get("ay"))
    const fileName = searchParams.get("file")
    if (!Number.isFinite(yil) || !Number.isFinite(ay)) {
      return NextResponse.json({ error: "yil ve ay zorunludur" }, { status: 400 })
    }

    const ihale = await withTenant(tenantId, (tx) =>
      tx.ihale.findFirst({ where: { id: ihaleId, tenantId }, select: { ihaleNo: true, ad: true, kurum: { select: { ad: true } } } })
    )
    if (!ihale) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const storage = await getStorageAdapter(tenantId)
    const folder = hakedisFolderPath({ yil, ay, ihaleNo: ihale.ihaleNo, ihaleAdi: ihale.ad, kurumAdi: ihale.kurum.ad })

    if (fileName) {
      const clean = path.basename(fileName)
      const filePath = `${folder}/${clean}`
      const exists = await storage.exists(filePath)
      if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
      const fileBuffer = await storage.download(filePath)
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(clean)}"`,
        },
      })
    }

    const exists = await storage.exists(folder)
    if (!exists) return NextResponse.json([])
    const files = await storage.list(folder)
    return NextResponse.json(files.map((f) => path.basename(f)))
  } catch (error) {
    console.error("GET hakediş evrakları hatası:", error)
    return NextResponse.json({ error: "Hakediş evrakları alınırken hata oluştu" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id: ihaleId } = await params
    const { searchParams } = new URL(request.url)
    const yil = Number(searchParams.get("yil"))
    const ay = Number(searchParams.get("ay"))
    if (!Number.isFinite(yil) || !Number.isFinite(ay)) {
      return NextResponse.json({ error: "yil ve ay zorunludur" }, { status: 400 })
    }

    const ihale = await withTenant(tenantId, (tx) =>
      tx.ihale.findFirst({ where: { id: ihaleId, tenantId }, select: { ihaleNo: true, ad: true, kurum: { select: { ad: true } } } })
    )
    if (!ihale) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 })

    const storage = await getStorageAdapter(tenantId)
    const folder = hakedisFolderPath({ yil, ay, ihaleNo: ihale.ihaleNo, ihaleAdi: ihale.ad, kurumAdi: ihale.kurum.ad })
    const safeFileName = dosyaAdi(file.name)
    const filePath = `${folder}/${safeFileName}`

    await storage.upload(file, filePath)
    return NextResponse.json({ ok: true, fileName: safeFileName }, { status: 201 })
  } catch (error) {
    console.error("POST hakediş evrakları hatası:", error)
    return NextResponse.json({ error: "Hakediş evrağı yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id: ihaleId } = await params
    const { searchParams } = new URL(request.url)
    const yil = Number(searchParams.get("yil"))
    const ay = Number(searchParams.get("ay"))
    const fileName = searchParams.get("file")
    if (!Number.isFinite(yil) || !Number.isFinite(ay) || !fileName) {
      return NextResponse.json({ error: "yil, ay ve file zorunludur" }, { status: 400 })
    }

    const ihale = await withTenant(tenantId, (tx) =>
      tx.ihale.findFirst({ where: { id: ihaleId, tenantId }, select: { ihaleNo: true, ad: true, kurum: { select: { ad: true } } } })
    )
    if (!ihale) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const storage = await getStorageAdapter(tenantId)
    const folder = hakedisFolderPath({ yil, ay, ihaleNo: ihale.ihaleNo, ihaleAdi: ihale.ad, kurumAdi: ihale.kurum.ad })
    const clean = path.basename(fileName)
    const filePath = `${folder}/${clean}`
    const exists = await storage.exists(filePath)
    if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
    await storage.delete(filePath)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE hakediş evrakları hatası:", error)
    return NextResponse.json({ error: "Hakediş evrağı silinirken hata oluştu" }, { status: 500 })
  }
}

