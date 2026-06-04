import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit-log"

const teminatSchema = z.object({
  sozlesmeId: z.string().min(1, "Sözleşme ID zorunludur"),
  tutar: z.coerce.number().min(0, "Tutar 0'dan büyük olmalıdır"),
  tip: z.enum(["NAKIT", "MEKTUP"]),
  bankaId: z.string().optional().nullable(),
  mektupNo: z.string().optional().nullable(),
  vadeTarihi: z.string().optional().nullable(),
})

const teminatDurumSchema = z.object({
  id: z.string().min(1, "ID zorunludur"),
  durum: z.enum(["AKTIF", "IADE_EDILDI", "NAKDE_CEVRILDI"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    
    const body = await request.json()
    const validatedData = teminatSchema.parse(body)
    
    const teminat = await withTenant(tenantId, async (tx) => {
      const sozlesme = await tx.sozlesme.findFirst({
        where: { id: validatedData.sozlesmeId, tenantId },
      })
      if (!sozlesme) return null

      if (validatedData.tip === "MEKTUP" && validatedData.bankaId) {
        const banka = await tx.banka.findFirst({
          where: { id: validatedData.bankaId, tenantId },
        })
        if (!banka) return null
      }

      const yeniTeminat = await tx.sozlesmeKesinTeminat.create({
        data: {
          sozlesmeId: validatedData.sozlesmeId,
          tutar: validatedData.tutar,
          tip: validatedData.tip,
          bankaId: validatedData.bankaId || null,
          mektupNo: validatedData.mektupNo || null,
          vadeTarihi: validatedData.vadeTarihi ? new Date(validatedData.vadeTarihi) : null,
          durum: "AKTIF",
        },
      })

      if (validatedData.tip === "MEKTUP" && validatedData.bankaId) {
        await tx.banka.update({
          where: { id: validatedData.bankaId },
          data: {
            kullanilanLimit: {
              increment: validatedData.tutar,
            },
          },
        })
      }

      return yeniTeminat
    })

    if (!teminat) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(teminat, { status: 201 })
  } catch (error) {
    console.error("POST teminatlar hatası:", error)
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Teminat oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const deleted = await withTenant(tenantId, async (tx) => {
      const teminat = await tx.sozlesmeKesinTeminat.findUnique({ where: { id } })
      if (!teminat) return false

      const sozlesme = await tx.sozlesme.findFirst({
        where: { id: teminat.sozlesmeId, tenantId },
      })
      if (!sozlesme) return false

      await tx.sozlesmeKesinTeminat.delete({ where: { id } })

      if (teminat.tip === "MEKTUP" && teminat.bankaId) {
        const banka = await tx.banka.findFirst({ where: { id: teminat.bankaId, tenantId } })
        if (!banka) return false

        await tx.banka.update({
          where: { id: teminat.bankaId },
          data: {
            kullanilanLimit: {
              decrement: teminat.tutar,
            },
          },
        })
      }

      return true
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Teminat başarıyla silindi" })
  } catch (error) {
    console.error("Teminat silme hatası:", error)
    return NextResponse.json({ error: "Silinirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.rol
    const isPrivileged = role === "SUPER_ADMIN" || role === "TENANT_ADMIN"
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const tenantId = session.user.tenantId
    const body = await request.json()
    const validated = teminatDurumSchema.parse(body)

    const updated = await withTenant(tenantId, async (tx) => {
      const teminat = await tx.sozlesmeKesinTeminat.findUnique({ where: { id: validated.id } })
      if (!teminat) return null

      const sozlesme = await tx.sozlesme.findFirst({
        where: { id: teminat.sozlesmeId, tenantId },
      })
      if (!sozlesme) return null

      if (teminat.durum === validated.durum) return teminat

      if (teminat.tip === "MEKTUP" && teminat.bankaId) {
        const shouldDecrement = teminat.durum === "AKTIF" && validated.durum !== "AKTIF"
        const shouldIncrement = teminat.durum !== "AKTIF" && validated.durum === "AKTIF"
        if (shouldDecrement) {
          await tx.banka.update({
            where: { id: teminat.bankaId },
            data: { kullanilanLimit: { decrement: teminat.tutar } },
          })
        } else if (shouldIncrement) {
          await tx.banka.update({
            where: { id: teminat.bankaId },
            data: { kullanilanLimit: { increment: teminat.tutar } },
          })
        }
      }

      const updated = await tx.sozlesmeKesinTeminat.update({
        where: { id: validated.id },
        data: { durum: validated.durum },
      })

      await createAuditLog(tx, tenantId, "SOZLESME", sozlesme.id, "UPDATE", session.user.id as string, {
        action: "UPDATE_TEMINAT_DURUM",
        teminatId: validated.id,
        durum: validated.durum,
      })

      return updated
    })

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT teminat durum hatası:", error)
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Teminat güncellenirken hata oluştu" }, { status: 500 })
  }
}
