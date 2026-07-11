const { Router } = require('express')
const { z } = require('zod')
const { auth } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')
const { validate } = require('../middleware/validate')
const { listar, obtener, editarCliente, obtenerEstadisticas } = require('../controllers/clientes.controller')

const router = Router()

const editarClienteSchema = z.object({
  nombres: z.string().min(1, 'Nombre requerido').regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras').optional(),
  apellidos: z.string().min(1, 'Apellido requerido').regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras').optional(),
  telefono: z.string().min(1, 'Teléfono requerido').regex(/^\d{9}$/, 'Debe tener 9 dígitos').optional(),
})

router.get('/', auth, authorize('ADMIN'), listar)
router.get('/:id', auth, authorize('ADMIN'), obtener)
router.patch('/:id', auth, authorize('ADMIN'), validate(editarClienteSchema), editarCliente)
router.get('/:id/estadisticas', auth, authorize('ADMIN'), obtenerEstadisticas)

module.exports = router
