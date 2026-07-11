const { env } = require('../config/env')

// ── Validación de IDs ──────────────────────────────────────────
function safeId(raw) {
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

// ── Formateo de fechas/horas ──────────────────────────────────
function hhmm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function hhmmss(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function yyyymmdd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Verificación de clase pasada ──────────────────────────────
function haPasado(clase) {
  const ahora = new Date()
  const hoyStr = yyyymmdd(ahora)
  const ahoraTimeStr = hhmmss(ahora)
  const fechaStr = yyyymmdd(clase.fecha)
  const horaFinStr = hhmmss(clase.horaFin)
  return fechaStr < hoyStr || (fechaStr === hoyStr && horaFinStr < ahoraTimeStr)
}

// ── Verificación de inscripción bloqueada (<2 horas para iniciar) ──
const HORAS_INSCRIPCION = 2
function inscripcionBloqueada(clase) {
  if (haPasado(clase)) return true
  const ahora = new Date()
  const fechaStr = yyyymmdd(clase.fecha)
  const hoyStr = yyyymmdd(ahora)
  if (fechaStr !== hoyStr) return false
  const hInicio = clase.horaInicio instanceof Date ? clase.horaInicio.getHours() : parseInt(String(clase.horaInicio).split(':')[0], 10)
  const mInicio = clase.horaInicio instanceof Date ? clase.horaInicio.getMinutes() : parseInt(String(clase.horaInicio).split(':')[1], 10)
  const inicioClase = new Date(ahora)
  inicioClase.setHours(hInicio, mInicio, 0, 0)
  const diffMs = inicioClase - ahora
  const diffHoras = diffMs / (1000 * 60 * 60)
  return diffHoras < HORAS_INSCRIPCION
}

// ── Formateo de hora "HH:MM" → Date ──────────────────────────
function parsearHora(horaStr) {
  const [h, m] = horaStr.split(':').map(Number)
  const d = new Date(0)
  d.setUTCHours(h, m, 0, 0)
  return d
}

// ── Defaults configurables ────────────────────────────────────
const DEFAULT_CLASE_PRECIO = env.DEFAULT_CLASE_PRECIO || 15
const DEFAULT_MIN_PARTICIPANTES = env.DEFAULT_MIN_PARTICIPANTES || 7
const CLASES_POR_HORARIO = env.CLASES_POR_HORARIO || 4

module.exports = {
  safeId,
  hhmm,
  hhmmss,
  yyyymmdd,
  haPasado,
  inscripcionBloqueada,
  parsearHora,
  DEFAULT_CLASE_PRECIO,
  DEFAULT_MIN_PARTICIPANTES,
  CLASES_POR_HORARIO,
}
