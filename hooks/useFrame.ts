import { useEffect, useRef } from 'react'

/**
 * Hook for creating smooth animation loops
 * Calls the provided callback on every animation frame
 */
export function useFrame(callback: () => void) {
  const callbackRef = useRef(callback)
  const frameRef = useRef<number>()

  // Update callback ref to always have the latest version
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const animate = () => {
      callbackRef.current()
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])
}
