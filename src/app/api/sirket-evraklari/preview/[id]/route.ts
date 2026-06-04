import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"
import { storage } from "@/lib/storage-adapter"

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

    // Get file from storage
    const fileBuffer = await storage.download(document.dosyaYolu)

    if (!fileBuffer) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    // Return appropriate content type
    const contentType = document.dosyaTipi || 'application/octet-stream'
    
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.dosyaAdi}"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Document preview error:", error)
    return NextResponse.json(
      { error: "Document preview failed" },
      { status: 500 }
    )
  }
}
