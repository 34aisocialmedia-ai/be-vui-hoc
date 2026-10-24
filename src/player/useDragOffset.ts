import { useEffect, useMemo, useRef } from 'react'
import { useFitScale } from '../motion/stage'

/**
 * Moves a dragged element with the finger by writing its transform directly, at most once per
 * animation frame, instead of re-rendering the whole game on every pointer move.
 */
export function useDragOffset<T extends HTMLElement>() {
  const frame = useRef(0)
  // On a shrunk play area the item must move further in its own units to stay under the finger.
  const fit = useRef(1)
  fit.current = useFitScale()
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  return useMemo(() => {
    let node: T | null = null
    let onFrame: (() => void) | null = null
    const offset = { x: 0, y: 0 }
    const apply = () => { if (node) node.style.transform = `translate(${offset.x / fit.current}px, ${offset.y / fit.current}px)` }
    return {
      ref: (el: T | null) => { node = el; apply() },
      move(x: number, y: number, then?: () => void) {
        offset.x = x; offset.y = y; onFrame = then ?? null
        if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; apply(); onFrame?.() })
      },
      /** Drop any queued frame work and show the latest position now (on finger lift). */
      settle() { cancelAnimationFrame(frame.current); frame.current = 0; onFrame = null; apply() },
      reset() {
        cancelAnimationFrame(frame.current); frame.current = 0; onFrame = null
        offset.x = 0; offset.y = 0; apply()
      },
    }
  }, [])
}
