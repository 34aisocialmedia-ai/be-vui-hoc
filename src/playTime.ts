/*
 * Play-time reminder: after the child has played for the time a parent chose (30 minutes by default),
 * a rest popup appears. Time counts only while the app is on screen and the child is on a child screen
 * (not the parents' area or the studio), and only from the first game opened. It is kept on the device,
 * so closing or reloading the app does not reset it; a real break (the app unused for BREAK_MS) does.
 * The popup asks for a short rest (REST_MS) before the child can play on; an adult can skip it.
 */

export const REST_MS = 5 * 60_000
export const BREAK_MS = 10 * 60_000
export const LIMIT_CHOICES = [0, 10, 15, 20, 30, 45, 60] as const
export const DEFAULT_LIMIT = 30

export interface PlayTime {
  /** Milliseconds played since the last rest. */
  elapsed: number
  /** Wall-clock time of the last counted moment. */
  lastActive: number
  /** The child opened a game in this play period (time counts from then on). */
  started: boolean
  /** While set, the rest popup is shown; once passed the child may play on. */
  restUntil?: number
}

const KEY = 'be-vui-hoc-playtime'
export const fresh = (now: number): PlayTime => ({ elapsed: 0, lastActive: now, started: false })

export function readPlayTime(now = Date.now()): PlayTime {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && typeof raw.elapsed === 'number' && typeof raw.lastActive === 'number') {
      return resume({ elapsed: Math.max(0, raw.elapsed), lastActive: raw.lastActive, started: raw.started === true, ...(typeof raw.restUntil === 'number' ? { restUntil: raw.restUntil } : {}) }, now)
    }
  } catch { /* private mode or broken data */ }
  return fresh(now)
}
export function writePlayTime(t: PlayTime) {
  try { localStorage.setItem(KEY, JSON.stringify(t)) } catch { /* private mode */ }
}

/** Coming back after a real break starts a new play period (a rest already in progress stays). */
export function resume(t: PlayTime, now: number): PlayTime {
  if (t.restUntil !== undefined) return t
  return now - t.lastActive > BREAK_MS ? fresh(now) : t
}

/**
 * One tick. `delta` is the foreground time since the last tick (capped by the caller),
 * `counting` says whether the child is on a child screen with the app visible.
 * Returns the new state; `restUntil` appears in it when the limit is reached.
 */
export function tick(t: PlayTime, { now, delta, counting, limitMinutes }: { now: number; delta: number; counting: boolean; limitMinutes: number }): PlayTime {
  const base = resume(t, now)
  if (base.restUntil !== undefined || !counting || !base.started) return counting ? { ...base, lastActive: now } : base
  const elapsed = base.elapsed + Math.max(0, delta)
  if (limitMinutes > 0 && elapsed >= limitMinutes * 60_000) return { ...base, elapsed, lastActive: now, restUntil: now + REST_MS }
  return { ...base, elapsed, lastActive: now }
}

/** The rest is over (waited it out, or an adult said so): a new play period starts. */
export const afterRest = (now: number): PlayTime => ({ ...fresh(now), started: true })

export const restLeft = (t: PlayTime, now: number) => t.restUntil === undefined ? 0 : Math.max(0, t.restUntil - now)
export const clock = (ms: number) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
