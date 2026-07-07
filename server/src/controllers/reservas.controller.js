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

async function cambiarAsiento(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const { nuevaPosicionClaseId } = req.body
    if (!nuevaPosicionClaseId) return res.status(400).json({ error: 'nuevaPosicionClaseId es requerido' })
    const reserva = await reservaService.cambiarAsiento(id, req.user.id, nuevaPosicionClaseId)
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' })
    res.json({ reserva })
  } catch (error) {
    if (error.estadoInvalido) return res.status(400).json({ error: 'Solo puedes cambiar asiento de reservas confirmadas' })
    if (error.inscripcionBloqueada) return res.status(409).json({ error: 'No puedes cambiar asiento 2 horas antes de la clase' })
    if (error.posicionInvalida) return res.status(400).json({ error: 'La posición no pertenece a esta clase' })
    if (error.asientoOcupado) return res.status(409).json({ error: 'El asiento seleccionado ya está ocupado' })
    if (error.mismoAsiento) return res.status(400).json({ error: 'El asiento seleccionado es el mismo que el actual' })
    next(error)
  }
}

module.exports = { listarMisReservas, cancelarReserva, cambiarAsiento }
