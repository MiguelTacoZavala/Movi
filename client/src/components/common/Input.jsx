export default function Input({ label, hint, name, value, onChange, type = 'text', placeholder, required, min, max }) {

  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        // Cuando no hay <label> visible (ej. buscador), aria-label da el nombre
        // accesible; el placeholder por sí solo no cuenta como etiqueta.
        aria-label={ariaLabel}
      />
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )
}
