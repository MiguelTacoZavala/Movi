function errorHandler(err, _req, res, _next) {
  console.error('Error:', err)

  const statusCode = err.statusCode || 500
  const message = err.statusCode ? err.message : 'Error interno del servidor'

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { detalle: err.message }),
  })
}

module.exports = { errorHandler }
