import { useEffect, useRef } from 'react'

export default function KeyboardShortcutsHelp({ shortcuts, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' || e.key === '?') { onClose(); return }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Atajos de teclado">
      <div
        className="keyboard-help-modal"
        onClick={e => e.stopPropagation()}
        ref={ref}
        tabIndex={-1}
      >
        <div className="keyboard-help-header">
          <h3>Atajos de teclado</h3>
          <button className="keyboard-help-close" onClick={onClose} aria-label="Cerrar" title="Cerrar (Esc)">&times;</button>
        </div>
        <div className="keyboard-help-list">
          {shortcuts.map(s => (
            <div key={s.keys} className="keyboard-help-row">
              <kbd className="keyboard-help-kbd">
                {s.keys.split(' ').map((k, i) => (
                  <span key={i}>
                    {i > 0 && <span className="keyboard-help-seq-sep">, luego </span>}
                    <kbd>{k}</kbd>
                  </span>
                ))}
              </kbd>
              <span className="keyboard-help-desc">{s.description}</span>
            </div>
          ))}
        </div>
        <p className="keyboard-help-footnote">Presiona <kbd>?</kbd> o <kbd>Esc</kbd> para cerrar</p>
      </div>
    </div>
  )
}
