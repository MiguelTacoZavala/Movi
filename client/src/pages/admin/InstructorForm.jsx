import { useState } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import { User } from 'lucide-react'
import '../../App.css'

const ESPECIALIDADES = ['Salsa', 'Bachata', 'Tango', 'Merengue', 'Cumbia', 'Reggaeton', 'Hip Hop', 'Ballet']

export default function InstructorForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    especialidad: initialData?.especialidad || '',
    contacto: initialData?.contacto || '',
    email: initialData?.email || '',
    foto: initialData?.foto || '',
  })
  const [fotoPreview, setFotoPreview] = useState(initialData?.foto || '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setFotoPreview(dataUrl)
      setFormData({ ...formData, foto: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.especialidad) {
      alert('Nombre y especialidad son requeridos')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Input
        label="Nombre Completo"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />

      <Select
        label="Especialidad"
        name="especialidad"
        value={formData.especialidad}
        onChange={handleChange}
        options={ESPECIALIDADES.map(e => ({ value: e, label: e }))}
        required
      />

      <Input
        label="Contacto (Teléfono)"
        name="contacto"
        value={formData.contacto}
        onChange={handleChange}
        placeholder="999888777"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      <div className="form-group">
        <label>Foto</label>
        <div className="file-upload-wrapper">
          <div className="file-upload-preview">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" className="file-upload-img" />
            ) : (
              <div className="file-upload-placeholder">
                <User size={24} />
              </div>
            )}
          </div>
          <label className="file-upload-btn">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {fotoPreview ? 'Cambiar foto' : 'Seleccionar foto'}
          </label>
        </div>
      </div>

      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
