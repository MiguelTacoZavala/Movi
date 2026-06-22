const cloudinary = require('cloudinary').v2

const FOLDER_MAP = { cliente: 'clientes', instructor: 'instructores' }

function subirFotoPerfil(filePath, userId, rol) {
  const rolFolder = FOLDER_MAP[rol.toLowerCase()] || 'temp'
  const publicId = `movi/perfiles/${rolFolder}/usuario-${userId}`
  return cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: 'image',
    overwrite: true,
    invalidate: true,
  })
}

module.exports = { subirFotoPerfil }
