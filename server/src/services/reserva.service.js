const prisma = require('../lib/prisma')

const includeClase = {
  clase: {
    select: {
      id: true,
      fecha: true,
      horaInicio: true,
      horaFin: true,
      estado: true,
      capacidadMaxima: true,
      tematica: true,
      horarioSemanal: {
        select: {
          diaSemana: true,
          categoria: { select: { id: true, nombre: true } },
          instructor: {
            select: { id: true, usuario: { select: { nombres: true, apellidos: true } } },
          },
        },
      },
    },
  },
  posicionClase: { select: { id: true, numero: true } },
  pago: { select: { monto: true, metodoPago: true } },
}

function haPasado(clase) {
  const ahora = new Date().toISOString()
  const hoyStr = ahora.substring(0, 10)
  const ahoraTimeStr = ahora.substring(11, 19)
  const fechaStr = clase.fecha.toISOString().substring(0, 10)
  const horaFinStr = clase.horaFin.toISOString().substring(11, 19)
  return fechaStr < hoyStr || (fechaStr === hoyStr && horaFinStr < ahoraTimeStr)
}

function formatear(reserva) {
  const base = {
    id: reserva.id,
    codigoPago: reserva.codigoPago,
    estado: reserva.estado,
    estadoDisplay: reserva.estado === 'CONFIRMADA' && haPasado(reserva.clase)
      ? 'FINALIZADA'
      : reserva.estado,
    fechaReserva: reserva.fechaReserva,
    expiracionReserva: reserva.expiracionReserva,
    fechaConfirmacion: reserva.fechaConfirmacion,
    usoCredito: reserva.usoCredito,
    monto: reserva.pago ? Number(reserva.pago.monto) : null,
    metodoPago: reserva.pago?.metodoPago || null,
    asiento: reserva.posicionClase?.numero,
    clase: {
      id: reserva.clase.id,
      fecha: reserva.clase.fecha.toISOString().substring(0, 10),
      horaInicio: reserva.clase.horaInicio.toISOString().substring(11, 16),
      horaFin: reserva.clase.horaFin.toISOString().substring(11, 16),
      estado: reserva.clase.estado,
      capacidadMaxima: reserva.clase.capacidadMaxima,
      tematica: reserva.clase.tematica,
      categoria: reserva.clase.horarioSemanal?.categoria,
      instructor: reserva.clase.horarioSemanal?.instructor
        ? {
            id: reserva.clase.horarioSemanal.instructor.id,
            nombres: reserva.clase.horarioSemanal.instructor.usuario.nombres,
            apellidos: reserva.clase.horarioSemanal.instructor.usuario.apellidos,
          }
        : undefined,
    },
  }
  return base
}

async function listarPorUsuario(usuarioId) {
  const reservas = await prisma.reserva.findMany({
    where: { usuarioId },
    include: includeClase,
    orderBy: { fechaReserva: 'desc' },
  })
  return reservas.map(formatear)
}

async function cancelar(reservaId, usuarioId) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  })
  if (!reserva) return null
  if (reserva.usuarioId !== usuarioId) return null
  if (reserva.estado === 'CANCELADA') throw { yaCancelada: true }

  const updated = await prisma.reserva.update({
    where: { id: reservaId },
    data: {
      estado: 'CANCELADA',
      fechaCancelacion: new Date(),
      updatedAt: new Date(),
    },
    include: includeClase,
  })
  return formatear(updated)
}

async function obtenerParticipantes(claseId) {
  const reservas = await prisma.reserva.findMany({
    where: { claseId, estado: { not: 'CANCELADA' } },
    include: {
      usuario: { select: { id: true, nombres: true, apellidos: true, email: true } },
      posicionClase: { select: { numero: true } },
    },
    orderBy: { fechaConfirmacion: 'asc' },
  })

  return reservas.map(r => ({
    id: r.id,
    usuarioId: r.usuario.id,
    nombres: r.usuario.nombres,
    apellidos: r.usuario.apellidos,
    email: r.usuario.email,
    asiento: r.posicionClase?.numero,
    estado: r.estado,
    fechaConfirmacion: r.fechaConfirmacion,
  }))
}

module.exports = { listarPorUsuario, cancelar, obtenerParticipantes }
