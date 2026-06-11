function authorize(...rolesPermitidos) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new Error('Middleware auth debe ejecutarse antes que authorize'))
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return _res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}`,
      })
    }

    next()
  }
}

module.exports = { authorize }
