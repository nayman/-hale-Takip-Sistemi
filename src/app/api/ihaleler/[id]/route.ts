import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { hesaplaSinirDeger } from "@/lib/sinir-deger"
import { createAuditLog } from "@/lib/audit-log"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const { id } = await params

    const ihale = await withTenant(tenantId, async (tx) =>
      tx.ihale.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          kurum: true,
          geciciTeminatlar: {
            orderBy: { createdAt: "desc" },
          },
          atamalar: {
            include: {
              kurumKisi: true,
            },
          },
          rakipAnalizleri: {
            include: {
              rakipFirma: true,
            },
            orderBy: { teklifTutar: "asc" },
          },
          notlar: {
            orderBy: { createdAt: "desc" },
          },
          itirazlar: true,
          sozlesme: true,
          yaklasikMaliyetler: true,
        },
      })
    )

    if (!ihale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(ihale)
  } catch (error) {
    console.error("İhale detay getirilirken hata:", error)
    return NextResponse.json(
      { error: "İhale detay getirilirken bir hata oluştu" },
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
    const tenantId = session.user.tenantId
    let userId = session.user.id as string
    if (session.user.email) {
      const dbUser = await prismaClient.user.findUnique({ where: { email: session.user.email } })
      if (dbUser) userId = dbUser.id
    }
    const { id } = await params

    const body = await request.json()

    const updatedIhale = await withTenant(tenantId, async (tx) => {
      const existingIhale = await tx.ihale.findFirst({
        where: { id, tenantId },
        include: { rakipAnalizleri: true },
      })

      if (!existingIhale) return null

      const {
        ad,
        ihaleNo,
        aciklama,
        tur,
        usul,
        butce,
        sozlesmeBedeli,
        baslangicTarihi,
        bitisTarihi,
        teklifSonTarihi,
        durum,
        ymTutar,
        rKatsayisi,
        teklifimiz,
        sorumluUserId,
        selectedYmId,
      } = body

      const updateData: any = {}
      if (ad !== undefined) updateData.ad = ad
      if (ihaleNo !== undefined) updateData.ihaleNo = ihaleNo
      if (aciklama !== undefined) updateData.aciklama = aciklama
      if (tur !== undefined) updateData.tur = tur
      if (usul !== undefined) updateData.usul = usul
      if (butce !== undefined) updateData.butce = Number(butce)
      if (sozlesmeBedeli !== undefined) {
        updateData.sozlesmeBedeli = sozlesmeBedeli !== null ? Number(sozlesmeBedeli) : null
      }
      if (baslangicTarihi !== undefined) updateData.baslangicTarihi = baslangicTarihi ? new Date(baslangicTarihi) : null
      if (bitisTarihi !== undefined) updateData.bitisTarihi = bitisTarihi ? new Date(bitisTarihi) : null
      if (teklifSonTarihi !== undefined) updateData.teklifSonTarihi = new Date(teklifSonTarihi)
      if (durum !== undefined) updateData.durum = durum
      if (ymTutar !== undefined) updateData.ymTutar = ymTutar !== null ? Number(ymTutar) : null
      if (rKatsayisi !== undefined) updateData.rKatsayisi = rKatsayisi !== null ? Number(rKatsayisi) : null
      if (teklifimiz !== undefined) updateData.teklifimiz = teklifimiz !== null ? Number(teklifimiz) : null
      if (sorumluUserId !== undefined) updateData.sorumluUserId = sorumluUserId

      let selectedYmTutar: number | null | undefined = undefined
      if (selectedYmId !== undefined && selectedYmId) {
        const ym = await tx.yaklasikMaliyet.findFirst({ where: { id: selectedYmId, tenantId } })
        if (!ym) return null
        selectedYmTutar = ym.tutar
        updateData.ymTutar = ym.tutar
        await tx.yaklasikMaliyet.update({
          where: { id: selectedYmId },
          data: { ihaleId: id },
        })
      }

      const finalYm =
        selectedYmTutar !== undefined
          ? selectedYmTutar
          : ymTutar !== undefined
            ? (ymTutar !== null ? Number(ymTutar) : null)
            : existingIhale.ymTutar
      const finalR = rKatsayisi !== undefined ? (rKatsayisi !== null ? Number(rKatsayisi) : null) : existingIhale.rKatsayisi

      if (finalYm && finalR) {
        const competitorBids = existingIhale.rakipAnalizleri.map((r) => r.teklifTutar)
        const finalTeklifimiz =
          teklifimiz !== undefined ? (teklifimiz !== null ? Number(teklifimiz) : null) : existingIhale.teklifimiz
        const allBids = [...competitorBids]
        if (finalTeklifimiz && !existingIhale.rakipAnalizleri.some((r) => r.bizimTeklifMi)) {
          allBids.push(finalTeklifimiz)
        }

        const { sinirDeger } = hesaplaSinirDeger(finalYm, finalR, allBids)
        updateData.sinirDeger = sinirDeger
      } else {
        updateData.sinirDeger = null
      }

      const updatedIhale = await tx.ihale.update({
        where: { id },
        data: updateData,
      })

      await createAuditLog(tx, tenantId, "IHALE", id, "UPDATE", userId, { changes: updateData })
      return updatedIhale
    })

    if (!updatedIhale) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(updatedIhale)
  } catch (error) {
    console.error("İhale güncellenirken hata:", error)
    return NextResponse.json(
      { error: "İhale güncellenirken bir hata oluştu" },
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
    const { id } = await params

    const deleted = await withTenant(tenantId, async (tx) => {
      const existing = await tx.ihale.findFirst({ where: { id, tenantId } })
      if (!existing) return null

      await tx.ihale.delete({ where: { id } })
      await createAuditLog(tx, tenantId, "IHALE", id, "DELETE", userId, { ad: existing.ad, ihaleNo: existing.ihaleNo })
      return true
    })

    if (!deleted) {
      return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({ message: "İhale başarıyla silindi" })
  } catch (error) {
    console.error("İhale silinirken hata:", error)
    return NextResponse.json(
      { error: "İhale silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
