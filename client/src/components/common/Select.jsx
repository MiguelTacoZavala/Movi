export default function Select({ label, name, value, onChange, options, required }) {
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
        <option value="">Seleccione...</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
