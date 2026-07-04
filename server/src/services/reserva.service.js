const prisma = require('../lib/prisma')

function hhmm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function yyyymmdd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hhmmss(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

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
  const ahora = new Date()
  const hoyStr = yyyymmdd(ahora)
  const ahoraTimeStr = hhmmss(ahora)
  const fechaStr = yyyymmdd(clase.fecha)
  const horaFinStr = hhmmss(clase.horaFin)
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
      fecha: yyyymmdd(reserva.clase.fecha),
      horaInicio: hhmm(reserva.clase.horaInicio),
      horaFin: hhmm(reserva.clase.horaFin),
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

async function limpiarHoldsExpirados() {
  const ahora = new Date()
  const { count } = await prisma.reserva.updateMany({
    where: { estado: 'PENDIENTE', expiracionReserva: { lt: ahora } },
    data: { estado: 'EXPIRADA', updatedAt: ahora },
  })
  return count
}

async function listarPorUsuario(usuarioId) {
  await limpiarHoldsExpirados()

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
  if (reserva.estado === 'EXPIRADA') throw { yaExpirada: true }

  await prisma.$transaction(async (tx) => {
    await tx.reserva.update({
      where: { id: reservaId },
      data: {
        estado: 'CANCELADA',
        fechaCancelacion: new Date(),
        updatedAt: new Date(),
      },
    })

    if (reserva.usoCredito) {
      await tx.credito.updateMany({
        where: { reservaId, usado: true },
        data: { usado: false, fechaUso: null, reservaId: null, claseId: null },
      })
    }
  })

  const updated = await prisma.reserva.findUnique({
    where: { id: reservaId },
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

module.exports = { listarPorUsuario, cancelar, obtenerParticipantes, limpiarHoldsExpirados }
