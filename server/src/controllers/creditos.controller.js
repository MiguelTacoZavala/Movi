const creditoService = require('../services/credito.service')

async function listarMisCreditos(req, res, next) {
  try {
    const creditos = await creditoService.listarPorUsuario(req.user.id)
    res.json({ creditos })
  } catch (error) {
    next(error)
  }
}

module.exports = { listarMisCreditos }
