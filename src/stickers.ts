import type { Game, SceneTheme } from './types'
import type { ToyMove } from './motion/motion'

/**
 * Sticker album that replaces the random gift box. Each finished game adds a known sticker:
 * the next empty slot on the page of the game's own world, so children can see what they are
 * working toward. Stickers are stored in Save.collection by emoji, as the old prizes were, so
 * prizes already won keep their count (all ten old prizes are in the album).
 */
export interface Sticker {
  emoji: string
  name: string
  /** A line Cô Thủy has recorded for this sticker. */
  say: string
  /** How the toy moves on the treasure shelf. */
  move: ToyMove
  /** One of the ten prizes from the old gift box, which have their own recorded sentences. */
  legacy?: boolean
}

export interface StickerPage {
  id: SceneTheme | 'treasure'
  title: string
  stickers: Sticker[]
}

const s = (emoji: string, name: string, move: ToyMove, legacy = false, say = name.toLowerCase()): Sticker => ({ emoji, name, say, move, legacy })

export const STICKER_PAGES: StickerPage[] = [
  { id: 'farm', title: 'Nông trại', stickers: [
    s('🐥', 'Gà con', 'hop', true), s('🐷', 'Heo con', 'wiggle'), s('🐄', 'Con bò', 'wiggle'),
    s('🐑', 'Con cừu', 'hop'), s('🌻', 'Hoa hướng dương', 'sway', true), s('🐴', 'Con ngựa', 'hop'),
  ] },
  { id: 'pond', title: 'Ao cá', stickers: [
    s('🐸', 'Con ếch', 'hop'), s('🦆', 'Vịt con', 'swim'), s('🦀', 'Con cua', 'crawl'),
    s('🐟', 'Cá', 'swim'), s('🐙', 'Bạch tuộc', 'wiggle'), s('🐳', 'Cá voi', 'swim'),
  ] },
  { id: 'room', title: 'Phòng đồ chơi', stickers: [
    s('🧸', 'Gấu bông', 'wiggle', true), s('🎀', 'Nơ xinh', 'sway', true), s('⚽', 'Quả bóng', 'roll'),
    s('🚂', 'Tàu hỏa', 'crawl'), s('🥁', 'Trống', 'wiggle'), s('🎺', 'Kèn', 'sway'),
  ] },
  { id: 'sky', title: 'Bầu trời', stickers: [
    s('🦄', 'Ngựa một sừng', 'hop', true), s('🌈', 'Cầu vồng', 'float'), s('🎈', 'Bóng bay', 'float'),
    s('🪁', 'Diều', 'sway'), s('🦋', 'Bướm', 'flutter'), s('✈️', 'Máy bay', 'launch'),
  ] },
  { id: 'hanoi', title: 'Hà Nội', stickers: [
    s('🍜', 'Phở', 'wiggle'), s('🚲', 'Xe đạp', 'crawl'), s('🌸', 'Hoa đào', 'sway'),
    s('🍦', 'Kem', 'wiggle'), s('👗', 'Áo dài', 'sway'), s('🌾', 'Cốm', 'sway'),
  ] },
  { id: 'treasure', title: 'Báu vật', stickers: [
    s('👑', 'Vương miện', 'spin', true), s('🪙', 'Đồng xu', 'spin', true), s('💎', 'Kim cương', 'spin', true),
    s('🥇', 'Huy chương vàng', 'spin', true), s('🏅', 'Huy hiệu', 'spin', true), s('⭐', 'Ngôi sao', 'spin'),
  ] },
]

export const ALL_STICKERS = STICKER_PAGES.flatMap(page => page.stickers)

/** The world a game is drawn in (also used for its background scene). */
export function sceneOf(game: Pick<Game, 'scene' | 'domain'>): SceneTheme {
  return game.scene || (game.domain === 'ha_noi' ? 'hanoi' : game.domain === 'tham_my' ? 'sky' : 'farm')
}

/**
 * The sticker this game will add: the first empty slot on the game's own page, then the
 * first empty slot in the album; once the album is full, the least collected sticker on the page.
 */
export function nextSticker(collection: Record<string, number>, scene: SceneTheme): { sticker: Sticker; page: StickerPage } {
  const own = STICKER_PAGES.find(page => page.id === scene) ?? STICKER_PAGES[0]
  const missing = (page: StickerPage) => page.stickers.find(sticker => !collection[sticker.emoji])
  const first = missing(own)
  if (first) return { sticker: first, page: own }
  for (const page of STICKER_PAGES) {
    const sticker = missing(page)
    if (sticker) return { sticker, page }
  }
  const least = own.stickers.reduce((a, b) => (collection[b.emoji] ?? 0) < (collection[a.emoji] ?? 0) ? b : a)
  return { sticker: least, page: own }
}

/** What Cô Thủy says when a sticker is won, using only recorded lines. */
export const stickerCheer = (sticker: Sticker) =>
  sticker.legacy ? [`Oa! Chúc mừng con! Con nhận được ${sticker.name}!`] : ['Cô khen con nhé!', sticker.say]

/** What Cô Thủy says when a toy on the shelf is touched. */
export const stickerHello = (sticker: Sticker) =>
  sticker.legacy ? `Bé có ${sticker.name}! Thật là tuyệt vời!` : sticker.say
