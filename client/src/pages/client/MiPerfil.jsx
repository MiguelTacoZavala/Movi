import { useState, useRef, useEffect } from 'react'
import { User, Moon, Sun, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

export default function MiPerfil() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', telefono: '' })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [creditos, setCreditos] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/creditos').then(res => {
      const disponibles = (res.creditos || []).filter(c => !c.usado).length
      setCreditos(disponibles)
    }).catch(() => {})
  }, [])

  const openEditModal = () => {
    setEditData({
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      telefono: user?.telefono || '',
    })
    setModalOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData({ ...editData, [name]: value })
  }

  const handleSave = async () => {
    if (!editData.nombres.trim() || !editData.apellidos.trim()) {
      alert('Nombres y apellidos son obligatorios')
      return
    }
    try {
      await api.updateProfile({
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        telefono: editData.telefono.trim(),
      })
      updateUser({
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        telefono: editData.telefono.trim(),
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
          <Input
            label="Nombres"
            name="nombres"
            value={editData.nombres}
            onChange={handleEditChange}
            required
          />
          <Input
            label="Apellidos"
            name="apellidos"
            value={editData.apellidos}
            onChange={handleEditChange}
            required
          />
          <div className="form-group">
            <label>DNI</label>
            <input
              type="text"
              value={user?.dni || ''}
              disabled
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.95rem', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: '8px', color: 'var(--gray-500)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', display: 'block' }}>
              El DNI no se puede modificar
            </span>
          </div>
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={editData.telefono}
            onChange={handleEditChange}
          />
          <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
            <Button onClick={handleSave}>Guardar cambios</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <div className="perfil-header">
        <div
          className="perfil-avatar"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {fotoSource ? (
            <img
              src={fotoSource}
              alt="Foto de perfil"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <User size={40} />
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
        <h2 className="perfil-name">{user?.nombres} {user?.apellidos}</h2>
        {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Subiendo foto...</p>}
      </div>

      <div className="perfil-creditos">{creditos}</div>
      <div style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Créditos disponibles
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
