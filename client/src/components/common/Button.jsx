export default function Button({ children, variant = 'primary', size = 'medium', onClick, type = 'button', style, disabled, className = '', title, ariaLabel }) {
  const classes = ['btn', `btn-${variant}`, size === 'small' ? 'btn-small' : '', className].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      style={style}
      disabled={disabled}
      title={title}
      // Los botones de solo ícono pasan `title`; lo usamos también como nombre
      // accesible (aria-label) para que un lector de pantalla no lea solo "botón".
      aria-label={ariaLabel || title}
    >
      {children}
    </button>
  )
}
