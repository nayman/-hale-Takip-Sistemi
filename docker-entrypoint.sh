#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for DB
node wait-for-db.js

# Sync database schema with Prisma
echo "Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

# Seed database
echo "Seeding database..."
npx prisma db seed

# Start Next.js server
echo "Starting Next.js..."
exec npm run start
