const prisma = require('../lib/prisma')
const culqiService = require('../services/culqi.service')
const { yyyymmdd, hhmmss, haPasado, inscripcionBloqueada } = require('../lib/helpers')

function generarCodigoPago() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = 'MOV-'
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

function claseHaPasado(clase) {
  return haPasado(clase)
}

function claseInscripcionBloqueada(clase) {
  return inscripcionBloqueada(clase)
}

async function iniciarHold(req, res, next) {
  try {
    const { claseId, posicionClaseId } = req.body
    const usuarioId = req.user.id

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: { horarioSemanal: { include: { categoria: true } } },
    })
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' })
    if (claseHaPasado(clase)) return res.status(409).json({ error: 'La clase ya pasó' })
    if (claseInscripcionBloqueada(clase)) {
      return res.status(409).json({ error: 'Las inscripciones se cierran 2 horas antes de que inicie la clase' })
    }

    const codigoPago = generarCodigoPago()
    const expiracion = new Date(Date.now() + 5 * 60 * 1000)

    const reserva = await prisma.$transaction(async (tx) => {
      const yaTieneReserva = await tx.reserva.findFirst({
        where: { usuarioId, claseId, estado: { in: ['PENDIENTE', 'CONFIRMADA'] } },
      })
      if (yaTieneReserva) {
        throw Object.assign(new Error('Ya tienes una reserva en esta clase'), { statusCode: 409 })
      }

      // Expirar holds vencidos de esta posición
      await tx.reserva.updateMany({
        where: { posicionClaseId, estado: 'PENDIENTE', expiracionReserva: { lt: new Date() } },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })

      // Verificar que la posición no esté ocupada (con lock implícito de transacción)
      const ocupada = await tx.reserva.findFirst({
        where: {
          posicionClaseId,
          estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        },
      })
      if (ocupada) throw Object.assign(new Error('El asiento ya está ocupado'), { statusCode: 409 })

      // Verificar pertenencia a la clase
      const posicion = await tx.posicionClase.findUnique({ where: { id: posicionClaseId } })
      if (!posicion || posicion.claseId !== claseId) {
        throw Object.assign(new Error('Posición no válida'), { statusCode: 400 })
      }

      return tx.reserva.create({
        data: {
          usuarioId,
          claseId,
          posicionClaseId,
          codigoPago,
          estado: 'PENDIENTE',
          expiracionReserva: expiracion,
          usoCredito: false,
        },
      })
    })

    res.status(201).json({
      holdId: reserva.id,
      codigoPago,
      expiracion: expiracion.toISOString(),
    })
  } catch (error) {
    next(error)
  }
}

async function confirmarPago(req, res, next) {
  try {
    const { holdId, tokenId } = req.body
    const usuarioId = req.user.id

    const reserva = await prisma.reserva.findUnique({
      where: { id: holdId },
      include: {
        clase: { include: { horarioSemanal: { include: { categoria: true } } } },
      },
    })

    if (!reserva || reserva.usuarioId !== usuarioId) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }
    if (reserva.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'La reserva ya fue procesada o cancelada' })
    }
    if (claseHaPasado(reserva.clase)) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(409).json({ error: 'La clase ya pasó' })
    }
    if (claseInscripcionBloqueada(reserva.clase)) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(409).json({ error: 'Las inscripciones se cierran 2 horas antes de que inicie la clase' })
    }
    if (reserva.expiracionReserva && new Date() > new Date(reserva.expiracionReserva)) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(410).json({ error: 'El tiempo de reserva expiró' })
    }

    // Re-verificar disponibilidad dentro de una transacción antes de procesar pago
    const seatTaken = await prisma.$transaction(async (tx) => {
      const ocupada = await tx.reserva.findFirst({
        where: {
          posicionClaseId: reserva.posicionClaseId,
          id: { not: holdId },
          estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        },
      })
      return !!ocupada
    })
    if (seatTaken) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(409).json({ error: 'El asiento ya no está disponible' })
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
    const precio = Number(reserva.clase.horarioSemanal.categoria.precio)

    let chargeId = null
    try {
      const cargo = await culqiService.crearCargo({
        tokenId,
        monto: precio,
        email: usuario.email || 'cliente@movi.com',
        descripcion: `${reserva.clase.horarioSemanal.categoria.nombre} - ${yyyymmdd(reserva.clase.fecha)}`,
      })
      chargeId = cargo.chargeId
    } catch {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(402).json({ error: 'Error al procesar el pago con Culqi' })
    }

    await prisma.$transaction([
      prisma.pago.create({
        data: {
          reservaId: holdId,
          metodoPago: 'yape',
          monto: precio,
          estado: 'PAGADO',
          fechaPago: new Date(),
          culqiChargeId: chargeId,
        },
      }),
      prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'CONFIRMADA', fechaConfirmacion: new Date(), updatedAt: new Date() },
      }),
    ])

    res.status(200).json({
      success: true,
      codigoPago: reserva.codigoPago,
      reservaId: holdId,
      monto: precio,
      metodoPago: 'yape',
    })
  } catch (error) {
    next(error)
  }
}

