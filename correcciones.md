# Correcciones y mejoras

## 2026-07-01

### Ayuda contextual (nuevo)
- **AyudaContextual.jsx**: Botón flotante `?` abajo a la derecha que muestra tips según la página actual (cliente e instructor). Insertado en `ClientLayout.jsx` e `InstructorLayout.jsx`.
- **Ayuda.jsx**: Sección FAQ en Perfil con 6 preguntas para cliente y 5 para instructor. Acordeón nativo `<details>` (0 estado, 0 librerías).

### Tooltips nativos
- Agregados atributos `title` a ~10 botones clave: toggle tema oscuro, Editar Perfil, filtros Próximas/Pasadas, Cancelar inscripción, métodos de pago (Yape/Créditos), Pagar, editar temática.

### Mensajes de error amigables
- Reemplazados `alert(e.message)` con textos centrados en la tarea:
  - "No pudimos cargar tus reservas. Revisa tu conexión."
  - "No se pudo cancelar la reserva. Intenta de nuevo."
  - "No se pudieron guardar los cambios. Revisa los campos."
  - "No se pudo subir la foto. Intenta con otro archivo."
  - "No se pudo guardar la temática. Intenta de nuevo."

### Migración completa a API real

### Migración completa a API real
- Todas las páginas cliente e instructor conectadas a backend (sin mockData).
- Precio dinámico desde `categoria.precio` en lugar de hardcode `S/ 15`.
- Monto y método de pago reales en comprobante de MisClases.
- Backend fixes: authorize middleware en rutas de pagos/créditos/notificaciones, PATCH en cancelar reserva, try/catch en auth.me(), fs.unlink fix.
- `instructor.service.js` eliminado (dead code).

### Archivos creados
- `client/src/components/common/Ayuda.jsx`
- `client/src/components/common/AyudaContextual.jsx`
- `client/src/utils/helpers.js`
- `server/src/controllers/creditos.controller.js`
- `server/src/controllers/notificaciones.controller.js`
- `server/src/controllers/reservas.controller.js`
- `server/src/services/credito.service.js`
- `server/src/services/notificacion.service.js`
- `server/src/services/reserva.service.js`

### Archivos eliminados
- `server/src/services/instructor.service.js`

---

## 2026-07-01 (parte 2)

### Transición suave de tema oscuro
- **`toggleTheme`** en `ThemeContext.jsx`: agrega clase `theme-transitioning` al `<html>` antes de cambiar tema, la remueve tras 300ms.
- **`App.css`**: nuevo bloque `.theme-transitioning, .theme-transitioning *` con `transition` en `background-color, color, border-color, box-shadow, fill, stroke` con `!important`.
- Sin impacto en interacciones normales (clase solo existe durante 300ms al togglear).

### Desactivar animaciones (toggle + OS)
- **`ThemeContext.jsx`**: nuevo estado `reducedMotion` persistido en `localStorage('movi-reduced-motion')` + `toggleReducedMotion`.
- **`App.css`**: bloque `[data-reduced-motion="true"]` anula solo animaciones de transición entre páginas (`page-fade-in`, `clase-card-slim`, `date-carousel`, `back-btn`, `category-active-header`). Mismo alcance en `@media (prefers-reduced-motion: reduce)` para respetar preferencia del SO.
- **`ClientLayout.jsx` / `InstructorLayout.jsx`**: nuevo `useEffect` sincroniza `data-reduced-motion` en `<html>`.
- **`MiPerfil.jsx` / `Perfil.jsx` (instructor)**: toggle "Desactivar animaciones" en Preferencias, debajo del toggle de tema oscuro.

### Ayuda colapsable por defecto
- **`Ayuda.jsx`**: nueva prop `collapsible` (default `true`). La card arranca cerrada (solo título + chevron `▼`). Click en el título expande/colapsa el contenido. Chevron rota 180° al abrir.

### Archivos modificados
- `client/src/components/common/Ayuda.jsx`
- `client/src/context/ThemeContext.jsx`
- `client/src/App.css`
- `client/src/components/layout/ClientLayout.jsx`
- `client/src/components/layout/InstructorLayout.jsx`
- `client/src/pages/client/MiPerfil.jsx`
- `client/src/pages/instructor/Perfil.jsx`
