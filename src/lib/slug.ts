/**
 * Turkish character to ASCII conversion utilities
 * and folder management functions
 */

// Turkish character mappings
const TURKISH_CHARS: Record<string, string> = {
  'ç': 'c',
  'ğ': 'g',
  'ı': 'i',
  'ö': 'o',
  'ş': 's',
  'ü': 'u',
  'Ç': 'C',
  'Ğ': 'G',
  'İ': 'I',
  'Ö': 'O',
  'Ş': 'S',
  'Ü': 'U',
}

// Special characters to be replaced
const SPECIAL_CHARS: Record<string, string> = {
  ' ': '-',
  '/': '-',
  '\\': '-',
  ':': '-',
  '*': '-',
  '?': '-',
  '"': '-',
  '<': '-',
  '>': '-',
  '|': '-',
  '.': '-',
  ',': '-',
  ';': '-',
  "'": '-',
  '!': '-',
  '@': '-',
  '#': '-',
  '$': '-',
  '%': '-',
  '^': '-',
  '&': '-',
  '(': '-',
  ')': '-',
  '[': '-',
  ']': '-',
  '{': '-',
  '}': '-',
  '+': '-',
  '=': '-',
  '_': '-',
}

/**
 * Converts Turkish characters to ASCII equivalents
 */
export function turkishToAscii(text: string): string {
  let result = text
  
  // Convert Turkish characters
  Object.entries(TURKISH_CHARS).forEach(([turkish, ascii]) => {
    result = result.replace(new RegExp(turkish, 'g'), ascii)
  })
  
  return result
}

/**
 * Creates a URL-friendly slug from text
 * Removes special characters and converts Turkish chars to ASCII
 */
export function slug(text: string, maxLength = 50): string {
  // Convert Turkish characters to ASCII
  let result = turkishToAscii(text)
  
  // Convert to lowercase
  result = result.toLowerCase()
  
  // Replace special characters with hyphens
  Object.entries(SPECIAL_CHARS).forEach(([special, replacement]) => {
    result = result.replace(new RegExp(escapeRegExp(special), 'g'), replacement)
  })
  
  // Remove multiple consecutive hyphens
  result = result.replace(/-+/g, '-')
  
  // Remove hyphens from start and end
  result = result.replace(/^-+|-+$/g, '')
  
  // Limit length
  if (result.length > maxLength) {
    result = result.substring(0, maxLength).replace(/-+$/, '') // Remove trailing hyphen if cut
  }
  
  return result || 'untitled'
}

/**
 * Creates a valid folder name from text
 * Limits to 33 characters and handles Turkish characters
 */
export function klasorAdi(text: string): string {
  // Convert Turkish characters to ASCII
  let result = turkishToAscii(text)
  
  // Replace special characters with underscores
  Object.entries(SPECIAL_CHARS).forEach(([special, replacement]) => {
    result = result.replace(new RegExp(escapeRegExp(special), 'g'), '_')
  })
  
  // Remove multiple consecutive underscores
  result = result.replace(/_+/g, '_')
  
  // Remove underscores from start and end
  result = result.replace(/^_+|_+$/g, '')
  
  // Limit to 33 characters
  if (result.length > 33) {
    result = result.substring(0, 33).replace(/_+$/, '') // Remove trailing underscore if cut
  }
  
  return result || 'untitled'
}

/**
 * Creates a disk path from components
 * Handles Turkish characters and creates proper path structure
 */
export function diskYoluOlustur(...components: string[]): string {
  const processedComponents = components.map(component => klasorAdi(component))
  
  // Remove empty components and join with forward slashes
  return processedComponents
    .filter(Boolean)
    .join('/')
}

/**
 * Creates a year-based folder path
 * Format: YYYY/folder-name
 */
export function yilBasedPath(folderName: string, year?: number): string {
  const currentYear = year || new Date().getFullYear()
  const folder = klasorAdi(folderName)
  return `${currentYear}/${folder}`
}

/**
 * Creates a month-based folder path
 * Format: YYYY/MM/folder-name
 */
export function ayBasedPath(folderName: string, year?: number, month?: number): string {
  const currentYear = year || new Date().getFullYear()
  const currentMonth = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0')
  const folder = klasorAdi(folderName)
  return `${currentYear}/${currentMonth}/${folder}`
}

/**
 * Creates a date-based folder path
 * Format: YYYY/MM/DD/folder-name
 */
export function tarihBasedPath(folderName: string, date?: Date): string {
  const currentDate = date || new Date()
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')
  const folder = klasorAdi(folderName)
  return `${year}/${month}/${day}/${folder}`
}

/**
 * Sanitizes filename for file system
 * Removes invalid characters and limits length
 */
