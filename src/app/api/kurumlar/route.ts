import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = session.user.tenantId

    if (id) {
      const kurum = await withTenant(tenantId, async (tx) =>
        tx.kurum.findFirst({
          where: { id, tenantId },
          include: {
            hafizaNotlari: {
              orderBy: { createdAt: "desc" },
            },
            kisiler: {
              orderBy: { createdAt: "desc" },
            },
            aramaLoglari: {
              orderBy: { createdAt: "desc" },
            },
          },
        })
      )
      if (!kurum) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json(kurum)
    }

    const kurumlar = await withTenant(tenantId, async (tx) =>
      tx.kurum.findMany({
        where: { tenantId },
        orderBy: { ad: "asc" },
      })
    )

    return NextResponse.json(kurumlar)
  } catch (error) {
    console.error("GET kurumlar hatası:", error)
    return NextResponse.json({ error: "Veri getirilirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const body = await request.json()
    const { ad, unvan, vergiNo, vergiDairesi, il, ilce, adres, telefon, email } = body

    const adTrimmed = typeof ad === "string" ? ad.trim() : ""
    if (!adTrimmed) return NextResponse.json({ error: "Kurum adı zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const yeniKurum = await withTenant(tenantId, async (tx) => {
      const tenantExists = await tx.tenant.findUnique({ where: { id: tenantId }, select: { id: true } })
      if (!tenantExists) {
        throw Object.assign(new Error("TENANT_NOT_FOUND"), { code: "TENANT_NOT_FOUND" })
      }

      return tx.kurum.create({
        data: {
          ad: adTrimmed,
          unvan,
          vergiNo,
          vergiDairesi,
          il,
          ilce,
          adres,
          telefon,
          email,
          tenantId,
        },
      })
    })

    return NextResponse.json(yeniKurum, { status: 201 })
  } catch (error) {
    console.error("POST kurum hatası:", error)
    if ((error as any)?.code === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        {
          code: "TENANT_NOT_FOUND",
          error:
            "Tenant bulunamadı. Büyük ihtimalle veritabanı reset/migration sonrası oturum eski tenantId ile kaldı. Çıkış yapıp tekrar giriş yapın.",
        },
        { status: 401 }
      )
    }
    if ((error as any)?.code === "P2003") {
      return NextResponse.json(
        { code: "TENANT_NOT_FOUND", error: "Tenant kaydı bulunamadığı için kurum oluşturulamadı. Çıkış yapıp tekrar giriş yapın." },
        { status: 401 }
      )
    }
    return NextResponse.json({ error: "Kurum oluşturulurken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const body = await request.json()
    const { ad, unvan, vergiNo, vergiDairesi, il, ilce, adres, telefon, email } = body

    const tenantId = session.user.tenantId
    const result = await withTenant(tenantId, async (tx) => {
      const existing = await tx.kurum.findFirst({ where: { id, tenantId } })
      if (!existing) return null
      return tx.kurum.update({
        where: { id },
        data: { ad, unvan, vergiNo, vergiDairesi, il, ilce, adres, telefon, email },
      })
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const kurum = result

    return NextResponse.json(kurum)
  } catch (error) {
    console.error("PUT kurum hatası:", error)
    return NextResponse.json({ error: "Kurum güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: "ID zorunludur" }, { status: 400 })

    const tenantId = session.user.tenantId
    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.kurum.findFirst({ where: { id, tenantId } })
      if (!existing) return null
      return tx.kurum.delete({ where: { id } })
    })

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ message: "Kurum başarıyla silindi" })
  } catch (error) {
    console.error("DELETE kurum hatası:", error)
    return NextResponse.json({ error: "Silinirken hata oluştu" }, { status: 500 })
  }
}
