import { useRef, useState } from 'react'

export function useAutoSave(saveFn) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  const triggerSave = async (data) => {
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await saveFn(data)
        setSaving(false)
        setSaved(true)
        timerRef.current = setTimeout(() => setSaved(false), 2500)
      } catch {
        setSaving(false)
      }
    }, 800)
  }

  return { saving, saved, triggerSave }
}
