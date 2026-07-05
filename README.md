# Movi

> Sistema de reserva y gestión de clases de baile para academias.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)

---

## Descripción

Movi es una plataforma web diseñada para academias de baile que permite a los clientes reservar asientos en clases, a los instructores gestionar sus sesiones y a los administradores controlar toda la operación. El sistema incluye un mapa visual de asientos, pagos con Yape (Culqi) y créditos, gestión de horarios semanales con auto-generación de clases, y un panel de administración con métricas en tiempo real.

---

## Características

- **Mapa de asientos visual** — Selección interactiva de asiento con grid responsivo
- **Tres roles diferenciados** — Admin (dashboard + CRUD), Instructor (clases + participantes), Cliente (reservas + perfil)
- **Pagos integrados** — Yape vía Culqi y pago con créditos
- **Auto-generación de clases** — Crear un horario genera clases automáticamente hasta una fecha elegida
- **Panel de administración** — Dashboard con ingresos, clases en riesgo y métricas por categoría
- **Tema oscuro / claro** — Toggle desde el perfil del cliente e instructor
- **Responsive** — Diseño mobile-first para clientes e instructores, desktop para admin

---

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, React Router 7, Vite 8, Lucide React |
| Backend | Express 5, Node.js |
| ORM | Prisma 6 |
| Base de datos | MySQL 8.0 |
| Autenticación | JWT + bcryptjs |
| Pagos | Culqi (Yape) |
| Validación | Zod |
| Despliegue | Vercel (frontend) |

---

## Inicio Rápido

### Requisitos previos

- Node.js 18+
- MySQL 8.0 corriendo localmente
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/movi.git
cd movi

# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Crear tablas y poblar datos iniciales
npx prisma migrate dev
npm run seed

# Iniciar el servidor (puerto 3000)
npm run dev
```

En otra terminal:

```bash
# Instalar dependencias del cliente
cd client
npm install

# Iniciar el cliente (puerto 5173)
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Estructura del Proyecto

```
movi/
├── client/                  # Frontend React SPA
│   ├── src/
│   │   ├── components/      # Componentes reutilizables (UI + layouts)
│   │   ├── context/         # Auth, Theme, Accesibilidad
│   │   ├── pages/           # Páginas por rol (admin/, client/, instructor/)
│   │   ├── services/        # API client + Culqi
│   │   └── utils/           # Helpers de formato y constantes
│   └── public/              # Assets estáticos
├── server/                  # Backend Express
│   ├── src/
│   │   ├── controllers/     # Lógica de request/response
│   │   ├── services/        # Lógica de negocio
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Auth, validación, errores
│   │   └── lib/             # Prisma singleton, JWT
│   ├── prisma/
│   │   ├── schema.prisma    # Modelos y relaciones
│   │   └── seed.js          # Datos iniciales (roles, categorías)
│   └── database/            # Schema SQL de referencia
└── README.md
```


