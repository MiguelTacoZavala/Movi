const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listarMisReservas, cancelarReserva } = require('../controllers/reservas.controller')

const router = Router()

router.get('/mis-reservas', auth, authorize('CLIENTE'), listarMisReservas)
router.patch('/:id/cancelar', auth, authorize('CLIENTE'), cancelarReserva)

module.exports = router
