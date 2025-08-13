import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@clinica.com',
        password: hashedPassword,
        name: 'Administrador',
        role: UserRole.ADMIN
      }
    })

    console.log('Admin user created successfully:')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('Role:', admin.role)
    console.log('\n⚠️  Please change the default password after first login!')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()