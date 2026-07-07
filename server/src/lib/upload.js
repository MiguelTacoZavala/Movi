const multer = require('multer')
const path = require('path')
const fs = require('fs')

const dir = path.join(__dirname, '../../uploads/instructores')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// Firmas de magic bytes para validar tipo real del archivo
const MAGIC_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  'image/webp': [
    // RIFF....WEBP
    [0x52, 0x49, 0x46, 0x46],
  ],
}

function detectMimetype(buffer) {
  for (const [mimeType, signatures] of Object.entries(MAGIC_SIGNATURES)) {
    for (const sig of signatures) {
      if (buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte)) {
        return mimeType
      }
    }
  }
  return null
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  // Primero validar por mimetype declarado
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes (jpeg, png, webp)'))
  }
  // La validación real de magic bytes se hace en el middleware post-upload
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// Middleware post-upload: valida magic bytes del archivo ya escrito en disco
function validateFileContent(req, res, next) {
  if (!req.file) return next()

  const buffer = fs.readFileSync(req.file.path)
  const detected = detectMimetype(buffer)

  if (!detected || !['image/jpeg', 'image/png', 'image/webp'].includes(detected)) {
    // Eliminar archivo inválido
    fs.unlink(req.file.path, () => {})
    req.file = null
    return res.status(400).json({ error: 'El archivo no es una imagen válida (jpeg, png, webp)' })
  }

  next()
}

module.exports = upload
module.exports.validateFileContent = validateFileContent
