const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, obtener, crear, actualizar, toggleActivo, eliminar, extender } = require('../controllers/horarios.controller')

const router = Router()

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/
const fechaRegex = /^\d{4}-\d{2}-\d{2}$/

const crearSchema = z
  .object({
    categoriaId: z.number().int().positive(),
    instructorId: z.number().int().positive(),
    diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']),
    horaInicio: z.string().regex(horaRegex, 'Formato HH:MM requerido'),
    horaFin: z.string().regex(horaRegex, 'Formato HH:MM requerido'),
    capacidadMaxima: z.number().int().positive(),
    minimoParticipantes: z.number().int().positive().optional(),
    generarHasta: z.string().regex(fechaRegex, 'Formato YYYY-MM-DD requerido').optional(),
  })
  .refine((d) => d.horaInicio < d.horaFin, {
    message: 'horaFin debe ser posterior a horaInicio',
    path: ['horaFin'],
  })

const generarHastaSchema = z.object({
  hasta: z.string().regex(fechaRegex, 'Formato YYYY-MM-DD requerido'),
})

const actualizarSchema = z
  .object({
    categoriaId: z.number().int().positive().optional(),
    instructorId: z.number().int().positive().optional(),
    diaSemana: z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']).optional(),
    horaInicio: z.string().regex(horaRegex, 'Formato HH:MM requerido').optional(),
    horaFin: z.string().regex(horaRegex, 'Formato HH:MM requerido').optional(),
    capacidadMaxima: z.number().int().positive().optional(),
    minimoParticipantes: z.number().int().positive().optional(),
  })
  .refine(
    (d) => {
      if (d.horaInicio && d.horaFin) return d.horaInicio < d.horaFin
      return true
    },
    { message: 'horaFin debe ser posterior a horaInicio', path: ['horaFin'] }
  )

router.get('/', auth, listar)
router.get('/:id', auth, obtener)
router.post('/', auth, authorize('ADMIN'), validate(crearSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), validate(actualizarSchema), actualizar)
router.patch('/:id/estado', auth, authorize('ADMIN'), toggleActivo)
router.post('/:id/generar', auth, authorize('ADMIN'), validate(generarHastaSchema), extender)
router.delete('/:id', auth, authorize('ADMIN'), eliminar)

module.exports = router
