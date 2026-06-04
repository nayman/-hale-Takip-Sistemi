import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

// .env dosyasını yükle
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const prismaSchemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma')
const looksLikeSupabaseDirectHost = (url: string) =>
  /\/\/[^@]+@db\.[^/]+\.supabase\.co(?::\d+)?\//i.test(url)

const buildMigrationUrlFromDatabaseUrl = (databaseUrl: string) => {
  const u = new URL(databaseUrl)

  if (u.port === '6543') u.port = '5432'

  if (/\.pooler\.supabase\.com$/i.test(u.hostname)) {
    if (!u.searchParams.has('pgbouncer')) u.searchParams.set('pgbouncer', 'true')
    u.searchParams.set('statement_cache_size', '0')
  }

  return u.toString()
}

const migrationDatabaseUrl = process.env.MIGRATION_DATABASE_URL
const directUrl = process.env.DIRECT_URL
const databaseUrl = process.env.DATABASE_URL

const datasourceUrl =
  migrationDatabaseUrl ??
  (directUrl && databaseUrl && looksLikeSupabaseDirectHost(directUrl)
    ? buildMigrationUrlFromDatabaseUrl(databaseUrl)
    : directUrl ?? (databaseUrl ? buildMigrationUrlFromDatabaseUrl(databaseUrl) : undefined))

if (!datasourceUrl) {
  throw new Error(
    'DATABASE_URL veya DIRECT_URL bulunamadı. Prisma migrate için .env/.env.local içinde tanımlı olmalı.'
  )
}

export default defineConfig({
  schema: prismaSchemaPath,
  datasource: {
    // Prisma CLI (migrate/pull/push) için mümkünse DIRECT_URL (pooler olmayan) kullanılır.
    url: datasourceUrl,
  },
  migrations: {
    seed: 'npx --yes tsx prisma/seed.ts',
  },
})
