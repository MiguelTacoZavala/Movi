import { useLocation } from 'react-router-dom'
import { HelpCircle, X } from 'lucide-react'
import { useState } from 'react'
import '../../App.css'

const TIPS = {
  cliente: {
    '/cliente/dashboard': 'En el inicio ves tus créditos, tu próxima clase y clases con cupo disponible. Presiona una clase para ir al detalle.',
    '/cliente/clases': 'Elige un estilo de baile, luego selecciona una fecha y una clase disponible para ver los asientos y pagar. Tienes 5 minutos para completar el pago con Yape.',
    '/cliente/mis-clases': 'Aquí están tus reservas. Presiona una para ver el comprobante. Puedes cancelar desde el botón rojo.',
    '/cliente/perfil': 'Edita tus datos, cambia tu foto de perfil, activa el tema oscuro y consulta las preguntas frecuentes.',
  },
  instructor: {
    '/instructor/dashboard': 'Bienvenido. Aquí ves tu próxima clase y las clases de hoy. Presiona una clase para más detalles.',
    '/instructor/clases': 'Tus clases programadas y tu horario semanal. Presiona una clase para ver los participantes y editar la temática.',
    '/instructor/clases/:id': 'Lista de participantes inscritos. Puedes editar la temática de la clase desde el botón Editar.',
    '/instructor/historial': 'Clases finalizadas o canceladas. Consulta el historial de tus clases anteriores.',
    '/instructor/perfil': 'Edita tus datos personales, cambia tu foto y consulta las preguntas frecuentes.',
  },
}

export default function AyudaContextual({ role = 'cliente' }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const tips = TIPS[role]
  const tip = tips[location.pathname] || tips[Object.keys(tips).find(k => location.pathname.startsWith(k.replace('/:id', '')))] || 'Usa el menú inferior para navegar entre las secciones.'

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Ayuda"
        style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1rem',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--primary-medium)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 90,
          fontSize: '1.1rem',
          fontWeight: 700,
        }}
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '9rem',
            right: '1rem',
            width: 'min(320px, calc(100vw - 2rem))',
            background: 'var(--card-bg, #fff)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 91,
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            💡 ¿Necesitas ayuda?
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.6, margin: 0 }}>
            {tip}
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            Más ayuda en <strong>Perfil → Ayuda</strong>
          </div>
        </div>
      )}
    </>
  )
}
