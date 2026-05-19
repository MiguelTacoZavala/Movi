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

const instructores = [
  { id: 1, nombre: 'María García', especialidad: 'Salsa', contacto: '999888777', foto: '', estado: 'Activo' },
  { id: 2, nombre: 'Carlos López', especialidad: 'Bachata', contacto: '999777666', foto: '', estado: 'Activo' },
  { id: 3, nombre: 'Ana Martínez', especialidad: 'Tango', contacto: '999666555', foto: '', estado: 'Inactivo' },
  { id: 4, nombre: 'Pedro Ruiz', especialidad: 'Urbano', contacto: '999555444', foto: '', estado: 'Activo' },
  { id: 5, nombre: 'Laura Vega', especialidad: 'Zumba', contacto: '999444333', foto: '', estado: 'Activo' },
]

const categorias = [
  { id: 1, nombre: 'Salsa', descripcion: 'Ritmo y energía' },
  { id: 2, nombre: 'Bachata', descripcion: 'Romántica y sensual' },
  { id: 3, nombre: 'Tango', descripcion: 'Pasión y elegancia' },
]

function formatHoraAMPM(hora) {
  const [h, m] = hora.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - ((day + 6) % 7)
  d.setDate(diff)
  return d
}

function formatDateStr(date) {
  return date.toISOString().split('T')[0]
}

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

function generarProximosDias() {
  const hoy = new Date()
  const diaSem = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((diaSem + 6) % 7))
  const dias = []
  for (let i = 0; i < 6; i++) {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
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
      tematica: 'LIBRE',
      estado: inscritos >= capacidad ? 'COMPLETA' : 'PROGRAMADA',
    })
  }

  addClase('Salsa', 'María García', 0, '10:00', '11:30', 30, 25, 'Salón Principal')
  addClase('Salsa', 'María García', 1, '10:00', '11:30', 30, 18, 'Salón Principal')
  addClase('Salsa', 'Pedro Ruiz', 2, '16:00', '17:30', 25, 20, 'Salón 2')
  addClase('Salsa', 'María García', 2, '19:00', '20:30', 35, 8, 'Salón Principal')
  addClase('Salsa', 'Pedro Ruiz', 3, '09:00', '10:30', 20, 6, 'Salón 2')
  addClase('Salsa', 'Carmen Vega', 4, '11:00', '12:30', 25, 22, 'Salón 3')
  addClase('Salsa', 'María García', 5, '10:00', '11:30', 30, 14, 'Salón Principal')

  addClase('Bachata', 'Carlos López', 0, '14:00', '15:30', 20, 18, 'Salón 2')
  addClase('Bachata', 'Laura Vega', 1, '18:00', '19:30', 20, 10, 'Salón Principal')
  addClase('Bachata', 'Carlos López', 2, '14:00', '15:30', 20, 7, 'Salón 2')
  addClase('Bachata', 'Laura Vega', 3, '18:00', '19:30', 20, 15, 'Salón Principal')
  addClase('Bachata', 'Carlos López', 3, '20:00', '21:30', 25, 4, 'Salón 2')
  addClase('Bachata', 'Andrés Ríos', 4, '15:00', '16:30', 18, 12, 'Salón VIP')
  addClase('Bachata', 'Laura Vega', 5, '18:00', '19:30', 20, 17, 'Salón Principal')

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

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
const DIAS_SEMANA_MAP = { LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6 }

const ESTADOS_CLASE = ['PROGRAMADA', 'EN_CURSO', 'CANCELADA', 'FINALIZADA']
const ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA']

let nextHorarioId = 1
let nextClaseId = 100

function generarPosiciones(capacidad) {
  const posiciones = []
  for (let i = 1; i <= capacidad; i++) {
    posiciones.push({ id: i, numero: i, estado: 'disponible' })
  }
  return posiciones
}

