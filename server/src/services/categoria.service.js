const prisma = require('../lib/prisma')

async function listar() {
  return prisma.categoriaBaile.findMany({ orderBy: { nombre: 'asc' } })
}

async function obtener(id) {
  return prisma.categoriaBaile.findUnique({ where: { id } })
}

async function crear({ nombre, descripcion }) {
  return prisma.categoriaBaile.create({ data: { nombre, descripcion } })
}

async function actualizar(id, { nombre, descripcion }) {
  return prisma.categoriaBaile.update({
    where: { id },
    data: { nombre, descripcion },
  })
}

async function tieneHorarios(id) {
  const count = await prisma.horarioSemanal.count({ where: { categoriaId: id } })
  return count > 0
}

async function eliminar(id) {
  return prisma.categoriaBaile.delete({ where: { id } })
}

module.exports = { listar, obtener, crear, actualizar, tieneHorarios, eliminar }
