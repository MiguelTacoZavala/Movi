const prisma = require('../lib/prisma')

const DIA_OFFSET = {
  LUNES: 0, MARTES: 1, MIERCOLES: 2, JUEVES: 3,
  VIERNES: 4, SABADO: 5, DOMINGO: 6,
}

function getMondayOfCurrentWeek() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const day = today.getUTCDay() // 0=Dom, 1=Lun, ..., 6=Sab
  const diasDesdeLunes = day === 0 ? 6 : day - 1
  today.setUTCDate(today.getUTCDate() - diasDesdeLunes)
  return today
}

function getFechaClase(monday, diaSemana, weekOffset) {
  const fecha = new Date(monday)
  fecha.setUTCDate(monday.getUTCDate() + weekOffset * 7 + DIA_OFFSET[diaSemana])
  return fecha
}

const includeBase = {
  horarioSemanal: {
    select: {
      diaSemana: true,
      categoria: { select: { id: true, nombre: true, precio: true } },
      instructor: {
        select: {
          id: true,
          usuario: { select: { nombres: true, apellidos: true } },
        },
      },
    },
  },
  _count: { select: { reservas: true } },
}

const includeDetalle = {
  horarioSemanal: {
    select: {
      diaSemana: true,
      categoria: { select: { id: true, nombre: true, precio: true } },
      instructor: {
        select: {
          id: true,
          usuario: { select: { nombres: true, apellidos: true } },
        },
      },
    },
  },
  posiciones: {
    orderBy: { numero: 'asc' },
    include: {
      reservas: {
        where: { estado: { not: 'CANCELADA' } },
        select: { id: true, estado: true },
      },
    },
  },
  _count: { select: { reservas: true } },
}

function formatear(clase) {
  return {
    id: clase.id,
    fecha: clase.fecha.toISOString().substring(0, 10),
    horaInicio: clase.horaInicio.toISOString().substring(11, 16),
    horaFin: clase.horaFin.toISOString().substring(11, 16),
    capacidadMaxima: clase.capacidadMaxima,
    minimoParticipantes: clase.minimoParticipantes,
    tematica: clase.tematica,
    estado: clase.estado,
    inscritos: clase._count?.reservas,
    diaSemana: clase.horarioSemanal?.diaSemana,
    categoria: clase.horarioSemanal?.categoria,
    precio: clase.horarioSemanal?.categoria?.precio ? Number(clase.horarioSemanal.categoria.precio) : 15,
    instructor: clase.horarioSemanal
      ? {
          id: clase.horarioSemanal.instructor.id,
          nombres: clase.horarioSemanal.instructor.usuario.nombres,
          apellidos: clase.horarioSemanal.instructor.usuario.apellidos,
        }
      : undefined,
    posiciones: clase.posiciones,
    createdAt: clase.createdAt,
  }
}

async function generar({ semanas }) {
  const horarios = await prisma.horarioSemanal.findMany({ where: { activo: true } })
  const monday = getMondayOfCurrentWeek()

  let creadas = 0
  let omitidas = 0

  for (const horario of horarios) {
    for (let week = 0; week < semanas; week++) {
      const fecha = getFechaClase(monday, horario.diaSemana, week)

      const existing = await prisma.clase.findUnique({
        where: { horarioSemanalId_fecha: { horarioSemanalId: horario.id, fecha } },
      })

      if (existing) {
        omitidas++
        continue
      }

      await prisma.$transaction(async (tx) => {
        const clase = await tx.clase.create({
          data: {
            horarioSemanalId: horario.id,
            fecha,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            capacidadMaxima: horario.capacidadMaxima,
            minimoParticipantes: horario.minimoParticipantes,
          },
        })

        const posiciones = Array.from({ length: horario.capacidadMaxima }, (_, i) => ({
          claseId: clase.id,
          numero: i + 1,
        }))

        await tx.posicionClase.createMany({ data: posiciones })
      })

      creadas++
    }
  }

  return { creadas, omitidas, semanas }
}

async function listar({ estado, fecha, categoriaId, instructorId, page = 1, limit = 10 }) {
  const where = {}

  if (estado) where.estado = estado

  if (fecha) {
    const d = new Date(fecha)
    d.setUTCHours(0, 0, 0, 0)
    const siguiente = new Date(d)
    siguiente.setUTCDate(d.getUTCDate() + 1)
    where.fecha = { gte: d, lt: siguiente }
  }

  if (categoriaId || instructorId) {
    where.horarioSemanal = {}
    if (categoriaId) where.horarioSemanal.categoriaId = Number(categoriaId)
    if (instructorId) where.horarioSemanal.instructorId = Number(instructorId)
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [total, clases] = await Promise.all([
    prisma.clase.count({ where }),
    prisma.clase.findMany({
      where,
      include: includeBase,
      skip,
      take: Number(limit),
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    }),
  ])

  return {
    clases: clases.map(formatear),
    paginacion: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPaginas: Math.ceil(total / Number(limit)),
    },
  }
}

async function obtener(id) {
  const clase = await prisma.clase.findUnique({ where: { id }, include: includeDetalle })
  return clase ? formatear(clase) : null
}

async function cancelar(id) {
  const clase = await prisma.clase.findUnique({
    where: { id },
    include: {
      reservas: {
        where: { estado: 'CONFIRMADA' },
        select: { id: true, usuarioId: true },
      },
    },
  })

  if (!clase) return null
  if (clase.estado === 'CANCELADA') throw { yaCancelada: true }
  if (clase.estado === 'FINALIZADA') throw { yaFinalizada: true }

  const creditosGenerados = clase.reservas.length

  await prisma.$transaction(async (tx) => {
    await tx.clase.update({
      where: { id },
      data: { estado: 'CANCELADA', updatedAt: new Date() },
    })

    for (const reserva of clase.reservas) {
      await tx.credito.create({
        data: { usuarioId: reserva.usuarioId, claseId: id, reservaId: reserva.id },
      })
      await tx.reserva.update({
        where: { id: reserva.id },
        data: { estado: 'CANCELADA', fechaCancelacion: new Date(), updatedAt: new Date() },
      })
    }

    // Cancelar también las reservas PENDIENTE (sin crédito, no han pagado)
    await tx.reserva.updateMany({
      where: { claseId: id, estado: 'PENDIENTE' },
      data: { estado: 'CANCELADA', fechaCancelacion: new Date(), updatedAt: new Date() },
    })
  })

  return { creditosGenerados }
}

module.exports = { generar, listar, obtener, cancelar }
