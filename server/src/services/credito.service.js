const prisma = require('../lib/prisma')

async function listarPorUsuario(usuarioId) {
  const creditos = await prisma.credito.findMany({
    where: { usuarioId },
    include: {
      clase: {
        select: {
          fecha: true,
          horarioSemanal: {
            select: { categoria: { select: { nombre: true } } },
          },
        },
      },
    },
    orderBy: { fechaCreacion: 'desc' },
  })

  return creditos.map(c => ({
    id: c.id,
    usado: c.usado,
    fechaCreacion: c.fechaCreacion,
    fechaUso: c.fechaUso,
    categoria: c.clase?.horarioSemanal?.categoria?.nombre || null,
    claseFecha: c.clase?.fecha?.toISOString().substring(0, 10) || null,
  }))
}

async function usarCredito(usuarioId, claseId, reservaId) {
  const credito = await prisma.credito.findFirst({
    where: { usuarioId, usado: false },
    orderBy: { fechaCreacion: 'asc' },
  })
  if (!credito) return null

  return prisma.credito.update({
    where: { id: credito.id },
    data: { usado: true, fechaUso: new Date(), reservaId, claseId },
  })
}

module.exports = { listarPorUsuario, usarCredito }
