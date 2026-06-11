const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const upload = require('../lib/upload')
const { listar, obtener, crear, actualizar, toggleEstado } = require('../controllers/instructores.controller')

const router = Router()

const crearSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  especialidad: z.string().optional(),
})

const actualizarSchema = z.object({
  nombres: z.string().min(1).optional(),
  apellidos: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
})

router.get('/', auth, listar)
router.get('/:id', auth, obtener)
router.post('/', auth, authorize('ADMIN'), upload.single('foto'), validate(crearSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), upload.single('foto'), validate(actualizarSchema), actualizar)
router.patch('/:id/status', auth, authorize('ADMIN'), toggleEstado)

module.exports = router
