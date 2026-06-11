const categoriaService = require('../services/categoria.service')

async function listar(req, res, next) {
  try {
    const categorias = await categoriaService.listar()
    res.json({ categorias })
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id)
    const categoria = await categoriaService.obtener(id)
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json({ categoria })
  } catch (error) {
    next(error)
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion } = req.body
    const categoria = await categoriaService.crear({ nombre, descripcion })
    res.status(201).json({ categoria })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    }
    next(error)
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id)
    const { nombre, descripcion } = req.body
    const categoria = await categoriaService.actualizar(id, { nombre, descripcion })
    res.json({ categoria })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    }
    next(error)
  }
}

async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id)

    const tieneHorarios = await categoriaService.tieneHorarios(id)
    if (tieneHorarios) {
      return res.status(409).json({ error: 'No se puede eliminar: la categoría tiene horarios vinculados' })
    }

    await categoriaService.eliminar(id)
    res.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    next(error)
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar }
