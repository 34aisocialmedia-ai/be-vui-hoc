import type { AgeId, Game } from './types'
import { totalOf } from './types'

/**
 * Playtest log for Đợt D: an adult turns it on in the parent area, enters a code for the
 * child (never a name) and lets the child play alone. Each game session records the four
 * measures from the plan: time to the first touch, touches that got no response, whether the
 * round was finished, and where the child gave up. Everything stays on this device until the
 * adult downloads the CSV file.
 */
export type PlaytestStatus = 'playing' | 'finished' | 'quit' | 'closed'

export interface PlaytestSession {
  id: string
  tester: string
  testerAge: AgeId
  gameId: string
  title: string
  engine: string
  gameAge: AgeId
  motion: string
  startedAt: string
  firstTouchMs: number | null
  taps: number
  /** Touches on something that does not respond (a picture, the companion, an empty spot). */
  deadTaps: number
  deadZones: Record<string, number>
  /** Touches while the game was busy giving feedback and ignored input on purpose. */
  lockedTaps: number
  correct: number
  wrong: number
  tasksDone: number
  tasksTotal: number
  /** Times the companion dozed off after 10 s without a touch. */
  idle: number
  status: PlaytestStatus
  durationMs: number
}

export interface PlaytestStore {
  enabled: boolean
  tester: string
  testerAge: AgeId
  sessions: PlaytestSession[]
}

const KEY = 'be-vui-hoc-playtest-v1'
const MAX_SESSIONS = 800
const AGES: AgeId[] = ['24-36', '3-4', '4-5', '5-6']

export function loadPlaytest(): PlaytestStore {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && typeof raw === 'object') return {
      enabled: raw.enabled === true,
      tester: typeof raw.tester === 'string' ? raw.tester.slice(0, 20) : '',
      testerAge: AGES.includes(raw.testerAge) ? raw.testerAge : '3-4',
      sessions: Array.isArray(raw.sessions) ? raw.sessions.slice(-MAX_SESSIONS) : [],
    }
  } catch { /* start fresh */ }
  return { enabled: false, tester: '', testerAge: '3-4', sessions: [] }
}

/** Outside a game nothing can still be playing: such sessions were cut off when the app closed. */
export function closeStale(store: PlaytestStore): PlaytestStore {
  return { ...store, sessions: store.sessions.map(s => s.status === 'playing' ? { ...s, status: 'closed' as const } : s) }
}

export function savePlaytest(store: PlaytestStore) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...store, sessions: store.sessions.slice(-MAX_SESSIONS) })) } catch { /* storage full or blocked */ }
}

/** Codes like "B07" or "Lá-3"; anything that looks like a full name is refused by the form. */
export const cleanTesterCode = (code: string) => code.replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 12)

/** Where an unanswered touch landed, in words an adult can act on. */
function zoneOf(target: Element): string {
  if (target.closest('.player-companion')) return 'ban-dong-hanh'
  if (target.closest('.topbar')) return 'thanh-tren'
  if (target.closest('.qcard, .creative-header, .organic-speech-bubble, .adventure-header')) return 'the-cau-hoi'
  if (target.closest('button:disabled, [aria-disabled="true"]')) return 'nut-dang-khoa'
  if (target.closest('.engine-inputs')) return 'san-choi'
  return 'khac'
}

const INTERACTIVE = 'button, [role="button"], a[href], input, select, textarea, .dragitem, .reveal-mist, .maze-board, [tabindex]:not([tabindex="-1"])'

export interface PlaytestRecorder {
  tap(target: EventTarget | null, locked: boolean): void
  answer(ok: boolean, tasksDone: number): void
  idle(): void
  finish(): void
  end(): void
}

