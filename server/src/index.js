const express = require('express')
const cors = require('cors')
const path = require('path')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const categoriasRoutes = require('./routes/categorias.routes')
const instructoresRoutes = require('./routes/instructores.routes')
const horariosRoutes = require('./routes/horarios.routes')
const clasesRoutes = require('./routes/clases.routes')
const clientesRoutes = require('./routes/clientes.routes')
const dashboardRoutes = require('./routes/dashboard.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api', (_req, res) => {
  res.json({ message: 'Movi API v1' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/instructores', instructoresRoutes)
app.use('/api/horarios', horariosRoutes)
app.use('/api/clases', clasesRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`)
})
