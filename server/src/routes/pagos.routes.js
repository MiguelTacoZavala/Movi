const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { iniciarHold, confirmarPago, procesarPago } = require('../controllers/pagos.controller')

const router = Router()

const holdSchema = z.object({
  claseId: z.number().int().positive(),
  posicionClaseId: z.number().int().positive(),
})

const confirmarSchema = z.object({
  holdId: z.number().int().positive(),
  tokenId: z.string().min(1),
})

const procesarPagoSchema = z.object({
  claseId: z.number().int().positive(),
  posicionClaseId: z.number().int().positive(),
})

router.post('/hold', auth, authorize('CLIENTE'), validate(holdSchema), iniciarHold)
router.post('/confirmar', auth, authorize('CLIENTE'), validate(confirmarSchema), confirmarPago)
router.post('/procesar', auth, authorize('CLIENTE'), validate(procesarPagoSchema), procesarPago)

module.exports = router
