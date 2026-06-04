const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUser() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: 'admin@demo.com' } 
    });
    
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Password exists:', user.password ? 'YES' : 'NO');
      console.log('Role:', user.rol);
      console.log('Tenant ID:', user.tenantId);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUser();
