import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

export default function CategoriaForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    precio: initialData?.precio ?? 15,
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (error) setError('')
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }
    onSave({ ...formData, nombre: formData.nombre.trim(), precio: Number(formData.precio) })
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
      <div className="form-group">
        <label htmlFor="precio">Precio por clase (S/)</label>
        <input
          id="precio"
          type="number"
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          min="1"
          step="0.50"
          required
          style={{ width: '100%', padding: '10px 12px', fontSize: '0.95rem', border: '1px solid var(--gray-200)', borderRadius: '8px' }}
        />
      </div>
      <div className="form-actions">
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
