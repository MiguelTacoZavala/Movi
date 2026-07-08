import { useEffect, useId, useRef, useState } from 'react'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const sheetRef = useRef(null)
  const titleId = useId()
  const [startY, setStartY] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const focoPrevio = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    sheetRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTranslateY(0)
      setClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 250)
  }

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - startY
    if (diff > 0) setTranslateY(diff)
  }

  const handleTouchEnd = () => {
    if (translateY > 100) {
      handleClose()
    } else {
      setTranslateY(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`bottom-sheet-overlay${closing ? ' closing' : ''}`} onClick={handleClose}>
      <div
        className={`bottom-sheet${closing ? ' closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={sheetRef}
        tabIndex={-1}
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <div
          className="bottom-sheet-handle-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet-handle" />
        </div>
        {title && (
          <div className="bottom-sheet-header">
            <h2 id={titleId}>{title}</h2>
            <button className="bottom-sheet-close" onClick={handleClose} aria-label="Cerrar">&times;</button>
          </div>
        )}
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  )
}
