const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { procesarPago } = require('../controllers/pagos.controller')

const router = Router()

const procesarPagoSchema = z.object({
  tokenId: z.string().optional(),
  claseId: z.number().int().positive(),
  posicionClaseId: z.number().int().positive(),
  metodoPago: z.enum(['yape', 'creditos']),
})

router.post('/procesar', auth, validate(procesarPagoSchema), procesarPago)

module.exports = router
