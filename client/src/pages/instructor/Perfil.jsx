import { useState, useRef } from 'react'
import { User, Moon, Sun, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

export default function Perfil() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', telefono: '', email: '' })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const openEditModal = () => {
    setEditData({
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
    })
    setModalOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData({ ...editData, [name]: value })
  }

  const handleSave = async () => {
    if (!editData.nombres.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    try {
      await api.updateProfile({
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        telefono: editData.telefono.trim(),
        email: editData.email.trim(),
      })
      updateUser({
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        telefono: editData.telefono.trim(),
        email: editData.email.trim(),
      })
      setModalOpen(false)
    } catch (e) {
      alert(e.message || 'Error al guardar')
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const result = await api.uploadProfilePhoto(file)
      updateUser({ fotoUrl: result.fotoUrl })
      setPreviewUrl(null)
    } catch (e) {
      alert(e.message || 'Error al subir foto')
    } finally {
      setUploading(false)
    }
  }

  const fotoSource = previewUrl || user?.fotoUrl

  return (
    <div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Editar Perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nombres" name="nombres" value={editData.nombres} onChange={handleEditChange} required />
          <Input label="Apellidos" name="apellidos" value={editData.apellidos} onChange={handleEditChange} />
          <Input label="Teléfono" name="telefono" type="tel" value={editData.telefono} onChange={handleEditChange} />
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
        <div
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {fotoSource ? (
            <img src={fotoSource} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={40} className="icon-primary" />
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            background: 'var(--primary-medium)', borderRadius: '50%',
            width: 28, height: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
          }}>
            <Camera size={14} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--gray-900)' }}>
          {user?.nombres} {user?.apellidos}
        </h3>
        {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Subiendo foto...</p>}
      </div>

      <Button variant="secondary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={openEditModal}>
        Editar Perfil
      </Button>

      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <Moon size={20} className="icon-primary" /> : <Sun size={20} className="icon-primary" />}
            Preferencias
          </div>
        </div>
        <div className="client-card-content">
          <div
            onClick={toggleTheme}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer' }}
          >
            <span style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>Tema oscuro</span>
            <div style={{
              width: 44, height: 24, borderRadius: 12, padding: 2,
              background: theme === 'dark' ? 'var(--success)' : 'var(--gray-300)',
              transition: 'background 0.2s ease', position: 'relative',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: theme === 'dark' ? 22 : 2,
                transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>
      </div>

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
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Especialidad</span>
              <span style={{ fontWeight: 500 }}>{user?.especialidad || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Teléfono</span>
              <span style={{ fontWeight: 500 }}>{user?.telefono || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Email</span>
              <span style={{ fontWeight: 500 }}>{user?.email || '—'}</span>
            </div>
            {user?.fotoUrl && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Foto</span>
                <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--gray-500)' }}>Subida ✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
