const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, obtener } = require('../controllers/clientes.controller')

const router = Router()

router.get('/', auth, authorize('ADMIN'), listar)
router.get('/:id', auth, authorize('ADMIN'), obtener)

module.exports = router
