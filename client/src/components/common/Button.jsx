export default function Button({ children, variant = 'primary', size = 'medium', onClick, type = 'button', style, disabled, className = '', title }) {
  const classes = ['btn', `btn-${variant}`, size === 'small' ? 'btn-small' : '', className].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      style={style}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  )
}
