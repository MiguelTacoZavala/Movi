import { useState, useRef } from 'react'
import { User, Moon, Sun, Camera, Type, AlignLeft, ChevronDown, CaseSensitive, CheckCircle, AlertCircle } from 'lucide-react'
import Ayuda from '../../components/common/Ayuda'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import { useAccesibilidad } from '../../context/useAccesibilidad'
import api from '../../services/api'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

export default function Perfil() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme, reducedMotion, toggleReducedMotion } = useTheme()
  const { textSize, lineSpacing, dyslexiaFont, setTextSize, setLineSpacing, setDyslexiaFont } = useAccesibilidad()
  const [accExpanded, setAccExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', telefono: '', email: '' })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
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
    const cleaned = ['nombres', 'apellidos'].includes(name) ? value.replace(/\d/g, '') : value
    setEditData({ ...editData, [name]: cleaned })
  }

  const handleSave = async () => {
    if (!editData.nombres.trim()) {
      setSaveError('El nombre es un campo obligatorio.')
      return
    }
    setSaveLoading(true)
    setSaveError('')
    setSaveSuccess('')
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
      setSaveSuccess('Perfil actualizado correctamente.')
      setTimeout(() => setSaveSuccess(''), 4000)
    } catch {
      setSaveError('No se pudieron guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar 5 MB.')
      setTimeout(() => setUploadError(''), 4000)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    setUploadError('')
    try {
      const result = await api.uploadProfilePhoto(file)
      updateUser({ fotoUrl: result.fotoUrl })
      setPreviewUrl(null)
    } catch {
      setUploadError('No se pudo subir la foto. Intenta con otro archivo.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const fotoSource = previewUrl || user?.fotoUrl

  return (
    <div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Editar Perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Nombres" hint="Solo letras" name="nombres" value={editData.nombres} onChange={handleEditChange} required />
          <Input label="Apellidos" hint="Solo letras" name="apellidos" value={editData.apellidos} onChange={handleEditChange} />
          <Input label="Teléfono" name="telefono" type="tel" value={editData.telefono} onChange={handleEditChange} />
          <Input label="Email" name="email" type="email" value={editData.email} onChange={handleEditChange} />
          <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saveLoading}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <h2 className="client-section-title">Mi Perfil</h2>
      <p className="client-section-subtitle">Información personal</p>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', position: 'relative', cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Cambiar foto de perfil"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {fotoSource ? (
              <img src={fotoSource} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={40} className="icon-primary" aria-hidden="true" />
            )}
          </div>
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            background: 'var(--primary-medium)', borderRadius: '50%',
            width: 28, height: 28, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
            border: '2px solid var(--white)',
          }} aria-hidden="true">
            <Camera size={14} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          aria-label="Subir foto de perfil"
        />
        <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--gray-900)' }}>
          {user?.nombres} {user?.apellidos}
        </h3>
        {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Subiendo foto...</p>}
        {uploadError && (
          <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      <Button variant="secondary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={openEditModal} title="Modificar tus datos personales">
        Editar Perfil
      </Button>

      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <Moon size={20} className="icon-primary" aria-hidden="true" /> : <Sun size={20} className="icon-primary" aria-hidden="true" />}
            Preferencias
          </div>
        </div>
        <div className="client-card-content">
          <div
            onClick={toggleTheme}
            title="Alternar entre tema claro y oscuro"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer' }}
            role="switch"
            aria-checked={theme === 'dark'}
            tabIndex={0}
            aria-label="Alternar tema oscuro"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleTheme()
              }
            }}
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
          <div
            onClick={toggleReducedMotion}
            title="Activar o desactivar animaciones al cambiar de página"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' }}
            role="switch"
            aria-checked={!reducedMotion}
            tabIndex={0}
            aria-label="Alternar animaciones"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleReducedMotion()
              }
            }}
          >
            <span style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>Animaciones</span>
            <div style={{
              width: 44, height: 24, borderRadius: 12, padding: 2,
              background: reducedMotion ? 'var(--gray-300)' : 'var(--success)',
              transition: 'background 0.2s ease', position: 'relative',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: reducedMotion ? 2 : 22,
                transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} className="icon-primary" aria-hidden="true" />
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
          </div>
        </div>
      </div>

      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div
          className="client-card-title"
          onClick={() => setAccExpanded(v => !v)}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type size={20} className="icon-primary" />
              Accesibilidad
            </div>
            <ChevronDown
              size={18}
              className="icon-primary"
              style={{
                transition: 'transform 0.3s ease',
                transform: accExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </div>
        </div>
        {accExpanded && (
          <div className="client-card-content">
            <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Type size={18} className="icon-primary" />
                <span style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>Tamaño de texto</span>
              </div>
              <div className="accesibilidad-opciones">
                <button
                  className={`accesibilidad-btn ${textSize === 'normal' ? 'active' : ''}`}
                  onClick={() => setTextSize('normal')}
                  aria-pressed={textSize === 'normal'}
                >
                  Normal
                </button>
                <button
                  className={`accesibilidad-btn ${textSize === 'grande' ? 'active' : ''}`}
                  onClick={() => setTextSize('grande')}
                  aria-pressed={textSize === 'grande'}
                >
                  Grande
                </button>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlignLeft size={18} className="icon-primary" />
                <span style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>Interlineado</span>
              </div>
              <div className="accesibilidad-opciones">
                <button
                  className={`accesibilidad-btn ${lineSpacing === 'normal' ? 'active' : ''}`}
                  onClick={() => setLineSpacing('normal')}
                  aria-pressed={lineSpacing === 'normal'}
                >
                  Normal
                </button>
                <button
                  className={`accesibilidad-btn ${lineSpacing === 'relajado' ? 'active' : ''}`}
                  onClick={() => setLineSpacing('relajado')}
                  aria-pressed={lineSpacing === 'relajado'}
                >
                  Relajado
                </button>
                <button
                  className={`accesibilidad-btn ${lineSpacing === 'extra' ? 'active' : ''}`}
                  onClick={() => setLineSpacing('extra')}
                  aria-pressed={lineSpacing === 'extra'}
                >
                  Extra
                </button>
              </div>
            </div>

            <div
              role="switch"
              aria-checked={dyslexiaFont}
              aria-label="Activar o desactivar espaciado para dislexia"
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDyslexiaFont(!dyslexiaFont) } }}
              title="Activar o desactivar espaciado para dislexia"
              tabIndex={0}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CaseSensitive size={18} className="icon-primary" />
                <span style={{ color: 'var(--gray-700)', fontSize: '0.95rem' }}>Espaciado para dislexia</span>
              </div>
              <div style={{
                width: 44, height: 24, borderRadius: 12, padding: 2,
                background: dyslexiaFont ? 'var(--success)' : 'var(--gray-300)',
                transition: 'background 0.2s ease', position: 'relative',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2,
                  left: dyslexiaFont ? 22 : 2,
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <Ayuda role="instructor" />
    </div>
  )
}