function generarClasesDesdeHorarios(horarios, semanas = 4) {
  const hoy = new Date()
  const clases = []
  let id = nextClaseId

  for (const horario of horarios) {
    if (!horario.activo) continue

    const targetDay = DIAS_SEMANA_MAP[horario.dia_semana]
    const hoyDay = hoy.getDay()
    const diff = targetDay - hoyDay
    const firstDate = new Date(hoy)
    firstDate.setDate(hoy.getDate() + (diff >= 0 ? diff : diff + 7))

    for (let w = 0; w < semanas; w++) {
      const fecha = new Date(firstDate)
      fecha.setDate(firstDate.getDate() + w * 7)
      const fechaStr = formatDateStr(fecha)
      const instructor = instructores.find(i => i.id === horario.instructorId)
      const categoria = categorias.find(c => c.id === horario.categoriaId)
      const ocupadosRandom = Math.floor(Math.random() * (horario.capacidad_maxima + 1))
      const posiciones = generarPosiciones(horario.capacidad_maxima)

      const posicionesOcupadas = new Set()
      while (posicionesOcupadas.size < ocupadosRandom && posicionesOcupadas.size < horario.capacidad_maxima) {
        posicionesOcupadas.add(Math.floor(Math.random() * horario.capacidad_maxima) + 1)
      }
      for (const p of posiciones) {
        if (posicionesOcupadas.has(p.numero)) p.estado = 'ocupado'
      }

      clases.push({
        id: id++,
        horario_semanal_id: horario.id,
        instructorId: horario.instructorId,
        instructor: instructor?.nombre || '',
        instructorFoto: `https://i.pravatar.cc/150?u=${(instructor?.nombre || '').replace(/\s+/g, '-')}`,
        categoriaId: horario.categoriaId,
        categoria: categoria?.nombre || '',
        fecha: fechaStr,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        capacidad_maxima: horario.capacidad_maxima,
        minimo_participantes: horario.minimo_participantes,
        inscritos: ocupadosRandom,
        tematica: 'LIBRE',
        estado: 'PROGRAMADA',
        posiciones,
      })
    }
  }

  return clases
}

const mockHorariosSemanales = [
  {
    id: nextHorarioId++,
    instructorId: 1,
    instructorNombre: 'María García',
    categoriaId: 1,
    categoriaNombre: 'Salsa',
    dia_semana: 'LUNES',
    hora_inicio: '10:00',
    hora_fin: '11:30',
    capacidad_maxima: 30,
    minimo_participantes: 10,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 1,
    instructorNombre: 'María García',
    categoriaId: 1,
    categoriaNombre: 'Salsa',
    dia_semana: 'MIERCOLES',
    hora_inicio: '10:00',
    hora_fin: '11:30',
    capacidad_maxima: 30,
    minimo_participantes: 10,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 1,
    instructorNombre: 'María García',
    categoriaId: 1,
    categoriaNombre: 'Salsa',
    dia_semana: 'VIERNES',
    hora_inicio: '10:00',
    hora_fin: '11:30',
    capacidad_maxima: 30,
    minimo_participantes: 10,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 2,
    instructorNombre: 'Carlos López',
    categoriaId: 2,
    categoriaNombre: 'Bachata',
    dia_semana: 'LUNES',
    hora_inicio: '14:00',
    hora_fin: '15:30',
    capacidad_maxima: 20,
    minimo_participantes: 8,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 2,
    instructorNombre: 'Carlos López',
    categoriaId: 2,
    categoriaNombre: 'Bachata',
    dia_semana: 'MIERCOLES',
    hora_inicio: '14:00',
    hora_fin: '15:30',
    capacidad_maxima: 20,
    minimo_participantes: 8,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 3,
    instructorNombre: 'Ana Martínez',
    categoriaId: 3,
    categoriaNombre: 'Tango',
    dia_semana: 'MARTES',
    hora_inicio: '18:00',
    hora_fin: '19:30',
    capacidad_maxima: 15,
    minimo_participantes: 5,
    activo: true,
  },
  {
    id: nextHorarioId++,
    instructorId: 3,
    instructorNombre: 'Ana Martínez',
    categoriaId: 3,
    categoriaNombre: 'Tango',
    dia_semana: 'JUEVES',
    hora_inicio: '18:00',
    hora_fin: '19:30',
    capacidad_maxima: 15,
    minimo_participantes: 5,
    activo: true,
  },
]

let mockClasesGeneradas = generarClasesDesdeHorarios(mockHorariosSemanales, 4)
nextClaseId = mockClasesGeneradas.reduce((max, c) => Math.max(max, c.id), 100) + 1

function generarPosicionesOcupadas(capacidad, ocupados) {
  const posiciones = []
  const ocupadosSet = new Set()
  while (ocupadosSet.size < ocupados && ocupadosSet.size < capacidad) {
    ocupadosSet.add(Math.floor(Math.random() * capacidad) + 1)
  }
  for (let i = 1; i <= capacidad; i++) {
    posiciones.push({ id: i, numero: i, estado: ocupadosSet.has(i) ? 'ocupado' : 'disponible' })
  }
  return posiciones
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return formatDateStr(d)
}

