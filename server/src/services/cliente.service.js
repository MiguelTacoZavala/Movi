const prisma = require('../lib/prisma')

const select = {
  id: true,
  nombres: true,
  apellidos: true,
  email: true,
  dni: true,
  telefono: true,
  fotoUrl: true,
  estado: true,
  createdAt: true,
}

async function listar({ search } = {}) {
  const where = { role: { nombre: 'CLIENTE' } }

  if (search) {
    where.OR = [
      { nombres: { contains: search } },
      { apellidos: { contains: search } },
      { dni: { contains: search } },
      { telefono: { contains: search } },
    ]
  }

  return prisma.usuario.findMany({
    where,
    select,
    orderBy: { nombres: 'asc' },
  })
}

async function obtener(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ...select, role: { select: { nombre: true } } },
  })

  if (!usuario || usuario.role.nombre !== 'CLIENTE') return null

  const [totalReservas, confirmadas, canceladas, creditosDisponibles] = await Promise.all([
    prisma.reserva.count({ where: { usuarioId: id } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'CONFIRMADA' } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'CANCELADA' } }),
    prisma.credito.count({ where: { usuarioId: id, usado: false } }),
  ])

  const { role: _, ...datos } = usuario

  return {
    ...datos,
    stats: { totalReservas, confirmadas, canceladas, creditosDisponibles },
  }
}

module.exports = { listar, obtener }
