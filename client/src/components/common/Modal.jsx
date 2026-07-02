import { useEffect, useId, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  const modalRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    // Recordamos el elemento que tenía el foco para devolvérselo al cerrar.
    const focoPrevio = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // Movemos el foco dentro del modal al abrirlo.
    modalRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${size === 'large' ? 'modal-large' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={modalRef}
        tabIndex={-1}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
