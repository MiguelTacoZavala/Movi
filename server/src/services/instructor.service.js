const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')

const include = {
  usuario: {
    select: {
      nombres: true,
      apellidos: true,
      email: true,
      telefono: true,
      fotoUrl: true,
      estado: true,
    },
  },
}

function formatear(instructor) {
  return {
    id: instructor.id,
    usuarioId: instructor.usuarioId,
    nombres: instructor.usuario.nombres,
    apellidos: instructor.usuario.apellidos,
    email: instructor.usuario.email,
    telefono: instructor.usuario.telefono,
    fotoUrl: instructor.usuario.fotoUrl,
    especialidad: instructor.especialidad,
    estado: instructor.usuario.estado,
    createdAt: instructor.createdAt,
  }
}

async function listar() {
  const instructores = await prisma.instructor.findMany({
    include,
    orderBy: { usuario: { nombres: 'asc' } },
  })
  return instructores.map(formatear)
}

async function obtener(id) {
  const instructor = await prisma.instructor.findUnique({ where: { id }, include })
  return instructor ? formatear(instructor) : null
}

async function crear({ nombres, apellidos, email, telefono, password, especialidad, fotoUrl }) {
  const hash = await bcrypt.hash(password, 10)
  const rolInstructor = await prisma.role.findUnique({ where: { nombre: 'INSTRUCTOR' } })

  const instructor = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: { nombres, apellidos, email, telefono, password: hash, rolId: rolInstructor.id, fotoUrl },
    })
    return tx.instructor.create({
      data: { usuarioId: usuario.id, especialidad },
      include,
    })
  })

  return formatear(instructor)
}

async function actualizar(id, { nombres, apellidos, email, telefono, especialidad, fotoUrl }) {
  const instructor = await prisma.instructor.findUnique({ where: { id } })
  if (!instructor) return null

  const dataUsuario = {}
  if (nombres !== undefined) dataUsuario.nombres = nombres
  if (apellidos !== undefined) dataUsuario.apellidos = apellidos
  if (email !== undefined) dataUsuario.email = email
  if (telefono !== undefined) dataUsuario.telefono = telefono
  if (fotoUrl !== undefined) dataUsuario.fotoUrl = fotoUrl

  const dataInstructor = {}
  if (especialidad !== undefined) dataInstructor.especialidad = especialidad

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(dataUsuario).length > 0) {
      await tx.usuario.update({ where: { id: instructor.usuarioId }, data: dataUsuario })
    }
    return tx.instructor.update({
      where: { id },
      data: { ...dataInstructor, updatedAt: new Date() },
      include,
    })
  })

  return formatear(updated)
}

async function toggleEstado(id) {
  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { usuario: { select: { estado: true } } },
  })
  if (!instructor) return null

  const updated = await prisma.usuario.update({
    where: { id: instructor.usuarioId },
    data: { estado: !instructor.usuario.estado },
  })

  return { estado: updated.estado }
}

module.exports = { listar, obtener, crear, actualizar, toggleEstado }
