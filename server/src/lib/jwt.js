const jwt = require('jsonwebtoken')
const { env } = require('../config/env')

function firmar(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

function verificar(token) {
  return jwt.verify(token, env.JWT_SECRET)
}

module.exports = { firmar, verificar }
