# Movi

Sistema de reserva y gestión de clases de baile.

- **Cliente**: React SPA (`client/`) — Vite 8 + React 19 + React Router 7
- **Servidor**: Express 5 + CORS (`server/`) — esqueleto, sin base de datos
- **Datos**: 100% mock (`client/src/data/mockData.js`), todo en `localStorage`

## Quick start

```bash
# Cliente (http://localhost:5173)
cd client && npm install && npm run dev

# Servidor (http://localhost:3000)
cd server && npm install && node index.js
```

## Credenciales de acceso

| Rol       | Identificador                | Contraseña        | Redirección                |
|-----------|------------------------------|-------------------|----------------------------|
| Admin     | `admin@dance.com`            | `admin123`        | `/admin/dashboard`         |
| Instructor| `maria@dance.com`            | `instructor123`   | `/instructor/dashboard`    |
| Cliente   | DNI `12345678` / telf. `999111222` | `cliente123` | `/cliente/dashboard`    |

Los clientes también pueden registrarse solos en `/registro`.

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

## Flujo de reserva

1. El cliente selecciona una clase → escoge asiento + método de pago (Yape o Créditos)
2. "Pagar Reserva" abre un modal de confirmación
3. "Confirmar" inicia un hold de **5 minutos** + procesamiento simulado de 2.5s
4. Si el hold expira, la selección se resetea
5. Al completarse, se muestra pantalla de éxito con código de pago (`MOV-XXXXXX`)

## Comandos del cliente

```bash
npm run dev       # Vite dev (hot reload)
npm run build     # Build producción a dist/
npm run lint      # ESLint (flat config)
npm run preview   # Vista previa de dist/
```

## Notas técnicas

- Sin base de datos — todo es mock, persiste solo en `localStorage`
- Sin framework de tests, sin formatter
- React 19 Compiler habilitado vía `@rolldown/plugin-babel` (impacta rendimiento de dev/build)
- `index.css` eliminado — `main.jsx` importa solo `App.jsx`
- Tema oscuro desde Perfil (cliente/instructor). Admin siempre en modo claro
- `server/database/MOVI_bd.sql` — esquema MySQL de referencia para integración futura
