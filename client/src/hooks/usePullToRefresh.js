import { useState, useRef, useCallback, useEffect } from 'react'

export function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const containerRef = useRef(null)
  const THRESHOLD = 80

  const onTouchStart = useCallback((e) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!pullingRef.current) return
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5))
    }
  }, [])

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return
    pullingRef.current = false

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing, onRefresh])

  useEffect(() => {
    return () => {
      setPullDistance(0)
      setRefreshing(false)
      pullingRef.current = false
    }
  }, [])

  return {
    containerRef,
    pullDistance,
    refreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    THRESHOLD,
  }
}
