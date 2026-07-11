const { Router } = require('express')
const { z } = require('zod')
const rateLimit = require('express-rate-limit')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { login, register, me, updateProfile } = require('../controllers/auth.controller')

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identificador requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

const registerSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  dni: z.string().min(1, 'DNI requerido'),
  telefono: z.string().min(1, 'Teléfono requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const updateProfileSchema = z.object({
  nombres: z.string().min(1).optional(),
  apellidos: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contacto: z.string().min(1).optional(),
})

router.post('/login', loginLimiter, validate(loginSchema), login)
router.post('/register', registerLimiter, validate(registerSchema), register)
router.get('/me', auth, me)
router.put('/profile', auth, validate(updateProfileSchema), updateProfile)

module.exports = router
