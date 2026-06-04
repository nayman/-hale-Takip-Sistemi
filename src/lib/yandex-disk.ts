import axios from "axios"
import { prismaClient } from "./prisma-client"

const BASE_URL = "https://cloud-api.yandex.net/v1/disk/resources"

export class YandexDiskService {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  // Tenant veya fallback token'ı bulan factory metot
  static async getInstance(tenantId: string): Promise<YandexDiskService> {
    const tenant = await prismaClient.tenant.findUnique({ where: { id: tenantId } })
    const token = tenant?.yandexToken || process.env.YANDEX_DISK_TOKEN

    if (!token) {
      throw new Error("Yandex Disk Token bulunamadı. Lütfen ayarlardan token girin veya .env yapılandırmasını kontrol edin.")
    }

    return new YandexDiskService(token)
  }

  // Belirtilen yolda klasör oluşturur
  async createFolder(path: string): Promise<boolean> {
    try {
      const response = await axios.put(
        `${BASE_URL}?path=${encodeURIComponent(path)}`,
        null,
        { headers: { Authorization: `OAuth ${this.token}` }, validateStatus: (s) => s === 201 || s === 409 }
      )
      return true
    } catch (e: any) {
      // 409 zaten var demek, başarılı say
      if (e?.response?.status === 409) return true
      console.error("Yandex Disk klasör oluşturma hatası:", e?.response?.status, e?.message)
      return false
    }
  }

  // İçiçe klasörleri sırayla oluşturur
  async ensurePath(fullPath: string): Promise<boolean> {
    const parts = fullPath.split('/').filter(Boolean)
    let currentPath = ""
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      await this.createFolder(currentPath)
    }
    return true
  }

  // Dosya yükleme işlemi için upload URL'si alır ve dosyayı yükler
  async uploadFile(path: string, buffer: Buffer): Promise<string | null> {
    try {
      // 1. Upload link al
      const urlResponse = await axios.get(
        `${BASE_URL}/upload?path=${encodeURIComponent(path)}&overwrite=true`,
        { headers: { Authorization: `OAuth ${this.token}` } }
      )
      const href: string = urlResponse.data.href
      console.log(`[YandexDisk] Upload URL alındı: ${href.substring(0, 80)}...`)
      console.log(`[YandexDisk] Buffer boyutu: ${buffer.length} bytes`)

      // 2. Dosyayı axios ile yükle (redirect'i otomatik takip eder)
      const uploadResponse = await axios.put(href, buffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": buffer.length,
        },
        maxRedirects: 5,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
        validateStatus: (s) => s < 500,
      })

      console.log(`[YandexDisk] Upload sonucu: ${uploadResponse.status}`)
      if (uploadResponse.status === 201 || uploadResponse.status === 200) {
        return path
      }

      console.error("[YandexDisk] Upload başarısız, status:", uploadResponse.status, uploadResponse.data)
      return null
    } catch (e: any) {
      console.error("[YandexDisk] Upload hatası:", e?.response?.status, e?.message)
      return null
    }
  }
}
