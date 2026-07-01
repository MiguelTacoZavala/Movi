const dashboardService = require('../services/dashboard.service')

async function adminDashboard(req, res, next) {
  try {
    const resumen = await dashboardService.resumenAdmin()
    res.json(resumen)
  } catch (error) {
    next(error)
  }
}

async function clienteDashboard(req, res, next) {
  try {
    const resumen = await dashboardService.resumenCliente(req.user.id)
    res.json(resumen)
  } catch (error) {
    next(error)
  }
}

module.exports = { adminDashboard, clienteDashboard }
