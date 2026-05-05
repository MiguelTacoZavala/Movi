import { Music, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../../App.css'

const mockReservaProxima = {
  id: 1,
  clase: 'Salsa Intermedio',
  fecha: '2026-05-05',
  hora_inicio: '10:00',
  hora_fin: '11:30',
  instructor: 'María García'
}

const mockClasesDestacadas = [
  { id: 1, categoria: 'Salsa', instructor: 'María García', hora_inicio: '10:00', cupos: '25/30' },
  { id: 2, categoria: 'Bachata', instructor: 'Carlos López', hora_inicio: '14:00', cupos: '18/20' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <div className="client-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
          ¡Hola, {user?.nombres}!
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>
          Bienvenido a tu panel de control
        </p>
      </div>

      <div className="client-stats">
        <div className="client-stat-card">
          <div className="client-stat-value">5</div>
          <div className="client-stat-label">Créditos</div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-value">12</div>
          <div className="client-stat-label">Reservas</div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-value">8</div>
          <div className="client-stat-label">Asistidas</div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-value">3</div>
          <div className="client-stat-label">Próximas</div>
        </div>
      </div>

      {mockReservaProxima && (
        <div className="client-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="client-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} className="icon-primary" />
              Tu próxima clase
            </div>
          </div>
          <div className="client-card-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              {mockReservaProxima.clase}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} className="icon-muted" />
                {mockReservaProxima.fecha}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Music size={16} className="icon-muted" />
                {mockReservaProxima.hora_inicio} - {mockReservaProxima.hora_fin}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Music size={16} className="icon-muted" />
                {mockReservaProxima.instructor}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} className="icon-primary" />
            Clases destacadas
          </div>
        </div>
        <div className="client-card-content">
          {mockClasesDestacadas.map(clase => (
            <div key={clase.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                {clase.categoria}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Music size={14} className="icon-muted" />
                {clase.instructor} • {clase.hora_inicio} • {clase.cupos} cupos
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
