# Movi — Flujo de reserva del cliente

Sistema de reserva y gestión de clases de baile.

## 1. Ingreso al sistema

**Iniciar sesión** (`/login`): DNI `12345678` o teléfono `999111222`, contraseña `cliente123`.

**Registrarse** (`/registro`): completa nombres, apellidos, DNI, teléfono y contraseña. Guarda en `localStorage` e inicia sesión automáticamente.

## 2. Dashboard (`/cliente/dashboard`)

Saludo personalizado, próxima clase reservada (si existe), clases destacadas.

## 3. Elegir clase (`/cliente/clases`)

1. Seleccionar categoría (Salsa, Bachata, Tango…).
2. Carrusel de 6 días (lun–sáb). Hoy seleccionado. Pasados deshabilitados.
3. Clases agrupadas por franja (mañana, tarde, nocturnas). Cada tarjeta muestra instructor, hora, duración, cupos.

## 4. Detalle de clase (`/cliente/clases/:id`)

- **Info**: categoría, instructor, foto, temática (default `LIBRE`).
- **Mapa de asientos**: cuadrícula. Verde = disponible, gris = ocupado. Al tocar cambia a color de selección.
- **Pago**: Yape (muestra el teléfono del cliente) o Créditos (simulado, 5 disponibles).
- Botón **"Pagar Reserva"**: se habilita solo con asiento + método de pago.

## 5. Modal de confirmación

Resumen: clase, asiento #, método de pago. Botones **Cancelar** (vuelve a selección) y **Confirmar**.

## 6. Procesamiento

Al confirmar: contador de **5 minutos** + 2.5s de procesamiento simulado. Si expira, se resetea la selección.

## 7. Pantalla de éxito

Icono verde, resumen completo, **código de pago** (`MOV-XXXXXX`). Botón **"Ir a Mis Reservas"**.

## 8. Mis Reservas (`/cliente/mis-reservas`)

Lista filtrable (Próximas / Todas). Cada tarjeta → modal comprobante con código, método de pago, temática. Se puede cancelar desde el botón en cada tarjeta.

## Notas técnicas

- Todo es front-end puro (mock). Sin base de datos.
- Reservas en memoria (`mockReservas`), no persisten al recargar.
- Hold timer local de 5 minutos. Al expirar resetea selección.
- Código de pago: `generarCodigoPago()` → `MOV-` + 6 caracteres.
- Tema oscuro desde Mi Perfil. No afecta el flujo.
