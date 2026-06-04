import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables before any other imports that might initialize database pools
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true })

import { prismaClient } from '../src/lib/prisma-client'
import { getStorageAdapter, resolvePathForLegacy } from '../src/lib/storage-adapter'
import { iknIsKlasorAdi } from '../src/lib/slug'

const MONTH_NAMES = [
  "Ocak",
  "Subat",
  "Mart",
  "Nisan",
  "Mayis",
  "Haziran",
  "Temmuz",
  "Agustos",
  "Eylul",
  "Ekim",
  "Kasim",
  "Aralik",
] as const

function monthFolder(ay: number) {
  const idx = ay - 1
  const name = MONTH_NAMES[idx] || "Ay"
  return `${String(ay).padStart(2, "0")}_${name}`
}

async function migrate() {
  console.log('[Migration] Starting archive path standardization migration...')
  
  // 1. Initialize storage adapter
  const storage = await getStorageAdapter()
  
  // 2. Fetch all IhaleBelge
  const ihaleBelgeler = await prismaClient.ihaleBelge.findMany()
  console.log(`[Migration] Found ${ihaleBelgeler.length} IhaleBelge records to process.`)
  
  let ihaleMigrated = 0
  for (const b of ihaleBelgeler) {
    const resolved = await resolvePathForLegacy(b.dosyaYolu)
    if (resolved !== b.dosyaYolu) {
      try {
        if (await storage.exists(b.dosyaYolu)) {
          console.log(`[Migration] Moving IhaleBelge file from ${b.dosyaYolu} to ${resolved}`)
          const buffer = await storage.download(b.dosyaYolu)
          await storage.upload(buffer, resolved)
          await storage.delete(b.dosyaYolu)
        }
        
        await prismaClient.ihaleBelge.update({
          where: { id: b.id },
          data: { dosyaYolu: resolved }
        })
        ihaleMigrated++
      } catch (err: any) {
        console.error(`[Migration] Failed to migrate IhaleBelge ${b.id}:`, err.message)
      }
    }
  }
  console.log(`[Migration] Migrated ${ihaleMigrated} IhaleBelge records.`)
  
  // 3. Fetch all SozlesmeBelge
  const sozlesmeBelgeler = await prismaClient.sozlesmeBelge.findMany()
  console.log(`[Migration] Found ${sozlesmeBelgeler.length} SozlesmeBelge records to process.`)
  
  let sozlesmeMigrated = 0
  for (const b of sozlesmeBelgeler) {
    const resolved = await resolvePathForLegacy(b.dosyaYolu)
    if (resolved !== b.dosyaYolu) {
      try {
        if (await storage.exists(b.dosyaYolu)) {
          console.log(`[Migration] Moving SozlesmeBelge file from ${b.dosyaYolu} to ${resolved}`)
          const buffer = await storage.download(b.dosyaYolu)
          await storage.upload(buffer, resolved)
          await storage.delete(b.dosyaYolu)
        }
        
        await prismaClient.sozlesmeBelge.update({
          where: { id: b.id },
          data: { dosyaYolu: resolved }
        })
        sozlesmeMigrated++
      } catch (err: any) {
        console.error(`[Migration] Failed to migrate SozlesmeBelge ${b.id}:`, err.message)
      }
    }
  }
  console.log(`[Migration] Migrated ${sozlesmeMigrated} SozlesmeBelge records.`)
  
  // 4. Fetch all Hakedis records with their relations to find legacy folders and files
  const hakedisler = await prismaClient.hakedis.findMany({
    include: {
      ihale: {
        include: {
          kurum: true
        }
      }
    }
  })
  console.log(`[Migration] Found ${hakedisler.length} Hakedis records to scan for files.`)
  
  let hakedisFilesMigrated = 0
  for (const h of hakedisler) {
    const cleanKurum = h.ihale.kurum.ad.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').substring(0, 20)
    const cleanIkn = h.ihale.ihaleNo.replace(/[^a-zA-Z0-9]/g, '_')
    
    // Construct legacy folder candidates
    const candidates = []
    
    // Candidate A: iknIsKlasorAdi
    const folderA = iknIsKlasorAdi(h.ihale.ihaleNo, h.ihale.ad)
    candidates.push(`04_Hakedis/${h.yil}/${folderA}/${monthFolder(h.ay)}`)
    
    // Candidate B: Old cleaning method
    const cleanedName = h.ihale.ad
      .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s-_]/g, '')
      .trim()
      .slice(0, 33)
      .replace(/\s+/g, '_')
    const folderB = `${h.ihale.ihaleNo.replace(/[^a-zA-Z0-9]/g, '_')}_${cleanedName}`
    candidates.push(`04_Hakedis/${h.yil}/${folderB}/${monthFolder(h.ay)}`)
    
    // Unique candidates list
    const uniqueCandidates = Array.from(new Set(candidates))
    
    for (const legacyFolder of uniqueCandidates) {
      try {
        if (await storage.exists(legacyFolder)) {
          console.log(`[Migration] Scanning legacy hakedis folder: ${legacyFolder}`)
          const listed = await storage.list(legacyFolder)
          
          for (const item of listed) {
            const fileName = path.basename(item)
            if (fileName === '.keep') continue // Skip placeholder files
            
            const oldFilePath = `${legacyFolder}/${fileName}`
            const newFilePath = `Ihaleler/${h.yil}_${cleanIkn}_${cleanKurum}/05_Hakedişler/${monthFolder(h.ay)}/${fileName}`
            
            // Avoid migration if it resolves to the same path (though here it shouldn't)
            if (oldFilePath !== newFilePath) {
              console.log(`[Migration] Moving hakedis file from ${oldFilePath} to ${newFilePath}`)
              if (await storage.exists(oldFilePath)) {
                const buffer = await storage.download(oldFilePath)
                await storage.upload(buffer, newFilePath)
                await storage.delete(oldFilePath)
                hakedisFilesMigrated++
              }
            }
          }
        }
      } catch (err: any) {
        console.error(`[Migration] Failed to scan or migrate hakedis folder ${legacyFolder}:`, err.message)
      }
    }
  }
  console.log(`[Migration] Migrated ${hakedisFilesMigrated} Hakedis files.`)
  console.log('[Migration] Migration complete!')
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Migration] Migration failed:', err)
    process.exit(1)
  })
