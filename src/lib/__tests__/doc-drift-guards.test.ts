import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function repoRoot() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(__dirname, '..', '..', '..')
}

function walkFiles(dir: string, predicate: (absolutePath: string) => boolean): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, predicate))
      continue
    }
    if (predicate(full)) out.push(full)
  }
  return out
}

describe('Doküman drift guard (auth/tenant conventions)', () => {
  it('kod tabanında getServerSession / next-auth/next kullanılmaz', () => {
    const root = repoRoot()
    const srcRoot = path.join(root, 'src')
    const files = walkFiles(srcRoot, (p) => /\.(ts|tsx|js|jsx)$/.test(p))

    const offenders: Array<{ file: string; reason: string }> = []
    for (const file of files) {
      if (file.endsWith(path.join('__tests__', 'doc-drift-guards.test.ts'))) continue
      const source = readFileSync(file, 'utf8')
      if (source.includes('next-auth/next')) offenders.push({ file, reason: 'imports next-auth/next' })
      if (source.includes('getServerSession')) offenders.push({ file, reason: 'uses getServerSession' })
    }

    expect(offenders).toEqual([])
  })

  it('session.user alanı role değil rol olarak kullanılır', () => {
    const root = repoRoot()
    const srcRoot = path.join(root, 'src')
    const files = walkFiles(srcRoot, (p) => /\.(ts|tsx|js|jsx)$/.test(p))

    const offenders: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      if (/\bsession\.user\.role\b/.test(source)) offenders.push(file)
    }

    expect(offenders).toEqual([])
  })

  it('auth() kullanılan API route’larında tenantId guard zorunludur', () => {
    const root = repoRoot()
    const apiRoot = path.join(root, 'src', 'app', 'api')
    const routeFiles = walkFiles(apiRoot, (p) => /[\\\/]route\.(ts|js)$/.test(p))

    const allowNoTenantGuard = new Set([
      path.join('auth', 'session', 'route.ts'),
      path.join('auth', 'session', 'route.js'),
    ])

    const missingGuard: string[] = []
    for (const file of routeFiles) {
      const source = readFileSync(file, 'utf8')
      const importsAuth = /import\s*\{\s*auth\s*\}\s*from\s*["']@\/lib\/auth["']/.test(source)
      if (!importsAuth) continue

      const rel = path.relative(apiRoot, file)
      if (allowNoTenantGuard.has(rel)) continue

      const hasTenantGuard =
        /!\s*session\?\.\s*user\?\.\s*tenantId/.test(source) ||
        (/const\s+tenantId\s*=/.test(source) && /if\s*\(\s*!\s*tenantId\s*\)/.test(source))
      if (!hasTenantGuard) missingGuard.push(file)
    }

    expect(missingGuard).toEqual([])
  })

  it('UI manifesto uyum testi: border-gray, border-slate, bg-gray, text-slate, shadow-lg ve <form> kullanılmaz', () => {
    const root = repoRoot()
    const srcRoot = path.join(root, 'src')
    const appRoot = path.join(srcRoot, 'app')
    const componentsRoot = path.join(srcRoot, 'components')

    const files = [
      ...walkFiles(appRoot, (p) => /\.(ts|tsx|js|jsx)$/.test(p)),
      ...walkFiles(componentsRoot, (p) => /\.(ts|tsx|js|jsx)$/.test(p)),
    ]

    const offenders: Array<{ file: string; line: number; match: string }> = []
    const pattern = /\b(border-gray|border-slate|bg-gray|text-slate|shadow-lg)\b|<form\b/i

    for (const file of files) {
      if (
        file.endsWith('.test.ts') || 
        file.endsWith('.test.tsx') || 
        file.endsWith('doc-drift-guards.test.ts') ||
        file.includes('globals.css')
      ) {
        continue
      }
      const source = readFileSync(file, 'utf8')
      const lines = source.split('\n')
      lines.forEach((line, index) => {
        const match = line.match(pattern)
        if (match) {
          offenders.push({
            file: path.relative(root, file).replace(/\\/g, '/'),
            line: index + 1,
            match: match[0],
          })
        }
      })
    }

    expect(offenders).toEqual([])
  })
})
