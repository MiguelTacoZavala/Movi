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

async function procesarPago(req, res, next) {
  try {
    const { tokenId, claseId, posicionClaseId, metodoPago } = req.body
    const usuarioId = req.user.id

    // Validar que la clase existe y obtener precio
    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        horarioSemanal: {
          include: { categoria: true },
        },
      },
    })

    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' })
    }

    const precio = Number(clase.horarioSemanal.categoria.precio)

    // Validar que la posicion existe y está disponible
    const posicion = await prisma.posicionClase.findUnique({
      where: { id: posicionClaseId },
      include: { reservas: true },
    })

    if (!posicion || posicion.claseId !== claseId) {
      return res.status(400).json({ error: 'Posición no válida' })
    }

    const ocupada = posicion.reservas.some(
      (r) => r.estado !== 'CANCELADA' && r.estado !== 'EXPIRADA'
    )
    if (ocupada) {
      return res.status(409).json({ error: 'El asiento ya está ocupado' })
    }

    // Obtener datos del usuario para el email
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })

    // Crear reserva
    const codigoPago = generarCodigoPago()
    const reserva = await prisma.reserva.create({
      data: {
        usuarioId,
        claseId,
        posicionClaseId,
        codigoPago,
        estado: 'PENDIENTE',
        usoCredito: metodoPago === 'creditos',
      },
    })

    // Procesar pago
    let chargeId = null
    let estadoPago = 'PAGADO'

    if (metodoPago === 'yape') {
      if (!tokenId) {
        await prisma.reserva.delete({ where: { id: reserva.id } })
        return res.status(400).json({ error: 'tokenId requerido para pago Yape' })
      }

      try {
        const cargo = await culqiService.crearCargo({
          tokenId,
          monto: precio,
          email: usuario.email || 'cliente@movi.com',
          descripcion: `${clase.horarioSemanal.categoria.nombre} - ${clase.fecha.toISOString().split('T')[0]}`,
        })
        chargeId = cargo.chargeId
      } catch (culqiError) {
        await prisma.reserva.delete({ where: { id: reserva.id } })
        return res.status(402).json({
          error: 'Error al procesar el pago',
          detalle: culqiError.message,
        })
      }
    }

    // Crear registro de pago
    await prisma.pago.create({
      data: {
        reservaId: reserva.id,
        metodoPago,
        monto: precio,
        estado: estadoPago,
        fechaPago: new Date(),
        culqiChargeId: chargeId,
      },
    })

    // Actualizar reserva a CONFIRMADA
    await prisma.reserva.update({
      where: { id: reserva.id },
      data: { estado: 'CONFIRMADA', fechaConfirmacion: new Date() },
    })

    res.status(201).json({
      success: true,
      codigoPago,
      reservaId: reserva.id,
      monto: precio,
      metodoPago,
      chargeId,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { procesarPago }
