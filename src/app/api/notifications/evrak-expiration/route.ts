import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaClient, withTenant } from "@/lib/prisma-client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    // Check if user has permission to send notifications
    const userRole = (session.user as any).rol
    if (userRole !== 'TENANT_ADMIN' && userRole !== 'OPERASYON') {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Get documents expiring in the next 90 days
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 90)

    const expiringDocuments = await withTenant(tenantId, async (tx) =>
      tx.sirketEvrak.findMany({
        where: {
          tenantId,
          durum: "AKTIF",
          sonGecerlilikTarihi: {
            lte: expirationDate,
            not: null,
          },
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
        orderBy: {
          sonGecerlilikTarihi: "asc",
        },
      })
    )

    if (expiringDocuments.length === 0) {
      return NextResponse.json({
        message: "Yaklaşan son geçerlilik tarihi olan evrak bulunmamaktadır",
        sent: 0
      })
    }

    // Group documents by urgency
    const now = new Date()
    const urgent = expiringDocuments.filter(doc => {
      const daysUntil = Math.ceil((doc.sonGecerlilikTarihi!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 30
    })

    const warning = expiringDocuments.filter(doc => {
      const daysUntil = Math.ceil((doc.sonGecerlilikTarihi!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil > 30 && daysUntil <= 60
    })

    const info = expiringDocuments.filter(doc => {
      const daysUntil = Math.ceil((doc.sonGecerlilikTarihi!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil > 60
    })

    // Create notification message
    const notificationMessage = `
Şirket evrakları son geçerlilik tarihi uyarısı:

${urgent.length > 0 ? `
🚨 KRİTİK (30 günden az):
${urgent.map(doc => `• ${doc.ad} - ${doc.sonGecerlilikTarihi?.toLocaleDateString('tr-TR')}`).join('\n')}
` : ''}

${warning.length > 0 ? `
⚠️ YÜKSEK (60 günden az):
${warning.map(doc => `• ${doc.ad} - ${doc.sonGecerlilikTarihi?.toLocaleDateString('tr-TR')}`).join('\n')}
` : ''}

${info.length > 0 ? `
ℹ️ BİLGİLENDİRME (90 günden az):
${info.map(doc => `• ${doc.ad} - ${doc.sonGecerlilikTarihi?.toLocaleDateString('tr-TR')}`).join('\n')}
` : ''}

Toplam: ${expiringDocuments.length} evrak

Lütfen bu evrakların yenilenmesini sağlayın.
    `.trim()

    // Get tenant users to notify
    const tenantUsers = await prismaClient.user.findMany({
      where: {
        tenantId,
        rol: {
          in: ['TENANT_ADMIN', 'OPERASYON']
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    await withTenant(tenantId, async (tx) =>
      tx.notification.createMany({
        data: tenantUsers.map((user) => ({
          userId: user.id,
          title: "Evrak Son Geçerlilik Tarihi Uyarısı",
          message: notificationMessage,
          type: "EVRAK_EXPIRATION",
          data: {
            urgentCount: urgent.length,
            warningCount: warning.length,
            infoCount: info.length,
            totalCount: expiringDocuments.length,
          },
          tenantId,
          isRead: false,
          readAt: null,
        })),
      })
    )

    return NextResponse.json({
      message: `${expiringDocuments.length} evrak için son geçerlilik tarihi uyarısı gönderildi`,
      sent: tenantUsers.length,
      recipients: tenantUsers.length,
      summary: {
        urgent: urgent.length,
        warning: warning.length,
        info: info.length,
        total: expiringDocuments.length
      }
    })
  } catch (error) {
    console.error("Evrak expiration notification error:", error)
    return NextResponse.json(
      { error: "Bildirim gönderilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '90')

    // Get expiration statistics
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + days)

    const { expiringDocuments, expiredDocuments, totalDocuments } = await withTenant(tenantId, async (tx) => {
      const [expiringDocuments, expiredDocuments, totalDocuments] = await Promise.all([
        tx.sirketEvrak.count({
          where: {
            tenantId,
            durum: "AKTIF",
            sonGecerlilikTarihi: {
              lte: expirationDate,
              not: null,
            },
          },
        }),
        tx.sirketEvrak.count({
          where: {
            tenantId,
            durum: "AKTIF",
            sonGecerlilikTarihi: {
              lt: new Date(),
            },
          },
        }),
        tx.sirketEvrak.count({
          where: {
            tenantId,
          },
        }),
      ])

      return { expiringDocuments, expiredDocuments, totalDocuments }
    })

    return NextResponse.json({
      expiring: expiringDocuments,
      expired: expiredDocuments,
      total: totalDocuments,
      percentage: totalDocuments > 0 ? Math.round((expiringDocuments / totalDocuments) * 100) : 0,
      days
    })
  } catch (error) {
    console.error("Expiration statistics error:", error)
    return NextResponse.json(
      { error: "İstatistikler alınırken bir hata oluştu" },
      { status: 500 }
    )
  }
}
