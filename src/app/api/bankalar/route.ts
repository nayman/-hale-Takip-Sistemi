import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"

const bankaSchema = z.object({
  ad: z.string().min(1, "Banka adı zorunludur"),
  sube: z.string().optional(),
  toplamLimit: z.coerce.number().min(0, "Limit 0'dan küçük olamaz"),
  kullanilanLimit: z.coerce.number().min(0).optional(),
  komisyonOrani: z.coerce.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const bankalar = await withTenant(tenantId, async (tx) =>
      tx.banka.findMany({
        where: { tenantId },
        orderBy: { ad: "asc" },
      })
    )

    return NextResponse.json(bankalar)
  } catch (error) {
    console.error("GET bankalar hatasi:", error)
    return NextResponse.json({ error: "Bankalar alınırken bir hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const body = await request.json()
    const validatedData = bankaSchema.parse(body)

    const banka = await withTenant(tenantId, async (tx) =>
      tx.banka.create({
        data: {
          ...validatedData,
          tenantId,
        },
      })
    )

    return NextResponse.json(banka, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Banka oluşturulurken bir hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: "Banka ID zorunludur" }, { status: 400 })

    const validatedData = bankaSchema.partial().parse(updateData)

    const existing = await withTenant(tenantId, async (tx) =>
      tx.banka.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const banka = await withTenant(tenantId, async (tx) =>
      tx.banka.update({
        where: { id },
        data: validatedData,
      })
    )

    return NextResponse.json(banka)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    return NextResponse.json({ error: "Banka güncellenirken bir hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: "Banka ID zorunludur" }, { status: 400 })

    const existing = await withTenant(tenantId, async (tx) =>
      tx.banka.findFirst({ where: { id, tenantId } })
    )
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await withTenant(tenantId, async (tx) => tx.banka.delete({ where: { id } }))

    return NextResponse.json({ message: "Banka başarıyla silindi" })
  } catch (error) {
    return NextResponse.json({ error: "Banka silinirken bir hata oluştu" }, { status: 500 })
  }
}