async function procesarPago(req, res, next) {
  try {
    const { claseId, posicionClaseId } = req.body
    const usuarioId = req.user.id

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: { horarioSemanal: { include: { categoria: true } } },
    })
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' })
    if (claseHaPasado(clase)) return res.status(409).json({ error: 'La clase ya pasó' })
    if (claseInscripcionBloqueada(clase)) {
      return res.status(409).json({ error: 'Las inscripciones se cierran 2 horas antes de que inicie la clase' })
    }

    const precio = Number(clase.horarioSemanal.categoria.precio)
    const codigoPago = generarCodigoPago()

    const result = await prisma.$transaction(async (tx) => {
      const yaTieneReserva = await tx.reserva.findFirst({
        where: { usuarioId, claseId, estado: { in: ['PENDIENTE', 'CONFIRMADA'] } },
      })
      if (yaTieneReserva) {
        throw Object.assign(new Error('Ya tienes una reserva en esta clase'), { statusCode: 409 })
      }

      // Verificar disponibilidad dentro de la transacción
      const posicion = await tx.posicionClase.findUnique({ where: { id: posicionClaseId } })
      if (!posicion || posicion.claseId !== claseId) {
        throw Object.assign(new Error('Posición no válida'), { statusCode: 400 })
      }

      const ocupada = await tx.reserva.findFirst({
        where: {
          posicionClaseId,
          estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        },
      })
      if (ocupada) {
        throw Object.assign(new Error('El asiento ya está ocupado'), { statusCode: 409 })
      }

      const credito = await tx.credito.findFirst({
        where: { usuarioId, usado: false },
        orderBy: { fechaCreacion: 'asc' },
      })
      if (!credito) {
        throw Object.assign(new Error('No tienes créditos disponibles'), { statusCode: 402 })
      }

      await tx.credito.update({
        where: { id: credito.id },
        data: { usado: true, fechaUso: new Date(), claseId },
      })

      const reserva = await tx.reserva.create({
        data: {
          usuarioId,
          claseId,
          posicionClaseId,
          codigoPago,
          estado: 'CONFIRMADA',
          fechaConfirmacion: new Date(),
          usoCredito: true,
        },
      })

      await tx.credito.update({
        where: { id: credito.id },
        data: { reservaId: reserva.id },
      })

      await tx.pago.create({
        data: {
          reservaId: reserva.id,
          metodoPago: 'creditos',
          monto: precio,
          estado: 'PAGADO',
          fechaPago: new Date(),
        },
      })

      return { codigoPago, reservaId: reserva.id, monto: precio }
    })

    res.status(201).json({
      success: true,
      ...result,
      metodoPago: 'creditos',
      creditoUsado: true,
    })
  } catch (error) {
    if (error.statusCode === 402) {
      return res.status(402).json({ error: error.message })
    }
    next(error)
  }
}

module.exports = { iniciarHold, confirmarPago, procesarPago }
