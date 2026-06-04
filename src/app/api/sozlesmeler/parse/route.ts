import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"

import { parseSozlesmeText } from "@/lib/sozlesme-parse"

const parseSchema = z.object({
  text: z.string().min(10)
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { text } = parseSchema.parse(body)

    const result = parseSozlesmeText(text)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz metin" }, { status: 400 })
    }
    console.error("Metin çözümleme hatası:", error)
    return NextResponse.json({ error: "Çözümleme başarısız oldu" }, { status: 500 })
  }
}
