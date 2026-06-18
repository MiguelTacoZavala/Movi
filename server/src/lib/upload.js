const multer = require('multer')
const path = require('path')
const fs = require('fs')

const dir = path.join(__dirname, '../../uploads/instructores')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Solo se permiten imágenes (jpeg, png, webp)'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

module.exports = upload
