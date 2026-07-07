import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import '../../App.css'

const styles = `
details > summary { list-style: none }
details > summary::-webkit-details-marker { display: none }
details > summary::marker { display: none }
`

const FAQ_CLIENTE = [
  {
    q: '¿Cómo reservar una clase?',
    a: 'Ve a la pestaña Clases, elige el estilo de baile, selecciona una fecha disponible, escoge tu asiento en el mapa, elige un método de pago y presiona "Pagar e inscribirme". Recibirás un código de pago como comprobante.',
  },
  {
    q: '¿Qué métodos de pago tengo?',
    a: 'Puedes pagar con Yape (pago móvil a través de Culqi) o usando tus Créditos disponibles. Si eliges Yape, el pago se procesa al instante. Si usas créditos, el cargo se descuenta automáticamente de tu saldo.',
  },
  {
    q: '¿Cómo cancelo una reserva?',
    a: 'Ingresa a Mis Clases, busca la clase que deseas cancelar y presiona el botón rojo "Cancelar inscripción". Confirma en la ventana emergente. Si pagaste con Yape, se generará un crédito de devolución para uso futuro. Si usaste un crédito, se restaurará a tu saldo.',
  },
  {
    q: '¿Cómo obtengo y uso créditos?',
    a: 'Los créditos se generan cuando una clase es cancelada por el administrador, o cuando tú cancelas una reserva pagada con Yape. Puedes usarlos como método de pago al reservar una nueva clase.',
  },
  {
    q: '¿Cómo cambio mi foto de perfil?',
    a: 'En tu Perfil, presiona sobre el círculo del avatar (tu foto o el icono de persona). Selecciona una imagen desde tu dispositivo y se subirá automáticamente.',
  },
  {
    q: '¿Cómo activo el tema oscuro?',
    a: 'En tu Perfil, busca la sección Preferencias y activa el interruptor "Tema oscuro". El cambio es instantáneo y solo afecta a tu sesión actual.',
  },
  {
    q: '¿Qué es el temporizador de reserva?',
    a: 'Al elegir un asiento y pagar con Yape, tienes 5 minutos para completar el pago. El asiento se mantiene temporalmente reservado. Si el tiempo expira, deberás seleccionar el asiento nuevamente.',
  },
  {
    q: '¿Cómo configuro la accesibilidad?',
    a: 'En tu Perfil, busca la sección Accesibilidad. Puedes ajustar el tamaño del texto, el espaciado de líneas y activar una fuente amigable para dislexia.',
  },
]

const FAQ_INSTRUCTOR = [
  {
    q: '¿Qué veo en el Inicio?',
    a: 'En Inicio ves un resumen con tu próxima clase y las clases del día. Presiona una clase para ver más detalles.',
  },
  {
    q: '¿Dónde veo mi horario semanal?',
    a: 'En la pestaña Horarios del menú inferior. Allí aparecen todas tus clases recurrentes con día, hora, capacidad y mínimo de participantes.',
  },
  {
    q: '¿Cómo veo mis clases programadas?',
    a: 'Ve a la pestaña Clases. Verás tus clases programadas y en curso ordenadas por fecha. Presiona sobre una clase para ver los participantes.',
  },
  {
    q: '¿Cómo veo quién se inscribió?',
    a: 'Desde la pestaña Clases, presiona sobre la clase que te interesa. Se abrirá una vista con la lista de participantes y su número de asiento.',
  },
  {
    q: '¿Cómo cambio la temática de una clase?',
    a: 'Presiona sobre la clase en la pestaña Clases, luego haz clic en "Editar" junto a la temática actual. Escribe el nuevo valor, confirma con el botón ✓ y luego presiona "Confirmar" en la ventana emergente.',
  },
  {
    q: '¿Qué muestra el Historial?',
    a: 'En la pestaña Historial ves tus clases finalizadas o canceladas. Puedes consultar el registro de tus clases anteriores.',
  },
  {
    q: '¿Cómo cambio mi foto de perfil?',
    a: 'En tu Perfil, presiona sobre el círculo del avatar. Selecciona una imagen desde tu dispositivo y se subirá automáticamente.',
  },
  {
    q: '¿Cómo activo el tema oscuro?',
    a: 'En tu Perfil, busca la sección Preferencias y activa el interruptor "Tema oscuro". El cambio es instantáneo.',
  },
  {
    q: '¿Cómo configuro la accesibilidad?',
    a: 'En tu Perfil, busca la sección Accesibilidad. Puedes ajustar el tamaño del texto, el espaciado de líneas y activar una fuente amigable para dislexia.',
  },
  {
    q: '¿Cómo edito mis datos personales?',
    a: 'En tu Perfil, presiona el botón "Editar Perfil". Puedes modificar tus nombres, apellidos, teléfono y email. Guarda los cambios al terminar.',
  },
]

export default function Ayuda({ role = 'cliente', collapsible = true }) {
  const faqs = role === 'instructor' ? FAQ_INSTRUCTOR : FAQ_CLIENTE
  const [expanded, setExpanded] = useState(!collapsible)

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'space-between',
    cursor: collapsible ? 'pointer' : 'default',
    userSelect: 'none',
  }

  return (
    <>
      <style>{styles}</style>
      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div
          className="client-card-title"
          onClick={collapsible ? () => setExpanded(v => !v) : undefined}
          style={collapsible ? { cursor: 'pointer', userSelect: 'none' } : undefined}
        >
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} className="icon-primary" />
              Ayuda
            </div>
            {collapsible && (
              <ChevronDown
                size={18}
                className="icon-primary"
                style={{
                  transition: 'transform 0.3s ease',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            )}
          </div>
        </div>
        {expanded && (
          <div className="client-card-content" style={{ padding: 0 }}>
            {faqs.map((item, i) => (
              <details
                key={i}
                style={{
                  borderBottom: i < faqs.length - 1 ? '1px solid var(--gray-100)' : 'none',
                }}
              >
                <summary
                  style={{
                    padding: '0.9rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: 'var(--gray-800)',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    userSelect: 'none',
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--primary-soft)',
                    color: 'var(--primary-medium)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  {item.q}
                </summary>
                <div
                  style={{
                    padding: '0 1rem 1rem 3rem',
                    fontSize: '0.85rem',
                    color: 'var(--gray-600)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
