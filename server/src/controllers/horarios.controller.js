const horarioService = require('../services/horario.service')

async function listar(req, res, next) {
  try {
    const horarios = await horarioService.listar()
    res.json({ horarios })
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id)
    const horario = await horarioService.obtener(id)
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' })
    res.json({ horario })
  } catch (error) {
    next(error)
  }
}

async function crear(req, res, next) {
  try {
    const { categoriaId, instructorId, diaSemana, horaInicio, horaFin, capacidadMaxima, minimoParticipantes } = req.body
    const horario = await horarioService.crear({
      categoriaId,
      instructorId,
      diaSemana,
      horaInicio,
      horaFin,
      capacidadMaxima,
      minimoParticipantes,
      createdBy: req.user.id,
    })
    res.status(201).json({ horario })
  } catch (error) {
    if (error.overlap) return res.status(409).json({ error: 'El instructor ya tiene un horario en ese día y hora. Elige otro día, hora o instructor.' })
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ya existe un horario idéntico para ese instructor' })
    if (error.code === 'P2003') return res.status(404).json({ error: 'Categoría o instructor no encontrado' })
    next(error)
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id)
    const horario = await horarioService.actualizar(id, req.body)
    if (!horario) return res.status(404).json({ error: 'Horario no encontrado' })
    res.json({ horario })
  } catch (error) {
    if (error.overlap) return res.status(409).json({ error: 'El instructor ya tiene un horario en ese día y hora. Elige otro día, hora o instructor.' })
    if (error.code === 'P2025') return res.status(404).json({ error: 'Horario no encontrado' })
    if (error.code === 'P2003') return res.status(404).json({ error: 'Categoría o instructor no encontrado' })
    next(error)
  }
}

async function toggleActivo(req, res, next) {
  try {
    const id = Number(req.params.id)
    const resultado = await horarioService.toggleActivo(id)
    if (!resultado) return res.status(404).json({ error: 'Horario no encontrado' })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id)
    await horarioService.eliminar(id)
    res.json({ message: 'Horario eliminado correctamente' })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Horario no encontrado' })
    next(error)
  }
}

module.exports = { listar, obtener, crear, actualizar, toggleActivo, eliminar }
