import { Music, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import '../../App.css'

const stats = [
  { title: 'Clases Activas', value: '12', icon: Music, color: '#662222' },
  { title: 'Clases Llenas', value: '3', icon: TrendingUp, color: '#842A3B' },
  { title: 'Clases Canceladas', value: '1', icon: XCircle, color: '#A3485A' },
  { title: 'Participantes', value: '48', icon: Users, color: '#662222' },
]

const clasesHoy = [
  { id: 1, clase: 'Salsa Intermedio', hora: '10:00 AM', instructor: 'María García', salon: 'Salón Principal', cupos: '25/30', estado: 'En curso' },
  { id: 2, clase: 'Bachata Básico', hora: '2:00 PM', instructor: 'Carlos López', salon: 'Salón 2', cupos: '18/20', estado: 'Programada' },
  { id: 3, clase: 'Tango Avanzado', hora: '6:00 PM', instructor: 'Ana Martínez', salon: 'Salón VIP', cupos: '10/15', estado: 'Programada' },
]

export default function Dashboard() {
  return (
    <div>
      <div className="dashboard-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div className="stat-card" key={index} style={{ animation: 'fadeInUp 0.35s ease both', animationDelay: `${index * 0.08}s` }}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <p style={{ color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

       <div className="table-container">
         <div className="dashboard-section" style={{ marginBottom: 0, border: 'none', boxShadow: 'none', padding: 0 }}>
           <h2>
             <Clock size={20} className="icon-primary" />
             Clases del Día
           </h2>
         </div>
         <table className="table">
           <thead>
             <tr>
               <th>Clase</th>
               <th>Hora</th>
               <th>Instructor</th>
               <th>Salón</th>
               <th>Cupos</th>
               <th>Estado</th>
             </tr>
           </thead>
           <tbody>
              {clasesHoy.map((clase, idx) => (
                <tr key={clase.id} style={{ animation: 'fadeInUp 0.3s ease both', animationDelay: `${idx * 0.04}s` }}>
                 <td>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Music size={16} className="icon-primary" />
                     {clase.clase}
                   </div>
                 </td>
                 <td>{clase.hora}</td>
                 <td>{clase.instructor}</td>
                 <td>{clase.salon}</td>
                 <td>{clase.cupos}</td>
                 <td>
                   <span className={`status-badge ${clase.estado === 'En curso' ? 'status-active' : clase.estado === 'Programada' ? 'status-info' : 'status-inactive'}`}>
                     {clase.estado === 'En curso' && <CheckCircle size={14} style={{ marginRight: '0.25rem' }} />}
                     {clase.estado}
                   </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  )
}
