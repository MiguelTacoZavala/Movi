# Base de Datos MOVI

Sistema de Gestión y Reserva de Clases de Baile.

Motor: **MySQL**.

---

## Convenciones

- Nombres de tablas en plural y minúsculas con guion bajo (`snake_case`).
- `id` como `INT AUTO_INCREMENT PRIMARY KEY` en todas las tablas.
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` en tablas que registran eventos.
- Las FK siguen el patrón `fk_tabla_origen_tabla_destino`.

---

## Diagrama de relaciones

```
roles ──< usuarios ──< instructores
                            │
categorias_baile ──< horarios_semanales >── instructores
                            │
                   clases ──< horarios_semanales
                      │
              posiciones_clase ──< clases
                      │
              reservas ──< usuarios
                  │   ──< clases
                  │   ──< posiciones_clase
                  │
              pagos ──< reservas

              creditos ──< usuarios
                      ──? clases

              notificaciones ──< usuarios
```

- `──<` = uno a muchos (la flecha apunta a la tabla referenciada)
- `>──` = muchos a uno
- `──?` = opcional (FK nullable)

---

## Tablas

### roles

Propósito: Define los roles del sistema.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| nombre | VARCHAR(50) | NOT NULL UNIQUE | `ADMIN`, `CLIENTE`, `INSTRUCTOR` |

**Datos iniciales:**
```sql
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CLIENTE'), ('INSTRUCTOR');
```

---

### usuarios

Propósito: Almacena todos los usuarios del sistema sin importar su rol.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| rol_id | INT | FK → roles(id) NOT NULL | |
| nombres | VARCHAR(100) | NOT NULL | |
| apellidos | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(150) | NULL UNIQUE | Login de admin/instructor |
| dni | VARCHAR(15) | NULL UNIQUE | Login de cliente |
| telefono | VARCHAR(20) | NULL UNIQUE | Login alternativo de cliente |
| password | VARCHAR(255) | NOT NULL | Hash de la contraseña |
| foto_url | VARCHAR(255) | NULL | Foto de perfil |
| estado | BOOLEAN | DEFAULT TRUE | Activo/Inactivo |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Notas:**
- Admin: usa `email`, no requiere `dni` ni `telefono`.
- Instructor: usa `email`, no requiere `dni`.
- Cliente: usa `dni` o `telefono`, no requiere `email`.
- Solo el campo correspondiente al método de login debe ser NOT NULL a nivel aplicación, pero en la BD todos son NULL por flexibilidad.

---

### instructores

Propósito: Datos adicionales para usuarios con rol `INSTRUCTOR`.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| usuario_id | INT | FK → usuarios(id) UNIQUE NOT NULL ON DELETE CASCADE | |
| especialidad | VARCHAR(100) | NULL | Ej: "Salsa", "Bachata" |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | NULL ON UPDATE CURRENT_TIMESTAMP | |

**Notas:**
- Relación 1:1 con `usuarios`.
- El contacto del instructor se almacena en `usuarios.telefono`.
- El estado (Activo/Inactivo) se almacena en `usuarios.estado`.

---

### categorias_baile

Propósito: Tipos de baile ofrecidos (Salsa, Bachata, Tango, etc.).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| nombre | VARCHAR(100) | NOT NULL UNIQUE | |
| descripcion | TEXT | NULL |

**Datos iniciales:**
```sql
INSERT INTO categorias_baile (nombre, descripcion) VALUES
('Salsa',   'Ritmo y energía'),
('Bachata', 'Romántica y sensual'),
('Tango',   'Pasión y elegancia');
```

---

### horarios_semanales

Propósito: Programación semanal fija. Cada fila representa un bloque horario recurrente (ej: "María García da Salsa los lunes 10:00-11:30").

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| categoria_id | INT | FK → categorias_baile(id) NOT NULL | |
| instructor_id | INT | FK → instructores(id) NOT NULL | |
| dia_semana | ENUM | NOT NULL | LUNES a DOMINGO |
| hora_inicio | TIME | NOT NULL | |
| hora_fin | TIME | NOT NULL | Debe ser mayor a hora_inicio |
| capacidad_maxima | INT | NOT NULL | Cupo total de la clase |
| minimo_participantes | INT | NOT NULL DEFAULT 7 | Mínimo para que la clase se confirme |
| activo | BOOLEAN | DEFAULT TRUE | Permite desactivar sin eliminar |
| created_by | INT | FK → usuarios(id) NULL | Admin que creó el horario |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | NULL ON UPDATE CURRENT_TIMESTAMP |

**Validaciones (CHECK constraints):**
- `chk_horario_hora`: `hora_fin > hora_inicio`
- `chk_horario_capacidad_maxima`: `capacidad_maxima > 0`
- `chk_horario_minimo_participantes`: `minimo_participantes > 0`
- `chk_horario_minimo_vs_capacidad`: `minimo_participantes <= capacidad_maxima`
- No overlaps del mismo instructor en el mismo día y horario — a nivel aplicación.

---

### clases

Propósito: Ocurrencias reales de clases, generadas automáticamente desde `horarios_semanales` (generalmente 4 semanas adelante).

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| horario_semanal_id | INT | FK → horarios_semanales(id) NOT NULL ON DELETE CASCADE | |
| fecha | DATE | NOT NULL | |
| hora_inicio | TIME | NOT NULL | Copiado del horario al generarse |
| hora_fin | TIME | NOT NULL | Copiado del horario al generarse |
| capacidad_maxima | INT | NOT NULL | Copiado del horario al generarse |
| minimo_participantes | INT | NOT NULL DEFAULT 7 | Copiado del horario al generarse |
| tematica | VARCHAR(100) | DEFAULT 'LIBRE' | Modificable por el instructor |
| estado | ENUM | DEFAULT 'PROGRAMADA' | PROGRAMADA, EN_CURSO, CANCELADA, FINALIZADA |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | NULL ON UPDATE CURRENT_TIMESTAMP |

**Validaciones (CHECK constraints):**
- `chk_clase_capacidad_maxima`: `capacidad_maxima > 0`
- `chk_clase_minimo_participantes`: `minimo_participantes > 0`
- `chk_clase_minimo_vs_capacidad`: `minimo_participantes <= capacidad_maxima`

**Restricciones UNIQUE:**
- `uq_clase_horario_fecha` UNIQUE(horario_semanal_id, fecha): evita generar dos clases para el mismo horario en la misma fecha.

**Notas:**
- `hora_inicio`, `hora_fin`, `capacidad_maxima` y `minimo_participantes` se copian desde `horarios_semanales` al generar la clase, permitiendo que una clase puntual difiera del horario base si es necesario.
- La grilla de asientos se calcula desde `capacidad_maxima`:
  - ≤ 10 → 4 columnas
  - ≤ 20 → 5 columnas
  - > 20 → 6 columnas

---

### posiciones_clase

Propósito: Asientos físicos numerados dentro de una clase.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| clase_id | INT | FK → clases(id) NOT NULL ON DELETE CASCADE | |
| numero | INT | NOT NULL | Número de asiento (1..capacidad_maxima) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Relaciones:**
- `uq_clase_numero` UNIQUE(clase_id, numero): un asiento no se repite dentro de una clase.
- `uq_clase_id_posicion` UNIQUE(clase_id, id): permite que `reservas` referencie con FK compuesta `(clase_id, posicion_clase_id)` garantizando que la posición pertenezca a la clase.
- El estado (disponible/ocupado) se deduce de la existencia de una `reservas` activa con `posicion_clase_id` = esta posición.

---

### reservas

Propósito: Registro de inscripciones de clientes a clases.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| usuario_id | INT | FK → usuarios(id) NOT NULL | Cliente que reserva |
| clase_id | INT | FK → clases(id) NOT NULL | |
| posicion_clase_id | INT | FK → posiciones_clase(id) NOT NULL | Asiento seleccionado |
| codigo_pago | VARCHAR(20) | NOT NULL UNIQUE | Código `MOV-XXXXXX` |
| estado | ENUM | DEFAULT 'PENDIENTE' | PENDIENTE, CONFIRMADA, CANCELADA, EXPIRADA |
| fecha_reserva | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| expiracion_reserva | TIMESTAMP | NULL | Límite del hold de 5 min |
| fecha_confirmacion | TIMESTAMP | NULL | Momento del pago confirmado |
| fecha_cancelacion | TIMESTAMP | NULL | Momento de la cancelación |
| cancelado_por | INT | FK → usuarios(id) NULL | Usuario o sistema que canceló |
| uso_credito | BOOLEAN | DEFAULT FALSE | Si se pagó con créditos |
| updated_at | TIMESTAMP | NULL ON UPDATE CURRENT_TIMESTAMP |

**Restricciones:**
- `fk_reserva_posicion_pertenece_clase` FK compuesta (clase_id, posicion_clase_id) → posiciones_clase(clase_id, id): garantiza que el asiento reservado pertenezca a la clase indicada. Previene errores de programación.
- No hay UNIQUE sobre `posicion_clase_id`: se elimina para permitir reusar un asiento cuando la reserva previa fue CANCELADA o EXPIRADA. El control de asientos ocupados se hace a nivel aplicación (solo 1 reserva activa por posición).

**Notas:**
- `codigo_pago` se genera como `MOV-` + 6 caracteres alfanuméricos aleatorios.
- `expiracion_reserva` = `fecha_reserva + 5 minutos` para el hold timer.

---

### pagos

Propósito: Información del pago asociado a una reserva. Relación 1:1.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| reserva_id | INT | FK → reservas(id) UNIQUE NOT NULL ON DELETE CASCADE | |
| metodo_pago | ENUM('yape', 'creditos') | NOT NULL | Yape o créditos |
| monto | DECIMAL(10,2) | NOT NULL | Monto pagado |
| estado | ENUM | DEFAULT 'PENDIENTE' | PENDIENTE, PAGADO, FALLIDO |
| fecha_pago | TIMESTAMP | NULL | Momento en que se confirmó el pago |
| culqi_charge_id | VARCHAR(255) | NULL | ID del cargo en Culqi (para pagos Yape) |

**Notas:**
- En el MVP actual el pago es simulado (siempre exitoso tras 2.5s de procesamiento).
- `monto` se calcula según la categoría: Salsa = 25, Bachata = 30, Tango = 35.

---

### creditos

Propósito: Créditos de clase gratuita generados cuando una clase se cancela.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| usuario_id | INT | FK → usuarios(id) NOT NULL ON DELETE CASCADE | Cliente que recibe el crédito |
| clase_id | INT | FK → clases(id) NULL ON DELETE SET NULL | Clase cancelada que originó el crédito |
| reserva_id | INT | FK → reservas(id) NULL ON DELETE SET NULL | Reserva en la que se consumió el crédito |
| usado | BOOLEAN | DEFAULT FALSE | |
| fecha_creacion | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| fecha_uso | TIMESTAMP | NULL | Momento en que se consumió el crédito |

**Notas:**
- `clase_id` es opcional: registra qué clase cancelada generó el crédito, pero si la clase se elimina, el crédito permanece (ON DELETE SET NULL).
- `reserva_id` y `fecha_uso` dan trazabilidad al consumo del crédito.
- El control para evitar múltiples créditos por una misma cancelación se realiza a nivel aplicación.

---

### notificaciones

Propósito: Notificaciones para los usuarios del sistema.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK AUTO_INCREMENT | |
| usuario_id | INT | FK → usuarios(id) NOT NULL ON DELETE CASCADE | |
| tipo | ENUM | NOT NULL | INSCRIPCION_CONFIRMADA, RECORDATORIO, CLASE_CANCELADA, CREDITO_GENERADO |
| mensaje | TEXT | NOT NULL | |
| leido | BOOLEAN | DEFAULT FALSE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

## Mapeo mock → base de datos

| Archivo mock (mockData.js) | Tabla SQL |
|----------------------------|-----------|
| `roles` (implícito en `AuthContext`) | `roles` |
| `instructores[]` | `usuarios` (rol INSTRUCTOR) + `instructores` |
| `categorias[]` | `categorias_baile` |
| `mockHorariosSemanales[]` | `horarios_semanales` |
| `mockClasesGeneradas[]` | `clases` + `posiciones_clase` |
| `mockClases[]` (legacy client) | `clases` + `posiciones_clase` |
| `mockInscripciones[]` | `reservas` + `pagos` |
| `mockCreditos[]` | `creditos` |
| `mockNotificaciones[]` | `notificaciones` |

---

## Índices

| Índice | Tabla | Columna | Propósito |
|--------|-------|---------|-----------|
| `idx_clases_fecha` | `clases` | `fecha` | Búsqueda rápida de clases por fecha |
| `idx_reservas_usuario` | `reservas` | `usuario_id` | Historial de reservas de un cliente |
| `idx_reservas_clase` | `reservas` | `clase_id` | Participantes de una clase |
| `idx_creditos_usuario` | `creditos` | `usuario_id` | Créditos disponibles de un cliente |
| `idx_notificaciones_usuario` | `notificaciones` | `usuario_id` | Notificaciones de un usuario |

---

## Consideraciones futuras

- **Auditoría**: Agregar tabla `auditoria_log` para registrar acciones de administradores (crear/editar horarios, cancelar clases).
- **Múltiples salones**: Si se requiere, agregar tabla `salones` y FK `salon_id` en `horarios_semanales`.
- **Pagos reales**: Integrar con pasarela de pago (Yape, Mercado Pago, etc.) y reemplazar la simulación actual.
