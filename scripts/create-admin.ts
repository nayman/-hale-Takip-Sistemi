import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Önce tenant'ı kontrol et veya oluştur
    let tenant = await prisma.tenant.findFirst()
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Demo Şirket",
        }
      })
      console.log('Tenant oluşturuldu:', tenant.name)
    }

    // Admin kullanıcısını kontrol et
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' }
    })

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut')
      return
    }

    // Admin kullanıcısını oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        rol: 'SUPER_ADMIN',
        tenantId: tenant.id,
      }
    })

    console.log('Admin kullanıcısı oluşturuldu:')
    console.log('Email:', adminUser.email)
    console.log('Şifre: admin123')
    console.log('Rol:', adminUser.rol)

  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
