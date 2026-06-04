import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function readRepoFile(relativePathFromRepoRoot: string) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(__dirname, '..', '..', '..')
  const absolutePath = path.resolve(repoRoot, relativePathFromRepoRoot)
  return readFileSync(absolutePath, 'utf8')
}

function extractNumberArray(source: string, variableName: string): number[] {
  const re = new RegExp(`\\b${variableName}\\s*=\\s*\\[([^\\]]*)\\]`)
  const match = source.match(re)
  if (!match) throw new Error(`Array not found: ${variableName}`)
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n))
}

describe('Sprint 01.06.2026 drift guard', () => {
  it('belge-alarm eşikleri 15 günü içerir (90/60/30/15/7)', () => {
    const source = readRepoFile('src/lib/queue-worker.ts')
    const thresholds = extractNumberArray(source, 'thresholds')
    expect(thresholds).toEqual([90, 60, 30, 15, 7])
  })

  it('queues bootstrap endpoint tüm repeat job’ları schedule eder (belge-alarm + kalici-silme dahil) ve tenant bazlı tekil jobId kullanır', () => {
    const source = readRepoFile('src/app/api/health/queues/route.ts')

    expect(source).toContain('BELGE_ALARM_CRON')
    expect(source).toContain('KALICI_SILME_CRON')

    expect(source).toMatch(/jobId:\s*`ym-alarm:\$\{t\.id\}`/)
    expect(source).toMatch(/jobId:\s*`hukuki-alarm:\$\{t\.id\}`/)
    expect(source).toMatch(/jobId:\s*`sozlesme-alarm:\$\{t\.id\}`/)
    expect(source).toMatch(/jobId:\s*`hakedis-acilis:\$\{t\.id\}`/)
    expect(source).toMatch(/jobId:\s*`belge-alarm:\$\{t\.id\}`/)
    expect(source).toMatch(/jobId:\s*`kalici-silme:\$\{t\.id\}`/)
  })

  it('queue job type union belge-alarm + kalici-silme içerir', () => {
    const source = readRepoFile('src/lib/queue.ts')
    expect(source).toContain("type: 'belge-alarm'")
    expect(source).toContain("'kalici-silme'")
  })
})

