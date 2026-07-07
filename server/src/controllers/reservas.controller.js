const reservaService = require('../services/reserva.service')
const { safeId } = require('../lib/helpers')

async function listarMisReservas(req, res, next) {
  try {
    const reservas = await reservaService.listarPorUsuario(req.user.id)
    res.json({ reservas })
  } catch (error) {
    next(error)
  }
}

async function cancelarReserva(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const reserva = await reservaService.cancelar(id, req.user.id)
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' })
    res.json({ reserva })
  } catch (error) {
    if (error.yaCancelada) return res.status(409).json({ error: 'La reserva ya está cancelada' })
    if (error.yaExpirada) return res.status(410).json({ error: 'La reserva expiró y no puede cancelarse' })
    if (error.claseYaPasada) return res.status(409).json({ error: 'No se puede cancelar una reserva de una clase que ya pasó' })
    next(error)
  }
}

module.exports = { listarMisReservas, cancelarReserva }
