import { useState, useEffect } from 'react'

// Mensaje efímero de éxito/confirmación: se muestra y se limpia solo tras `duracion` ms.
// Pensado para avisos tipo "Horario activado" que no deben quedarse fijos en pantalla.
// Nota: NO usar para errores — esos conviene que persistan hasta que el usuario los resuelva.
//
// Uso:  const [mensaje, setMensaje] = useFlashMessage()
// (setMensaje('') limpia de inmediato; volver a setear el mismo texto reinicia el temporizador)
export function useFlashMessage(duracion = 4000) {
  // `n` es un contador que fuerza reiniciar el temporizador aunque el texto se repita
  const [estado, setEstado] = useState({ texto: '', n: 0 })

  const setMensaje = (texto) => setEstado((s) => ({ texto, n: s.n + 1 }))

  useEffect(() => {
    if (!estado.texto) return undefined
    const timer = setTimeout(() => setEstado((s) => ({ texto: '', n: s.n + 1 })), duracion)
    return () => clearTimeout(timer)
  }, [estado.texto, estado.n, duracion])

  return [estado.texto, setMensaje]
}
