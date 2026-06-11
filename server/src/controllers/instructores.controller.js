const instructorService = require('../services/instructor.service')

async function listar(req, res, next) {
  try {
    const instructores = await instructorService.listar()
    res.json({ instructores })
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id)
    const instructor = await instructorService.obtener(id)
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })
    res.json({ instructor })
  } catch (error) {
    next(error)
  }
}

async function crear(req, res, next) {
  try {
    const { nombres, apellidos, email, telefono, password, especialidad } = req.body
    const fotoUrl = req.file ? `/uploads/instructores/${req.file.filename}` : undefined

    const instructor = await instructorService.crear({
      nombres, apellidos, email, telefono, password, especialidad, fotoUrl,
    })
    res.status(201).json({ instructor })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El email o teléfono ya está registrado' })
    }
    next(error)
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { nombres, apellidos, email, telefono, especialidad } = req.body
    const fotoUrl = req.file ? `/uploads/instructores/${req.file.filename}` : undefined

    const instructor = await instructorService.actualizar(id, {
      nombres, apellidos, email, telefono, especialidad, fotoUrl,
    })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })
    res.json({ instructor })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'El email o teléfono ya está registrado' })
    }
    next(error)
  }
}

async function toggleEstado(req, res, next) {
  try {
    const id = Number(req.params.id)
    const result = await instructorService.toggleEstado(id)
    if (!result) return res.status(404).json({ error: 'Instructor no encontrado' })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, obtener, crear, actualizar, toggleEstado }
