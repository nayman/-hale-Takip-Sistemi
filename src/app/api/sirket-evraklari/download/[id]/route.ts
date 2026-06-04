import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { storage } from "@/lib/storage-adapter"
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

    // Get document from database
    const document = await withTenant(tenantId, async (tx) =>
      tx.sirketEvrak.findFirst({
        where: {
          id: id,
          tenantId,
        },
      })
    )

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check permissions based on user role
    const userRole = (session.user as any).rol
    if (userRole !== 'TENANT_ADMIN' && userRole !== 'OPERASYON') {
      // Regular users can only download documents they uploaded
      if (document.yukleyenUserId !== session.user.id) {
        return NextResponse.json({ error: "Permission denied" }, { status: 403 })
      }
    }

    // Get file from storage
    const fileBuffer = await storage.download(document.dosyaYolu)

    if (!fileBuffer) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    // Create audit log for download
    await withTenant(tenantId, async (tx) =>
      createAuditLog(
        tx,
        tenantId,
        "SIRKET_EVRAK",
        document.id,
        "UPDATE",
        session.user.id as string,
        {
          dosyaAdi: document.dosyaAdi,
          dosyaBoyutu: document.dosyaBoyutu,
          action: "DOWNLOAD",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        }
      )
    )

    // Return file for download
    const contentType = document.dosyaTipi || 'application/octet-stream'
    
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${document.dosyaAdi}"`,
        'Content-Length': document.dosyaBoyutu.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Document download error:", error)
    return NextResponse.json(
      { error: "Document download failed" },
      { status: 500 }
    )
  }
}