export function dosyaAdi(filename: string, maxLength = 255): string {
  // Convert Turkish characters to ASCII
  let result = turkishToAscii(filename)

  result = result.replace(/\s+/g, '_')
  
  // Replace invalid filename characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/g
  result = result.replace(invalidChars, '_')
  
  // Remove multiple consecutive underscores
  result = result.replace(/_+/g, '_')
  
  // Remove underscores from start and end
  result = result.replace(/^_+|_+$/g, '')
  
  // Limit length
  if (result.length > maxLength) {
    const ext = result.includes('.') ? result.substring(result.lastIndexOf('.')) : ''
    const nameWithoutExt = result.includes('.') ? result.substring(0, result.lastIndexOf('.')) : result
    const truncatedName = nameWithoutExt.substring(0, maxLength - ext.length - 1)
    result = truncatedName + ext
  }
  
  return result || 'untitled'
}

/**
 * Helper function to escape special characters for RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validates if a folder name is valid
 */
export function isValidFolderName(folderName: string): boolean {
  // Check length
  if (folderName.length === 0 || folderName.length > 33) {
    return false
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(folderName)) {
    return false
  }
  
  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]
  
  const nameWithoutExt = folderName.includes('.') ? folderName.substring(0, folderName.indexOf('.')) : folderName
  if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
    return false
  }
  
  return true
}

/**
 * Creates a unique folder name by adding suffix if needed
 */
export function uniqueKlasorAdi(baseName: string, existingNames: string[]): string {
  let folderName = klasorAdi(baseName)
  let counter = 1
  
  while (existingNames.includes(folderName)) {
    folderName = `${klasorAdi(baseName)}_${counter}`
    counter++
  }
  
  return folderName
}

/**
 * Extracts file extension from filename
 */
export function dosyaUzantisi(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1).toLowerCase() : ''
}

function klasorParcasi(text: string): string {
  let result = turkishToAscii(text)
  Object.entries(SPECIAL_CHARS).forEach(([special, replacement]) => {
    result = result.replace(new RegExp(escapeRegExp(special), 'g'), replacement)
  })
  result = result.replace(/_+/g, '_')
  result = result.replace(/^_+|_+$/g, '')
  return result
}

export function iknIsKlasorAdi(ikn: string, isAdi: string, maxLength = 33): string {
  const safeIkn = klasorParcasi(ikn) || 'IKN'
  const prefix = `${safeIkn}_`
  const remaining = maxLength - prefix.length
  if (remaining <= 0) {
    return prefix.substring(0, maxLength).replace(/_+$/g, '')
  }
  const safeIs = klasorParcasi(isAdi) || 'is'
  const isPart = safeIs.length > remaining ? safeIs.substring(0, remaining).replace(/_+$/g, '') : safeIs
  const combined = `${prefix}${isPart}`.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
  return combined || klasorAdi(`${ikn}_${isAdi}`)
}

export function kurumIsKlasorAdi(kurumAdi: string, isAdi: string, maxLength = 33): string {
  const kurumPart = klasorParcasi(kurumAdi)
  const isPart = klasorParcasi(isAdi)
  if (!kurumPart && !isPart) return 'untitled'
  if (!kurumPart) return (isPart.length > maxLength ? isPart.substring(0, maxLength).replace(/_+$/g, '') : isPart) || 'untitled'
  if (!isPart) return (kurumPart.length > maxLength ? kurumPart.substring(0, maxLength).replace(/_+$/g, '') : kurumPart) || 'untitled'

  const combined = `${kurumPart}_${isPart}`
  if (combined.length <= maxLength) return combined

  const total = maxLength - 1
  const kurumMax = Math.max(1, Math.floor(total * 0.4))
  const isMax = Math.max(1, total - kurumMax)

  const kurumTrimmed = (kurumPart.length > kurumMax ? kurumPart.substring(0, kurumMax).replace(/_+$/g, '') : kurumPart) || 'k'
  const isTrimmed = (isPart.length > isMax ? isPart.substring(0, isMax).replace(/_+$/g, '') : isPart) || 'i'

  return `${kurumTrimmed}_${isTrimmed}`.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
}

export function sozlesmeBasePath(input: {
  year: number
  ihaleTuruKlasor: "DT" | "IHALE"
  ihaleNo: string
  ihaleAdi: string
}): string {
  const folder = iknIsKlasorAdi(input.ihaleNo, input.ihaleAdi)
  return `03_Sozlesme/${input.year}/${input.ihaleTuruKlasor}/${folder}`
}

/**
 * Removes file extension from filename
 */
export function dosyaAdiUzantisiz(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
}

// Export all functions as a namespace
export const SlugUtils = {
  turkishToAscii,
  slug,
  klasorAdi,
  diskYoluOlustur,
  yilBasedPath,
  ayBasedPath,
  tarihBasedPath,
  dosyaAdi,
  isValidFolderName,
  uniqueKlasorAdi,
  dosyaUzantisi,
  dosyaAdiUzantisiz,
}
