import { useState } from 'react'
import { User, Award } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

export default function Perfil() {
  const { user, updateUser } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', contacto: '', email: '' })

  const openEditModal = () => {
    setEditData({
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      contacto: user?.contacto || '',
      email: user?.email || '',
    })
    setModalOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData({ ...editData, [name]: value })
  }

  const handleSave = () => {
    if (!editData.nombres.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    updateUser({
      nombres: editData.nombres.trim(),
      apellidos: editData.apellidos.trim(),
      contacto: editData.contacto.trim(),
      email: editData.email.trim(),
    })
    setModalOpen(false)
  }

  return (
    <div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Editar Perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nombres" name="nombres" value={editData.nombres} onChange={handleEditChange} required />
          <Input label="Apellidos" name="apellidos" value={editData.apellidos} onChange={handleEditChange} />
          <Input label="Teléfono" name="contacto" type="tel" value={editData.contacto} onChange={handleEditChange} />
          <Input label="Email" name="email" type="email" value={editData.email} onChange={handleEditChange} />
          <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <h2 className="client-section-title">Mi Perfil</h2>
      <p className="client-section-subtitle">Información personal</p>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <User size={40} className="icon-primary" />
        </div>
        <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--gray-900)' }}>
          {user?.nombres} {user?.apellidos}
        </h3>
      </div>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} className="icon-primary" />
            Información
          </div>
        </div>
        <div className="client-card-content">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Especialidad</span>
              <span style={{ fontWeight: 500 }}>{user?.especialidad || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Teléfono</span>
              <span style={{ fontWeight: 500 }}>{user?.contacto || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Email</span>
              <span style={{ fontWeight: 500 }}>{user?.email || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <Button variant="secondary" style={{ width: '100%' }} onClick={openEditModal}>
        Editar Perfil
      </Button>
    </div>
  )
}
