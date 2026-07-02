import { useEffect, useRef, useCallback } from 'react'

export function useHotkeys(shortcuts, { enabled = true } = {}) {
  const pendingRef = useRef([])
  const timeoutRef = useRef(null)
  const shortcutsRef = useRef(shortcuts)

  useEffect(() => { shortcutsRef.current = shortcuts })

  const clearPending = useCallback(() => {
    pendingRef.current = []
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handler = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' ||
        e.target.isContentEditable
      ) return

      const key = e.key
      const newSeq = [...pendingRef.current, key]
      const seqStr = newSeq.join(' ')

      const match = shortcutsRef.current.find(s => s.keys === seqStr)
      if (match) {
        e.preventDefault()
        match.handler(e)
        clearPending()
        return
      }

      const hasPartial = shortcutsRef.current.some(s => s.keys.startsWith(seqStr + ' '))
      if (hasPartial && newSeq.length < 3) {
        pendingRef.current = newSeq
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(clearPending, 1200)
        return
      }

      const single = shortcutsRef.current.find(s => s.keys === key && !s.keys.includes(' '))
      if (single) {
        e.preventDefault()
        single.handler(e)
      }

      clearPending()
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      clearPending()
    }
  }, [enabled, clearPending])
}
