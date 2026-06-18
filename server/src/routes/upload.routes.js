const { Router } = require('express')
const multer = require('multer')
const { auth } = require('../middleware/auth')
const { uploadProfilePhoto } = require('../controllers/upload.controller')

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, `profile-${Date.now()}.${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream']
      if (allowed.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error(`Formato no permitido: ${file.mimetype}. Usa JPG, PNG o WebP`))
      }
    },
})

router.post('/profile-photo', auth, upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'file', maxCount: 1 }]), uploadProfilePhoto)

module.exports = router
