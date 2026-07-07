const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')
const { hhmm, yyyymmdd, safeId } = require('../lib/helpers')

function formatearInstructor(inst) {
  return {
    id: inst.id,
    usuarioId: inst.usuarioId,
    nombres: inst.usuario.nombres,
    apellidos: inst.usuario.apellidos,
    email: inst.usuario.email,
    telefono: inst.usuario.telefono,
    especialidad: inst.especialidad,
    fotoUrl: inst.usuario.fotoUrl,
    estado: inst.usuario.estado,
  }
}

async function listar(req, res, next) {
  try {
    const instructores = await prisma.instructor.findMany({
      include: { usuario: true },
      orderBy: { usuario: { nombres: 'asc' } },
    })
    res.json({ instructores: instructores.map(formatearInstructor) })
  } catch (error) {
    next(error)
  }
}

async function crear(req, res, next) {
  try {
    const { nombres, apellidos, email, password, telefono, especialidad, fotoUrl } = req.body

    const existeEmail = await prisma.usuario.findUnique({ where: { email } })
    if (existeEmail) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email. Usa otro email o edita el instructor existente.' })
    }

    const rolInstructor = await prisma.role.findUnique({ where: { nombre: 'INSTRUCTOR' } })
    if (!rolInstructor) {
      return res.status(500).json({ error: 'Rol INSTRUCTOR no encontrado' })
    }

    const hash = await bcrypt.hash(password, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        email,
        telefono: telefono || null,
        password: hash,
        fotoUrl: fotoUrl || null,
        rolId: rolInstructor.id,
        instructor: {
          create: { especialidad: especialidad || null },
        },
      },
      include: { instructor: true },
    })

    const instructorCreado = await prisma.instructor.findUnique({
      where: { id: usuario.instructor.id },
      include: { usuario: true },
    })

    res.status(201).json({ instructor: formatearInstructor(instructorCreado) })
  } catch (error) {
    next(error)
  }
}

async function actualizar(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const { nombres, apellidos, email, telefono, especialidad, estado, fotoUrl } = req.body

    const instructor = await prisma.instructor.findUnique({
      where: { id },
      include: { usuario: true },
    })
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' })
    }

    const usuarioData = {}
    if (nombres !== undefined) usuarioData.nombres = nombres
    if (apellidos !== undefined) usuarioData.apellidos = apellidos
    if (fotoUrl !== undefined) usuarioData.fotoUrl = fotoUrl
    if (email !== undefined) {
      const duplicado = await prisma.usuario.findFirst({
        where: { email, NOT: { id: instructor.usuarioId } },
      })
      if (duplicado) {
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario. Elige un email distinto.' })
      }
      usuarioData.email = email
    }
    if (telefono !== undefined) usuarioData.telefono = telefono
    if (estado !== undefined) usuarioData.estado = estado

    if (Object.keys(usuarioData).length > 0) {
      await prisma.usuario.update({
        where: { id: instructor.usuarioId },
        data: usuarioData,
      })
    }

    if (especialidad !== undefined) {
      await prisma.instructor.update({
        where: { id },
        data: { especialidad },
      })
    }

    const actualizado = await prisma.instructor.findUnique({
      where: { id },
      include: { usuario: true },
    })

    res.json({ instructor: formatearInstructor(actualizado) })
  } catch (error) {
    next(error)
  }
}

async function eliminar(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })

    const instructor = await prisma.instructor.findUnique({
      where: { id },
    })
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' })
    }

    // Un instructor con cualquier horario (activo o inactivo) tiene clases, reservas y
    // pagos de clientes colgando de él; eliminarlo perdería historial legítimo. En ese
    // caso solo se debe desactivar. Solo se puede borrar de verdad si no tiene historial.
    const horarios = await prisma.horarioSemanal.count({
      where: { instructorId: id },
    })
    if (horarios > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar: el instructor tiene horarios o clases asociadas. Desactívalo en su lugar.',
      })
    }

    await prisma.usuario.delete({ where: { id: instructor.usuarioId } })
    res.json({ message: 'Instructor eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}

async function toggleEstado(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })

    const instructor = await prisma.instructor.findUnique({
      where: { id },
      include: { usuario: true },
    })
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' })
    }

    const usuario = await prisma.usuario.update({
      where: { id: instructor.usuarioId },
      data: { estado: !instructor.usuario.estado },
    })

    const actualizado = await prisma.instructor.findUnique({
      where: { id },
      include: { usuario: true },
    })

    res.json({ instructor: formatearInstructor(actualizado) })
  } catch (error) {
    next(error)
  }
}

const includeClaseBase = {
  horarioSemanal: {
    select: {
      diaSemana: true,
      categoria: { select: { id: true, nombre: true } },
    },
  },
  _count: { select: { reservas: { where: { estado: 'CONFIRMADA' } } } },
}

function formatearClase(c) {
  return {
    id: c.id,
    fecha: yyyymmdd(c.fecha),
    horaInicio: hhmm(c.horaInicio),
    horaFin: hhmm(c.horaFin),
    estado: c.estado,
    tematica: c.tematica,
    capacidadMaxima: c.capacidadMaxima,
    minimoParticipantes: c.minimoParticipantes,
    inscritos: c._count?.reservas,
    categoria: c.horarioSemanal?.categoria,
    diaSemana: c.horarioSemanal?.diaSemana,
  }
}

