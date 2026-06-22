const claseService = require('../services/clase.service')

async function generar(req, res, next) {
  try {
    const { semanas } = req.body
    const resultado = await claseService.generar({ semanas })
    res.status(201).json(resultado)
  } catch (error) {
    next(error)
  }
}

async function listar(req, res, next) {
  try {
    const { estado, fecha, categoriaId, instructorId, page, limit } = req.query
    const resultado = await claseService.listar({ estado, fecha, categoriaId, instructorId, page, limit })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id)
    const clase = await claseService.obtener(id)
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' })
    res.json({ clase })
  } catch (error) {
    next(error)
  }
}

async function cancelar(req, res, next) {
  try {
    const id = Number(req.params.id)
    const resultado = await claseService.cancelar(id)
    if (!resultado) return res.status(404).json({ error: 'Clase no encontrada' })
    res.json({ message: 'Clase cancelada correctamente', ...resultado })
  } catch (error) {
    if (error.yaCancelada) return res.status(409).json({ error: 'La clase ya está cancelada' })
    if (error.yaFinalizada) return res.status(409).json({ error: 'No se puede cancelar una clase finalizada' })
    next(error)
  }
}

module.exports = { generar, listar, obtener, cancelar }
