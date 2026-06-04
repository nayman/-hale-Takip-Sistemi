import { prismaClient } from './src/lib/prisma-client'

async function test() {
  try {
    console.log("Connecting to database...")
    const users = await prismaClient.user.findMany()
    console.log("Users found:", users.length)
  } catch (err) {
    console.error("Database connection error:", err)
  } finally {
    await prismaClient.$disconnect()
  }
}

test()
