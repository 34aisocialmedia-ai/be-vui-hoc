import { useEffect, useRef } from 'react'

/** Locks immediately, and cancels engine continuations after leaving a game. */
export function useGameTask() {
  const busy = useRef(false)
  const alive = useRef(true)
  const timers = useRef(new Map<ReturnType<typeof setTimeout>, (active: boolean) => void>())
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      for (const [timer, resolve] of timers.current) {
        clearTimeout(timer)
        resolve(false)
      }
      timers.current.clear()
    }
  }, [])
  return {
    alive,
    busy,
    delay(ms: number): Promise<boolean> {
      if (!alive.current) return Promise.resolve(false)
      return new Promise(resolve => {
        const timer = setTimeout(() => {
          timers.current.delete(timer)
          resolve(alive.current)
        }, ms)
        timers.current.set(timer, resolve)
      })
    },
  }
}
