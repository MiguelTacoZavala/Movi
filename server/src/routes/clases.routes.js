const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { generar, listar, obtener, cancelar } = require('../controllers/clases.controller')

const router = Router()

const generarSchema = z.object({
  semanas: z.number().int().min(1).max(52),
})

// /generar debe ir antes de /:id para que Express no lo confunda con un id
router.post('/generar', auth, authorize('ADMIN'), validate(generarSchema), generar)
router.get('/', auth, listar)
router.get('/:id', auth, obtener)
router.patch('/:id/cancelar', auth, authorize('ADMIN'), cancelar)

module.exports = router
