export default function Select({ label, name, value, onChange, options, required }) {
  // Si las opciones ya traen una de valor vacío (ej. "Todos..." en los filtros),
  // no agregamos otra "Seleccione..." para no duplicar opciones vacías.
  const yaTieneVacia = options.some(o => o.value === '')

  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        {!yaTieneVacia && <option value="">Seleccione...</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
