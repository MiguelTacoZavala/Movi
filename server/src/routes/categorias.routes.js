const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { listar, crear, actualizar, eliminar } = require('../controllers/categorias.controller')

const router = Router()

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  precio: z.number().positive('Precio debe ser mayor a 0').default(15),
})

router.get('/', auth, listar)
router.post('/', auth, authorize('ADMIN'), validate(categoriaSchema), crear)
router.put('/:id', auth, authorize('ADMIN'), validate(categoriaSchema), actualizar)
router.delete('/:id', auth, authorize('ADMIN'), eliminar)

module.exports = router
