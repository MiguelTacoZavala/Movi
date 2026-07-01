const notificacionService = require('../services/notificacion.service')

async function listarNotificaciones(req, res, next) {
  try {
    const notificaciones = await notificacionService.listarPorUsuario(req.user.id)
    res.json({ notificaciones })
  } catch (error) {
    next(error)
  }
}

async function marcarLeida(req, res, next) {
  try {
    const id = Number(req.params.id)
    const resultado = await notificacionService.marcarLeida(id, req.user.id)
    if (!resultado) return res.status(404).json({ error: 'Notificación no encontrada' })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

module.exports = { listarNotificaciones, marcarLeida }
