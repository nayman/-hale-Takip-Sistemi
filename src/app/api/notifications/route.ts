import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantId = session.user.tenantId
  const userId = session.user.id as string

  const { searchParams } = new URL(request.url)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50") || 50))
  const includeRead = searchParams.get("includeRead") === "1"
  const countOnly = searchParams.get("countOnly") === "1"

  if (countOnly) {
    const unreadCount = await prismaClient.notification.count({
      where: { tenantId, userId, isRead: false },
    })
    return NextResponse.json({ unreadCount })
  }

  const notifications = await withTenant(tenantId, (tx) =>
    tx.notification.findMany({
      where: {
        tenantId,
        userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  )

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tenantId = session.user.tenantId
  const userId = session.user.id as string

  let body: any = {}
  try {
    body = await request.json()
  } catch {}

  const id = typeof body?.id === "string" ? body.id : null
  const markAllRead = body?.all === true
  const now = new Date()

  if (markAllRead) {
    const result = await prismaClient.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true, readAt: now },
    })
    return NextResponse.json({ updated: result.count })
  }

  if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 400 })

  const updated = await prismaClient.notification.updateMany({
    where: { id, tenantId, userId },
    data: { isRead: true, readAt: now },
  })

  if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
