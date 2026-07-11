import { useEffect, useId, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  const modalRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const focoPrevio = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !modalRef.current) return

      const elementos = modalRef.current.querySelectorAll(FOCUSABLE)
      if (elementos.length === 0) return

      const primero = elementos[0]
      const ultimo = elementos[elementos.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === primero) {
          e.preventDefault()
          ultimo.focus()
        }
      } else {
        if (document.activeElement === ultimo) {
          e.preventDefault()
          primero.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)

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
