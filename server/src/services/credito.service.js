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

module.exports = { listarPorUsuario }
