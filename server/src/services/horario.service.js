const prisma = require('../lib/prisma')

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
  d.setUTCHours(h, m, 0, 0)
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
  return horarios.map(formatear)
}

async function obtener(id) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id }, include })
  return horario ? formatear(horario) : null
}

async function crear({ categoriaId, instructorId, diaSemana, horaInicio: hi, horaFin: hf, capacidadMaxima, minimoParticipantes, createdBy }) {
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
  return formatear(horario)
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

async function toggleActivo(id) {
  const horario = await prisma.horarioSemanal.findUnique({ where: { id } })
  if (!horario) return null
  const updated = await prisma.horarioSemanal.update({
    where: { id },
    data: { activo: !horario.activo, updatedAt: new Date() },
  })
  return { id: updated.id, activo: updated.activo }
}

async function eliminar(id) {
  return prisma.horarioSemanal.delete({ where: { id } })
}

module.exports = { listar, obtener, crear, actualizar, toggleActivo, eliminar }
