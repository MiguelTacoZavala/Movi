# Guía de Commits — Movi

## Convenciones

- Mensajes en español con formato `tipo: descripción breve`
- Un commit por funcionalidad atómica
- Verificar que el servidor inicie sin errores antes de commitear
- Siempre hacer `pull` de `main` antes de empezar a trabajar

## Ramas

| Rama | Responsable | Módulo |
|------|-------------|--------|
| `main` | — | Rama base con frontend completo + infraestructura backend |
| `taco` | Miguel | Infraestructura backend (Prisma + Auth + middlewares) |
| `geleon` | Gerardo | Backend del módulo Administrador |
| `angel` | Angel | Backend del módulo Instructor |

## Flujo de integración

```
1. Miguel (taco) → PR a main: infraestructura base
2. Gerardo hace git pull origin main en geleon → commits → PR a main
3. Angel hace git pull origin main en angel → commits → PR a main
```

---

## Rama `taco` — Miguel (Infraestructura base)

Un solo commit con todo:

| Mensaje | Contenido |
|---------|-----------|
| `chore: preparación de infraestructura backend (Prisma, Auth, middlewares, documentación)` | server/package.json, .env, .env.example, .gitignore, prisma/schema.prisma, prisma/seed.js, src/index.js, src/config/env.js, src/lib/prisma.js, src/lib/jwt.js, src/middleware/auth.js, src/middleware/authorize.js, src/middleware/validate.js, src/middleware/errorHandler.js, src/controllers/auth.controller.js, src/services/auth.service.js, src/routes/auth.routes.js, database/MOVI_bd.sql (+ culqi_charge_id), database/documentacion_database.md (actualizada), COMMITS_GUIDE.md, README.md (actualizado) |

---

## Rama `geleon` — Gerardo (Backend Administrador)

| # | Mensaje del commit | Archivos clave | Descripción |
|---|-------------------|----------------|-------------|
| 1 | `feat: CRUD categorías` | controllers/categorias.controller.js, routes/categorias.routes.js, services/categoria.service.js | CRUD completo con validación de horarios vinculados al eliminar. Endpoints: GET /api/categorias, POST, PUT /:id, DELETE /:id |
| 2 | `feat: CRUD instructores + foto` | controllers/instructores.controller.js, routes/instructores.routes.js, services/instructor.service.js | CRUD con upload de foto vía Multer, toggle activate/deactivate. Endpoints: GET /api/instructores, POST, PUT /:id, PATCH /:id/status |
| 3 | `feat: CRUD horarios semanales` | controllers/horarios.controller.js, routes/horarios.routes.js, services/horario.service.js | CRUD con validación de overlap (mismo instructor + día + hora), toggle activo, minimo_participantes = 7. Endpoints: GET /api/horarios, POST, PUT /:id, PATCH /:id/status, DELETE /:id |
| 4 | `feat: generar y gestionar clases` | controllers/clases.controller.js, routes/clases.routes.js, services/clase.service.js | Generar N semanas desde horarios activos, listar con filtros + paginación, cancelar clase (cambia estado + genera créditos). Endpoints: POST /api/clases/generate, GET /api/clases, GET /api/clases/:id, PATCH /api/clases/:id/cancel |
| 5 | `feat: listado y detalle de clientes` | controllers/clientes.controller.js, routes/clientes.routes.js | Listar con búsqueda, detalle con stats. Endpoints: GET /api/clientes, GET /api/clientes/:id |
| 6 | `feat: dashboard admin` | controllers/dashboard.controller.js, routes/dashboard.routes.js | Ingresos hoy/semana/mes, clases hoy, categorías populares, clase en riesgo. Endpoint: GET /api/dashboard/admin |

---

## Rama `angel` — Angel (Backend Instructor)

| # | Mensaje del commit | Archivos clave | Descripción |
|---|-------------------|----------------|-------------|
| 1 | `feat: dashboard instructor` | controllers/instructor.controller.js, routes/instructor.routes.js | Próxima clase, clases de hoy del instructor logueado. Endpoints: GET /api/dashboard/instructor/:id, GET /api/instructores/:id/clases-hoy |
| 2 | `feat: horarios del instructor` | routes/horarios.routes.js, controllers/horarios.controller.js | GET horarios activos filtrados por instructor. Endpoint: GET /api/instructores/:id/horarios |
| 3 | `feat: clases del instructor y detalle` | routes/clases.routes.js, controllers/clases.controller.js | Próximas clases, historial (FINALIZADA/CANCELADA), detalle con lista de participantes, editar temática |
| 4 | `feat: perfil instructor con foto` | routes/auth.routes.js, controllers/auth.controller.js | Editar perfil con soporte de upload de foto (Multer). Endpoint: PUT /api/auth/profile (ampliar para foto) |
| 5 | `feat: créditos del usuario` | controllers/creditos.controller.js, routes/creditos.routes.js | Consultar créditos disponibles. Endpoint: GET /api/creditos?usuarioId= |

---

## Endpoints disponibles después de cada rama

### Después de `taco` (main)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Iniciar sesión |
| POST | /api/auth/register | No | Registrar cliente |
| POST | /api/auth/register-admin | No | Registrar admin |
| GET | /api/auth/me | Sí | Perfil del usuario autenticado |
| PUT | /api/auth/profile | Sí | Actualizar perfil |

### Después de `geleon` (main)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /api/categorias | Sí | Listar categorías |
| POST | /api/categorias | Sí (admin) | Crear categoría |
| PUT | /api/categorias/:id | Sí (admin) | Actualizar categoría |
| DELETE | /api/categorias/:id | Sí (admin) | Eliminar categoría |
| GET | /api/instructores | Sí | Listar instructores |
| POST | /api/instructores | Sí (admin) | Crear instructor |
| PUT | /api/instructores/:id | Sí (admin) | Actualizar instructor |
| PATCH | /api/instructores/:id/status | Sí (admin) | Activar/desactivar instructor |
| GET | /api/horarios | Sí | Listar horarios |
| POST | /api/horarios | Sí (admin) | Crear horario |
| PUT | /api/horarios/:id | Sí (admin) | Actualizar horario |
| PATCH | /api/horarios/:id/status | Sí (admin) | Activar/desactivar horario |
| DELETE | /api/horarios/:id | Sí (admin) | Eliminar horario |
| POST | /api/clases/generate | Sí (admin) | Generar clases desde horarios |
| GET | /api/clases | Sí | Listar clases |
| GET | /api/clases/:id | Sí | Detalle de clase |
| PATCH | /api/clases/:id/cancel | Sí (admin) | Cancelar clase |
| GET | /api/clientes | Sí (admin) | Listar clientes |
| GET | /api/clientes/:id | Sí (admin) | Detalle de cliente |
| GET | /api/dashboard/admin | Sí (admin) | Dashboard admin |

### Después de `angel` (main)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /api/dashboard/instructor/:id | Sí (instructor) | Dashboard instructor |
| GET | /api/instructores/:id/clases-hoy | Sí (instructor) | Clases de hoy |
| GET | /api/instructores/:id/horarios | Sí (instructor) | Horarios del instructor |
| GET | /api/clases/instructor/:id | Sí (instructor) | Próximas clases |
| GET | /api/clases/instructor/:id/historial | Sí (instructor) | Historial |
| PATCH | /api/clases/:id/tematica | Sí (instructor) | Editar temática |
| GET | /api/creditos | Sí | Créditos disponibles |
