const { z } = require('zod')

function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const detalles = error.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        }))
        console.warn(
          'Validacion fallida:',
          detalles.map((d) => `${d.campo}: ${d.mensaje}`).join(' | ')
        )
        return _res.status(400).json({ error: 'Datos inválidos', detalles })
      }
      next(error)
    }
  }
}

module.exports = { validate }
