import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number // saniye cinsinden
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `rate-limit:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  // Önce pencere dışındaki kayıtları temizle
  await redis.zremrangebyscore(key, 0, windowStart)

  // Mevcut istek sayısını al
  const current = await redis.zcard(key)

  if (current >= limit) {
    // Sıfırlanma zamanını hesapla
    const firstRequest = await redis.zrange(key, 0, 0, "WITHSCORES")
    const reset = firstRequest[1] ? parseInt(firstRequest[1]) + window * 1000 : now + window * 1000
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(reset / 1000),
    }
  }

  // Yeni isteği ekle
  await redis.zadd(key, now, `${now}-${Math.random()}`)
  await redis.expire(key, window)

  return {
    success: true,
    limit,
    remaining: limit - current - 1,
    reset: Math.ceil((now + window * 1000) / 1000),
  }
}
