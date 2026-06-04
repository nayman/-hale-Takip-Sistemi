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

function getIhaleFolderPathLegacy(ihale: { ihaleNo: string; ad: string; teklifSonTarihi: Date }) {
  const yil = new Date(ihale.teklifSonTarihi).getFullYear()
  const cleanedName = ihale.ad
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s-_]/g, '')
    .trim()
    .slice(0, 33)
    .replace(/\s+/g, '_')
  return `02_Ihale/${yil}/${ihale.ihaleNo}_${cleanedName}`
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const { id } = await params

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }))

    if (!ihale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    const storage = await getStorageAdapter(tenantId)
    const folderCandidates = uniqueStrings([getIhaleFolderPath(ihale), getIhaleFolderPathLegacy(ihale)])

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')
    const fileId = searchParams.get('fileId')
    const meta = searchParams.get('meta') === '1'
    const includeInactive = searchParams.get('includeInactive') === '1'

    if (fileId) {
      const belge = await withTenant(tenantId, (tx) =>
        tx.ihaleBelge.findFirst({ where: { id: fileId, ihaleId: id, tenantId } })
      )
      if (!belge) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
      const exists = await storage.exists(belge.dosyaYolu)
      if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const fileBuffer = await storage.download(belge.dosyaYolu)
      const cleanFileName = path.basename(belge.dosyaYolu)

      let contentType = 'application/octet-stream'
      let contentDisposition = `attachment; filename="${encodeURIComponent(cleanFileName)}"`

      const lowerName = cleanFileName.toLowerCase()
      if (lowerName.endsWith('.pdf')) {
        contentType = 'application/pdf'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.png')) {
        contentType = 'image/png'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        contentType = 'image/jpeg'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.gif')) {
        contentType = 'image/gif'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.webp')) {
        contentType = 'image/webp'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': contentDisposition
        }
      })
    }

    if (fileName) {
      // Dosya indirme
      const cleanFileName = path.basename(fileName)
      let filePath: string | null = null
      for (const folderPath of folderCandidates) {
        const candidate = `${folderPath}/${cleanFileName}`
        if (await storage.exists(candidate)) {
          filePath = candidate
          break
        }
      }

      if (!filePath) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const fileBuffer = await storage.download(filePath)
      
      let contentType = 'application/octet-stream'
      let contentDisposition = `attachment; filename="${encodeURIComponent(cleanFileName)}"`

      const lowerName = cleanFileName.toLowerCase()
      if (lowerName.endsWith('.pdf')) {
        contentType = 'application/pdf'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.png')) {
        contentType = 'image/png'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        contentType = 'image/jpeg'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.gif')) {
        contentType = 'image/gif'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      } else if (lowerName.endsWith('.webp')) {
        contentType = 'image/webp'
        contentDisposition = `inline; filename="${encodeURIComponent(cleanFileName)}"`
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': contentDisposition
        }
      })
    } else if (meta) {
      const belgeler = await withTenant(tenantId, (tx) =>
        tx.ihaleBelge.findMany({
          where: includeInactive ? { ihaleId: id, tenantId } : { ihaleId: id, tenantId, durum: "AKTIF" },
          orderBy: { createdAt: "desc" },
          select: { id: true, dosyaAdi: true, aciklama: true, createdAt: true, durum: true, silinmeTarihi: true },
        })
      )

      const storageFiles: string[] = []
      for (const folderPath of folderCandidates) {
        const exists = await storage.exists(folderPath)
        if (!exists) continue
        const files = await storage.list(folderPath)
        storageFiles.push(...files.map((f) => path.basename(f)))
      }

      const dbNames = new Set(belgeler.map((b) => b.dosyaAdi))
      const onlyStorage = uniqueStrings(storageFiles).filter((n) => !dbNames.has(n))
      return NextResponse.json([
        ...belgeler.map((b) => ({ ...b, source: "db" as const })),
        ...onlyStorage.map((dosyaAdi) => ({ dosyaAdi, aciklama: null, createdAt: null, source: "storage" as const })),
      ])
    } else {
      // Dosyaları listele
      const allFiles: string[] = []
      for (const folderPath of folderCandidates) {
        const exists = await storage.exists(folderPath)
        if (!exists) continue
        const files = await storage.list(folderPath)
        allFiles.push(...files.map((f) => path.basename(f)))
      }
      return NextResponse.json(uniqueStrings(allFiles))
    }
  } catch (error) {
    console.error("İhale dosyaları alınırken hata:", error)
    return NextResponse.json(
      { error: "İhale dosyaları alınırken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }))

    if (!ihale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const aciklama = formData.get('aciklama')

    if (!file) {
      return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 })
    }

    const storage = await getStorageAdapter(tenantId)
    const folderPath = getIhaleFolderPath(ihale)
    const safeFileName = dosyaAdi(file.name)
    const filePath = `${folderPath}/${safeFileName}`

    await storage.upload(file, filePath)

    const created = await withTenant(tenantId, async (tx) => {
      const existingIhale = await tx.ihale.findFirst({ where: { id, tenantId } })
      if (!existingIhale) return null

      const belge = await tx.ihaleBelge.create({
        data: {
          ihaleId: id,
          dosyaAdi: safeFileName,
          dosyaYolu: filePath,
          dosyaBoyutu: file.size,
          dosyaTipi: file.type || 'application/octet-stream',
          aciklama: typeof aciklama === "string" && aciklama.trim() ? aciklama.trim() : null,
          yukleyenUserId: userId,
          tenantId,
        },
      })

      if (existingIhale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id }, data: { durum: "DEVAM_EDİYOR" } })
      }

      await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, {
        action: "UPLOAD_FILE",
        fileName: safeFileName,
        belgeId: belge.id,
      })

      return belge
    })

    if (!created) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Dosya yüklenirken hata:", error)
    return NextResponse.json(
      { error: "Dosya yüklenirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }))
    if (!ihale) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })

    let body: any = {}
    try {
      body = await request.json()
    } catch {}

    const inputNames: string[] | null = Array.isArray(body?.fileNames)
      ? body.fileNames.map((n: unknown) => String(n))
      : null
    const targetNameSet = inputNames ? new Set(inputNames.map((n) => path.basename(n))) : null

    const storage = await getStorageAdapter(tenantId)
    const folderCandidates = uniqueStrings([getIhaleFolderPath(ihale), getIhaleFolderPathLegacy(ihale)])

    const fileCandidatesByName = new Map<string, string>()
    for (const folderPath of folderCandidates) {
      const exists = await storage.exists(folderPath)
      if (!exists) continue
      const listed = await storage.list(folderPath)
      for (const listedItem of listed) {
        const baseName = path.basename(listedItem)
        if (targetNameSet && !targetNameSet.has(baseName)) continue
        if (!fileCandidatesByName.has(baseName)) {
          fileCandidatesByName.set(baseName, `${folderPath}/${baseName}`)
        }
      }
    }

    const targetNames = Array.from(fileCandidatesByName.keys())
    if (targetNames.length === 0) return NextResponse.json({ createdCount: 0 })

    const createdCount = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleBelge.findMany({
        where: { ihaleId: id, tenantId, dosyaAdi: { in: targetNames } },
        select: { dosyaAdi: true },
      })
      const existingNames = new Set(existing.map((e) => e.dosyaAdi))
      const toCreate = targetNames.filter((n) => !existingNames.has(n))
      if (toCreate.length === 0) return 0

      await tx.ihaleBelge.createMany({
        data: toCreate.map((dosyaAdi) => ({
          ihaleId: id,
          dosyaAdi,
          dosyaYolu: fileCandidatesByName.get(dosyaAdi) || `${getIhaleFolderPath(ihale)}/${dosyaAdi}`,
          dosyaBoyutu: 0,
          dosyaTipi: "application/octet-stream",
          aciklama: null,
          yukleyenUserId: userId,
          tenantId,
          durum: "AKTIF",
          silinmeTarihi: null,
        })),
      })

      await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, {
        action: "BACKFILL_FILES",
        createdCount: toCreate.length,
      })

      return toCreate.length
    })

    return NextResponse.json({ createdCount })
  } catch (error) {
    console.error("Dosya metaveri backfill hatası:", error)
    return NextResponse.json({ error: "Dosya metaveri backfill hatası oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }))

    if (!ihale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')
    const fileId = searchParams.get('fileId')

    if (!fileName && !fileId) {
      return NextResponse.json({ error: "Silinecek dosya belirtilmedi" }, { status: 400 })
    }

    const storage = await getStorageAdapter(tenantId)
    if (fileId) {
      const updated = await withTenant(tenantId, async (tx) => {
        const belge = await tx.ihaleBelge.findFirst({ where: { id: fileId, ihaleId: id, tenantId } })
        if (!belge) return null
        if (belge.durum === "PASIF") return belge

        const updated = await tx.ihaleBelge.update({
          where: { id: fileId },
          data: { durum: "PASIF", silinmeTarihi: new Date() },
        })

        await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, { action: "SOFT_DELETE_FILE", belgeId: fileId })
        return updated
      })

      if (!updated) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
      return NextResponse.json({ message: "Dosya pasif edildi" })
    }

    const cleanFileName = path.basename(fileName as string)
    const folderCandidates = uniqueStrings([getIhaleFolderPath(ihale), getIhaleFolderPathLegacy(ihale)])
    let filePath: string | null = null
    for (const folderPath of folderCandidates) {
      const candidate = `${folderPath}/${cleanFileName}`
      if (await storage.exists(candidate)) {
        filePath = candidate
        break
      }
    }

    if (!filePath) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

    await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihaleBelge.findFirst({ where: { ihaleId: id, tenantId, dosyaAdi: cleanFileName } })
      if (existing) {
        if (existing.durum !== "PASIF") {
          await tx.ihaleBelge.update({
            where: { id: existing.id },
            data: { durum: "PASIF", silinmeTarihi: new Date() },
          })
        }
      } else {
        await tx.ihaleBelge.create({
          data: {
            ihaleId: id,
            dosyaAdi: cleanFileName,
            dosyaYolu: filePath,
            dosyaBoyutu: 0,
            dosyaTipi: 'application/octet-stream',
            aciklama: null,
            yukleyenUserId: userId,
            tenantId,
            durum: "PASIF",
            silinmeTarihi: new Date(),
          },
        })
      }

      await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, { action: "SOFT_DELETE_FILE", fileName: cleanFileName })
    })

    return NextResponse.json({ message: "Dosya pasif edildi" })
  } catch (error) {
    console.error("Dosya silinirken hata:", error)
    return NextResponse.json(
      { error: "Dosya silinirken hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }))
    if (!ihale) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    if (!fileId) return NextResponse.json({ error: "fileId zorunludur" }, { status: 400 })

    const restored = await withTenant(tenantId, async (tx) => {
      const belge = await tx.ihaleBelge.findFirst({ where: { id: fileId, ihaleId: id, tenantId } })
      if (!belge) return null
      if (belge.durum === "AKTIF") return belge
      const updated = await tx.ihaleBelge.update({
        where: { id: fileId },
        data: { durum: "AKTIF", silinmeTarihi: null },
      })
      await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, { action: "RESTORE_FILE", belgeId: fileId })
      return updated
    })

    if (!restored) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Dosya geri alma hatası:", error)
    return NextResponse.json({ error: "Dosya geri alınırken hata oluştu" }, { status: 500 })
  }
}
