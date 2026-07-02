export default function Alert({ type = 'info', children }) {
  // Los errores/advertencias se anuncian de inmediato (assertive); info/éxito de
  // forma cortés (polite). Así un lector de pantalla lee el mensaje al aparecer.
  const esUrgente = type === 'danger' || type === 'warning'

  return (
    <div
      className={`alert alert-${type}`}
      role={esUrgente ? 'alert' : 'status'}
      aria-live={esUrgente ? 'assertive' : 'polite'}
    >
      {children}
    </div>
  )
}
