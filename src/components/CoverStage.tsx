import type { Game } from '../types'
import { modeOf, type ModeId } from '../modes'

/*
 * The drawn place behind every game cover, so each cover belongs to one of the three worlds
 * on the home page: a little island in the sea, the friend's room, or a cinema screen.
 * Colours change with the topic (counting, shapes, music, stories…) so neighbouring covers differ.
 * Everything is vector art drawn here: light, sharp at any size, no extra downloads.
 */

/** Soft colours per topic: [sky or wall, accent, ground]. */
const TINTS: Record<string, [string, string, string]> = {
  math: ['#d7f0ff', '#ffd75e', '#7fd36b'],
  geometry: ['#e6e0ff', '#ff9a3d', '#8fd86f'],
  discovery: ['#dff6e8', '#ffc24a', '#74c95a'],
  recognition: ['#fff0cf', '#ff8fb1', '#8fd86f'],
  letters: ['#ffe9f1', '#7a5cff', '#7fd36b'],
  music: ['#efe6ff', '#ff6fa5', '#e9b77a'],
  life: ['#ffeedd', '#3dbb6b', '#e8a96f'],
  literature: ['#fff4dc', '#e2504c', '#ffd75e'],
  language: ['#e8f4ff', '#ff9a3d', '#ffd75e'],
}
const tintOf = (game: Game) => TINTS[game.category ?? 'discovery'] ?? TINTS.discovery

function Island({ tint: [sky, accent, ground] }: { tint: [string, string, string] }) {
  return <>
    <rect width="200" height="150" fill={sky} />
    <circle cx="170" cy="26" r="13" fill={accent} opacity=".85" />
    <g className="stage-drift" fill="#fff"><ellipse cx="40" cy="28" rx="18" ry="7" /><ellipse cx="52" cy="23" rx="11" ry="7" /></g>
    <path d="M0 104 Q50 98 100 104 T200 104 V150 H0Z" fill="#7fd3e6" />
    <path d="M0 116 Q50 110 100 116 T200 116 V150 H0Z" fill="#5ec4da" />
    <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7"><path d="M18 130 q6 -4 12 0" /><path d="M160 136 q6 -4 12 0" /></g>
    <ellipse cx="100" cy="118" rx="70" ry="14" fill="#f6dc9c" />
    <ellipse cx="100" cy="113" rx="62" ry="10" fill={ground} />
    <g transform="translate(168 84)"><path d="M0 30 q4 -16 2 -30" stroke="#b5793f" strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M2 0 q-14 -4 -20 6 q10 -4 20 -6 q-4 -12 -16 -12 q12 2 16 12 q8 -12 20 -8 q-12 0 -20 8 q14 0 18 10 q-8 -8 -18 -10" fill="#3dbb6b" /></g>
  </>
}

function Room({ tint: [wall, accent, floor] }: { tint: [string, string, string] }) {
  return <>
    <rect width="200" height="150" fill={wall} />
    <g fill="#fff" opacity=".55">{[20, 60, 100, 140, 180].map(x => <circle key={x} cx={x} cy={x % 40 ? 18 : 44} r="3" />)}</g>
    <g transform="translate(14 14)"><rect width="40" height="34" rx="7" fill="#cdeefb" stroke="#fff" strokeWidth="4" /><path d="M20 0 V34 M0 17 H40" stroke="#fff" strokeWidth="3" /></g>
    <rect x="140" y="40" width="50" height="5" rx="2.5" fill="#d9924b" />
    <circle cx="152" cy="34" r="6" fill={accent} /><rect x="163" y="27" width="10" height="13" rx="3" fill="#7fd36b" /><path d="M177 40 l6 -12 l6 12Z" fill="#ffd75e" />
    <rect y="108" width="200" height="42" fill={floor} />
    <ellipse cx="100" cy="124" rx="76" ry="13" fill="#fff" opacity=".45" />
    <ellipse cx="100" cy="124" rx="56" ry="8" fill={accent} opacity=".35" />
  </>
}

function Screen({ tint: [screen, accent, light] }: { tint: [string, string, string] }) {
  return <>
    <rect width="200" height="150" fill="#26306b" />
    <rect x="18" y="14" width="164" height="112" rx="10" fill={screen} />
    <path d="M18 14 H60 Q44 70 52 126 H18Z" fill="#e2504c" /><path d="M182 14 H140 Q156 70 148 126 H182Z" fill="#e2504c" />
    <path d="M28 14 Q36 70 30 126 M172 14 Q164 70 170 126" stroke="#b83a37" strokeWidth="3" fill="none" />
    <path d="M10 8 H190 V22 Q170 30 150 22 Q130 30 110 22 Q90 30 70 22 Q50 30 30 22 Q20 28 10 22Z" fill="#b83a37" />
    <g fill={light}>{[34, 62, 90, 118, 146, 166].map(x => <circle key={x} cx={x} cy="138" r="3.5" />)}</g>
    <g className="stage-twinkle" fill={accent}><path d="M150 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" opacity=".5" /></g>
  </>
}

