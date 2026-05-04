import { useState } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import '../../App.css'

const TIPOS_BAILE = ['Salsa', 'Bachata', 'Tango', 'Merengue', 'Cumbia', 'Reggaeton', 'Hip Hop', 'Ballet']

const MOCK_INSTRUCTORES = [
  { id: 1, nombre: 'María García' },
  { id: 2, nombre: 'Carlos López' },
  { id: 3, nombre: 'Ana Martínez' },
]

const MOCK_SALONES = [
  { id: 1, nombre: 'Salón Principal' },
  { id: 2, nombre: 'Salón 2' },
  { id: 3, nombre: 'Salón VIP' },
]

export default function ClaseForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    tipoBaile: initialData?.tipoBaile || '',
    instructorId: initialData?.instructorId || '',
    salonId: initialData?.salonId || '',
    fecha: initialData?.fecha || '',
    horaInicio: initialData?.horaInicio || '',
    horaFin: initialData?.horaFin || '',
    capacidad: initialData?.capacidad || '',
    minimo: initialData?.minimo || '',
    descripcion: initialData?.descripcion || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.tipoBaile || !formData.instructorId || !formData.salonId || !formData.fecha || !formData.horaInicio || !formData.capacidad) {
      alert('Por favor complete los campos requeridos')
      return
    }
    onSave({
      ...formData,
      instructorId: parseInt(formData.instructorId),
      salonId: parseInt(formData.salonId),
      capacidad: parseInt(formData.capacidad),
      minimo: parseInt(formData.minimo) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Select
        label="Tipo de Baile"
        name="tipoBaile"
        value={formData.tipoBaile}
        onChange={handleChange}
        options={TIPOS_BAILE.map(t => ({ value: t, label: t }))}
        required
      />

      <Select
        label="Instructor"
        name="instructorId"
        value={formData.instructorId}
        onChange={handleChange}
        options={MOCK_INSTRUCTORES.map(i => ({ value: i.id, label: i.nombre }))}
        required
      />

      <Select
        label="Salón"
        name="salonId"
        value={formData.salonId}
        onChange={handleChange}
        options={MOCK_SALONES.map(s => ({ value: s.id, label: s.nombre }))}
        required
      />

      <Input
        label="Fecha"
        name="fecha"
        type="date"
        value={formData.fecha}
        onChange={handleChange}
        required
      />

      <div className="form-row">
        <Input
          label="Hora Inicio"
          name="horaInicio"
          type="time"
          value={formData.horaInicio}
          onChange={handleChange}
          required
        />
        <Input
          label="Hora Fin"
          name="horaFin"
          type="time"
          value={formData.horaFin}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <Input
          label="Capacidad Máxima"
          name="capacidad"
          type="number"
          value={formData.capacidad}
          onChange={handleChange}
          min="1"
          required
        />
        <Input
          label="Mínimo Requerido"
          name="minimo"
          type="number"
          value={formData.minimo}
          onChange={handleChange}
          min="0"
        />
      </div>

      <Input
        label="Descripción"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        placeholder="Descripción de la clase..."
      />

      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
