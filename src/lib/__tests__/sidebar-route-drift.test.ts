import fs from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

function projectPath(...parts: string[]) {
  return path.resolve(process.cwd(), ...parts)
}

function extractSidebarHrefs(sidebarSource: string) {
  const hrefs = new Set<string>()
  const re = /href:\s*'([^']+)'/g
  let match: RegExpExecArray | null
  while ((match = re.exec(sidebarSource))) {
    const href = match[1]
    if (href.startsWith("/")) hrefs.add(href)
  }
  return Array.from(hrefs).sort()
}

describe("Sidebar route drift", () => {
  it("Sidebar href'leri için app page dosyaları bulunmalı", () => {
    const sidebarPath = projectPath("src", "components", "Sidebar.tsx")
    const appDir = projectPath("src", "app")

    const source = fs.readFileSync(sidebarPath, "utf-8")
    const hrefs = extractSidebarHrefs(source)

    const missing: string[] = []
    for (const href of hrefs) {
      const route = href.replace(/^\/+/, "")
      const pagePath = path.join(appDir, route, "page.tsx")
      const exists = fs.existsSync(pagePath)
      if (!exists) missing.push(href)
    }

    expect(missing, `Eksik sayfa rotaları: ${missing.join(", ")}`).toEqual([])
  })
})