const STAGES: Record<ModeId, (p: { tint: [string, string, string] }) => JSX.Element> = { island: Island, friend: Room, movies: Screen }

export function CoverStage({ game }: { game: Game }) {
  const world = modeOf(game)
  const Stage = STAGES[world]
  return <svg className={`cover-stage stage-${world}`} viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <Stage tint={tintOf(game)} />
  </svg>
}

/** What the child does in a game, as a small picture and a short verb for the tile. */
export const ACTIONS: Record<string, { icon: string; label: string }> = {
  G01: { icon: 'tap', label: 'Chạm chọn' },
  G02: { icon: 'link', label: 'Ghép đôi' },
  G03: { icon: 'basket', label: 'Phân loại' },
  MEMORY: { icon: 'cards', label: 'Lật thẻ' },
  ORDER: { icon: 'film', label: 'Xếp truyện' },
  RHYTHM: { icon: 'drum', label: 'Gõ nhịp' },
  MUSIC: { icon: 'drum', label: 'Chơi đàn' },
  SPATIAL: { icon: 'arrows', label: 'Tìm vị trí' },
  ALPHABET: { icon: 'letter', label: 'Hái chữ' },
  BUBBLE: { icon: 'bubble', label: 'Chạm bóng' },
  REVEAL: { icon: 'swipe', label: 'Vuốt mở' },
  COLLECT: { icon: 'basket', label: 'Hái quả' },
  PATH: { icon: 'path', label: 'Tìm đường' },
  FEED: { icon: 'feed', label: 'Cho bạn ăn' },
  PUZZLE: { icon: 'puzzle', label: 'Khớp bóng' },
  TRAFFIC: { icon: 'light', label: 'Qua đường' },
  DOTS: { icon: 'dots', label: 'Nối số' },
  NUMBER_TRAIN: { icon: 'train', label: 'Chở hàng' },
  SCALE: { icon: 'scale', label: 'Cân' },
}
const ICON_PATHS: Record<string, string> = {
  tap: 'M9 11V5a2 2 0 0 1 4 0v5l4.5 1a2 2 0 0 1 1.5 2.3L18 19H10l-3.5-4.5a1.6 1.6 0 0 1 2.5-2Z',
  link: 'M9 15 15 9M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2',
  basket: 'M4 10h16l-2 9H6ZM8 10l3-5M16 10l-3-5',
  cards: 'M4 7h9v12H4ZM11 4h9v12',
  film: 'M4 5h16v14H4ZM9 5v14M15 5v14',
  drum: 'M5 9a7 3 0 0 0 14 0a7 3 0 0 0-14 0v6a7 3 0 0 0 14 0V9M8 3l3 5M16 3l-3 5',
  arrows: 'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4',
  letter: 'M6 19 12 5l6 14M8.5 14h7',
  bubble: 'M12 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12ZM9.5 8.5a2.5 2.5 0 0 1 2-1.5M7 19.5a1.5 1.5 0 1 0 0 .1',
  swipe: 'M4 12h12M12 8l4 4-4 4M19 6v12',
  path: 'M5 19c0-5 6-3 6-8s6-4 8-6M5 19h.1M19 5h.1',
  feed: 'M7 4v7a2 2 0 0 0 4 0V4M9 11v9M16 4c-2 2-2 6 0 8v8',
  puzzle: 'M5 9h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3H5Z',
  light: 'M9 3h6v18H9ZM12 7h.1M12 12h.1M12 17h.1',
  dots: 'M5 18 9 6l6 10 4-9',
  train: 'M4 15h16M6 15V8h8v7M14 11h5v4M8 19a1.5 1.5 0 1 0 0 .1M16 19a1.5 1.5 0 1 0 0 .1',
  scale: 'M12 4v16M5 20h14M4 8h16M4 8l-2 6h6ZM20 8l-2 6h6Z',
}

export function PlayAction({ game }: { game: Game }) {
  const action = ACTIONS[game.engine] ?? ACTIONS.G01
  return <span className={`play-action act-${action.icon}`}>
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={ICON_PATHS[action.icon]} /></svg>
    {action.label}
  </span>
}
