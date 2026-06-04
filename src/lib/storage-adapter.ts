import * as path from 'path'
import * as fs from 'fs/promises'
import axios from 'axios'
import { prismaClient } from './prisma-client'

export async function resolvePathForLegacy(filePath: string): Promise<string> {
  const normalizedPath = filePath.replace(/\\/g, '/')
  
  // Matches "02_Ihale/2026/2026_12345_is_adi/file.pdf"
  // or "03_Sozlesme/2026/IHALE/2026_12345_is_adi/file.pdf"
  // or "04_Hakedis/2026/2026_12345_is_adi/01_Ocak/file.pdf"
  const match = normalizedPath.match(/^(02_Ihale|03_Sozlesme|04_Hakedis)\/(\d{4})\/(?:DT|IHALE\/)?([^\/]+)\/(.*)$/)
  if (!match) return filePath
  
  const type = match[1]
  const year = match[2]
  const folderName = match[3]
  const rest = match[4]
  
  try {
    const ihaleler = await prismaClient.ihale.findMany({
      include: { kurum: true }
    })
    
    const ihale = ihaleler.find(i => {
      const cleanNo = i.ihaleNo.replace(/[^a-zA-Z0-9]/g, '_')
      return folderName.startsWith(cleanNo) || folderName.includes(cleanNo) || folderName.toLowerCase().includes(i.id.toLowerCase())
    })
    
    if (ihale) {
      const cleanKurum = ihale.kurum.ad.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').substring(0, 20)
      const cleanIkn = ihale.ihaleNo.replace(/[^a-zA-Z0-9]/g, '_')
      const targetFolder = `Ihaleler/${year}_${cleanIkn}_${cleanKurum}`
      
      if (type === '02_Ihale') {
        return `${targetFolder}/02_Teklif_ve_Yeterlik_Belgeleri/${rest}`
      } else if (type === '03_Sozlesme') {
        return `${targetFolder}/03_Sözleşme_ve_Teminatlar/${rest}`
      } else if (type === '04_Hakedis') {
        return `${targetFolder}/05_Hakedişler/${rest}`
      }
    }
  } catch (err) {
    console.error('[StorageAdapter] Failed to resolve legacy path:', err)
  }
  
  return filePath
}

export interface StorageAdapter {
  upload(file: File | Buffer, filePath: string): Promise<string>
  download(filePath: string): Promise<Buffer>
  delete(filePath: string): Promise<void>
  exists(filePath: string): Promise<boolean>
  list(filePath: string): Promise<string[]>
}

export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string

  constructor(basePath: string = './uploads') {
    this.basePath = basePath
  }

  async ensureFolder(folderPath: string): Promise<void> {
    const cleanPath = folderPath.replace(/\\/g, '/').replace(/^\/+/, '')
    const fullPath = path.join(this.basePath, cleanPath)
    await fs.mkdir(fullPath, { recursive: true })
  }

  async upload(file: File | Buffer, filePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath)
    const dir = path.dirname(fullPath)
    
    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true })
    
    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(fullPath, buffer)
    } else {
      await fs.writeFile(fullPath, file)
    }
    
    return filePath
  }

  async download(filePath: string): Promise<Buffer> {
    let targetPath = filePath
    const localExists = await this.existsDirect(filePath)
    if (!localExists) {
      const resolved = await resolvePathForLegacy(filePath)
      if (resolved !== filePath && (await this.existsDirect(resolved))) {
        targetPath = resolved
      }
    }
    const fullPath = path.join(this.basePath, targetPath)
    return await fs.readFile(fullPath)
  }

  async delete(filePath: string): Promise<void> {
    let targetPath = filePath
    const localExists = await this.existsDirect(filePath)
    if (!localExists) {
      const resolved = await resolvePathForLegacy(filePath)
      if (resolved !== filePath && (await this.existsDirect(resolved))) {
        targetPath = resolved
      }
    }
    const fullPath = path.join(this.basePath, targetPath)
    try {
      await fs.unlink(fullPath)
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }
  }

  private async existsDirect(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath)
    try {
      await fs.access(fullPath)
      return true
    } catch {
      return false
    }
  }

  async exists(filePath: string): Promise<boolean> {
    if (await this.existsDirect(filePath)) return true
    const resolved = await resolvePathForLegacy(filePath)
    if (resolved !== filePath) {
      return await this.existsDirect(resolved)
    }
    return false
  }

  async list(filePath: string): Promise<string[]> {
    const fullPath = path.join(this.basePath, filePath)
    try {
      const files = await fs.readdir(fullPath)
      return files
    } catch (e: any) {
      if (e.code === 'ENOENT') return []
      throw e
    }
  }
}

