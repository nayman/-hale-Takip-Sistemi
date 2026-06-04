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
    const userName = session.user.name || session.user.email || "Kullanıcı"
    const { id: ihaleId } = await params

    const body = await request.json()
    const { not } = body

    if (!not || not.trim() === "") {
      return NextResponse.json({ error: "Not içeriği boş olamaz" }, { status: 400 })
    }

    const noteId =
      (globalThis as any).crypto?.randomUUID?.() ??
      `note_${Date.now()}_${Math.random().toString(16).slice(2)}`

    const ihaleNot = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null
      const ihaleNot = await tx.ihaleNot.create({
        data: {
          id: noteId,
          ihaleId,
          not: not.trim(),
          yazar: userName,
        },
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "ADD_NOTE", id: ihaleNot.id })
      return ihaleNot
    })

    if (!ihaleNot) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    return NextResponse.json(ihaleNot, { status: 201 })
  } catch (error) {
    console.error("Not oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Not oluşturulurken bir hata oluştu" },
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
    const { id: ihaleId } = await params

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')
    if (!noteId) return NextResponse.json({ error: "Not ID zorunludur" }, { status: 400 })

    const body = await request.json()
    const { not } = body
    if (!not || typeof not !== "string" || !not.trim()) {
      return NextResponse.json({ error: "Not içeriği boş olamaz" }, { status: 400 })
    }

    const updated = await withTenant(tenantId, async (tx) => {
      const ihaleNot = await tx.ihaleNot.findFirst({
        where: {
          id: noteId,
          ihaleId,
          ihale: { tenantId },
        },
      })
      if (!ihaleNot) return null

      const updated = await tx.ihaleNot.update({ where: { id: noteId }, data: { not: not.trim() } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "UPDATE_NOTE", id: noteId })
      return updated
    })

    if (!updated) return NextResponse.json({ error: "Not bulunamadı" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Not güncellenirken hata:", error)
    return NextResponse.json({ error: "Not güncellenirken bir hata oluştu" }, { status: 500 })
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

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id: ihaleId } = await params

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: "Not ID zorunludur" }, { status: 400 })
    }

    const deleted = await withTenant(tenantId, async (tx) => {
      const ihaleNot = await tx.ihaleNot.findFirst({
        where: {
          id: noteId,
          ihaleId,
          ihale: {
            tenantId,
          },
        },
      })

      if (!ihaleNot) return false

      await tx.ihaleNot.delete({ where: { id: noteId } })
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, { action: "DELETE_NOTE", id: noteId })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not bulunamadı" }, { status: 404 })

    return NextResponse.json({ message: "Not başarıyla silindi" })
  } catch (error) {
    console.error("Not silinirken hata:", error)
    return NextResponse.json(
      { error: "Not silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
