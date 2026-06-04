import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { createAuditLog } from "@/lib/audit-log"

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
    const { id: ihaleId } = await params

    const body = await request.json()
    const { kurumKisiId, rol } = body

    if (!kurumKisiId) {
      return NextResponse.json({ error: "Kişi seçimi zorunludur" }, { status: 400 })
    }

    const result = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const kisi = await tx.kurumKisi.findUnique({ where: { id: kurumKisiId } })
      if (!kisi) return null

      if (kisi.kurumId !== ihale.kurumId) return null

      const atama = await tx.ihaleAtama.upsert({
        where: {
          ihaleId_kurumKisiId: {
            ihaleId,
            kurumKisiId,
          },
        },
        update: {
          rol: rol || null,
        },
        create: {
          id:
            (globalThis as any).crypto?.randomUUID?.() ??
            `atama_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          ihaleId,
          kurumKisiId,
          rol: rol || null,
        },
        include: {
          kurumKisi: true,
        },
      })

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "ADD_ATAMA",
        name: `${kisi.ad} ${kisi.soyad}`,
        rol,
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      return atama
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const atama = result

    return NextResponse.json(atama, { status: 201 })
  } catch (error) {
    console.error("Personel atama hatası:", error)
    return NextResponse.json(
      { error: "Personel atama hatası oluştu" },
      { status: 500 }
    )
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
    const { id: ihaleId } = await params

    const { searchParams } = new URL(request.url)
    const kurumKisiId = searchParams.get('kurumKisiId')

    if (!kurumKisiId) {
      return NextResponse.json({ error: "Kişi ID zorunludur" }, { status: 400 })
    }

    const deleted = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const atama = await tx.ihaleAtama.findUnique({
        where: {
          ihaleId_kurumKisiId: {
            ihaleId,
            kurumKisiId,
          },
        },
        include: {
          kurumKisi: true,
        },
      })

      if (!atama) return null
      if (atama.kurumKisi.kurumId !== ihale.kurumId) return null

      await tx.ihaleAtama.delete({
        where: {
          ihaleId_kurumKisiId: {
            ihaleId,
            kurumKisiId,
          },
        },
      })

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "DELETE_ATAMA",
        name: `${atama.kurumKisi.ad} ${atama.kurumKisi.soyad}`,
      })

      return true
    })

    if (!deleted) return NextResponse.json({ error: "Atama bulunamadı" }, { status: 404 })

    return NextResponse.json({ message: "Atama başarıyla kaldırıldı" })
  } catch (error) {
    console.error("Atama kaldırma hatası:", error)
    return NextResponse.json(
      { error: "Atama kaldırma hatası oluştu" },
      { status: 500 }
    )
  }
}
