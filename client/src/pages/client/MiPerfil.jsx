import { useState, useRef, useEffect } from 'react'
import { User, Moon, Sun, Camera, AlertCircle, Type, AlignLeft, ChevronDown, CaseSensitive, CheckCircle } from 'lucide-react'
import Ayuda from '../../components/common/Ayuda'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import { useAccesibilidad } from '../../context/useAccesibilidad'
import api from '../../services/api'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

export default function MiPerfil() {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme, reducedMotion, toggleReducedMotion } = useTheme()
  const { textSize, lineSpacing, dyslexiaFont, setTextSize, setLineSpacing, setDyslexiaFont } = useAccesibilidad()
  const [accExpanded, setAccExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState({ nombres: '', apellidos: '', telefono: '' })
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [creditos, setCreditos] = useState(0)
  const [creditosError, setCreditosError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.cachedGet('/creditos').then(res => {
      const disponibles = (res.creditos || []).filter(c => !c.usado).length
      setCreditos(disponibles)
    }).catch(() => {
      setCreditosError('No pudimos cargar tus créditos.')
    })
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
    const cleaned = ['nombres', 'apellidos'].includes(name) ? value.replace(/\d/g, '') : value
    setEditData({ ...editData, [name]: cleaned })
  }

  const handleSave = async () => {
    if (!editData.nombres.trim() || !editData.apellidos.trim()) {
      setSaveError('Nombres y apellidos son obligatorios.')
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
      })
      updateUser({
        nombres: editData.nombres.trim(),
        apellidos: editData.apellidos.trim(),
        telefono: editData.telefono.trim(),
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
          <Input
            label="Nombres"
            hint="Solo letras"
            name="nombres"
            value={editData.nombres}
            onChange={handleEditChange}
            required
          />
          <Input
            label="Apellidos"
            hint="Solo letras"
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
            <Button onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saveLoading}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <div className="perfil-header">
        <div
          className="perfil-avatar"
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {fotoSource ? (
              <img
                src={fotoSource}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={40} />
            )}
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Cambiar foto de perfil"
            style={{
              position: 'absolute', bottom: -2, right: -2,
              background: 'var(--primary-medium)', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', cursor: 'pointer',
              border: '2px solid var(--white)',
            }}
          >
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
        {uploadError && (
          <div className="alert alert-danger" style={{ marginTop: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      <div className="perfil-creditos">{creditos}</div>
      <div style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Créditos disponibles
      </div>
      {creditosError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <AlertCircle size={14} />
          <span>{creditosError}</span>
        </div>
      )}

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
            {theme === 'dark' ? <Moon size={20} className="icon-primary" /> : <Sun size={20} className="icon-primary" />}
            Preferencias
          </div>
        </div>
        <div className="client-card-content">
          <div
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Activar o desactivar tema oscuro"
            onClick={toggleTheme}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme() } }}
            title="Alternar entre tema claro y oscuro"
            tabIndex={0}
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
          <div
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Activar o desactivar animaciones"
            onClick={toggleReducedMotion}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReducedMotion() } }}
            title="Activar o desactivar animaciones al cambiar de página"
            tabIndex={0}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' }}
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

      <Ayuda role="cliente" />
    </div>
  )
}
