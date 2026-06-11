const { verificar } = require('../lib/jwt')
const prisma = require('../lib/prisma')

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = header.split(' ')[1]
    const decoded = verificar(token)

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { role: true },
    })

    if (!usuario || !usuario.estado) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' })
    }

    req.user = {
      id: usuario.id,
      rol: usuario.role.nombre,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      dni: usuario.dni,
      telefono: usuario.telefono,
      fotoUrl: usuario.fotoUrl,
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }
    next(error)
  }
}

module.exports = { auth }
