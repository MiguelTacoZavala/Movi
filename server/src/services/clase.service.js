const prisma = require('../lib/prisma')
const { limpiarHoldsExpirados } = require('./reserva.service')

const DIA_OFFSET = {
  LUNES: 0, MARTES: 1, MIERCOLES: 2, JUEVES: 3,
  VIERNES: 4, SABADO: 5, DOMINGO: 6,
}

function getMondayOfCurrentWeek() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = today.getDay()
  const diasDesdeLunes = day === 0 ? 6 : day - 1
  today.setDate(today.getDate() - diasDesdeLunes)
  return today
}

function getFechaClase(monday, diaSemana, weekOffset) {
  const fecha = new Date(monday)
  fecha.setDate(monday.getDate() + weekOffset * 7 + DIA_OFFSET[diaSemana])
  return fecha
}

function hhmm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function yyyymmdd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function combinarFechaHora(fecha, horaRef) {
  const d = new Date(fecha)
  d.setHours(horaRef.getHours(), horaRef.getMinutes(), 0, 0)
  return d
}

const includeBase = {
  horarioSemanal: {
    select: {
      diaSemana: true,
      categoria: { select: { id: true, nombre: true, precio: true } },
      instructor: {
        select: {
          id: true,
          usuario: { select: { nombres: true, apellidos: true, fotoUrl: true } },
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
          usuario: { select: { nombres: true, apellidos: true, fotoUrl: true } },
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
    fecha: yyyymmdd(clase.fecha),
    horaInicio: hhmm(clase.horaInicio),
    horaFin: hhmm(clase.horaFin),
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
          fotoUrl: clase.horarioSemanal.instructor.usuario.fotoUrl,
        }
      : undefined,
    posiciones: clase.posiciones,
    createdAt: clase.createdAt,
  }
}

async function generar({ semanas }) {
  const horarios = await prisma.horarioSemanal.findMany({ where: { activo: true } })
  const monday = getMondayOfCurrentWeek()

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  let creadas = 0
  let omitidas = 0
  let pasadas = 0

  for (const horario of horarios) {
    for (let week = 0; week < semanas; week++) {
      const fecha = getFechaClase(monday, horario.diaSemana, week)

      // No generar clases de días que ya pasaron (ej. el lunes de esta semana si hoy es miércoles)
      if (fecha < hoy) {
        pasadas++
        continue
      }

      const existing = await prisma.clase.findUnique({
        where: { horarioSemanalId_fecha: { horarioSemanalId: horario.id, fecha } },
      })

      if (existing) {
        omitidas++
        continue
      }

      const hInicio = combinarFechaHora(fecha, horario.horaInicio)
      const hFin = combinarFechaHora(fecha, horario.horaFin)

      await prisma.$transaction(async (tx) => {
        const clase = await tx.clase.create({
          data: {
            horarioSemanalId: horario.id,
            fecha,
            horaInicio: hInicio,
            horaFin: hFin,
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

  console.log(
    `Clases generadas: ${creadas} nuevas, ${omitidas} ya existentes, ${pasadas} descartadas por fecha pasada (${horarios.length} horarios activos, ${semanas} semanas)`
  )

  return { creadas, omitidas, pasadas, semanas }
}

// Tope de seguridad para el bucle por fecha (~2 años), evita loops infinitos
const MAX_SEMANAS = 104

// Crea las sesiones de UN horario desde esta semana hasta la fecha `hasta` (inclusive).
// Idempotente: omite las que ya existen y las de días que ya pasaron.
async function crearSesionesHorario(horario, hastaStr) {
  const monday = getMondayOfCurrentWeek()

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const hasta = new Date(hastaStr)
  hasta.setHours(0, 0, 0, 0)

  let creadas = 0
  let omitidas = 0
  let pasadas = 0

  for (let week = 0; week < MAX_SEMANAS; week++) {
    const fecha = getFechaClase(monday, horario.diaSemana, week)

    // Las fechas crecen de forma monótona: si pasamos la fecha tope, terminamos
    if (fecha > hasta) break

    if (fecha < hoy) {
      pasadas++
      continue
    }

    const existing = await prisma.clase.findUnique({
      where: { horarioSemanalId_fecha: { horarioSemanalId: horario.id, fecha } },
    })

    if (existing) {
      omitidas++
      continue
    }

    const hInicio = combinarFechaHora(fecha, horario.horaInicio)
    const hFin = combinarFechaHora(fecha, horario.horaFin)

    await prisma.$transaction(async (tx) => {
      const clase = await tx.clase.create({
        data: {
          horarioSemanalId: horario.id,
          fecha,
          horaInicio: hInicio,
          horaFin: hFin,
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

  return { creadas, omitidas, pasadas }
}

// Genera/extiende las clases de un horario concreto hasta la fecha indicada.
async function generarDesdeHorario(horarioId, hasta) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id: horarioId } })
  if (!horario) return null

  const resultado = await crearSesionesHorario(horario, hasta)
  console.log(
    `Horario ${horarioId}: ${resultado.creadas} clases nuevas hasta ${hasta} (${resultado.omitidas} ya existentes)`
  )
  return resultado
}

// Cancela todas las clases futuras PROGRAMADAS de un horario y genera créditos
// para las reservas confirmadas (misma regla que cancelar una clase suelta).
async function cancelarFuturasDeHorario(horarioId) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const clases = await prisma.clase.findMany({
    where: { horarioSemanalId: horarioId, fecha: { gte: hoy }, estado: 'PROGRAMADA' },
    include: {
      reservas: { where: { estado: 'CONFIRMADA' }, select: { id: true, usuarioId: true } },
    },
  })

  let clasesCanceladas = 0
  let creditosGenerados = 0

  for (const clase of clases) {
    await prisma.$transaction(async (tx) => {
      await tx.clase.update({
        where: { id: clase.id },
        data: { estado: 'CANCELADA', updatedAt: new Date() },
      })

      for (const reserva of clase.reservas) {
        await tx.credito.create({
          data: { usuarioId: reserva.usuarioId, claseId: clase.id, reservaId: reserva.id },
        })
        await tx.reserva.update({
          where: { id: reserva.id },
          data: { estado: 'CANCELADA', fechaCancelacion: new Date(), updatedAt: new Date() },
        })
        creditosGenerados++
      }

      await tx.reserva.updateMany({
        where: { claseId: clase.id, estado: 'PENDIENTE' },
        data: { estado: 'CANCELADA', fechaCancelacion: new Date(), updatedAt: new Date() },
      })
    })
    clasesCanceladas++
  }

  console.log(`Horario ${horarioId}: ${clasesCanceladas} clases futuras canceladas, ${creditosGenerados} créditos`)
  return { clasesCanceladas, creditosGenerados }
}

// Marca como FINALIZADA toda clase que ya pasó (fecha anterior o mismo día pero horaFin vencida)
async function finalizarClasesPasadas() {
  const ahora = new Date()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { count } = await prisma.clase.updateMany({
    where: {
      estado: { in: ['PROGRAMADA', 'EN_CURSO'] },
      OR: [
        { fecha: { lt: hoy } },
        { horaFin: { lt: ahora } },
      ],
    },
    data: { estado: 'FINALIZADA', updatedAt: ahora },
  })

  if (count > 0) {
    console.log(`Clases finalizadas automaticamente: ${count}`)
  }
}

async function listar({ estado, fecha, categoriaId, instructorId, page = 1, limit = 10 }) {
  await finalizarClasesPasadas()

  const where = {}

  if (estado) where.estado = estado

  if (fecha) {
    const d = new Date(fecha)
    d.setHours(0, 0, 0, 0)
    const siguiente = new Date(d)
    siguiente.setDate(d.getDate() + 1)
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
  await limpiarHoldsExpirados()

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

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (clase.fecha < hoy) throw { yaPasada: true }

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

  console.log(`Clase ${id} cancelada: ${creditosGenerados} creditos generados`)

  return { creditosGenerados }
}

module.exports = {
  generar,
  listar,
  obtener,
  cancelar,
  generarDesdeHorario,
  cancelarFuturasDeHorario,
}
