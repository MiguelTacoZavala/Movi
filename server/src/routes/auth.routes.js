const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { login, register, registerAdmin, me, updateProfile } = require('../controllers/auth.controller')

const router = Router()

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

const registerAdminSchema = z.object({
  email: z.string().email('Email inválido'),
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const updateProfileSchema = z.object({
  nombres: z.string().min(1).optional(),
  apellidos: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contacto: z.string().min(1).optional(),
})

router.post('/login', validate(loginSchema), login)
router.post('/register', validate(registerSchema), register)
router.post('/register-admin', validate(registerAdminSchema), registerAdmin)
router.get('/me', auth, me)
router.put('/profile', auth, validate(updateProfileSchema), updateProfile)

module.exports = router
