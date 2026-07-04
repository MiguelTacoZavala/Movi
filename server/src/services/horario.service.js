const prisma = require('../lib/prisma')
const claseService = require('./clase.service')

const include = {
  categoria: { select: { id: true, nombre: true } },
  instructor: {
    select: {
      id: true,
      usuario: { select: { nombres: true, apellidos: true } },
    },
  },
}

function formatear(horario) {
  return {
    id: horario.id,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio.toISOString().substring(11, 16),
    horaFin: horario.horaFin.toISOString().substring(11, 16),
    capacidadMaxima: horario.capacidadMaxima,
    minimoParticipantes: horario.minimoParticipantes,
    activo: horario.activo,
    categoria: horario.categoria,
    instructor: {
      id: horario.instructor.id,
      nombres: horario.instructor.usuario.nombres,
      apellidos: horario.instructor.usuario.apellidos,
    },
    createdAt: horario.createdAt,
    updatedAt: horario.updatedAt,
  }
}

function parsearHora(horaStr) {
  const [h, m] = horaStr.split(':').map(Number)
  const d = new Date('1970-01-01T00:00:00.000Z')
  d.setHours(h, m, 0, 0)
  return d
}

async function verificarOverlap({ instructorId, diaSemana, horaInicio, horaFin, excluirId }) {
  const where = {
    instructorId,
    diaSemana,
    horaInicio: { lt: horaFin },
    horaFin: { gt: horaInicio },
  }
  if (excluirId) where.id = { not: excluirId }
  const count = await prisma.horarioSemanal.count({ where })
  return count > 0
}

async function listar() {
  const horarios = await prisma.horarioSemanal.findMany({ include, orderBy: { diaSemana: 'asc' } })

  // Cuántas clases futuras PROGRAMADAS tiene cada horario (para avisar cuando se acaban)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const counts = await prisma.clase.groupBy({
    by: ['horarioSemanalId'],
    where: { fecha: { gte: hoy }, estado: 'PROGRAMADA' },
    _count: { _all: true },
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.horarioSemanalId, c._count._all]))

  return horarios.map((h) => ({ ...formatear(h), proximasClases: countMap[h.id] || 0 }))
}

async function obtener(id) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id }, include })
  return horario ? formatear(horario) : null
}

async function crear({ categoriaId, instructorId, diaSemana, horaInicio: hi, horaFin: hf, capacidadMaxima, minimoParticipantes, generarHasta, createdBy }) {
  const horaInicio = parsearHora(hi)
  const horaFin = parsearHora(hf)

  const overlap = await verificarOverlap({ instructorId, diaSemana, horaInicio, horaFin })
  if (overlap) throw { overlap: true }

  const horario = await prisma.horarioSemanal.create({
    data: {
      categoriaId,
      instructorId,
      diaSemana,
      horaInicio,
      horaFin,
      capacidadMaxima,
      minimoParticipantes: minimoParticipantes ?? 7,
      createdBy,
    },
    include,
  })

  // Automatización: al crear el horario ya quedan generadas sus clases hasta la fecha elegida
  let generacion = null
  if (generarHasta) {
    generacion = await claseService.generarDesdeHorario(horario.id, generarHasta)
  }

  return { horario: { ...formatear(horario), proximasClases: generacion?.creadas ?? 0 }, generacion }
}

// Extiende (genera más) las clases de un horario activo hasta una nueva fecha
async function extender(id, hasta) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id } })
  if (!horario) return null
  if (!horario.activo) throw { inactivo: true }

  return claseService.generarDesdeHorario(id, hasta)
}

async function actualizar(id, { categoriaId, instructorId, diaSemana, horaInicio: hi, horaFin: hf, capacidadMaxima, minimoParticipantes }) {
  const existing = await prisma.horarioSemanal.findUnique({ where: { id } })
  if (!existing) return null

  const horaInicio = hi ? parsearHora(hi) : existing.horaInicio
  const horaFin = hf ? parsearHora(hf) : existing.horaFin
  const resolvedInstructorId = instructorId ?? existing.instructorId
  const resolvedDia = diaSemana ?? existing.diaSemana

  const overlap = await verificarOverlap({
    instructorId: resolvedInstructorId,
    diaSemana: resolvedDia,
    horaInicio,
    horaFin,
    excluirId: id,
  })
  if (overlap) throw { overlap: true }

  const data = { updatedAt: new Date() }
  if (categoriaId !== undefined) data.categoriaId = categoriaId
  if (instructorId !== undefined) data.instructorId = instructorId
  if (diaSemana !== undefined) data.diaSemana = diaSemana
  if (hi !== undefined) data.horaInicio = horaInicio
  if (hf !== undefined) data.horaFin = horaFin
  if (capacidadMaxima !== undefined) data.capacidadMaxima = capacidadMaxima
  if (minimoParticipantes !== undefined) data.minimoParticipantes = minimoParticipantes

  const horario = await prisma.horarioSemanal.update({ where: { id }, data, include })
  return formatear(horario)
}

async function toggleActivo(id, { cancelarFuturas = false } = {}) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id } })
  if (!horario) return null

  const updated = await prisma.horarioSemanal.update({
    where: { id },
    data: { activo: !horario.activo, updatedAt: new Date() },
  })

  // Solo tiene sentido al desactivar: opcionalmente cancelar las clases ya agendadas
  let cancelacion = null
  if (horario.activo && !updated.activo && cancelarFuturas) {
    cancelacion = await claseService.cancelarFuturasDeHorario(id)
  }

  return { id: updated.id, activo: updated.activo, cancelacion }
}

async function eliminar(id) {
  return prisma.$transaction(async (tx) => {
    const horario = await tx.horarioSemanal.findUnique({ where: { id }, select: { id: true } })
    if (!horario) throw { code: 'P2025' }

    // Las clases se borran en cascada (horario → clases → posiciones), pero las
    // reservas referencian clases y posiciones con FK restrictiva. Cancelar una
    // clase no borra sus reservas, así que hay que eliminarlas antes.
    // Al borrar la reserva: sus pagos caen en cascada y sus créditos quedan en NULL.
    const clases = await tx.clase.findMany({ where: { horarioSemanalId: id }, select: { id: true } })
    const claseIds = clases.map((c) => c.id)
    if (claseIds.length) {
      await tx.reserva.deleteMany({ where: { claseId: { in: claseIds } } })
    }

    return tx.horarioSemanal.delete({ where: { id } })
  })
}

module.exports = { listar, obtener, crear, actualizar, toggleActivo, eliminar, extender }
