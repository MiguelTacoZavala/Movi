const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listarMisCreditos } = require('../controllers/creditos.controller')

const router = Router()

router.get('/', auth, authorize('CLIENTE'), listarMisCreditos)

module.exports = router
