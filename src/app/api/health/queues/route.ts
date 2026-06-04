import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient } from "@/lib/prisma-client"
import { documentQueue, ihaleQueue, notificationQueue, setupQueueWorkers } from "@/lib/queue"

function isBootstrapped() {
  return (globalThis as any).__queueBootstrapped === true
}

function setBootstrapped() {
  ;(globalThis as any).__queueBootstrapped = true
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userRole = session.user.rol ?? null
  const isPrivilegedRole = userRole === "SUPER_ADMIN" || userRole === "TENANT_ADMIN"
  if (!isPrivilegedRole) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (!isBootstrapped()) {
    await setupQueueWorkers()
    setBootstrapped()
  }

  const cron = process.env.YM_ALARM_CRON || "0 9 * * *"
  const hukukiCron = process.env.HUKUKI_ALARM_CRON || "0 9 * * *"
  const sozlesmeCron = process.env.SOZLESME_ALARM_CRON || "0 9 * * *"
  const hakedisCron = process.env.HAKEDIS_ACILIS_CRON || "0 2 1 * *"
  const belgeCron = process.env.BELGE_ALARM_CRON || "0 9 * * *"
  const kaliciSilmeCron = process.env.KALICI_SILME_CRON || "0 3 * * *"
  const tenants = await prismaClient.tenant.findMany({ select: { id: true } })

  let scheduledYm = 0
  let scheduledHukuki = 0
  let scheduledSozlesme = 0
  let scheduledHakedis = 0
  let scheduledBelge = 0
  let scheduledKaliciSilme = 0
  for (const t of tenants) {
    await ihaleQueue.add(
      "ym-alarm",
      { type: "ym-alarm", tenantId: t.id, data: {} },
      { repeat: { pattern: cron }, jobId: `ym-alarm:${t.id}` }
    )
    scheduledYm++

    await ihaleQueue.add(
      "hukuki-alarm",
      { type: "hukuki-alarm", tenantId: t.id, data: {} },
      { repeat: { pattern: hukukiCron }, jobId: `hukuki-alarm:${t.id}` }
    )
    scheduledHukuki++

    await ihaleQueue.add(
      "sozlesme-alarm",
      { type: "sozlesme-alarm", tenantId: t.id, data: {} },
      { repeat: { pattern: sozlesmeCron }, jobId: `sozlesme-alarm:${t.id}` }
    )
    scheduledSozlesme++

    await notificationQueue.add(
      "hakedis-acilis",
      { type: "hakedis-acilis", tenantId: t.id, data: {} },
      { repeat: { pattern: hakedisCron }, jobId: `hakedis-acilis:${t.id}` }
    )
    scheduledHakedis++

    await documentQueue.add(
      "belge-alarm",
      { type: "belge-alarm", tenantId: t.id, data: {} },
      { repeat: { pattern: belgeCron }, jobId: `belge-alarm:${t.id}` }
    )
    scheduledBelge++

    await documentQueue.add(
      "kalici-silme",
      { type: "kalici-silme", tenantId: t.id, data: {} },
      { repeat: { pattern: kaliciSilmeCron }, jobId: `kalici-silme:${t.id}` }
    )
    scheduledKaliciSilme++
  }

  return NextResponse.json({
    ok: true,
    bootstrapped: true,
    cron: {
      ym: cron,
      hukuki: hukukiCron,
      sozlesme: sozlesmeCron,
      hakedis: hakedisCron,
      belge: belgeCron,
      kaliciSilme: kaliciSilmeCron,
    },
    tenants: tenants.length,
    scheduled: {
      ym: scheduledYm,
      hukuki: scheduledHukuki,
      sozlesme: scheduledSozlesme,
      hakedis: scheduledHakedis,
      belge: scheduledBelge,
      kaliciSilme: scheduledKaliciSilme,
    },
  })
}
