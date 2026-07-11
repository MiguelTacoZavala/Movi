const clienteService = require('../services/cliente.service')
const { safeId } = require('../lib/helpers')

async function listar(req, res, next) {
  try {
    const { search, page, limit } = req.query
    const resultado = await clienteService.listar({ search, page, limit })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const cliente = await clienteService.obtener(id)
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ cliente })
  } catch (error) {
    next(error)
  }
}

async function editarCliente(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })

    const cliente = await clienteService.editar(id, req.body)
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })

    res.json({ cliente })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Cliente no encontrado' })
    next(error)
  }
}

async function obtenerEstadisticas(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const resultado = await clienteService.obtenerEstadisticas(id)
    if (!resultado) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(resultado)
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, obtener, editarCliente, obtenerEstadisticas }
