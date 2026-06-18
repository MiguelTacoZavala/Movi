const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { adminDashboard } = require('../controllers/dashboard.controller')

const router = Router()

router.get('/admin', auth, authorize('ADMIN'), adminDashboard)

module.exports = router
