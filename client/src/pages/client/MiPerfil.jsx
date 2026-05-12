import { User, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import '../../App.css'

export default function MiPerfil() {
  const { user } = useAuth()

  const mockStats = {
    creditos: 5,
    totalReservas: 12,
    clasesAsistidas: 8,
    proximasReservas: 3
  }

  const mockHistorial = [
    { id: 1, clase: 'Salsa', fecha: '2026-04-28', estado: 'asistida' },
    { id: 2, clase: 'Bachata', fecha: '2026-04-25', estado: 'asistida' },
    { id: 3, clase: 'Tango', fecha: '2026-04-20', estado: 'cancelada' },
  ]

  return (
    <div>
      <div className="perfil-header">
        <div className="perfil-avatar">
          <User size={40} />
        </div>
        <h2 className="perfil-name">{user?.nombres} {user?.apellidos}</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
          Bienvenido a MOVI
        </p>
      </div>

      <div className="perfil-creditos">{mockStats.creditos}</div>
      <div style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Créditos disponibles
      </div>

      <Button variant="secondary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={() => alert('Funcionalidad próximamente disponible')}>
        Editar Perfil
      </Button>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} className="icon-primary" />
            Información Personal
          </div>
        </div>
        <div className="client-card-content">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Nombres</span>
              <span style={{ fontWeight: 500 }}>{user?.nombres}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Apellidos</span>
              <span style={{ fontWeight: 500 }}>{user?.apellidos}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>DNI</span>
              <span style={{ fontWeight: 500 }}>{user?.dni}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Teléfono</span>
              <span style={{ fontWeight: 500 }}>{user?.telefono}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="icon-primary" />
            Historial Reciente
          </div>
        </div>
        <div className="client-card-content">
          {mockHistorial.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem', 
              background: 'var(--gray-50)', 
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.clase}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{item.fecha}</div>
              </div>
              <span className={`status-badge ${item.estado === 'asistida' ? 'status-active' : 'status-inactive'}`}>
                {item.estado === 'asistida' ? 'Asistida' : 'Cancelada'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
