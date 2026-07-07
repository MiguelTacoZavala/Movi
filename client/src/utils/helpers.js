export function formatHoraAMPM(hora) {
  if (!hora || typeof hora !== 'string') return '--'
  const [h, m] = hora.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return '--'
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function formatFechaBonita(fechaStr) {
  if (!fechaStr || typeof fechaStr !== 'string') return '--'
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const [, m, d] = fechaStr.split('-').map(Number)
  if (isNaN(m) || isNaN(d) || !meses[m - 1]) return '--'
  return `${d} de ${meses[m - 1]}`
}

export function formatDateStr(date) {
  return date.toISOString().split('T')[0]
}

export function inscripcionBloqueada(clase) {
  if (!clase?.fecha || !clase?.horaInicio) return false
  const ahora = new Date()
  const hoyStr = ahora.toISOString().split('T')[0]
  if (clase.fecha < hoyStr) return true
  if (clase.fecha > hoyStr) return false
  const [h, m] = clase.horaInicio.split(':').map(Number)
  const inicio = new Date(ahora)
  inicio.setHours(h, m, 0, 0)
  const diffHoras = (inicio - ahora) / (1000 * 60 * 60)
  return diffHoras < 2
}

// Construye un mensaje de error claro a partir de la respuesta del backend.
// Si hay detalles de validación (campo + motivo), los lista; si no, usa el mensaje general.
export function mensajeError(err, fallback = 'Ocurrió un error. Inténtalo de nuevo.') {
  const detalles = err?.data?.detalles
  if (Array.isArray(detalles) && detalles.length > 0) {
    return detalles.map((d) => (d.campo ? `${d.campo}: ${d.mensaje}` : d.mensaje)).join(' · ')
  }
  return err?.message || fallback
}

export const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
export const DIAS_SEMANA_MAP = { LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6 }
export const ESTADOS_CLASE = ['PROGRAMADA', 'EN_CURSO', 'CANCELADA', 'FINALIZADA']
export const ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA']
