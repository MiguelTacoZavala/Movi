const prisma = require('../lib/prisma')
const bcrypt = require('bcryptjs')

async function crearUsuario({ nombres, apellidos, email, dni, telefono, password, rolId }) {
  const hash = await bcrypt.hash(password, 10)

  const usuario = await prisma.usuario.create({
    data: {
      nombres,
      apellidos,
      email,
      dni,
      telefono,
      password: hash,
      rolId,
    },
    include: { role: true },
  })

  return usuario
}

async function buscarPorIdentificador(identifier) {
  return prisma.usuario.findFirst({
    where: {
      OR: [
        { email: identifier },
        { dni: identifier },
        { telefono: identifier },
      ],
    },
    include: { role: true, instructor: true },
  })
}

async function verificarPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function formatearUsuario(usuario) {
  return {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    rol: usuario.role.nombre.toLowerCase(),
    email: usuario.email,
    dni: usuario.dni,
    telefono: usuario.telefono,
    contacto: usuario.instructor ? undefined : usuario.telefono,
    especialidad: usuario.instructor?.especialidad,
    fotoUrl: usuario.fotoUrl,
  }
}

module.exports = { crearUsuario, buscarPorIdentificador, verificarPassword, formatearUsuario }
