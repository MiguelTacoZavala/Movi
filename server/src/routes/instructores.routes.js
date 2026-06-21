const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, crear, actualizar, eliminar, toggleEstado } = require('../controllers/instructores.controller')

const router = Router()

const crearSchema = z.object({
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
  fotoUrl: z.string().optional(),
})

const actualizarSchema = z.object({
  nombres: z.string().min(1).optional(),
  apellidos: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
  fotoUrl: z.string().optional(),
  estado: z.boolean().optional(),
})

router.get('/', auth, authorize('ADMIN'), listar)
router.post('/', auth, authorize('ADMIN'), validate(crearSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), validate(actualizarSchema), actualizar)
router.delete('/:id', auth, authorize('ADMIN'), eliminar)
router.patch('/:id/estado', auth, authorize('ADMIN'), toggleEstado)

module.exports = router
