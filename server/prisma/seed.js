const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Roles
  const roles = [
    { id: 1, nombre: 'ADMIN' },
    { id: 2, nombre: 'CLIENTE' },
    { id: 3, nombre: 'INSTRUCTOR' },
  ]

  for (const rol of roles) {
    await prisma.role.upsert({
      where: { id: rol.id },
      update: { nombre: rol.nombre },
      create: rol,
    })
  }
  console.log('Roles insertados.')

  // Categorías
  const categorias = [
    { nombre: 'Salsa', descripcion: 'Ritmo y energía' },
    { nombre: 'Bachata', descripcion: 'Romántica y sensual' },
    { nombre: 'Tango', descripcion: 'Pasión y elegancia' },
  ]

  for (const cat of categorias) {
    await prisma.categoriaBaile.upsert({
      where: { nombre: cat.nombre },
      update: { descripcion: cat.descripcion },
      create: cat,
    })
  }
  console.log('Categorías insertadas.')

  // Usuarios de prueba

  // Admin
  await prisma.usuario.upsert({
    where: { email: 'admin@dance.com' },
    update: {},
    create: {
      nombres: 'Administrador',
      apellidos: '',
      email: 'admin@dance.com',
      password: await bcrypt.hash('admin123', 10),
      rolId: 1,
    },
  })
  console.log('Admin creado: admin@dance.com / admin123')

  // Instructor (María García)
  const instructorUser = await prisma.usuario.upsert({
    where: { email: 'maria@dance.com' },
    update: {},
    create: {
      nombres: 'María',
      apellidos: 'García',
      email: 'maria@dance.com',
      password: await bcrypt.hash('instructor123', 10),
      rolId: 3,
    },
  })

  await prisma.instructor.upsert({
    where: { usuarioId: instructorUser.id },
    update: {},
    create: {
      usuarioId: instructorUser.id,
      especialidad: 'Salsa',
    },
  })
  console.log('Instructor creado: maria@dance.com / instructor123')

  // Cliente (Juan Pérez)
  await prisma.usuario.upsert({
    where: { dni: '12345678' },
    update: {},
    create: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      dni: '12345678',
      telefono: '999111222',
      password: await bcrypt.hash('cliente123', 10),
      rolId: 2,
    },
  })
  console.log('Cliente creado: DNI 12345678 / cliente123')

  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
