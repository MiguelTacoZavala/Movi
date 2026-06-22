const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')

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
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' })
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
    const { id } = req.params
    const { nombres, apellidos, email, telefono, especialidad, estado, fotoUrl } = req.body

    const instructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
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
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario' })
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
        where: { id: Number(id) },
        data: { especialidad },
      })
    }

    const actualizado = await prisma.instructor.findUnique({
      where: { id: Number(id) },
      include: { usuario: true },
    })

    res.json({ instructor: formatearInstructor(actualizado) })
  } catch (error) {
    next(error)
  }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params

    const instructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
    })
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor no encontrado' })
    }

    const horarios = await prisma.horarioSemanal.count({
      where: { instructorId: Number(id), activo: true },
    })
    if (horarios > 0) {
      return res.status(409).json({
        error: `No se puede eliminar porque tiene ${horarios} horario(s) activo(s)`,
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
    const { id } = req.params

    const instructor = await prisma.instructor.findUnique({
      where: { id: Number(id) },
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
      where: { id: Number(id) },
      include: { usuario: true },
    })

    res.json({ instructor: formatearInstructor(actualizado) })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, crear, actualizar, eliminar, toggleEstado }
