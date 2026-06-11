const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

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

  console.log('Seed completado: roles y categorías insertados.')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
