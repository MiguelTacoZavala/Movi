const reservaService = require('../services/reserva.service')

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
    const id = Number(req.params.id)
    const reserva = await reservaService.cancelar(id, req.user.id)
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' })
    res.json({ reserva })
  } catch (error) {
    if (error.yaCancelada) return res.status(409).json({ error: 'La reserva ya está cancelada' })
    next(error)
  }
}

module.exports = { listarMisReservas, cancelarReserva }
