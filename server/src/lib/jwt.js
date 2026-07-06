const jwt = require('jsonwebtoken')
const { env } = require('../config/env')

const ALGORITHM = 'HS256'
const AUDIENCE = 'movi-web'
const ISSUER = 'movi-server'

function firmar(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: ALGORITHM,
    audience: AUDIENCE,
    issuer: ISSUER,
  })
}

function verificar(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: [ALGORITHM],
    audience: AUDIENCE,
    issuer: ISSUER,
  })
}

module.exports = { firmar, verificar }
