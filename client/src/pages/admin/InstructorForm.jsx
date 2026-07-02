import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Alert from '../../components/common/Alert'
import '../../App.css'

const ESPECIALIDADES = ['Salsa', 'Bachata', 'Tango', 'Merengue', 'Cumbia', 'Reggaeton', 'Hip Hop', 'Ballet']

export default function InstructorForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombres: initialData?.nombres || '',
    apellidos: initialData?.apellidos || '',
    especialidad: initialData?.especialidad || '',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (error) setError('')
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.especialidad) {
      setError('Nombres, apellidos y especialidad son requeridos.')
      return
    }
    if (!initialData && !formData.password) {
      setError('La contraseña es requerida para crear un nuevo instructor.')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && (
        <Alert type="danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </Alert>
      )}
      <Input
        label="Nombres"
        name="nombres"
        value={formData.nombres}
        onChange={handleChange}
        placeholder="Ej: María"
        required
      />

      <Input
        label="Apellidos"
        name="apellidos"
        value={formData.apellidos}
        onChange={handleChange}
        placeholder="Ej: García López"
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
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="maria@dance.com"
        required
      />

      <Input
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="999888777"
      />

      {!initialData && (
        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mínimo 6 caracteres"
          required
        />
      )}

      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear Instructor'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
