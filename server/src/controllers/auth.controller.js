const { firmar } = require('../lib/jwt')
const prisma = require('../lib/prisma')
const authService = require('../services/auth.service')

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body

    const usuario = await authService.buscarPorIdentificador(identifier)
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valido = await authService.verificarPassword(password, usuario.password)
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    if (!usuario.estado) {
      return res.status(401).json({ error: 'Usuario inactivo' })
    }

    const token = firmar({ sub: usuario.id, rol: usuario.role.nombre })

    res.json({
      token,
      user: authService.formatearUsuario(usuario),
    })
  } catch (error) {
    next(error)
  }
}

async function register(req, res, next) {
  try {
    const { nombres, apellidos, dni, telefono, password } = req.body

    const existe = await prisma.usuario.findFirst({
      where: {
        OR: [
          { dni: dni || undefined },
          { telefono: telefono || undefined },
        ].filter((c) => Object.values(c)[0] !== undefined),
      },
    })

    if (existe) {
      return res.status(409).json({ error: 'El DNI o teléfono ya está registrado' })
    }

    const rolCliente = await prisma.role.findUnique({ where: { nombre: 'CLIENTE' } })
    if (!rolCliente) {
      return res.status(500).json({ error: 'Error de configuración: rol CLIENTE no encontrado' })
    }

    const usuario = await authService.crearUsuario({
      nombres,
      apellidos,
      dni,
      telefono,
      password,
      rolId: rolCliente.id,
    })

    const token = firmar({ sub: usuario.id, rol: 'CLIENTE' })

    res.status(201).json({
      token,
      user: authService.formatearUsuario(usuario),
    })
  } catch (error) {
    next(error)
  }
}

async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { role: true, instructor: true },
    })

    res.json({ user: authService.formatearUsuario(usuario) })
  } catch (error) {
    next(error)
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nombres, apellidos, telefono, email, contacto } = req.body

    const data = {}
    if (nombres !== undefined) data.nombres = nombres
    if (apellidos !== undefined) data.apellidos = apellidos
    if (telefono !== undefined) data.telefono = telefono
    if (email !== undefined) data.email = email
    if (contacto !== undefined) data.telefono = contacto

    const usuario = await prisma.usuario.update({
      where: { id: req.user.id },
      data,
      include: { role: true, instructor: true },
    })

    res.json({ user: authService.formatearUsuario(usuario) })
  } catch (error) {
    next(error)
  }
}

module.exports = { login, register, me, updateProfile }
