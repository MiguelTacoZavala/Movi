const fs = require('fs')
const cloudinaryService = require('../services/cloudinary.service')
const prisma = require('../lib/prisma')

async function uploadProfilePhoto(req, res, next) {
  try {
    const file = req.files?.foto?.[0] || req.files?.file?.[0]

    if (!file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen' })
    }

    const result = await cloudinaryService.subirArchivo(file.path)

    fs.unlink(file.path, () => {})

    const fotoUrl = result.secure_url

    const usuario = await prisma.usuario.update({
      where: { id: req.user.id },
      data: { fotoUrl },
      include: { role: true, instructor: true },
    })

    res.json({
      message: 'Foto subida correctamente',
      fotoUrl,
      user: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        fotoUrl: usuario.fotoUrl,
      },
    })
  } catch (error) {
    const file = req.files?.foto?.[0] || req.files?.file?.[0]; if (file) fs.unlink(file.path, () => {})
    next(error)
  }
}

module.exports = { uploadProfilePhoto }
