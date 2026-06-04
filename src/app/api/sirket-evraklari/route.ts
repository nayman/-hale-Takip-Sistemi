import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit-log"

const evrakSchema = z.object({
  ad: z.string().min(1, "Evrak adı zorunludur"),
  tip: z.enum(["KIMLIK", "VERGI", "SIGORTA", "RUHSAT", "SERTIFIKA", "SOZLESME", "DIGER"]),
  kategori: z.enum(["PERSONEL", "MALI", "HUKUKI", "TEKNIK", "IDARI"]),
  aciklama: z.string().optional(),
  sonGecerlilikTarihi: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const tip = searchParams.get('tip')
    const kategori = searchParams.get('kategori')
    const durum = searchParams.get('durum')
    const arama = searchParams.get('arama')

    const whereClause: any = {
      tenantId
    }

    if (tip) {
      whereClause.tip = tip
    }

    if (kategori) {
      whereClause.kategori = kategori
    }

    if (durum) {
      whereClause.durum = durum
    }

    if (arama) {
      whereClause.OR = [
        { ad: { contains: arama, mode: 'insensitive' } },
        { aciklama: { contains: arama, mode: 'insensitive' } },
        { dosyaAdi: { contains: arama, mode: 'insensitive' } }
      ]
    }

    const { evraklar, total } = await withTenant(tenantId, async (tx) => {
      const [evraklar, total] = await Promise.all([
        tx.sirketEvrak.findMany({
          where: whereClause,
          include: {
            yukleyenUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        tx.sirketEvrak.count({ where: whereClause }),
      ])

      return { evraklar, total }
    })

    return NextResponse.json({
      evraklar,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error("Şirket evrakları alınırken hata:", error)
    return NextResponse.json(
      { error: "Şirket evrakları alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const body = await request.json()
    const validatedData = evrakSchema.parse(body)

    const evrak = await withTenant(tenantId, async (tx) => {
      const evrak = await tx.sirketEvrak.create({
        data: {
          ...validatedData,
          tenantId,
          yukleyenUserId: session.user.id as string,
          dosyaYolu: "",
          dosyaAdi: "",
          dosyaBoyutu: 0,
          dosyaTipi: "",
          durum: "AKTIF",
        },
        include: {
          yukleyenUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      await createAuditLog(
        tx,
        tenantId,
        "SIRKET_EVRAK",
        evrak.id,
        "CREATE",
        session.user.id as string,
        { ad: evrak.ad, tip: evrak.tip }
      )

      return evrak
    })

    return NextResponse.json(evrak, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Şirket evrağı oluşturulurken hata:", error)
    return NextResponse.json(
      { error: "Şirket evrağı oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Evrak ID zorunludur" }, { status: 400 })
    }

    const validatedData = evrakSchema.partial().parse(updateData)

    const evrak = await withTenant(tenantId, async (tx) =>
      tx.sirketEvrak.update({
        where: {
          id: id,
          tenantId,
        },
        data: validatedData,
        include: {
          yukleyenUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    )

    return NextResponse.json(evrak)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Şirket evrağı güncellenirken hata:", error)
    return NextResponse.json(
      { error: "Şirket evrağı güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Evrak ID zorunludur" }, { status: 400 })
    }

    await withTenant(tenantId, async (tx) =>
      tx.sirketEvrak.delete({
        where: {
          id: id,
          tenantId,
        },
      })
    )

    return NextResponse.json({ message: "Evrak başarıyla silindi" })
  } catch (error) {
    console.error("Şirket evrağı silinirken hata:", error)
    return NextResponse.json(
      { error: "Şirket evrağı silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
