const prisma = require('../lib/prisma')
const { safeId } = require('../lib/helpers')

async function listar(req, res, next) {
  try {
    const categorias = await prisma.categoriaBaile.findMany({
      orderBy: { nombre: 'asc' },
    })
    res.json({ categorias })
  } catch (error) {
    next(error)
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion, precio } = req.body

    const existe = await prisma.categoriaBaile.findUnique({ where: { nombre } })
    if (existe) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre. Usa un nombre diferente.' })
    }

    const categoria = await prisma.categoriaBaile.create({
      data: { nombre, descripcion: descripcion || null, precio },
    })

    res.status(201).json({ categoria })
  } catch (error) {
    next(error)
  }
}

async function actualizar(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })
    const { nombre, descripcion, precio } = req.body

    const existe = await prisma.categoriaBaile.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    const duplicado = await prisma.categoriaBaile.findFirst({
      where: { nombre, NOT: { id } },
    })
    if (duplicado) {
      return res.status(409).json({ error: 'Ya existe otra categoría con ese nombre. Elige un nombre distinto.' })
    }

    const categoria = await prisma.categoriaBaile.update({
      where: { id },
      data: { nombre, descripcion: descripcion || null, precio },
    })

    res.json({ categoria })
  } catch (error) {
    next(error)
  }
}

async function eliminar(req, res, next) {
  try {
    const id = safeId(req.params.id)
    if (!id) return res.status(400).json({ error: 'ID inválido' })

    const existe = await prisma.categoriaBaile.findUnique({ where: { id } })
    if (!existe) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    const horarios = await prisma.horarioSemanal.count({
      where: { categoriaId: id },
    })
    if (horarios > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: la categoría tiene ${horarios} horario(s) vinculado(s). Elimina o reasigna esos horarios primero.`,
      })
    }

    await prisma.categoriaBaile.delete({ where: { id } })
    res.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listar, crear, actualizar, eliminar }
