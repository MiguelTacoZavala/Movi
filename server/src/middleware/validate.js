const { z } = require('zod')

function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return _res.status(400).json({
          error: 'Datos inválidos',
          detalles: error.errors.map((e) => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        })
      }
      next(error)
    }
  }
}

module.exports = { validate }
