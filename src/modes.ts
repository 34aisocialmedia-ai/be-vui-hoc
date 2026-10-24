import type { AgeId, Game } from './types'
import { gamesFor } from './data/games'

/**
 * Three ways into the games, each with its own kind of game:
 *  - island: the adventure map. Thinking games (counting, shapes, letters, discovering the world)
 *    become stations on a daily journey of three.
 *  - friend: the companion's house. Games done together with a friend: music and singing,
 *    feelings, looking after yourself, staying safe.
 *  - movies: short episodes. Games that are stories: picture books, words, putting a story in order.
 * Every game belongs to exactly one of them; the full library stays available as well.
 */
export type ModeId = 'island' | 'friend' | 'movies'

export const MODES: Record<ModeId, { title: string; short: string; back: string }> = {
  island: { title: 'Đảo phiêu lưu', short: 'Đảo', back: 'Về đảo' },
  friend: { title: 'Nhà của bạn thân', short: 'Nhà bạn', back: 'Về nhà bạn' },
  movies: { title: 'Phim của bé', short: 'Phim', back: 'Về các tập phim' },
}

export function modeOf(game: Pick<Game, 'engine' | 'category' | 'domain'>): ModeId {
  if (game.engine === 'ORDER' || game.engine === 'TRAFFIC') return 'movies'
  if (game.category === 'literature' || game.category === 'language') return 'movies'
  if (game.category === 'music' || game.category === 'life' || game.engine === 'RHYTHM') return 'friend'
  return 'island'
}

/** A mode's games for an age, in curriculum order. */
export const poolFor = (mode: ModeId, age: AgeId) => gamesFor(age).filter(game => modeOf(game) === mode)

/** Today's date on this device, e.g. 2026-10-21. */
export function today(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Small stable hash so the same day gives the same order. */
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/** The least played games first, ties broken by a per-day shuffle so the choice changes from day to day. */
function freshest(games: Game[], plays: Record<string, number>, seed: string, skip: string[] = []) {
  return games.filter(game => !skip.includes(game.id))
    .map(game => ({ game, played: plays[game.id] ?? 0, order: hash(seed + game.id) }))
    .sort((a, b) => a.played - b.played || a.order - b.order)
    .map(entry => entry.game)
}

export interface Journey {
  day: string
  age: AgeId
  /** Three station game ids, in path order. */
  stations: string[]
  done: string[]
  /** How many journeys were started today (the child may ask for another one). */
  round: number
}

/** Today's journey: kept as it is for the same day and age, otherwise three fresh stations. */
export function journeyFor(saved: Journey | undefined, age: AgeId, plays: Record<string, number>, day = today()): Journey {
  const pool = poolFor('island', age)
  const valid = saved && saved.day === day && saved.age === age && saved.stations.length && saved.stations.every(id => pool.some(g => g.id === id))
  if (valid) return saved
  return { day, age, stations: freshest(pool, plays, day).slice(0, 3).map(g => g.id), done: [], round: 1 }
}

/** Another three stations after today's journey is finished. */
export function nextJourney(current: Journey, plays: Record<string, number>): Journey {
  const pool = poolFor('island', current.age)
  const round = current.round + 1
  const fresh = freshest(pool, plays, `${current.day}#${round}`, current.stations)
  return { ...current, round, stations: (fresh.length >= 3 ? fresh : freshest(pool, plays, `${current.day}#${round}`)).slice(0, 3).map(g => g.id), done: [] }
}

/** The friend's three wishes: the friend games played least so far. */
export const wishesFor = (age: AgeId, plays: Record<string, number>, day = today()) => freshest(poolFor('friend', age), plays, day).slice(0, 3)

/** Episodes in order; the first one never played is the one to watch next. */
export function episodesFor(age: AgeId, plays: Record<string, number>) {
  const list = poolFor('movies', age)
  const next = list.findIndex(game => !plays[game.id])
  return { list, next: next < 0 ? list.length : next }
}
