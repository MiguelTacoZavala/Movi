const { env } = require('../config/env')

async function crearCargo({ tokenId, monto, email, descripcion }) {
  const response = await fetch(`${env.CULQI_API_URL}/charges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.CULQI_SECRET_KEY}`,
    },
    body: JSON.stringify({
      amount: Math.round(monto * 100),
      currency_code: 'PEN',
      email,
      source_id: tokenId,
      description: descripcion,
      metadata: { fuente: 'movi-web' },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.merchant_message || 'Error al procesar pago en Culqi')
    error.statusCode = response.status
    error.culqiData = data
    throw error
  }

  return {
    chargeId: data.id,
    estado: data.outcome?.type || 'unknown',
    mensaje: data.outcome?.user_message || 'Pago exitoso',
  }
}

module.exports = { crearCargo }
