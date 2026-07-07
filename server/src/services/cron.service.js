const cron = require('node-cron')
const prisma = require('../lib/prisma')
const claseService = require('./clase.service')
const { limpiarHoldsExpirados } = require('./reserva.service')
const { CLASES_POR_HORARIO } = require('../lib/helpers')

// Mantener rolling window de clases por horario activo
async function mantenerRollingWindow() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const horarios = await prisma.horarioSemanal.findMany({
    where: { activo: true },
    select: { id: true, diaSemana: true },
  })

  let clasesGeneradas = 0

  for (const horario of horarios) {
    // Contar clases futuras PROGRAMADAS de este horario
    const clasesFuturas = await prisma.clase.count({
      where: {
        horarioSemanalId: horario.id,
        fecha: { gte: hoy },
        estado: 'PROGRAMADA',
      },
    })

    if (clasesFuturas < CLASES_POR_HORARIO) {
      // Generar las clases faltantes hasta tener 4
      const semanasNecesarias = CLASES_POR_HORARIO - clasesFuturas
      const hasta = new Date(hoy)
      hasta.setDate(hoy.getDate() + semanasNecesarias * 7 + 7)
      const fechaHasta = `${hasta.getFullYear()}-${String(hasta.getMonth() + 1).padStart(2, '0')}-${String(hasta.getDate()).padStart(2, '0')}`

      const resultado = await claseService.generarDesdeHorario(horario.id, fechaHasta)
      if (resultado && resultado.creadas > 0) {
        clasesGeneradas += resultado.creadas
      }
    }
  }

  return clasesGeneradas
}

// Tarea principal del cron: ejecuta todos los días a las 3:00 AM (America/Lima)
function iniciarCron() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await claseService.cerrarClasesVencidas()
      await limpiarHoldsExpirados()
      await mantenerRollingWindow()
    } catch (error) {
      console.error('[CRON] Error en mantenimiento:', error)
    }
  }, {
    timezone: 'America/Lima',
  })
}

module.exports = { iniciarCron, mantenerRollingWindow }
