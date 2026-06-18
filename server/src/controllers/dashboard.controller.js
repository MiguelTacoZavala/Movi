const dashboardService = require('../services/dashboard.service')

async function adminDashboard(req, res, next) {
  try {
    const resumen = await dashboardService.resumenAdmin()
    res.json(resumen)
  } catch (error) {
    next(error)
  }
}

module.exports = { adminDashboard }
