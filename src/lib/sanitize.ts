// Basit ve güvenli bir sanitizasyon fonksiyonu (harici kütüphane olmadan)
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return input
  }
  
  // HTML etiketlerini kaldır
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "")
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized as T
}
