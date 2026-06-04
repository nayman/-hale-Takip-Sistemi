import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withTenant } from "@/lib/prisma-client"

function isPermissionDeniedForTable(err: unknown, tableName: string) {
  const e = err as any
  const message = typeof e?.message === "string" ? e.message : ""
  const code = e?.cause?.originalCode ?? e?.cause?.code ?? e?.code
  return code === "42501" && message.toLowerCase().includes(`permission denied for table ${tableName}`.toLowerCase())
}

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

    const sozlesme = await withTenant(tenantId, (tx) =>
      tx.sozlesme.findFirst({
        where: { id, tenantId },
        include: {
          ihale: true,
          kesinTeminatlar: {
            orderBy: { createdAt: "desc" },
            include: { banka: true },
          },
          belgeler: { orderBy: { createdAt: "desc" } },
          notlar: { orderBy: { createdAt: "desc" } },
        },
      })
    )

    if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(sozlesme)
  } catch (error) {
    if (isPermissionDeniedForTable(error, "sozlesme_notlari")) {
      try {
        const session = await auth()
        if (!session?.user?.tenantId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const tenantId = session.user.tenantId
        const { id } = await params

        const sozlesme = await withTenant(tenantId, (tx) =>
          tx.sozlesme.findFirst({
            where: { id, tenantId },
            include: {
              ihale: true,
              kesinTeminatlar: {
                orderBy: { createdAt: "desc" },
                include: { banka: true },
              },
              belgeler: { orderBy: { createdAt: "desc" } },
            },
          })
        )
        if (!sozlesme) return NextResponse.json({ error: "Not found" }, { status: 404 })
        return NextResponse.json({ ...sozlesme, notlar: [] })
      } catch (e2) {
        console.error("GET sözleşme detay fallback hatası:", e2)
      }
    }
    console.error("GET sözleşme detay hatası:", error)
    return NextResponse.json({ error: "Sözleşme alınırken hata oluştu" }, { status: 500 })
  }
}
