export function formatHoraAMPM(hora) {
  const [h, m] = hora.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function formatFechaBonita(fechaStr) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const [, m, d] = fechaStr.split('-').map(Number)
  return `${d} de ${meses[m - 1]}`
}

export function formatDateStr(date) {
  return date.toISOString().split('T')[0]
}

export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
export const DIAS_SEMANA_MAP = { LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6 }
export const ESTADOS_CLASE = ['PROGRAMADA', 'EN_CURSO', 'CANCELADA', 'FINALIZADA']
export const ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA']
