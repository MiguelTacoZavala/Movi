import { useState } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function CategoriaForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio')
      return
    }
    onSave({ ...formData, nombre: formData.nombre.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Input
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Ej: Salsa, Bachata, Zumba..."
        required
      />
      <Input
        label="Descripción"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        placeholder="Breve descripción de la categoría"
      />
      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
