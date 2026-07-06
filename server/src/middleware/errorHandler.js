function errorHandler(err, _req, res, _next) {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.statusCode
    ? err.message
    : 'Error interno del servidor'

  const body = { error: message }

  if (process.env.NODE_ENV === 'development') {
    body.detalle = err.message
    body.stack = err.stack
  }

  res.status(statusCode).json(body)
}

module.exports = { errorHandler }