/** Starts recording one game session, or returns null when playtest mode is off. */
export function startPlaytest(game: Game, motion: string): PlaytestRecorder | null {
  const store = loadPlaytest()
  if (!store.enabled || !store.tester) return null
  // A session still marked as playing was cut off by closing or reloading the app.
  for (const s of store.sessions) if (s.status === 'playing') s.status = 'closed'
  const started = performance.now()
  const session: PlaytestSession = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    tester: store.tester, testerAge: store.testerAge, gameId: game.id, title: game.title, engine: game.engine, gameAge: game.age,
    motion, startedAt: new Date().toISOString(), firstTouchMs: null, taps: 0, deadTaps: 0, deadZones: {}, lockedTaps: 0,
    correct: 0, wrong: 0, tasksDone: 0, tasksTotal: totalOf(game), idle: 0, status: 'playing', durationMs: 0,
  }
  store.sessions.push(session)
  savePlaytest(store)

  const persist = () => {
    session.durationMs = Math.round(performance.now() - started)
    const latest = loadPlaytest()
    const i = latest.sessions.findIndex(s => s.id === session.id)
    if (i >= 0) latest.sessions[i] = session; else latest.sessions.push(session)
    savePlaytest(latest)
  }
  // Save what we have if the app is put away or closed mid-game.
  const onHide = () => { if (document.visibilityState === 'hidden') persist() }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', persist)
  const stop = () => { document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', persist) }

  return {
    tap(target, locked) {
      if (session.status !== 'playing' || !(target instanceof Element)) return
      session.taps++
      if (session.firstTouchMs === null) session.firstTouchMs = Math.round(performance.now() - started)
      if (locked) { session.lockedTaps++; return }
      const hit = target.closest(INTERACTIVE)
      if (hit && !(hit as HTMLButtonElement).disabled && !hit.closest('[inert]')) return
      session.deadTaps++
      const zone = zoneOf(target)
      session.deadZones[zone] = (session.deadZones[zone] ?? 0) + 1
    },
    answer(ok, tasksDone) {
      if (session.status !== 'playing') return
      if (ok) session.correct++; else session.wrong++
      session.tasksDone = tasksDone
      persist()
    },
    idle() { if (session.status === 'playing') { session.idle++; persist() } },
    finish() { if (session.status === 'playing') { session.status = 'finished'; persist() } },
    end() {
      stop()
      // Opened and left at once without a touch (or React's development double start): not a real try.
      if (session.status === 'playing' && session.taps === 0 && performance.now() - started < 1500) {
        const latest = loadPlaytest()
        savePlaytest({ ...latest, sessions: latest.sessions.filter(s => s.id !== session.id) })
        return
      }
      if (session.status === 'playing') session.status = 'quit'
      persist()
    },
  }
}

const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b), mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export interface PlaytestSummary {
  sessions: number
  testers: number
  finishedRate: number | null
  quitRate: number | null
  medianFirstTouchS: number | null
  deadTapsPerSession: number | null
}

export function summarize(sessions: PlaytestSession[]): PlaytestSummary {
  const done = sessions.filter(s => s.status !== 'playing')
  const n = done.length
  return {
    sessions: n,
    testers: new Set(done.map(s => s.tester)).size,
    finishedRate: n ? done.filter(s => s.status === 'finished').length / n : null,
    quitRate: n ? done.filter(s => s.status !== 'finished').length / n : null,
    medianFirstTouchS: (() => { const m = median(done.flatMap(s => s.firstTouchMs === null ? [] : [s.firstTouchMs / 1000])); return m === null ? null : Math.round(m * 10) / 10 })(),
    deadTapsPerSession: n ? Math.round(done.reduce((a, s) => a + s.deadTaps, 0) / n * 10) / 10 : null,
  }
}

export const CSV_COLUMNS = ['ma_be', 'tuoi_be', 'ma_tro', 'ten_tro', 'kieu_choi', 'tuoi_tro', 'hieu_ung', 'bat_dau', 'giay_toi_cham_dau',
  'so_lan_cham', 'cham_khong_phan_hoi', 'vung_khong_phan_hoi', 'cham_luc_khoa', 'dung', 'sai', 'nhiem_vu_xong', 'tong_nhiem_vu',
  'ngu_gat', 'ket_qua', 'giay_choi'] as const

/** Local date and time, e.g. 2026-10-21 11:20:41, easier for adults to read than UTC. */
const localTime = (iso: string) => { const d = new Date(iso); return isNaN(+d) ? iso : d.toLocaleString('sv-SE') }

const STATUS_WORDS: Record<PlaytestStatus, string> = { playing: 'dang_choi', finished: 'choi_het', quit: 'bo_giua_chung', closed: 'dong_app' }

/** CSV with a BOM so Excel opens Vietnamese text correctly. */
export function toCsv(sessions: PlaytestSession[]) {
  const cell = (v: unknown) => { const s = v === null || v === undefined ? '' : String(v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const rows = sessions.map(s => [s.tester, s.testerAge, s.gameId, s.title, s.engine, s.gameAge, s.motion, localTime(s.startedAt),
    s.firstTouchMs === null ? '' : (s.firstTouchMs / 1000).toFixed(1), s.taps, s.deadTaps,
    Object.entries(s.deadZones).map(([k, v]) => `${k}:${v}`).join(' '), s.lockedTaps, s.correct, s.wrong, s.tasksDone, s.tasksTotal,
    s.idle, STATUS_WORDS[s.status], (s.durationMs / 1000).toFixed(0)].map(cell).join(','))
  return '﻿' + [CSV_COLUMNS.join(','), ...rows].join('\r\n') + '\r\n'
}
