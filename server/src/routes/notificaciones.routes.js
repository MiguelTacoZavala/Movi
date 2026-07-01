const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listarNotificaciones, marcarLeida } = require('../controllers/notificaciones.controller')

const router = Router()

router.get('/', auth, authorize('CLIENTE', 'INSTRUCTOR'), listarNotificaciones)
router.patch('/:id/leer', auth, authorize('CLIENTE', 'INSTRUCTOR'), marcarLeida)

module.exports = router
