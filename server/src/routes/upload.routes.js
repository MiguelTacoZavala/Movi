const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const uploadLib = require('../lib/upload')
const { validateFileContent } = require('../lib/upload')
const { uploadProfilePhoto } = require('../controllers/upload.controller')

const router = Router()

// upload.fields acepta tanto 'foto' como 'file' para compatibilidad con el frontend
router.post(
  '/profile-photo',
  auth,
  authorize('CLIENTE', 'INSTRUCTOR'),
  uploadLib.fields([{ name: 'foto', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  validateFileContent,
  uploadProfilePhoto
)

module.exports = router
