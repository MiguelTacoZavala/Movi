const clienteService = require('../services/cliente.service')

async function listar(req, res, next) {
  try {
    const { search } = req.query
    const clientes = await clienteService.listar({ search })
    res.json({ clientes })
  } catch (error) {
    next(error)
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id)
    const cliente = await clienteService.obtener(id)
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ cliente })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, obtener }
