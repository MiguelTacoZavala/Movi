const prisma = require('../lib/prisma')

async function listarPorUsuario(usuarioId) {
  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'desc' },
  })

  return notificaciones.map(n => ({
    id: n.id,
    tipo: n.tipo,
    mensaje: n.mensaje,
    leido: n.leido,
    createdAt: n.createdAt,
  }))
}

async function marcarLeida(notificacionId, usuarioId) {
  const notificacion = await prisma.notificacion.findUnique({ where: { id: notificacionId } })
  if (!notificacion) return null
  if (notificacion.usuarioId !== usuarioId) return null

  const updated = await prisma.notificacion.update({
    where: { id: notificacionId },
    data: { leido: true },
  })

  return {
    id: updated.id,
    leido: updated.leido,
  }
}

module.exports = { listarPorUsuario, marcarLeida }
