const express = require('express')
const cors = require('cors')
const { env } = require('./config/env')
const { errorHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth.routes')
const uploadRoutes = require('./routes/upload.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api', (_req, res) => {
  res.json({ message: 'Movi API v1' })
})

app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`)
})
