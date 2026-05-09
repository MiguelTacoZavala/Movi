const SALONES = [
  { id: 1, nombre: 'Salón Principal', capacidad: 30, filas: 5, columnas: 6 },
  { id: 2, nombre: 'Salón 2', capacidad: 20, filas: 4, columnas: 5 },
  { id: 3, nombre: 'Salón 3', capacidad: 25, filas: 5, columnas: 5 },
  { id: 4, nombre: 'Salón VIP', capacidad: 15, filas: 3, columnas: 5 },
]

function salonId(nombre) {
  return SALONES.find(s => s.nombre === nombre)?.id || 1
}

const CATEGORIAS = [
  {
    nombre: 'Salsa',
    icon: 'Flame',
    color: '#E74C3C',
    bgColor: '#FEF2F2',
    gradient: 'linear-gradient(135deg, #E74C3C, #c0392b)',
    desc: 'Ritmo y energía',
  },
  {
    nombre: 'Bachata',
    icon: 'Heart',
    color: '#27AE60',
    bgColor: '#F0FDF4',
    gradient: 'linear-gradient(135deg, #27AE60, #1e8449)',
    desc: 'Romántica y sensual',
  },
  {
    nombre: 'Tango',
    icon: 'Drama',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    desc: 'Pasión y elegancia',
  },
]

function generarAsientos(capacidad, filas, columnas, ocupados) {
  const asientos = []
  const ocupadosSet = new Set(ocupados)
  let idx = 0
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (idx >= capacidad) break
      const num = idx + 1
      asientos.push({
        id: num,
        numero: num,
        fila: f + 1,
        columna: c + 1,
        estado: ocupadosSet.has(num) ? 'ocupado' : 'disponible',
      })
      idx++
    }
    if (idx >= capacidad) break
  }
  return asientos
}

const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

function formatFecha(fecha) {
  const dia = DIAS[fecha.getDay()]
  const numero = fecha.getDate().toString().padStart(2, '0')
  return { dia, numero, full: fecha.toISOString().split('T')[0] }
}

function formatHoraAMPM(hora) {
  const [h, m] = hora.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function generarProximosDias() {
  const hoy = new Date()
  const dias = []
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    dias.push(fecha)
  }
  return dias
}

function generarClases() {
  const hoy = new Date()
  const clases = []
  let id = 1

  const addClase = (categoria, instructor, dayOffset, horaInicio, horaFin, capacidad, inscritos, salon) => {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + dayOffset)
    const fechaStr = fecha.toISOString().split('T')[0]
    const salonData = SALONES.find(s => s.nombre === salon)
    const indices = new Set()
    while (indices.size < inscritos && indices.size < capacidad) {
      indices.add(Math.floor(Math.random() * capacidad) + 1)
    }
    const asientos = generarAsientos(capacidad, salonData.filas, salonData.columnas, [...indices])
    clases.push({
      id: id++,
      categoria,
      instructor,
      instructorFoto: `https://i.pravatar.cc/150?u=${instructor.replace(/\s+/g, '-')}`,
      especialidad: categoria,
      fecha: fechaStr,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      salon,
      salonId: salonData.id,
      capacidad_maxima: capacidad,
      inscritos,
      minimo_participantes: 7,
      asientos,
      estado: inscritos >= capacidad ? 'COMPLETA' : 'PROGRAMADA',
    })
  }

  // ── Salsa ──
  addClase('Salsa', 'María García', 0, '10:00', '11:30', 30, 25, 'Salón Principal')
  addClase('Salsa', 'María García', 1, '10:00', '11:30', 30, 18, 'Salón Principal')
  addClase('Salsa', 'Pedro Ruiz', 2, '16:00', '17:30', 25, 20, 'Salón 2')
  addClase('Salsa', 'María García', 2, '19:00', '20:30', 35, 8, 'Salón Principal')
  addClase('Salsa', 'Pedro Ruiz', 3, '09:00', '10:30', 20, 6, 'Salón 2')
  addClase('Salsa', 'Carmen Vega', 4, '11:00', '12:30', 25, 22, 'Salón 3')
  addClase('Salsa', 'María García', 5, '10:00', '11:30', 30, 14, 'Salón Principal')

  // ── Bachata ──
  addClase('Bachata', 'Carlos López', 0, '14:00', '15:30', 20, 18, 'Salón 2')
  addClase('Bachata', 'Laura Vega', 1, '18:00', '19:30', 20, 10, 'Salón Principal')
  addClase('Bachata', 'Carlos López', 2, '14:00', '15:30', 20, 7, 'Salón 2')
  addClase('Bachata', 'Laura Vega', 3, '18:00', '19:30', 20, 15, 'Salón Principal')
  addClase('Bachata', 'Carlos López', 3, '20:00', '21:30', 25, 4, 'Salón 2')
  addClase('Bachata', 'Andrés Ríos', 4, '15:00', '16:30', 18, 12, 'Salón VIP')
  addClase('Bachata', 'Laura Vega', 5, '18:00', '19:30', 20, 17, 'Salón Principal')

  // ── Tango ──
  addClase('Tango', 'Ana Martínez', 0, '18:00', '19:30', 15, 5, 'Salón VIP')
  addClase('Tango', 'Ana Martínez', 1, '18:00', '19:30', 15, 9, 'Salón VIP')
  addClase('Tango', 'Roberto Díaz', 2, '11:00', '12:30', 20, 3, 'Salón Principal')
  addClase('Tango', 'Ana Martínez', 3, '18:00', '19:30', 15, 12, 'Salón VIP')
  addClase('Tango', 'Roberto Díaz', 4, '11:00', '12:30', 20, 7, 'Salón Principal')
  addClase('Tango', 'Valentina Suárez', 5, '17:00', '18:30', 15, 6, 'Salón VIP')
  addClase('Tango', 'Ana Martínez', 6, '18:00', '19:30', 15, 11, 'Salón VIP')

  return clases
}

const mockClases = generarClases()
const diasSemana = generarProximosDias()

function isWithinReservationWindow(fecha, horaInicio) {
  const classStart = new Date(fecha + 'T' + horaInicio)
  const diffHours = (classStart - new Date()) / (1000 * 60 * 60)
  return diffHours >= 3
}

function checkMinParticipants(clase) {
  if (isWithinReservationWindow(clase.fecha, clase.hora_inicio)) return null
  if (clase.inscritos >= (clase.minimo_participantes || 7)) return 'CONFIRMADA'
  return 'CANCELADA'
}

function claseDisponible(clase) {
  if (!isWithinReservationWindow(clase.fecha, clase.hora_inicio)) return false
  const autoEstado = checkMinParticipants(clase)
  return autoEstado !== 'CANCELADA'
}

export {
  SALONES,
  CATEGORIAS,
  mockClases,
  diasSemana,
  isWithinReservationWindow,
  checkMinParticipants,
  claseDisponible,
  formatFecha,
  formatHoraAMPM,
  generarAsientos,
  salonId,
}
