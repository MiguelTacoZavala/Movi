const cloudinary = require('cloudinary').v2

function subirArchivo(filePath) {
  return cloudinary.uploader.upload(filePath, {
    folder: 'movi/perfiles',
    resource_type: 'image',
  })
}

function eliminarArchivo(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

module.exports = { subirArchivo, eliminarArchivo }
