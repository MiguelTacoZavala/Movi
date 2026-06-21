const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const uploadRoutes = require('./routes/upload.routes')
const pagosRoutes = require('./routes/pagos.routes')
const categoriasRoutes = require('./routes/categorias.routes')
const instructoresRoutes = require('./routes/instructores.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api', (_req, res) => {
  res.json({ message: 'Movi API v1' })
})

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/pagos', pagosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/instructores', instructoresRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`)
})
