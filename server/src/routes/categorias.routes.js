const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/categorias.controller')

const router = Router()

const crearSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
})

const actualizarSchema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
})

router.get('/', auth, listar)
router.get('/:id', auth, obtener)
router.post('/', auth, authorize('ADMIN'), validate(crearSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), validate(actualizarSchema), actualizar)
router.delete('/:id', auth, authorize('ADMIN'), eliminar)

module.exports = router
