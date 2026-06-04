import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withTenant } from "@/lib/prisma-client";
import { getStorageAdapter } from "@/lib/storage-adapter";
import { dosyaAdi, iknIsKlasorAdi } from "@/lib/slug";
import * as path from "path";

/**
 * Helper to compute the base folder for an ihale (same logic as dosya route).
 */
function getIhaleFolderPath(ihale: { ihaleNo: string; ad: string; teklifSonTarihi: Date }) {
  const yil = new Date(ihale.teklifSonTarihi).getFullYear();
  const folder = iknIsKlasorAdi(ihale.ihaleNo, ihale.ad);
  return `02_Ihale/${yil}/${folder}`;
}

function getIhaleFolderPathLegacy(ihale: { ihaleNo: string; ad: string; teklifSonTarihi: Date }) {
  const yil = new Date(ihale.teklifSonTarihi).getFullYear();
  const cleanedName = ihale.ad
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s-_]/g, "")
    .trim()
    .slice(0, 33)
    .replace(/\s+/g, "_");
  return `02_Ihale/${yil}/${ihale.ihaleNo}_${cleanedName}`;
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items));
}

/**
 * GET – list all files stored under the "10_Madde" sub‑folder for the current ihale.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tenantId = session.user.tenantId;
    const { id } = await params;

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }));
    if (!ihale) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 });

    const storage = await getStorageAdapter(tenantId);
    const baseFolders = uniqueStrings([getIhaleFolderPath(ihale), getIhaleFolderPathLegacy(ihale)]);
    const allNames: string[] = [];
    for (const baseFolder of baseFolders) {
      const folderPath = `${baseFolder}/10_Madde`;
      const exists = await storage.exists(folderPath);
      if (!exists) continue;
      const files = await storage.list(folderPath);
      allNames.push(...files.map((f) => path.basename(f)));
    }
    return NextResponse.json(uniqueStrings(allNames));
  } catch (error) {
    console.error("OnMadde list error:", error);
    return NextResponse.json({ error: "OnMadde dosyaları alınırken hata oluştu" }, { status: 500 });
  }
}

/**
 * POST – upload one or more files into the "10_Madde" folder.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tenantId = session.user.tenantId;
    const { id } = await params;

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }));
    if (!ihale) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 });

    const formData = await request.formData();
    const uploaded = formData.getAll("file") as File[];
    if (uploaded.length === 0) return NextResponse.json({ error: "Yüklenecek dosya bulunamadı" }, { status: 400 });

    const storage = await getStorageAdapter(tenantId);
    const baseFolder = getIhaleFolderPath(ihale);
    const folderPath = `${baseFolder}/10_Madde`;

    for (const file of uploaded) {
      const filePath = `${folderPath}/${dosyaAdi(file.name)}`;
      await storage.upload(file, filePath);
    }

    return NextResponse.json({ message: "Dosyalar başarıyla yüklendi" });
  } catch (error) {
    console.error("OnMadde upload error:", error);
    return NextResponse.json({ error: "Dosya yüklenirken hata oluştu" }, { status: 500 });
  }
}

/**
 * DELETE – remove a file from the "10_Madde" folder.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tenantId = session.user.tenantId;
    const { id } = await params;

    const ihale = await withTenant(tenantId, async (tx) => tx.ihale.findFirst({ where: { id, tenantId } }));
    if (!ihale) return NextResponse.json({ error: "İhale bulunamadı" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");
    if (!fileName) return NextResponse.json({ error: "Silinecek dosya adı belirtilmedi" }, { status: 400 });

    const cleanFileName = path.basename(fileName);
    const storage = await getStorageAdapter(tenantId);
    const baseFolders = uniqueStrings([getIhaleFolderPath(ihale), getIhaleFolderPathLegacy(ihale)]);
    let filePath: string | null = null;
    for (const baseFolder of baseFolders) {
      const candidate = `${baseFolder}/10_Madde/${cleanFileName}`;
      if (await storage.exists(candidate)) {
        filePath = candidate;
        break;
      }
    }
    if (!filePath) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });

    await storage.delete(filePath);
    return NextResponse.json({ message: "Dosya başarıyla silindi" });
  } catch (error) {
    console.error("OnMadde delete error:", error);
    return NextResponse.json({ error: "Dosya silinirken hata oluştu" }, { status: 500 });
  }
}
