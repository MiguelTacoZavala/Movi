import { useState } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import '../../App.css'

const DISPONIBILIDAD = ['Disponible', 'Mantenimiento', 'No Disponible']

export default function SalonForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    capacidad: initialData?.capacidad || '',
    disponibilidad: initialData?.disponibilidad || 'Disponible',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre || !formData.capacidad) {
      alert('Nombre y capacidad son requeridos')
      return
    }
    onSave({
      ...formData,
      capacidad: parseInt(formData.capacidad),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Input
        label="Nombre del Salón"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />

      <Input
        label="Capacidad Máxima"
        name="capacidad"
        type="number"
        value={formData.capacidad}
        onChange={handleChange}
        min="1"
        required
      />

      <Select
        label="Disponibilidad"
        name="disponibilidad"
        value={formData.disponibilidad}
        onChange={handleChange}
        options={DISPONIBILIDAD.map(d => ({ value: d, label: d }))}
      />

      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
