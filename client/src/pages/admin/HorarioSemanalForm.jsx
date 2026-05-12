import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { instructores, categorias, DIAS_SEMANA } from '../../data/mockData'
import '../../App.css'

export default function HorarioSemanalForm({ initialData, onSave, onCancel, existingHorarios }) {
  const [formData, setFormData] = useState({
    instructorId: initialData?.instructorId || '',
    categoriaId: initialData?.categoriaId || '',
    dia_semana: initialData?.dia_semana || '',
    hora_inicio: initialData?.hora_inicio || '',
    hora_fin: initialData?.hora_fin || '',
    capacidad_maxima: initialData?.capacidad_maxima || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    const { instructorId, categoriaId, dia_semana, hora_inicio, hora_fin, capacidad_maxima } = formData

    if (!instructorId) newErrors.instructorId = 'Selecciona un instructor'
    if (!categoriaId) newErrors.categoriaId = 'Selecciona una categoría'
    if (!dia_semana) newErrors.dia_semana = 'Selecciona un día'

    if (!hora_inicio) newErrors.hora_inicio = 'Ingresa la hora de inicio'
    if (!hora_fin) newErrors.hora_fin = 'Ingresa la hora de fin'
    if (hora_inicio && hora_fin && hora_inicio >= hora_fin) {
      newErrors.hora_fin = 'La hora de fin debe ser mayor a la de inicio'
    }

    const cap = parseInt(capacidad_maxima)
    if (!capacidad_maxima || cap < 1) newErrors.capacidad_maxima = 'Debe ser al menos 1'

    if (existingHorarios && instructorId && dia_semana && hora_inicio && hora_fin) {
      const overlap = existingHorarios.some(h => {
        if (initialData?.id && h.id === initialData.id) return false
        if (h.instructorId !== parseInt(instructorId)) return false
        if (h.dia_semana !== dia_semana) return false
        if (!h.activo) return false
        return h.hora_inicio < hora_fin && h.hora_fin > hora_inicio
      })
      if (overlap) newErrors.dia_semana = 'El instructor ya tiene un horario en este día y horario'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const instructor = instructores.find(i => i.id === parseInt(formData.instructorId))
    const categoria = categorias.find(c => c.id === parseInt(formData.categoriaId))

    onSave({
      ...formData,
      instructorId: parseInt(formData.instructorId),
      categoriaId: parseInt(formData.categoriaId),
      instructorNombre: instructor?.nombre || '',
      categoriaNombre: categoria?.nombre || '',
      capacidad_maxima: parseInt(formData.capacidad_maxima),
      minimo_participantes: 7,
      activo: initialData?.activo ?? true,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Select
        label="Instructor"
        name="instructorId"
        value={formData.instructorId}
        onChange={handleChange}
        options={instructores
          .filter(i => i.estado === 'Activo')
          .map(i => ({ value: i.id, label: i.nombre }))}
        required
      />
      {errors.instructorId && <p className="form-error">{errors.instructorId}</p>}

      <Select
        label="Categoría de Baile"
        name="categoriaId"
        value={formData.categoriaId}
        onChange={handleChange}
        options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
        required
      />
      {errors.categoriaId && <p className="form-error">{errors.categoriaId}</p>}

      <Select
        label="Día de la Semana"
        name="dia_semana"
        value={formData.dia_semana}
        onChange={handleChange}
        options={DIAS_SEMANA.map(d => ({
          value: d,
          label: d.charAt(0) + d.slice(1).toLowerCase(),
        }))}
        required
      />
      {errors.dia_semana && (
        <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertTriangle size={14} /> {errors.dia_semana}
        </p>
      )}

      <div className="form-row">
        <Input
          label="Hora Inicio"
          name="hora_inicio"
          type="time"
          value={formData.hora_inicio}
          onChange={handleChange}
          required
        />
        <Input
          label="Hora Fin"
          name="hora_fin"
          type="time"
          value={formData.hora_fin}
          onChange={handleChange}
          required
        />
      </div>
      {errors.hora_fin && <p className="form-error">{errors.hora_fin}</p>}

      <Input
        label="Capacidad Máxima"
        name="capacidad_maxima"
        type="number"
        value={formData.capacidad_maxima}
        onChange={handleChange}
        min="1"
        required
      />
      {errors.capacidad_maxima && <p className="form-error">{errors.capacidad_maxima}</p>}

      <div className="form-actions">
        <Button type="submit">
          {initialData ? 'Actualizar Horario' : 'Guardar Horario'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
