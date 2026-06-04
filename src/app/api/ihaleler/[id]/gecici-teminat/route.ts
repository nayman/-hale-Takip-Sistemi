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

    // İhale kontrolü
    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id: ihaleId, tenantId } }))
    if (!ihale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    const body = await request.json()
    const { tutar, banka, bitisTarihi, mektupNo } = body

    if (!tutar || Number(tutar) <= 0) {
      return NextResponse.json({ error: "Geçersiz teminat tutarı" }, { status: 400 })
    }

    const teminatId =
      (globalThis as any).crypto?.randomUUID?.() ??
      `teminat_${Date.now()}_${Math.random().toString(16).slice(2)}`

    const geciciTeminat = await withTenant(tenantId, async (tx) => {
      const geciciTeminat = await tx.ihaleGeciciTeminat.create({
        data: {
          id: teminatId,
          ihaleId,
          tutar: Number(tutar),
          banka: banka || null,
          bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null,
          mektupNo: mektupNo || null,
        },
      })

      if (banka) {
        const dbBanka = await tx.banka.findFirst({
          where: { ad: banka, tenantId },
        })
        if (dbBanka) {
          await tx.banka.update({
            where: { id: dbBanka.id },
            data: { kullanilanLimit: { increment: Number(tutar) } },
          })
        }
      }

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "ADD_GECICI_TEMINAT",
        id: geciciTeminat.id,
        tutar: geciciTeminat.tutar,
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      return geciciTeminat
    })

    return NextResponse.json(geciciTeminat, { status: 201 })
  } catch (error) {
    console.error("Geçici teminat oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Geçici teminat oluşturulurken bir hata oluştu" },
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
    const teminatId = searchParams.get('id')

    if (!teminatId) {
      return NextResponse.json({ error: "Teminat ID zorunludur" }, { status: 400 })
    }

    const result = await withTenant(tenantId, async (tx) => {
      const teminat = await tx.ihaleGeciciTeminat.findFirst({
        where: {
          id: teminatId,
          ihaleId,
          ihale: {
            tenantId,
          },
        },
      })

      if (!teminat) return null

      if (teminat.banka) {
        const dbBanka = await tx.banka.findFirst({
          where: { ad: teminat.banka, tenantId },
        })
        if (dbBanka) {
          await tx.banka.update({
            where: { id: dbBanka.id },
            data: { kullanilanLimit: { decrement: teminat.tutar } },
          })
        }
      }

      await tx.ihaleGeciciTeminat.delete({ where: { id: teminatId } })

      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "DELETE_GECICI_TEMINAT",
        id: teminatId,
        tutar: teminat.tutar,
      })

      return true
    })

    if (!result) return NextResponse.json({ error: "Teminat bulunamadı" }, { status: 404 })

    return NextResponse.json({ message: "Geçici teminat başarıyla silindi" })
  } catch (error) {
    console.error("Geçici teminat silinirken hata:", error)
    return NextResponse.json(
      { error: "Geçici teminat silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
