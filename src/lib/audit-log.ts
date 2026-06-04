import { PrismaClient } from "@prisma/client"

/**
 * Merkezi Audit Log oluşturma fonksiyonu
 * Sistem promptu v1.6 kurallarına göre düzenlenmiştir.
 */
export async function createAuditLog(
  prisma: any,
  tenantId: string,
  entity: string,
  entityId: string,
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT",
  userId: string,
  data?: any
) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        tenantId,
        entity,
        entityId,
        action,
        userId,
        data: data || {},
      },
    })

    return auditLog
  } catch (error) {
    console.error("Audit log oluşturulurken hata:", error)
    // Ana akışı bozmamak için hata fırlatılmaz
    return null
  }
}
