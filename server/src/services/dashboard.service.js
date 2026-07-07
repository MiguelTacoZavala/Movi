const prisma = require('../lib/prisma')
const { limpiarHoldsExpirados } = require('./reserva.service')
const { hhmm, yyyymmdd } = require('../lib/helpers')

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
    fecha: yyyymmdd(c.fecha),
    horaInicio: hhmm(c.horaInicio),
    horaFin: hhmm(c.horaFin),
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
  hoy.setHours(0, 0, 0, 0)
  const mañana = new Date(hoy)
  mañana.setDate(hoy.getDate() + 1)

  const diasDesdeLunes = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - diasDesdeLunes)
  const proximoLunes = new Date(lunes)
  proximoLunes.setDate(lunes.getDate() + 7)

  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1)

  const clasesHoyRaw = await prisma.clase.findMany({
    where: { fecha: { gte: hoy, lt: mañana } },
    include: includeClase,
    orderBy: { horaInicio: 'asc' },
  })

  const [pagoHoy, pagoSemana, pagoMes, todasCategorias, clasesEnRiesgoRaw] =
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
  await limpiarHoldsExpirados()

  const ahora = new Date()
  const hoy = new Date(ahora)
  hoy.setHours(0, 0, 0, 0)

  const reservas = await prisma.reserva.findMany({
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
    orderBy: [{ clase: { fecha: 'asc' } }, { clase: { horaInicio: 'asc' } }],
    take: 5,
  })

  const ahoraDateStr = yyyymmdd(ahora)
  const ahoraTimeStr = hhmm(ahora) + ':' + String(ahora.getSeconds()).padStart(2, '0')

  function claseHaPasado(c) {
    const fechaStr = yyyymmdd(c.fecha)
    const horaFinStr = hhmm(c.horaFin) + ':' + String(c.horaFin.getSeconds()).padStart(2, '0')
    return fechaStr < ahoraDateStr || (fechaStr === ahoraDateStr && horaFinStr < ahoraTimeStr)
  }

  const reservaValida = reservas.find(r => {
    if (!r.clase) return false
    const c = r.clase
    const fechaStr = yyyymmdd(c.fecha)

    if (fechaStr < ahoraDateStr) return false
    if (fechaStr > ahoraDateStr) return !claseHaPasado(c)
    const horaStr = hhmm(c.horaInicio) + ':' + String(c.horaInicio.getSeconds()).padStart(2, '0')
    return horaStr > ahoraTimeStr
  })

  const proximaReserva = reservaValida
    ? {
        id: reservaValida.id,
        codigoPago: reservaValida.codigoPago,
        asiento: reservaValida.posicionClase?.numero,
        estadoDisplay: 'CONFIRMADA',
        clase: {
          id: reservaValida.clase.id,
          fecha: yyyymmdd(reservaValida.clase.fecha),
          horaInicio: hhmm(reservaValida.clase.horaInicio),
          horaFin: hhmm(reservaValida.clase.horaFin),
          categoria: reservaValida.clase.horarioSemanal?.categoria,
          instructor: reservaValida.clase.horarioSemanal?.instructor
            ? {
                id: reservaValida.clase.horarioSemanal.instructor.id,
                nombres: reservaValida.clase.horarioSemanal.instructor.usuario.nombres,
                apellidos: reservaValida.clase.horarioSemanal.instructor.usuario.apellidos,
              }
            : undefined,
        },
      }
    : null

  const creditosDisponibles = await prisma.credito.count({
    where: { usuarioId, usado: false },
  })

  const clasesRaw = await prisma.clase.findMany({
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

  const proximasClases = clasesRaw
    .filter(c => c._count.reservas < c.capacidadMaxima)
    .map(c => ({
      id: c.id,
      fecha: yyyymmdd(c.fecha),
      horaInicio: hhmm(c.horaInicio),
      horaFin: hhmm(c.horaFin),
      ocupacion: c._count.reservas,
      capacidadMaxima: c.capacidadMaxima,
      categoria: c.horarioSemanal.categoria,
      instructor: {
        id: c.horarioSemanal.instructor.id,
        nombres: c.horarioSemanal.instructor.usuario.nombres,
        apellidos: c.horarioSemanal.instructor.usuario.apellidos,
      },
    }))

  const inscripcionesProximas = await prisma.reserva.count({
    where: {
      usuarioId,
      estado: { in: ['CONFIRMADA', 'PENDIENTE'] },
      clase: { fecha: { gte: hoy } },
    },
  })

  return {
    proximaReserva,
    creditosDisponibles,
    inscripcionesProximas,
    proximasClases,
  }
}

module.exports = { resumenAdmin, resumenCliente }
