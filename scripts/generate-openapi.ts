import { promises as fs } from "fs"
import * as path from "path"

type HttpMethod = "get" | "post" | "put" | "patch" | "delete"

type ParamLocation = "path" | "query" | "header"
type ParamType = "string" | "number" | "integer" | "boolean"

function toApiPathFromDir(relativeDir: string) {
  const segments = relativeDir
    .split(path.sep)
    .filter(Boolean)
    .map((seg) => {
      const m1 = seg.match(/^\[(.+)\]$/)
      if (m1) {
        const inner = m1[1]
        const mCatchAll = inner.match(/^\.\.\.(.+)$/)
        const name = (mCatchAll ? mCatchAll[1] : inner).trim()
        return `{${name}}`
      }
      return seg
    })
  return `/api/${segments.join("/")}`
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: string[] = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      results.push(...(await walk(full)))
    } else {
      results.push(full)
    }
  }
  return results
}

function extractMethods(source: string): HttpMethod[] {
  const found = new Set<HttpMethod>()
  const re = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) {
    found.add(m[1].toLowerCase() as HttpMethod)
  }
  const order: Record<HttpMethod, number> = { get: 0, post: 1, put: 2, patch: 3, delete: 4 }
  return Array.from(found).sort((a, b) => order[a] - order[b])
}

function extractPathParams(apiPath: string) {
  const params: string[] = []
  const re = /\{([^}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(apiPath))) {
    params.push(m[1])
  }
  return params
}

function uniqueSortedStrings(items: string[]) {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b))
}

function inferQueryParamType(source: string, name: string): ParamType {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  if (new RegExp(`Number\\(\\s*searchParams\\.get\\(\\s*["'\`]${escaped}["'\`]\\s*\\)`, "g").test(source)) {
    return "number"
  }
  if (new RegExp(`parseFloat\\(\\s*searchParams\\.get\\(\\s*["'\`]${escaped}["'\`]\\s*\\)`, "g").test(source)) {
    return "number"
  }
  if (new RegExp(`parseInt\\(\\s*searchParams\\.get\\(\\s*["'\`]${escaped}["'\`]\\s*\\)`, "g").test(source)) {
    return "integer"
  }
  if (
    new RegExp(`searchParams\\.get\\(\\s*["'\`]${escaped}["'\`]\\s*\\)\\s*===\\s*["'\`](true|false|1|0)["'\`]`, "g").test(source) ||
    new RegExp(`["'\`]${escaped}["'\`]\\s*\\)\\s*===\\s*["'\`](true|false|1|0)["'\`]`, "g").test(source)
  ) {
    return "boolean"
  }
  return "string"
}

