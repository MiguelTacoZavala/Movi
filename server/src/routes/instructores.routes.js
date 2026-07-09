const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, crear, actualizar, eliminar, toggleEstado, dashboard, misHorarios, misClases, obtenerParticipantes, actualizarTematica, historial, registrarCheckIn, toggleAsistencia } = require('../controllers/instructores.controller')

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

// Admin CRUD
router.get('/', auth, authorize('ADMIN'), listar)
router.post('/', auth, authorize('ADMIN'), validate(crearSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), validate(actualizarSchema), actualizar)
router.delete('/:id', auth, authorize('ADMIN'), eliminar)
router.patch('/:id/estado', auth, authorize('ADMIN'), toggleEstado)

// Instructor panel
router.get('/dashboard', auth, authorize('INSTRUCTOR'), dashboard)
router.get('/mis-horarios', auth, authorize('INSTRUCTOR'), misHorarios)
router.get('/mis-clases', auth, authorize('INSTRUCTOR'), misClases)
router.get('/historial', auth, authorize('INSTRUCTOR'), historial)
router.get('/clases/:id/participantes', auth, authorize('INSTRUCTOR'), obtenerParticipantes)
router.patch('/clases/:id/tematica', auth, authorize('INSTRUCTOR'), actualizarTematica)
router.post('/clases/:id/check-in', auth, authorize('INSTRUCTOR'), registrarCheckIn)
router.patch('/reservas/:reservaId/asistencia', auth, authorize('INSTRUCTOR'), toggleAsistencia)

module.exports = router