async function dashboard(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const ahora = new Date()
    const hoy = new Date(ahora)
    hoy.setHours(0, 0, 0, 0)
    const mañana = new Date(hoy)
    mañana.setDate(hoy.getDate() + 1)

    const [proximaClase, clasesHoy] = await Promise.all([
      prisma.clase.findFirst({
        where: {
          horarioSemanal: { instructorId: instructor.id },
          fecha: { gte: hoy },
          estado: { notIn: ['CANCELADA', 'FINALIZADA'] },
        },
        include: includeClaseBase,
        orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      }),
      prisma.clase.findMany({
        where: {
          horarioSemanal: { instructorId: instructor.id },
          fecha: { gte: hoy, lt: mañana },
          estado: { notIn: ['CANCELADA', 'FINALIZADA'] },
        },
        include: includeClaseBase,
        orderBy: { horaInicio: 'asc' },
      }),
    ])

    res.json({
      proximaClase: proximaClase ? formatearClase(proximaClase) : null,
      clasesHoy: clasesHoy.map(formatearClase),
    })
  } catch (error) {
    next(error)
  }
}

async function misHorarios(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const horarios = await prisma.horarioSemanal.findMany({
      where: { instructorId: instructor.id, activo: true },
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
      orderBy: { diaSemana: 'asc' },
    })

    const formateados = horarios.map(h => ({
      id: h.id,
      diaSemana: h.diaSemana,
      horaInicio: h.horaInicio.toISOString().substring(11, 16),
      horaFin: h.horaFin.toISOString().substring(11, 16),
      capacidadMaxima: h.capacidadMaxima,
      minimoParticipantes: h.minimoParticipantes,
      categoria: h.categoria,
    }))

    res.json({ horarios: formateados })
  } catch (error) {
    next(error)
  }
}

async function misClases(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const ahora = new Date()
    const hoy = new Date(ahora)
    hoy.setHours(0, 0, 0, 0)

    const clases = await prisma.clase.findMany({
      where: {
        horarioSemanal: { instructorId: instructor.id },
        fecha: { gte: hoy },
        estado: { notIn: ['FINALIZADA', 'CANCELADA'] },
      },
      include: includeClaseBase,
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
    })

    res.json({ clases: clases.map(formatearClase) })
  } catch (error) {
    next(error)
  }
}

async function obtenerParticipantes(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const claseId = safeId(req.params.id)
    if (!claseId) return res.status(400).json({ error: 'ID inválido' })

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        horarioSemanal: {
          select: { instructorId: true, categoria: { select: { nombre: true } } },
        },
      },
    })
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' })
    if (clase.horarioSemanal.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'No eres el instructor de esta clase' })
    }

    const reservas = await prisma.reserva.findMany({
      where: { claseId, estado: { not: 'CANCELADA' } },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, email: true } },
        posicionClase: { select: { numero: true } },
      },
      orderBy: { fechaConfirmacion: 'asc' },
    })

    const participantes = reservas.map(r => ({
      id: r.id,
      usuarioId: r.usuario.id,
      nombres: r.usuario.nombres,
      apellidos: r.usuario.apellidos,
      email: r.usuario.email,
      asiento: r.posicionClase?.numero,
      estado: r.estado,
    }))

    res.json({
      clase: {
        id: clase.id,
        fecha: yyyymmdd(clase.fecha),
        horaInicio: hhmm(clase.horaInicio),
        horaFin: hhmm(clase.horaFin),
        capacidadMaxima: clase.capacidadMaxima,
        tematica: clase.tematica,
        estado: clase.estado,
        categoria: clase.horarioSemanal?.categoria?.nombre || null,
      },
      participantes,
    })
  } catch (error) {
    next(error)
  }
}

async function actualizarTematica(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const claseId = safeId(req.params.id)
    if (!claseId) return res.status(400).json({ error: 'ID inválido' })
    const { tematica } = req.body

    if (!tematica || !tematica.trim()) {
      return res.status(400).json({ error: 'Temática es requerida' })
    }

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: { horarioSemanal: { select: { instructorId: true } } },
    })
    if (!clase) return res.status(404).json({ error: 'Clase no encontrada' })
    if (clase.horarioSemanal.instructorId !== instructor.id) {
      return res.status(403).json({ error: 'No eres el instructor de esta clase' })
    }

    const updated = await prisma.clase.update({
      where: { id: claseId },
      data: { tematica: tematica.trim(), updatedAt: new Date() },
    })

    res.json({ tematica: updated.tematica })
  } catch (error) {
    next(error)
  }
}

async function historial(req, res, next) {
  try {
    const instructor = await prisma.instructor.findUnique({ where: { usuarioId: req.user.id } })
    if (!instructor) return res.status(404).json({ error: 'Instructor no encontrado' })

    const clases = await prisma.clase.findMany({
      where: {
        horarioSemanal: { instructorId: instructor.id },
        estado: { in: ['FINALIZADA', 'CANCELADA'] },
      },
      include: includeClaseBase,
      orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }],
    })

    res.json({ clases: clases.map(formatearClase) })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, crear, actualizar, eliminar, toggleEstado, dashboard, misHorarios, misClases, obtenerParticipantes, actualizarTematica, historial }