export class YandexDiskAdapter implements StorageAdapter {
  private accessToken: string
  private baseUrl = 'https://cloud-api.yandex.net/v1/disk/resources'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async ensureFolder(folderPath: string): Promise<void> {
    const clean = folderPath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/g, '')
    if (!clean) return
    await this.ensurePath(`${clean}/.keep`)
  }

  private async ensurePath(fullPath: string): Promise<void> {
    const dirPath = path.dirname(fullPath).replace(/\\/g, '/');
    if (dirPath === '.' || dirPath === '') return;

    const parts = dirPath.split('/').filter(Boolean);
    let currentPath = "";
    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      try {
        await axios.put(
          `${this.baseUrl}?path=${encodeURIComponent(currentPath)}`,
          null,
          {
            headers: { Authorization: `OAuth ${this.accessToken}` },
            validateStatus: (s) => s === 201 || s === 409
          }
        );
      } catch (e: any) {
        if (e?.response?.status !== 409) {
          console.error(`[YandexDisk] Folder creation failed for ${currentPath}:`, e.message);
        }
      }
    }
  }

  async upload(file: File | Buffer, filePath: string): Promise<string> {
    const cleanPath = filePath.replace(/\\/g, '/');
    await this.ensurePath(cleanPath);

    let buffer: Buffer;
    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      buffer = file;
    }

    // 1. Get upload url
    const urlResponse = await axios.get(
      `${this.baseUrl}/upload?path=${encodeURIComponent(cleanPath)}&overwrite=true`,
      { headers: { Authorization: `OAuth ${this.accessToken}` } }
    );
    const href = urlResponse.data.href;

    // 2. Put file to href
    await axios.put(href, buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length,
      },
      maxRedirects: 5,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000,
    });

    return cleanPath;
  }

  async download(filePath: string): Promise<Buffer> {
    let cleanPath = filePath.replace(/\\/g, '/');
    const localExists = await this.existsDirect(cleanPath)
    if (!localExists) {
      const resolved = await resolvePathForLegacy(filePath)
      if (resolved !== filePath && (await this.existsDirect(resolved.replace(/\\/g, '/')))) {
        cleanPath = resolved.replace(/\\/g, '/');
      }
    }
    // 1. Get download url
    const urlResponse = await axios.get(
      `${this.baseUrl}/download?path=${encodeURIComponent(cleanPath)}`,
      { headers: { Authorization: `OAuth ${this.accessToken}` } }
    );
    const href = urlResponse.data.href;

    // 2. Download from href
    const downloadResponse = await axios.get(href, {
      responseType: 'arraybuffer'
    });

    return Buffer.from(downloadResponse.data);
  }

  async delete(filePath: string): Promise<void> {
    let cleanPath = filePath.replace(/\\/g, '/');
    const localExists = await this.existsDirect(cleanPath)
    if (!localExists) {
      const resolved = await resolvePathForLegacy(filePath)
      if (resolved !== filePath && (await this.existsDirect(resolved.replace(/\\/g, '/')))) {
        cleanPath = resolved.replace(/\\/g, '/');
      }
    }
    await axios.delete(`${this.baseUrl}?path=${encodeURIComponent(cleanPath)}&permanently=true`, {
      headers: {
        'Authorization': `OAuth ${this.accessToken}`,
      },
      validateStatus: (s) => s === 204 || s === 404
    });
  }

  private async existsDirect(filePath: string): Promise<boolean> {
    const cleanPath = filePath.replace(/\\/g, '/');
    try {
      await axios.get(`${this.baseUrl}?path=${encodeURIComponent(cleanPath)}&fields=type`, {
        headers: {
          'Authorization': `OAuth ${this.accessToken}`,
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    if (await this.existsDirect(filePath)) return true;
    const resolved = await resolvePathForLegacy(filePath);
    if (resolved !== filePath) {
      return await this.existsDirect(resolved);
    }
    return false;
  }

  async list(filePath: string): Promise<string[]> {
    const cleanPath = filePath.replace(/\\/g, '/');
    const response = await axios.get(`${this.baseUrl}?path=${encodeURIComponent(cleanPath)}&limit=1000`, {
      headers: {
        'Authorization': `OAuth ${this.accessToken}`,
      },
    });
    
    return response.data._embedded?.items?.map((item: any) => item.path) || [];
  }
}

export async function getStorageAdapter(tenantId?: string): Promise<StorageAdapter> {
  const adapterType = process.env.STORAGE_ADAPTER || 'local'
  
  if (adapterType === 'yandex') {
    let token = process.env.YANDEX_DISK_TOKEN || process.env.YANDEX_DISK_ACCESS_TOKEN;
    
    if (tenantId) {
      const tenant = await prismaClient.tenant.findUnique({ where: { id: tenantId } });
      if (tenant?.yandexToken) {
        token = tenant.yandexToken;
      }
    }
    
    if (!token) {
      throw new Error('Yandex Disk Token not configured')
    }
    
    const cleanToken = token.trim().replace(/^['"]|['"]$/g, '');
    return new YandexDiskAdapter(cleanToken)
  }
  
  return new LocalStorageAdapter()
}

// For backward compatibility
let globalStorage: StorageAdapter = new LocalStorageAdapter();
const adapterType = typeof process !== 'undefined' ? (process.env.STORAGE_ADAPTER || 'local') : 'local';
if (adapterType === 'yandex') {
  const token = (process.env.YANDEX_DISK_TOKEN || process.env.YANDEX_DISK_ACCESS_TOKEN || '').trim().replace(/^['"]|['"]$/g, '');
  if (token) {
    globalStorage = new YandexDiskAdapter(token);
  }
}
export const storage = globalStorage;
