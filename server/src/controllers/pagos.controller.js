const prisma = require('../lib/prisma')
const culqiService = require('../services/culqi.service')

function generarCodigoPago() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = 'MOV-'
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

function yyyymmdd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hhmmss(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function claseHaPasado(clase) {
  const ahora = new Date()
  const hoyStr = yyyymmdd(ahora)
  const ahoraTimeStr = hhmmss(ahora)
  const fechaStr = yyyymmdd(clase.fecha)
  const horaFinStr = hhmmss(clase.horaFin)
  return fechaStr < hoyStr || (fechaStr === hoyStr && horaFinStr < ahoraTimeStr)
}

async function verificarDisponibilidad(claseId, posicionClaseId) {
  const ahora = new Date()

  await prisma.reserva.updateMany({
    where: { posicionClaseId, estado: 'PENDIENTE', expiracionReserva: { lt: ahora } },
    data: { estado: 'EXPIRADA', updatedAt: ahora },
  })

  const posicion = await prisma.posicionClase.findUnique({
    where: { id: posicionClaseId },
    include: { reservas: { where: { estado: { notIn: ['CANCELADA', 'EXPIRADA'] } } } },
  })
  if (!posicion || posicion.claseId !== claseId) {
    return { error: 'Posición no válida', status: 400 }
  }
  if (posicion.reservas.length > 0) {
    return { error: 'El asiento ya está ocupado', status: 409 }
  }
  return { ok: true }
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

    const disp = await verificarDisponibilidad(claseId, posicionClaseId)
    if (!disp.ok) return res.status(disp.status).json({ error: disp.error })

    const codigoPago = generarCodigoPago()
    const expiracion = new Date(Date.now() + 5 * 60 * 1000)

    const reserva = await prisma.reserva.create({
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
        posicionClase: { include: { reservas: true } },
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
    if (reserva.expiracionReserva && new Date() > new Date(reserva.expiracionReserva)) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(410).json({ error: 'El tiempo de reserva expiró' })
    }

    const ocupada = reserva.posicionClase.reservas.some(
      (r) => r.id !== holdId && r.estado !== 'CANCELADA' && r.estado !== 'EXPIRADA'
    )
    if (ocupada) {
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
    } catch (culqiError) {
      await prisma.reserva.update({
        where: { id: holdId },
        data: { estado: 'EXPIRADA', updatedAt: new Date() },
      })
      return res.status(402).json({
        error: 'Error al procesar el pago',
        detalle: culqiError.message,
      })
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

    const disp = await verificarDisponibilidad(claseId, posicionClaseId)
    if (!disp.ok) return res.status(disp.status).json({ error: disp.error })

    const precio = Number(clase.horarioSemanal.categoria.precio)
    const codigoPago = generarCodigoPago()

    const result = await prisma.$transaction(async (tx) => {
      const credito = await tx.credito.findFirst({
        where: { usuarioId, usado: false },
        orderBy: { fechaCreacion: 'asc' },
      })
      if (!credito) {
        throw new Error('No tienes créditos disponibles')
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
    if (error.message === 'No tienes créditos disponibles') {
      return res.status(402).json({ error: error.message })
    }
    next(error)
  }
}

module.exports = { iniciarHold, confirmarPago, procesarPago }
