const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const { iniciarCron } = require('./services/cron.service')
const authRoutes = require('./routes/auth.routes')
const uploadRoutes = require('./routes/upload.routes')
const pagosRoutes = require('./routes/pagos.routes')
const categoriasRoutes = require('./routes/categorias.routes')
const instructoresRoutes = require('./routes/instructores.routes')
const horariosRoutes = require('./routes/horarios.routes')
const clasesRoutes = require('./routes/clases.routes')
const clientesRoutes = require('./routes/clientes.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const reservasRoutes = require('./routes/reservas.routes')
const creditosRoutes = require('./routes/creditos.routes')
const notificacionesRoutes = require('./routes/notificaciones.routes')

const app = express()

app.use(cors())
app.use(express.json())

// Log de cada petición: método, ruta, status y duración
app.use((req, res, next) => {
  const inicio = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - inicio}ms`)
  })
  next()
})

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api', (_req, res) => {
  res.json({ message: 'Movi API v1' })
})

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/pagos', pagosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/instructores', instructoresRoutes)
app.use('/api/horarios', horariosRoutes)
app.use('/api/clases', clasesRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reservas', reservasRoutes)
app.use('/api/creditos', creditosRoutes)
app.use('/api/notificaciones', notificacionesRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`)
  iniciarCron()
})
