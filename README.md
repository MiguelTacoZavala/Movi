# Movi

Sistema de reserva y gestión de clases de baile.

- **Frontend**: React SPA (`client/`) — Vite 8 + React 19 + React Router 7
- **Backend**: Express API (`server/`) — Prisma 6 + MySQL 8.0
- **Datos actuales**: 100% mock (`client/src/data/mockData.js`), todo en `localStorage`

---

## Quick start

```bash
# Cliente (http://localhost:5173)
cd client && npm install && npm run dev

# Servidor (http://localhost:3000)
cd server
npm install
cp .env.example .env        # Configurar credenciales de BD
npx prisma migrate dev       # Crear tablas en MySQL
npm run seed                 # Poblar roles + categorías
npm run dev
```

---

## Credenciales de acceso (frontend mock)

| Rol       | Identificador                | Contraseña        | Redirección                |
|-----------|------------------------------|-------------------|----------------------------|
| Admin     | `admin@dance.com`            | `admin123`        | `/admin/dashboard`         |
| Instructor| `maria@dance.com`            | `instructor123`   | `/instructor/dashboard`    |
| Cliente   | DNI `12345678` / telf. `999111222` | `cliente123` | `/cliente/dashboard`    |

Los clientes también pueden registrarse solos en `/registro`.

---

## Páginas

### Admin — sidebar (escritorio)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/admin/dashboard` | Dashboard | Resumen de ingresos, clases en riesgo, clases de hoy |
| `/admin/clases` | Clases | Clases generadas desde horarios, grilla de asientos |
| `/admin/horarios` | Horarios | CRUD de horarios semanales (formulario modal) |
| `/admin/instructores` | Instructores | CRUD con foto |
| `/admin/categorias` | Categorías | CRUD |
| `/admin/clientes` | Clientes | Lista de clientes registrados |

### Cliente — bottom nav (móvil)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/cliente/dashboard` | Inicio | Saludo, próxima clase, clases destacadas |
| `/cliente/clases` | Clases | Selector de categoría → carrusel de 6 días → grilla de clases |
| `/cliente/clases/:id` | Detalle | Mapa de asientos, método de pago, "Pagar Reserva" |
| `/cliente/mis-clases` | Mis Clases | Reservas activas/pasadas, comprobante, cancelación |
| `/cliente/perfil` | Perfil | Editar datos, toggle de tema oscuro |

### Instructor — bottom nav (móvil)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/instructor/dashboard` | Inicio | Siguiente clase + clases de hoy |
| `/instructor/horarios` | Horarios | Horario semanal en tarjetas |
| `/instructor/clases` | Clases | Próximas clases, detalle de participantes |
| `/instructor/clases/:id` | Detalle | Lista de participantes, editar temática |
| `/instructor/historial` | Historial | Clases pasadas (FINALIZADA / CANCELADA) |
| `/instructor/perfil` | Perfil | Editar datos, toggle de tema oscuro |

---

## Flujo de reserva

1. El cliente selecciona una clase → escoge asiento + método de pago (Yape o Créditos)
2. "Pagar Reserva" abre un modal de confirmación
3. "Confirmar" inicia un hold de **5 minutos** + procesamiento simulado de 2.5s
4. Si el hold expira, la selección se resetea
5. Al completarse, se muestra pantalla de éxito con código de pago (`MOV-XXXXXX`)

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React SPA)                  │
│  Vite 8 + React 19 + React Router 7 + lucide-react     │
│  Datos mock → mockData.js + localStorage                │
│  Sin estado externo (solo useState / useEffect)         │
└────────────────────────┬────────────────────────────────┘
                         │  (HTTP → conexión futura)
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (Express API)                 │
│  Express 5 + Prisma 6 + MySQL 8.0                       │
│  Auth: JWT + bcryptjs                                   │
│  Validación: Zod                                        │
│  Archivos: Multer                                       │
│  Tareas programadas: node-cron                          │
│  Pagos: Culqi (preparado, pendiente de credenciales)   │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     MySQL 8.0       │
              │  11 tablas, seed   │
              │  (roles, cat.)     │
              └─────────────────────┘
```

### Estructura del backend

```
server/
├── prisma/
│   ├── schema.prisma      # Modelos, relaciones, enums
│   └── seed.js            # Seed: roles + categorías
├── src/
│   ├── index.js           # Entry point Express 5
│   ├── config/env.js      # Variables de entorno validadas (Zod)
│   ├── lib/
│   │   ├── prisma.js      # Singleton PrismaClient
│   │   └── jwt.js         # Firmar y verificar JWT
│   ├── middleware/
│   │   ├── auth.js        # Verificar JWT → req.user
│   │   ├── authorize.js   # Validar rol(es) permitidos
│   │   ├── validate.js    # Validar body con Zod
│   │   └── errorHandler.js# Error handler global
│   ├── controllers/       # Lógica de request/response
│   ├── services/          # Lógica de negocio
│   └── routes/            # Definición de rutas
├── database/
│   ├── MOVI_bd.sql        # Schema MySQL de referencia
│   └── documentacion_database.md
├── uploads/               # Fotos de perfil
├── .env                   # Configuración local
└── package.json
```

---

## Base de datos

- **Motor**: MySQL 8.0
- **Esquema de referencia**: `server/database/MOVI_bd.sql`
- **ORM**: Prisma 6 (`prisma/schema.prisma`)
- **11 tablas**: roles, usuarios, instructores, categorias_baile, horarios_semanales, clases, posiciones_clase, reservas, pagos, creditos, notificaciones
- **Seed inicial**: roles (ADMIN, CLIENTE, INSTRUCTOR) + categorías (Salsa, Bachata, Tango)
- **Documentación completa**: `server/database/documentacion_database.md`

---

## Comandos

### Cliente

```bash
npm run dev       # Vite dev (hot reload) — puerto 5173
npm run build     # Build producción a dist/
npm run lint      # ESLint (flat config)
npm run preview   # Vista previa de dist/
```

### Servidor

```bash
npm run dev                # Iniciar con watch mode — puerto 3000
npm start                  # Iniciar en producción
npx prisma migrate dev     # Ejecutar migraciones
npm run seed               # Ejecutar seed
npx prisma studio          # Prisma Studio (GUI de BD)
```

---

## Ramas y responsables

| Rama | Responsable | Módulo |
|------|-------------|--------|
| `main` | — | Rama base con frontend completo + infraestructura backend |
| `taco` | Miguel | Infraestructura backend (Prisma + Auth + middlewares) |
| `geleon` | Gerardo | Backend del módulo Administrador |
| `angel` | Angel | Backend del módulo Instructor |

Ver `COMMITS_GUIDE.md` para el plan detallado de commits por rama.

---

## Notas técnicas

- Sin framework de tests, sin formatter
- React 19 Compiler habilitado vía `@rolldown/plugin-babel`
- `index.css` eliminado — `main.jsx` importa solo `App.jsx`
- Tema oscuro desde Perfil (cliente/instructor). Admin siempre en modo claro
- Pagos Yape vía Culqi (pendiente de credenciales)
- Fotos de perfil: almacenamiento local en `server/uploads/`, servidas estáticamente
