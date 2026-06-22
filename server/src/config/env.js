const { z } = require('zod')
// dotenv se carga en index.js — no aquí

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es requerido'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLOUDINARY_URL: z.string().min(1, 'CLOUDINARY_URL es requerida'),
  CULQI_PUBLIC_KEY: z.string().min(1, 'CULQI_PUBLIC_KEY es requerida'),
  CULQI_SECRET_KEY: z.string().min(1, 'CULQI_SECRET_KEY es requerida'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

exports.env = parsed.data
