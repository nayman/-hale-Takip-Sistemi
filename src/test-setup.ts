import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

process.env.NODE_OPTIONS = '--max-old-space-size=4096'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  account: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  ihale: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $use: vi.fn(),
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
} as any

const mockSession = {
  user: {
    id: 'test-user-1',
    email: 'test@admin.com',
    name: 'Test User',
    rol: 'SUPER_ADMIN',
    tenantId: 'test-tenant-1',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
}

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}))

export const createTestUser = (overrides = {}) => ({
  id: 'test-user-1',
  email: 'test@admin.com',
  name: 'Test User',
  rol: 'SUPER_ADMIN',
  tenantId: 'test-tenant-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createTestTenant = (overrides = {}) => ({
  id: 'test-tenant-1',
  name: 'Test Şirket',
  domain: 'test.example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createTestIhale = (overrides = {}) => ({
  id: 'test-ihale-1',
  ihaleNo: 'TEST-2024-001',
  ad: 'Test İhale',
  aciklama: 'Test ihalesi',
  tur: 'MAL_ALIM',
  usul: 'ACIK_IHALE',
  butce: 100000,
  sozlesmeBedeli: null,
  baslangicTarihi: new Date(),
  bitisTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  teklifSonTarihi: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  durum: 'TASLAK',
  yayinTarihi: null,
  teklifAlindiTarihi: null,
  sozlestirildiTarihi: null,
  iptalTarihi: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  olusturanUserId: 'test-user-1',
  sorumluUserId: null,
  tenantId: 'test-tenant-1',
  ...overrides,
})

// Global test setup
beforeAll(() => {
  // Set up global test environment
  (process.env as any).NODE_ENV = 'test'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  
  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  // Clean up
  vi.restoreAllMocks()
})

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Clean up any side effects
  vi.restoreAllMocks()
})

// Export test utilities
export const testUtils = {
  mockPrisma,
  mockSession,
  createTestUser,
  createTestTenant,
  createTestIhale,
}
