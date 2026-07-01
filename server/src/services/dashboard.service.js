const prisma = require('../lib/prisma')

const includeClase = {
  horarioSemanal: {
    select: {
      categoria: { select: { id: true, nombre: true } },
      instructor: {
        select: { id: true, usuario: { select: { nombres: true, apellidos: true } } },
      },
    },
  },
  _count: { select: { reservas: { where: { estado: 'CONFIRMADA' } } } },
}

function formatearClase(c) {
  return {
    id: c.id,
    fecha: c.fecha.toISOString().substring(0, 10),
    horaInicio: c.horaInicio.toISOString().substring(11, 16),
    horaFin: c.horaFin.toISOString().substring(11, 16),
    estado: c.estado,
    tematica: c.tematica,
    inscritos: c._count.reservas,
    capacidadMaxima: c.capacidadMaxima,
    minimoParticipantes: c.minimoParticipantes,
    categoria: c.horarioSemanal.categoria,
    instructor: {
      id: c.horarioSemanal.instructor.id,
      nombres: c.horarioSemanal.instructor.usuario.nombres,
      apellidos: c.horarioSemanal.instructor.usuario.apellidos,
    },
  }
}

async function resumenAdmin() {
  const ahora = new Date()

  const hoy = new Date(ahora)
  hoy.setUTCHours(0, 0, 0, 0)
  const mañana = new Date(hoy)
  mañana.setUTCDate(hoy.getUTCDate() + 1)

  const diasDesdeLunes = ahora.getUTCDay() === 0 ? 6 : ahora.getUTCDay() - 1
  const lunes = new Date(hoy)
  lunes.setUTCDate(hoy.getUTCDate() - diasDesdeLunes)
  const proximoLunes = new Date(lunes)
  proximoLunes.setUTCDate(lunes.getUTCDate() + 7)

  const inicioMes = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1))
  const finMes = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, 1))

  const [pagoHoy, pagoSemana, pagoMes, clasesHoyRaw, todasCategorias, clasesEnRiesgoRaw] =
    await Promise.all([
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { estado: 'PAGADO', fechaPago: { gte: hoy, lt: mañana } },
      }),
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { estado: 'PAGADO', fechaPago: { gte: lunes, lt: proximoLunes } },
      }),
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { estado: 'PAGADO', fechaPago: { gte: inicioMes, lt: finMes } },
      }),
      prisma.clase.findMany({
        where: { fecha: { gte: hoy, lt: mañana } },
        include: includeClase,
        orderBy: { horaInicio: 'asc' },
      }),
      prisma.categoriaBaile.findMany({ select: { id: true, nombre: true } }),
      prisma.clase.findMany({
        where: { estado: 'PROGRAMADA', fecha: { gte: ahora } },
        include: includeClase,
        orderBy: { fecha: 'asc' },
      }),
    ])

  const categoriasPopulares = await Promise.all(
    todasCategorias.map(async (cat) => {
      const total = await prisma.reserva.count({
        where: { estado: 'CONFIRMADA', clase: { horarioSemanal: { categoriaId: cat.id } } },
      })
      return { ...cat, totalReservas: total }
    })
  )
  categoriasPopulares.sort((a, b) => b.totalReservas - a.totalReservas)

  return {
    ingresos: {
      hoy: Number(pagoHoy._sum.monto ?? 0),
      semana: Number(pagoSemana._sum.monto ?? 0),
      mes: Number(pagoMes._sum.monto ?? 0),
    },
    clasesHoy: clasesHoyRaw.map(formatearClase),
    categoriasPopulares,
    clasesEnRiesgo: clasesEnRiesgoRaw
      .filter((c) => c._count.reservas < c.minimoParticipantes)
      .map(formatearClase),
  }
}

async function resumenCliente(usuarioId) {
  const ahora = new Date()
  const hoy = new Date(ahora)
  hoy.setUTCHours(0, 0, 0, 0)

  const proximaReserva = await prisma.reserva.findFirst({
    where: { usuarioId, estado: 'CONFIRMADA', clase: { fecha: { gte: hoy } } },
    include: {
      clase: {
        include: {
          horarioSemanal: {
            select: {
              categoria: { select: { id: true, nombre: true } },
              instructor: {
                select: { id: true, usuario: { select: { nombres: true, apellidos: true } } },
              },
            },
          },
        },
      },
      posicionClase: { select: { numero: true } },
    },
    orderBy: { clase: { fecha: 'asc' } },
  })

  const creditosDisponibles = await prisma.credito.count({
    where: { usuarioId, usado: false },
  })

  const proximasClases = await prisma.clase.findMany({
    where: { fecha: { gte: hoy }, estado: 'PROGRAMADA' },
    include: {
      horarioSemanal: {
        select: {
          categoria: { select: { id: true, nombre: true } },
          instructor: {
            select: { id: true, usuario: { select: { nombres: true, apellidos: true } } },
          },
        },
      },
      _count: { select: { reservas: { where: { estado: 'CONFIRMADA' } } } },
    },
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    take: 5,
  })

  const clasesPopulares = proximasClases
    .filter(c => c._count.reservas < c.capacidadMaxima)
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      fecha: c.fecha.toISOString().substring(0, 10),
      horaInicio: c.horaInicio.toISOString().substring(11, 16),
      horaFin: c.horaFin.toISOString().substring(11, 16),
      ocupacion: c._count.reservas,
      capacidadMaxima: c.capacidadMaxima,
      categoria: c.horarioSemanal.categoria,
      instructor: {
        id: c.horarioSemanal.instructor.id,
        nombres: c.horarioSemanal.instructor.usuario.nombres,
        apellidos: c.horarioSemanal.instructor.usuario.apellidos,
      },
    }))

  return {
    proximaReserva: proximaReserva
      ? {
          id: proximaReserva.id,
          codigoPago: proximaReserva.codigoPago,
          asiento: proximaReserva.posicionClase?.numero,
          clase: {
            id: proximaReserva.clase.id,
            fecha: proximaReserva.clase.fecha.toISOString().substring(0, 10),
            horaInicio: proximaReserva.clase.horaInicio.toISOString().substring(11, 16),
            horaFin: proximaReserva.clase.horaFin.toISOString().substring(11, 16),
            categoria: proximaReserva.clase.horarioSemanal?.categoria,
            instructor: proximaReserva.clase.horarioSemanal?.instructor
              ? {
                  id: proximaReserva.clase.horarioSemanal.instructor.id,
                  nombres: proximaReserva.clase.horarioSemanal.instructor.usuario.nombres,
                  apellidos: proximaReserva.clase.horarioSemanal.instructor.usuario.apellidos,
                }
              : undefined,
          },
        }
      : null,
    creditosDisponibles,
    clasesPopulares,
  }
}

module.exports = { resumenAdmin, resumenCliente }
