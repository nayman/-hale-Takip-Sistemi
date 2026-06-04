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
    const { id: sozlesmeId } = await params

    const body = await request.json()
    const not = typeof body?.not === "string" ? body.not.trim() : ""
    if (!not) return NextResponse.json({ error: "Not içeriği boş olamaz" }, { status: 400 })

    const noteId =
      (globalThis as any).crypto?.randomUUID?.() ??
      `note_${Date.now()}_${Math.random().toString(16).slice(2)}`

    const created = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({ where: { id: sozlesmeId, tenantId } })
      if (!sozlesme) return null

      const created = await tx.sozlesmeNot.create({
        data: {
          id: noteId,
          sozlesmeId,
          not,
          yazar: userName,
        },
      })

      await createAuditLog(tx, tenantId, "SOZLESME", sozlesmeId, "UPDATE", userId, { action: "ADD_NOTE", id: noteId })
      return created
    })

    if (!created) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("POST sözleşme not hatası:", error)
    return NextResponse.json({ error: "Not eklenirken hata oluştu" }, { status: 500 })
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

    const { id: sozlesmeId } = await params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get("id")
    if (!noteId) return NextResponse.json({ error: "Not ID zorunludur" }, { status: 400 })

    const body = await request.json()
    const not = typeof body?.not === "string" ? body.not.trim() : ""
    if (!not) return NextResponse.json({ error: "Not içeriği boş olamaz" }, { status: 400 })

    const updated = await withTenant(tenantId, async (tx) => {
      const existing = await tx.sozlesmeNot.findFirst({
        where: { id: noteId, sozlesmeId, sozlesme: { tenantId } },
      })
      if (!existing) return null
      const updated = await tx.sozlesmeNot.update({ where: { id: noteId }, data: { not } })
      await createAuditLog(tx, tenantId, "SOZLESME", sozlesmeId, "UPDATE", userId, { action: "UPDATE_NOTE", id: noteId })
      return updated
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT sözleşme not hatası:", error)
    return NextResponse.json({ error: "Not güncellenirken hata oluştu" }, { status: 500 })
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

    const { id: sozlesmeId } = await params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get("id")
    if (!noteId) return NextResponse.json({ error: "Not ID zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.sozlesmeNot.findFirst({
        where: { id: noteId, sozlesmeId, sozlesme: { tenantId } },
      })
      if (!existing) return false
      await tx.sozlesmeNot.delete({ where: { id: noteId } })
      await createAuditLog(tx, tenantId, "SOZLESME", sozlesmeId, "UPDATE", userId, { action: "DELETE_NOTE", id: noteId })
      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE sözleşme not hatası:", error)
    return NextResponse.json({ error: "Not silinirken hata oluştu" }, { status: 500 })
  }
}

