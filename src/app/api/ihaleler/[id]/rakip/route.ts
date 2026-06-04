import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { Prisma } from "@prisma/client"
import { prismaClient, withTenant } from "@/lib/prisma-client"
import { hesaplaSinirDeger } from "@/lib/sinir-deger"
import { createAuditLog } from "@/lib/audit-log"

async function updateIhaleBidsAndSinirDeger(tx: Prisma.TransactionClient, ihaleId: string, tenantId: string) {
  const ihale = await tx.ihale.findFirst({
    where: { id: ihaleId, tenantId },
    include: {
      rakipAnalizleri: true
    }
  })
  
  if (!ihale) return

  const ymTutar = ihale.ymTutar
  const rKatsayisi = ihale.rKatsayisi
  
  // Get all bids
  const competitorBids = ihale.rakipAnalizleri.map(r => r.teklifTutar)
  
  // Include our bid if configured on the ihale but not already in competitor list
  const finalTeklifimiz = ihale.teklifimiz
  const allBids = [...competitorBids]
  if (finalTeklifimiz && !ihale.rakipAnalizleri.some(r => r.bizimTeklifMi)) {
    allBids.push(finalTeklifimiz)
  }
  
  // Recalculate border value
  let newSinirDeger = null
  if (ymTutar && rKatsayisi) {
    const calc = hesaplaSinirDeger(ymTutar, rKatsayisi, allBids)
    newSinirDeger = calc.sinirDeger
  }
  
  // Sort and assign ranks to rakipAnalizleri
  const combinedForSorting = ihale.rakipAnalizleri.map(r => ({
    id: r.id,
    teklifTutar: r.teklifTutar,
    bizimTeklifMi: r.bizimTeklifMi
  }))
  
  if (finalTeklifimiz && !ihale.rakipAnalizleri.some(r => r.bizimTeklifMi)) {
    combinedForSorting.push({
      id: 'BİZİM_TEKLİF_TEMP',
      teklifTutar: finalTeklifimiz,
      bizimTeklifMi: true
    })
  }
  
  // Sort by price ascending
  combinedForSorting.sort((a, b) => a.teklifTutar - b.teklifTutar)
  
  // Save ranks back to database
  for (const item of combinedForSorting) {
    if (item.id === 'BİZİM_TEKLİF_TEMP') continue
    const rank = combinedForSorting.findIndex(x => x.id === item.id) + 1
    await tx.ihaleRakip.update({
      where: { id: item.id },
      data: { siralamasi: rank }
    })
  }
  
  // Update ihale's sinir deger
  await tx.ihale.update({
    where: { id: ihaleId },
    data: { sinirDeger: newSinirDeger }
  })
}

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

    const body = await request.json()
    const { rakipFirmaId, teklifTutar, bizimTeklifMi } = body

    if (!rakipFirmaId) {
      return NextResponse.json({ error: "Rakip firma seçimi zorunludur" }, { status: 400 })
    }
    if (!teklifTutar || Number(teklifTutar) <= 0) {
      return NextResponse.json({ error: "Geçersiz teklif tutarı" }, { status: 400 })
    }

    const rakipAnalizId =
      (globalThis as any).crypto?.randomUUID?.() ??
      `rakip_bid_${Date.now()}_${Math.random().toString(16).slice(2)}`

    const result = await withTenant(tenantId, async (tx) => {
      const ihale = await tx.ihale.findFirst({ where: { id: ihaleId, tenantId } })
      if (!ihale) return null

      const firma = await tx.rakipFirma.findFirst({ where: { id: rakipFirmaId, tenantId } })
      if (!firma) return null

      const rakipTeklif = await tx.ihaleRakip.create({
        data: {
          id: rakipAnalizId,
          ihaleId,
          rakipFirmaId,
          teklifTutar: Number(teklifTutar),
          bizimTeklifMi: !!bizimTeklifMi,
        },
        include: {
          rakipFirma: true,
        },
      })

      if (ihale.durum === "TASLAK") {
        await tx.ihale.update({ where: { id: ihaleId }, data: { durum: "DEVAM_EDİYOR" } })
      }

      await updateIhaleBidsAndSinirDeger(tx, ihaleId, tenantId)
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "ADD_RAKIP_BID",
        id: rakipTeklif.id,
        firma: firma.ad,
        tutar: rakipTeklif.teklifTutar,
      })

      return rakipTeklif
    })

    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const rakipTeklif = result

    return NextResponse.json(rakipTeklif, { status: 201 })
  } catch (error) {
    console.error("Rakip teklif ekleme hatası:", error)
    return NextResponse.json(
      { error: "Rakip teklif ekleme hatası oluştu" },
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
    const rakipBidId = searchParams.get('id')

    if (!rakipBidId) {
      return NextResponse.json({ error: "Teklif ID zorunludur" }, { status: 400 })
    }

    const deleted = await withTenant(tenantId, async (tx) => {
      const rakipBid = await tx.ihaleRakip.findFirst({
        where: {
          id: rakipBidId,
          ihaleId,
          ihale: {
            tenantId,
          },
        },
        include: {
          rakipFirma: true,
        },
      })

      if (!rakipBid) return null

      await tx.ihaleRakip.delete({ where: { id: rakipBidId } })
      await updateIhaleBidsAndSinirDeger(tx, ihaleId, tenantId)
      await createAuditLog(tx, tenantId, "IHALE", ihaleId, "UPDATE", userId, {
        action: "DELETE_RAKIP_BID",
        id: rakipBidId,
        firma: rakipBid.rakipFirma.ad,
      })

      return true
    })

    if (!deleted) return NextResponse.json({ error: "Teklif bulunamadı" }, { status: 404 })

    return NextResponse.json({ message: "Teklif başarıyla silindi" })
  } catch (error) {
    console.error("Teklif silinirken hata:", error)
    return NextResponse.json(
      { error: "Teklif silinirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
