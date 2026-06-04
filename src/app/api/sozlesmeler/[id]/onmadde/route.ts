import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { getStorageAdapter } from "@/lib/storage-adapter"
import { dosyaAdi, sozlesmeBasePath } from "@/lib/slug"
import * as path from "path"
import { randomUUID } from "crypto"

function ihaleTuruKlasor(usul: string | null | undefined): "DT" | "IHALE" {
  return usul === "DOGRUDAN_TEMIN" ? "DT" : "IHALE"
}

function belgeFolderName(belgeAdi: string) {
  return dosyaAdi(belgeAdi)
}

function hasOnMaddeDurumDelegate(tx: any) {
  return Boolean(tx?.sozlesmeOnMaddeDurum && typeof tx.sozlesmeOnMaddeDurum.findFirst === "function")
}

function isMissingRelation(err: unknown, tableName: string) {
  const e = err as any
  const message = typeof e?.message === "string" ? e.message : ""
  const causeMessage = typeof e?.meta?.driverAdapterError?.cause?.originalMessage === "string"
    ? e.meta.driverAdapterError.cause.originalMessage
    : ""
  const combined = `${message}\n${causeMessage}`.toLowerCase()
  return combined.includes("does not exist") && combined.includes(`relation "${tableName}"`.toLowerCase())
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    const { id: sozlesmeId } = await params

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode")
    const belgeAdiParam = searchParams.get("belgeAdi")
    const fileName = searchParams.get("file")
    if (mode === "checklist") {
      const sozlesmeExists = await withTenant(tenantId, (tx) =>
        tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId }, select: { id: true } })
      )
      if (!sozlesmeExists) return NextResponse.json({ error: "Not found" }, { status: 404 })

      if (belgeAdiParam) {
        const row = await withTenant(tenantId, async (tx) => {
          try {
            if (hasOnMaddeDurumDelegate(tx)) {
              return tx.sozlesmeOnMaddeDurum.findFirst({
                where: { tenantId, sozlesmeId, belgeAdi: belgeAdiParam },
                select: { durum: true },
              })
            }
            const rows = await (tx as any).$queryRaw<
              { durum: string }[]
            >`SELECT "durum" FROM "sozlesme_onmadde_durumlari" WHERE "tenantId" = ${tenantId} AND "sozlesmeId" = ${sozlesmeId} AND "belgeAdi" = ${belgeAdiParam} LIMIT 1`
            return rows?.[0] ?? null
          } catch (e) {
            if (isMissingRelation(e, "sozlesme_onmadde_durumlari")) return null
            throw e
          }
        })
        return NextResponse.json({ belgeAdi: belgeAdiParam, durum: row?.durum ?? "EKSIK" })
      }

      const rows = await withTenant(tenantId, async (tx) => {
        try {
          if (hasOnMaddeDurumDelegate(tx)) {
            return tx.sozlesmeOnMaddeDurum.findMany({
              where: { tenantId, sozlesmeId },
              select: { belgeAdi: true, durum: true, updatedAt: true },
              orderBy: { updatedAt: "desc" },
            })
          }
          return (tx as any).$queryRaw<
            { belgeAdi: string; durum: string; updatedAt: Date }[]
          >`SELECT "belgeAdi", "durum", "updatedAt" FROM "sozlesme_onmadde_durumlari" WHERE "tenantId" = ${tenantId} AND "sozlesmeId" = ${sozlesmeId} ORDER BY "updatedAt" DESC`
        } catch (e) {
          if (isMissingRelation(e, "sozlesme_onmadde_durumlari")) return []
          throw e
        }
      })
      return NextResponse.json(rows)
    }

    if (!belgeAdiParam) return NextResponse.json({ error: "belgeAdi zorunludur" }, { status: 400 })

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: { ihale: true },
      })
    )
    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

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

    const folderPath = `${basePath}/10_Madde/${belgeFolderName(belgeAdiParam)}`

    if (fileName) {
      const cleanFileName = path.basename(fileName)
      const filePath = `${folderPath}/${cleanFileName}`
      const exists = await storage.exists(filePath)
      if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

      const fileBuffer = await storage.download(filePath)
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(cleanFileName)}"`,
        },
      })
    }

    const exists = await storage.exists(folderPath)
    if (!exists) return NextResponse.json([])

    const files = await storage.list(folderPath)
    return NextResponse.json(files.map((f) => path.basename(f)))
  } catch (error) {
    console.error("GET sözleşme 10. madde hatası:", error)
    return NextResponse.json({ error: "10. madde dosyaları alınırken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: sozlesmeId } = await params

    const body = await request.json().catch(() => null)
    const belgeAdi = typeof body?.belgeAdi === "string" ? body.belgeAdi.trim() : ""
    const durum = typeof body?.durum === "string" ? body.durum : ""
    if (!belgeAdi) return NextResponse.json({ error: "belgeAdi zorunludur" }, { status: 400 })
    if (durum !== "EKSIK" && durum !== "TAMAMLANDI" && durum !== "MUAF") {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
    }

    const sozlesmeExists = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId }, select: { id: true } })
    )
    if (!sozlesmeExists) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const row = await withTenant(tenantId, async (tx) => {
      if (hasOnMaddeDurumDelegate(tx)) {
        return tx.sozlesmeOnMaddeDurum.upsert({
          where: {
            tenantId_sozlesmeId_belgeAdi: {
              tenantId,
              sozlesmeId,
              belgeAdi,
            },
          },
          update: { durum },
          create: { tenantId, sozlesmeId, belgeAdi, durum },
          select: { belgeAdi: true, durum: true, updatedAt: true },
        })
      }
      try {
        const id = randomUUID()
        const rows = await (tx as any).$queryRaw<
          { belgeAdi: string; durum: string; updatedAt: Date }[]
        >`INSERT INTO "sozlesme_onmadde_durumlari" ("id", "tenantId", "sozlesmeId", "belgeAdi", "durum", "updatedAt")
          VALUES (${id}, ${tenantId}, ${sozlesmeId}, ${belgeAdi}, ${durum}, CURRENT_TIMESTAMP)
          ON CONFLICT ("tenantId", "sozlesmeId", "belgeAdi")
          DO UPDATE SET "durum" = EXCLUDED."durum", "updatedAt" = CURRENT_TIMESTAMP
          RETURNING "belgeAdi", "durum", "updatedAt"`
        return rows?.[0] ?? { belgeAdi, durum, updatedAt: new Date() }
      } catch (e) {
        if (isMissingRelation(e, "sozlesme_onmadde_durumlari")) {
          throw new Error("Migrations uygulanmadı: sozlesme_onmadde_durumlari tablosu yok")
        }
        throw e
      }
    })

    await withTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenantId,
          entity: "SOZLESME",
          entityId: sozlesmeId,
          action: "UPDATE",
          userId,
          data: { action: "UPDATE_10_MADDE_DURUM", belgeAdi, durum },
        },
      })
    )

    return NextResponse.json(row)
  } catch (error) {
    console.error("PUT sözleşme 10. madde durum hatası:", error)
    if (typeof (error as any)?.message === "string" && (error as any).message.includes("sozlesme_onmadde_durumlari")) {
      return NextResponse.json(
        { error: "Checklist için veritabanı migration'ı uygulanmamış. Pending migration'ları deploy edin." },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "10. madde durumu güncellenirken hata oluştu" }, { status: 500 })
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
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: sozlesmeId } = await params

    const { searchParams } = new URL(request.url)
    const belgeAdiParam = searchParams.get("belgeAdi")
    if (!belgeAdiParam) return NextResponse.json({ error: "belgeAdi zorunludur" }, { status: 400 })

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 })

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: { ihale: true },
      })
    )
    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

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

    const folderPath = `${basePath}/10_Madde/${belgeFolderName(belgeAdiParam)}`
    const safeFileName = dosyaAdi(file.name)
    const filePath = `${folderPath}/${safeFileName}`

    await storage.upload(file, filePath)
    await withTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenantId,
          entity: "SOZLESME",
          entityId: sozlesmeId,
          action: "UPDATE",
          userId,
          data: { action: "UPLOAD_10_MADDE", belgeAdi: belgeAdiParam, fileName: safeFileName },
        },
      })
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("POST sözleşme 10. madde hatası:", error)
    return NextResponse.json({ error: "10. madde dosyası yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: sozlesmeId } = await params

    const { searchParams } = new URL(request.url)
    const belgeAdiParam = searchParams.get("belgeAdi")
    const fileName = searchParams.get("file")
    if (!belgeAdiParam || !fileName) return NextResponse.json({ error: "belgeAdi ve file zorunludur" }, { status: 400 })

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id: sozlesmeId, tenantId },
        include: { ihale: true },
      })
    )
    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })

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

    const folderPath = `${basePath}/10_Madde/${belgeFolderName(belgeAdiParam)}`
    const cleanFileName = path.basename(fileName)
    const filePath = `${folderPath}/${cleanFileName}`

    const exists = await storage.exists(filePath)
    if (!exists) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })

    await storage.delete(filePath)
    await withTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenantId,
          entity: "SOZLESME",
          entityId: sozlesmeId,
          action: "UPDATE",
          userId,
          data: { action: "DELETE_10_MADDE", belgeAdi: belgeAdiParam, fileName: cleanFileName },
        },
      })
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE sözleşme 10. madde hatası:", error)
    return NextResponse.json({ error: "10. madde dosyası silinirken hata oluştu" }, { status: 500 })
  }
}
