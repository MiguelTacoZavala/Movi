export default function Button({ children, variant = 'primary', size = 'medium', onClick, type = 'button', style, disabled }) {
  const classes = ['btn', `btn-${variant}`, size === 'small' ? 'btn-small' : ''].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
