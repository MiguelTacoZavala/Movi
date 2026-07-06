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

async function listar({ search, page = 1, limit = 20 } = {}) {
  const where = { role: { nombre: 'CLIENTE' } }

  if (search) {
    where.OR = [
      { nombres: { contains: search } },
      { apellidos: { contains: search } },
      { dni: { contains: search } },
      { telefono: { contains: search } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [total, clientes] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      select,
      skip,
      take: Number(limit),
      orderBy: { nombres: 'asc' },
    }),
  ])

  return {
    clientes,
    paginacion: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPaginas: Math.ceil(total / Number(limit)),
    },
  }
}

async function obtener(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ...select, role: { select: { nombre: true } } },
  })

  if (!usuario || usuario.role.nombre !== 'CLIENTE') return null

  const [
    totalReservas,
    confirmadas,
    canceladas,
    pendientes,
    expiradas,
    creditosDisponibles,
    creditosUsados,
  ] = await Promise.all([
    prisma.reserva.count({ where: { usuarioId: id } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'CONFIRMADA' } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'CANCELADA' } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'PENDIENTE' } }),
    prisma.reserva.count({ where: { usuarioId: id, estado: 'EXPIRADA' } }),
    prisma.credito.count({ where: { usuarioId: id, usado: false } }),
    prisma.credito.count({ where: { usuarioId: id, usado: true } }),
  ])

  // Próximas 5 reservas del cliente
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const proximasReservas = await prisma.reserva.findMany({
    where: {
      usuarioId: id,
      estado: { in: ['CONFIRMADA', 'PENDIENTE'] },
      clase: { fecha: { gte: hoy } },
    },
    include: {
      clase: {
        select: {
          id: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          estado: true,
          horarioSemanal: {
            select: {
              categoria: { select: { nombre: true } },
              instructor: {
                select: {
                  id: true,
                  usuario: { select: { nombres: true, apellidos: true } },
                },
              },
            },
          },
        },
      },
      posicionClase: { select: { numero: true } },
    },
    orderBy: [{ clase: { fecha: 'asc' } }, { clase: { horaInicio: 'asc' } }],
    take: 5,
  })

  const { role: _, ...datos } = usuario

  return {
    ...datos,
    stats: {
      totalReservas,
      confirmadas,
      canceladas,
      pendientes,
      expiradas,
      creditosDisponibles,
      creditosUsados,
    },
    proximasReservas: proximasReservas.map(r => ({
      id: r.id,
      codigoPago: r.codigoPago,
      asiento: r.posicionClase?.numero,
      estado: r.estado,
      clase: {
        id: r.clase.id,
        fecha: r.clase.fecha,
        horaInicio: r.clase.horaInicio,
        horaFin: r.clase.horaFin,
        estado: r.clase.estado,
        categoria: r.clase.horarioSemanal?.categoria,
        instructor: r.clase.horarioSemanal?.instructor
          ? {
              id: r.clase.horarioSemanal.instructor.id,
              nombres: r.clase.horarioSemanal.instructor.usuario.nombres,
              apellidos: r.clase.horarioSemanal.instructor.usuario.apellidos,
            }
          : undefined,
      },
    })),
  }
}

module.exports = { listar, obtener }