function extractSearchParamNames(source: string) {
  const re = /searchParams\.get\(\s*["'`]([^"'`]+)["'`]\s*\)/g
  const names: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) names.push(m[1])
  return uniqueSortedStrings(names)
}

function extractHeaderNames(source: string) {
  const re = /request\.headers\.get\(\s*["'`]([^"'`]+)["'`]\s*\)/g
  const names: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) names.push(m[1])
  return uniqueSortedStrings(names)
}

function extractStatusCodes(source: string) {
  const re = /status\s*:\s*(\d{3})/g
  const codes: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) codes.push(m[1])
  return uniqueSortedStrings(codes)
}

function param(
  name: string,
  where: ParamLocation,
  type: ParamType,
  required: boolean
) {
  return {
    name,
    in: where,
    required,
    schema: { type },
  }
}

function toOperationId(method: HttpMethod, apiPath: string) {
  const clean = apiPath
    .replace(/^\/+/, "")
    .replace(/[{}]/g, "")
    .replace(/[^a-zA-Z0-9/]+/g, "_")
    .split("/")
    .filter(Boolean)
    .join("_")
  return `${method}_${clean}`
}

function toTags(apiPath: string) {
  const segs = apiPath.split("/").filter(Boolean)
  const apiIndex = segs[0] === "api" ? 0 : -1
  const next = apiIndex >= 0 ? segs[apiIndex + 1] : segs[0]
  return [next || "api"]
}

function pickRequestBodyContentType(method: HttpMethod, source: string) {
  if (method === "get" || method === "delete") return null
  if (/request\.formData\(\)/.test(source)) return "multipart/form-data"
  if (/request\.json\(\)/.test(source)) return "application/json"
  return "application/json"
}

function pickResponseContentType(source: string) {
  if (/text\/csv/.test(source) || /Content-Type["']\s*:\s*["']text\/csv/.test(source)) return "text/csv"
  return "application/json"
}

async function main() {
  const repoRoot = process.cwd()
  const pkgPath = path.join(repoRoot, "package.json")
  const apiRoot = path.join(repoRoot, "src", "app", "api")
  const outPath = path.join(apiRoot, "openapi", "spec.ts")

  const pkgRaw = await fs.readFile(pkgPath, "utf8")
  const pkg = JSON.parse(pkgRaw) as { name?: string; version?: string }

  const allFiles = await walk(apiRoot)
  const routeFiles = allFiles.filter((p) => /[\\\/]route\.(ts|js)$/.test(p)).sort((a, b) => a.localeCompare(b))

  const paths: Record<string, Record<string, any>> = {}

  for (const filePath of routeFiles) {
    const rel = path.relative(apiRoot, filePath)
    const dir = path.dirname(rel)
    const apiPath = toApiPathFromDir(dir === "." ? "" : dir)
    const source = await fs.readFile(filePath, "utf8")
    const methods = extractMethods(source)
    if (methods.length === 0) continue

    const params = extractPathParams(apiPath)
    const queryParamNames = extractSearchParamNames(source)
    const headerNames = extractHeaderNames(source)
    const statusCodes = extractStatusCodes(source)
    const tags = toTags(apiPath)

    for (const method of methods) {
      const contentType = pickRequestBodyContentType(method, source)
      const responseContentType = pickResponseContentType(source)

      const parameters = [
        ...params.map((name) => param(name, "path", "string", true)),
        ...queryParamNames
          .filter((n) => !params.includes(n))
          .map((name) => param(name, "query", inferQueryParamType(source, name), false)),
        ...headerNames.map((name) => param(name, "header", "string", false)),
      ]

      const op: any = {
        operationId: toOperationId(method, apiPath),
        summary: `${method.toUpperCase()} ${apiPath}`,
        tags,
        parameters,
        responses: {
          "200": {
            description: "OK",
            content:
              responseContentType === "application/json"
                ? { "application/json": { schema: {} } }
                : { [responseContentType]: { schema: { type: "string" } } },
          },
          "400": { description: "Bad Request" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden" },
          "404": { description: "Not Found" },
          "500": { description: "Internal Server Error" },
        },
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      }

      for (const code of statusCodes) {
        if (!op.responses[code]) op.responses[code] = { description: `HTTP ${code}` }
      }

      if (contentType) {
        op.requestBody = {
          required: true,
          content: {
            [contentType]:
              contentType === "multipart/form-data"
                ? { schema: { type: "object", additionalProperties: true } }
                : { schema: {} },
          },
        }
      }

      paths[apiPath] ||= {}
      paths[apiPath][method] = op
    }
  }

  const doc = {
    openapi: "3.0.3",
    info: {
      title: pkg.name ? `${pkg.name} API` : "API",
      version: pkg.version || "0.0.0",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "session" },
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
    paths,
  }

  const content =
    `export const openApiDocument = ${JSON.stringify(doc, null, 2)} as const\n`

  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, content, "utf8")
  process.stdout.write(`OpenAPI spec generated: ${path.relative(repoRoot, outPath)}\n`)
}

main().catch((err) => {
  process.stderr.write(String(err instanceof Error ? err.stack || err.message : err))
  process.stderr.write("\n")
  process.exitCode = 1
})