const hoy = formatDateStr(new Date())
const demoClases = [
  {
    id: nextClaseId++, instructorId: 1, instructor: 'María García',
    instructorFoto: 'https://i.pravatar.cc/150?u=Maria-Garcia',
    categoriaId: 1, categoria: 'Salsa',
    fecha: hoy, hora_inicio: '14:00', hora_fin: '15:30',
    capacidad_maxima: 30, minimo_participantes: 7, inscritos: 22,
    tematica: 'LIBRE', estado: 'PROGRAMADA', posiciones: generarPosicionesOcupadas(30, 22),
  },
  {
    id: nextClaseId++, instructorId: 1, instructor: 'María García',
    instructorFoto: 'https://i.pravatar.cc/150?u=Maria-Garcia',
    categoriaId: 1, categoria: 'Salsa',
    fecha: hoy, hora_inicio: '16:00', hora_fin: '17:30',
    capacidad_maxima: 30, minimo_participantes: 7, inscritos: 15,
    tematica: 'LIBRE', estado: 'PROGRAMADA', posiciones: generarPosicionesOcupadas(30, 15),
  },
  {
    id: nextClaseId++, instructorId: 1, instructor: 'María García',
    instructorFoto: 'https://i.pravatar.cc/150?u=Maria-Garcia',
    categoriaId: 1, categoria: 'Salsa',
    fecha: addDays(hoy, -1), hora_inicio: '14:00', hora_fin: '15:30',
    capacidad_maxima: 30, minimo_participantes: 7, inscritos: 25,
    tematica: 'LIBRE', estado: 'FINALIZADA', posiciones: generarPosicionesOcupadas(30, 25),
  },
  {
    id: nextClaseId++, instructorId: 1, instructor: 'María García',
    instructorFoto: 'https://i.pravatar.cc/150?u=Maria-Garcia',
    categoriaId: 1, categoria: 'Salsa',
    fecha: addDays(hoy, -2), hora_inicio: '14:00', hora_fin: '15:30',
    capacidad_maxima: 30, minimo_participantes: 7, inscritos: 20,
    tematica: 'LIBRE', estado: 'FINALIZADA', posiciones: generarPosicionesOcupadas(30, 20),
  },
  {
    id: nextClaseId++, instructorId: 1, instructor: 'María García',
    instructorFoto: 'https://i.pravatar.cc/150?u=Maria-Garcia',
    categoriaId: 1, categoria: 'Salsa',
    fecha: addDays(hoy, -3), hora_inicio: '10:00', hora_fin: '11:30',
    capacidad_maxima: 30, minimo_participantes: 7, inscritos: 8,
    tematica: 'LIBRE', estado: 'CANCELADA', posiciones: generarPosicionesOcupadas(30, 8),
  },
]
mockClasesGeneradas.push(...demoClases)

let mockReservas = []
let mockCreditos = []
let mockNotificaciones = []

function formatFechaBonita(fechaStr) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const [, m, d] = fechaStr.split('-').map(Number)
  return `${d} de ${meses[m - 1]}`
}

function generarCodigoPago() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = 'MOV-'
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

function setTematica(claseId, nuevaTematica) {
  const clase = mockClasesGeneradas.find(c => c.id === claseId)
  if (clase) {
    clase.tematica = nuevaTematica
  }
}

function addReserva(data) {
  const nuevaReserva = {
    id: Date.now(),
    ...data,
    codigoPago: generarCodigoPago(),
    createdAt: new Date().toISOString(),
  }
  mockReservas.push(nuevaReserva)
  return nuevaReserva
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
  instructores,
  categorias,
  mockHorariosSemanales,
  mockClasesGeneradas,
  mockReservas,
  mockCreditos,
  mockNotificaciones,
  DIAS_SEMANA,
  DIAS_SEMANA_MAP,
  ESTADOS_CLASE,
  ESTADOS_RESERVA,
  generarClasesDesdeHorarios,
  formatDateStr,
  formatFechaBonita,
  getMonday,
  setTematica,
  addReserva,
  generarCodigoPago,
  nextHorarioId,
  nextClaseId,
}
