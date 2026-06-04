import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuditLog } from '../audit-log'
import { prisma } from '../prisma'

// Mock prisma
vi.mock('../prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}))

describe('Audit Log Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create an audit log entry with correct data', async () => {
    const mockTenantId = 'tenant-123'
    const mockUserId = 'user-456'
    const mockEntity = 'IHALE'
    const mockEntityId = 'ihale-789'
    const mockAction = 'CREATE'
    const mockData = { test: 'data' }

    const mockResult = { id: 'log-1', ...mockData }
    ;(prisma.auditLog.create as any).mockResolvedValue(mockResult)

    const result = await createAuditLog(
      prisma as any,
      mockTenantId,
      mockEntity,
      mockEntityId,
      mockAction,
      mockUserId,
      mockData
    )

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: mockTenantId,
        entity: mockEntity,
        entityId: mockEntityId,
        action: mockAction,
        userId: mockUserId,
        data: mockData,
      },
    })
    expect(result).toEqual(mockResult)
  })

  it('should handle errors gracefully', async () => {
    ;(prisma.auditLog.create as any).mockRejectedValue(new Error('Prisma Error'))

    const result = await createAuditLog(
      prisma as any,
      't', 'e', 'ei', 'CREATE', 'u'
    )

    expect(result).toBeNull()
  })
})
