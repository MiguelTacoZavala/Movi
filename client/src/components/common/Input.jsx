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
      />
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )
}
