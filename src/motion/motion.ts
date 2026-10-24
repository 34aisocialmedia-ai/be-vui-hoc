/**
 * Shared motion for every game: one place for timing, easing and the parent's
 * "Hiệu ứng" setting. Only transform and opacity are animated.
 *
 *  full  – everything below
 *  light – no travel or bounce; short fades and colour changes only
 *  off   – nothing moves
 */
export type MotionLevel = 'full' | 'light' | 'off'

export const EASE = {
  bounce: 'cubic-bezier(.34,1.56,.64,1)',
  smooth: 'cubic-bezier(.22,1,.36,1)',
} as const

export const DURATION = { press: 140, feedback: 450, fly: 620, roundIn: 480 } as const

export function defaultMotionLevel(): MotionLevel {
  try {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'light' : 'full'
  } catch { return 'full' }
}

export function motionLevel(): MotionLevel {
  if (typeof document === 'undefined') return 'off'
  const level = document.documentElement.dataset.motion
  return level === 'full' || level === 'light' || level === 'off' ? level : defaultMotionLevel()
}

export function applyMotionLevel(level: MotionLevel) {
  if (typeof document !== 'undefined') document.documentElement.dataset.motion = level
}

/**
 * Feedback motion is added on top of whatever transform the element already has, so pieces
 * that are placed with a transform (dots, apples on the tree) don't jump while they react.
 */
const ON_TOP = { composite: 'add' } as const

const canAnimate = (el: Element | null | undefined): el is HTMLElement =>
  !!el && el.isConnected && typeof (el as HTMLElement).animate === 'function'

export function play(el: Element | null | undefined, frames: Keyframe[], options: KeyframeAnimationOptions, lightFrames?: Keyframe[]) {
  if (!canAnimate(el)) return Promise.resolve()
  const level = motionLevel()
  if (level === 'off' || (level === 'light' && !lightFrames)) return Promise.resolve()
  const animation = el.animate(level === 'light' ? lightFrames! : frames, level === 'light' ? { duration: 220, easing: 'ease-out' } : options)
  return animation.finished.then(() => undefined, () => undefined)
}

/** Small squash when a child touches something, so every tap gets an answer. */
export const press = (el?: Element | null) =>
  play(el, [{ transform: 'scale(1)' }, { transform: 'scale(.93)' }, { transform: 'scale(1)' }], { duration: DURATION.press, easing: 'ease-out', ...ON_TOP })

/** Correct answer: a springy grow and settle. */
export const pop = (el?: Element | null) =>
  play(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: DURATION.feedback, easing: EASE.bounce, ...ON_TOP },
    [{ opacity: .6 }, { opacity: 1 }])

/** Not yet: a gentle wobble, never a red cross. */
export const nudge = (el?: Element | null) =>
  play(el, [0, -6, 5, -3, 2, 0].map(deg => ({ transform: `rotate(${deg}deg)` })), { duration: 420, easing: 'ease-in-out', ...ON_TOP })

/** Companion jump with squash and stretch. */
export const hop = (el?: Element | null, height = 18) =>
  play(el, [
    { transform: 'translateY(0) scale(1,1)' },
    { transform: 'translateY(0) scale(1.08,.9)', offset: .15 },
    { transform: `translateY(-${height}px) scale(.95,1.06)`, offset: .45 },
    { transform: 'translateY(0) scale(1.06,.94)', offset: .8 },
    { transform: 'translateY(0) scale(1,1)' },
  ], { duration: 560, easing: 'ease-out', ...ON_TOP })

export const tilt = (el?: Element | null) =>
  play(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }], { duration: 650, easing: 'ease-in-out', ...ON_TOP })

export function centerOf(el: Element) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

const SPARKLE_COLORS = ['#ffd45e', '#ff9db0', '#8fd3ff', '#9be29a']

/**
 * Dots burst from a point; only at the "full" level. The same burst makes bubble droplets
 * (blue, falling) and lifting mist (white, rising) with different options.
 */
export function sparkle(at: { x: number; y: number }, { colors = SPARKLE_COLORS, count = 8, distance = 44, rise = 0, size = 8 }:
  { colors?: string[]; count?: number; distance?: number; rise?: number; size?: number } = {}) {
  if (motionLevel() !== 'full' || typeof document === 'undefined') return
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span')
    dot.className = 'motion-particle motion-dot'
    dot.style.background = colors[i % colors.length]
    dot.style.width = dot.style.height = `${size}px`
    dot.style.left = `${at.x - size / 2}px`
    dot.style.top = `${at.y - size / 2}px`
    document.body.appendChild(dot)
    const angle = (i / count) * Math.PI * 2, d = distance + Math.random() * distance * .35
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * d}px,${Math.sin(angle) * d - rise}px) scale(.4)`, opacity: 0 },
    ], { duration: 520 + Math.abs(rise) * 3, easing: EASE.smooth }).finished.finally(() => dot.remove())
  }
}

/** Fly a picture along an arc from one element to another (stars to the progress track, items to a basket). */
export async function flyTo(src: string, from: Element | { x: number; y: number }, to: Element, size = 40, lift = 80) {
  if (motionLevel() !== 'full' || typeof document === 'undefined' || !to.isConnected) return
  const a = from instanceof Element ? centerOf(from) : from, b = centerOf(to)
  const img = document.createElement('img')
  img.src = src
  img.alt = ''
  img.className = 'motion-particle'
  img.width = size
  img.height = size
  img.style.left = `${a.x - size / 2}px`
  img.style.top = `${a.y - size / 2}px`
  document.body.appendChild(img)
  const frames: Keyframe[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    frames.push({ transform: `translate(${(b.x - a.x) * t}px,${(b.y - a.y) * t - Math.sin(Math.PI * t) * lift}px) scale(${1 - .35 * t}) rotate(${t * 20}deg)` })
  }
  try { await img.animate(frames, { duration: DURATION.fly, easing: EASE.smooth }).finished } catch { /* removed early */ }
  img.remove()
}

export const STAR_SRC = '/assets/3d/2b50.webp'

/** Fly a copy of an element (a picture, a card face) to a target, e.g. an item into its basket. */
export async function flyClone(source: Element | null | undefined, to: Element | null | undefined, { scale = .45, lift = 90, duration = DURATION.fly as number, spin = 0, easing = EASE.smooth as string }:
  { scale?: number; lift?: number; duration?: number; spin?: number; easing?: string } = {}) {
  if (motionLevel() !== 'full' || typeof document === 'undefined' || !source?.isConnected || !to?.isConnected) return
  const from = source.getBoundingClientRect(), b = centerOf(to)
  const clone = source.cloneNode(true) as HTMLElement
  clone.classList.add('motion-particle')
  clone.removeAttribute('id')
  Object.assign(clone.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, margin: '0' })
  document.body.appendChild(clone)
  const ax = from.left + from.width / 2, ay = from.top + from.height / 2
  const frames: Keyframe[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    frames.push({ transform: `translate(${(b.x - ax) * t}px,${(b.y - ay) * t - Math.sin(Math.PI * t) * lift}px) scale(${1 - (1 - scale) * t}) rotate(${spin * t}deg)` })
  }
  try { await clone.animate(frames, { duration, easing }).finished } catch { /* removed */ }
  clone.remove()
}

/** Draw a line from one card to its partner, hold it briefly, then fade (matching games). */
export async function connect(a: Element | null | undefined, b: Element | null | undefined, color = '#f2b84b') {
  if (motionLevel() === 'off' || typeof document === 'undefined' || !a?.isConnected || !b?.isConnected) return
  const p = centerOf(a), q = centerOf(b)
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('class', 'motion-particle motion-line')
  svg.setAttribute('width', String(innerWidth)); svg.setAttribute('height', String(innerHeight))
  Object.assign(svg.style, { left: '0', top: '0' })
  const path = document.createElementNS(ns, 'path')
  const mx = (p.x + q.x) / 2, my = Math.min(p.y, q.y) - 30
  path.setAttribute('d', `M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`)
  Object.assign(path.style, { fill: 'none', stroke: color, strokeWidth: '8', strokeLinecap: 'round' })
  svg.appendChild(path)
  document.body.appendChild(svg)
  const length = path.getTotalLength()
  path.style.strokeDasharray = `${length}`
  path.style.strokeDashoffset = motionLevel() === 'full' ? `${length}` : '0'
  try {
    if (motionLevel() === 'full') await path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 380, easing: EASE.smooth, fill: 'forwards' }).finished
    await svg.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 700 }).finished
  } catch { /* removed */ }
  svg.remove()
}

/** Two partners lean toward each other and back, like a little hug. */
export function lean(el: Element | null | undefined, dx: number) {
  return play(el, [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px) rotate(${dx > 0 ? 4 : -4}deg)` }, { transform: 'translateX(0)' }], { duration: 520, easing: EASE.bounce, ...ON_TOP })
}

/** Counted objects hop one after another so the child can count along. */
export function hopEach(elements: Iterable<Element>, gap = 260) {
  let i = 0
  for (const el of elements) {
    const delay = i++ * gap
    if (canAnimate(el) && motionLevel() === 'full') el.animate([
      { transform: 'translateY(0)' }, { transform: 'translateY(-16px) scale(1.12)', offset: .4 }, { transform: 'translateY(0)' },
    ], { duration: 380, delay, easing: 'ease-out', ...ON_TOP })
    else if (canAnimate(el) && motionLevel() === 'light') el.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 240, delay })
  }
}

/** A music note floats up from an instrument pad. */
export function floatNote(from: Element | null | undefined, glyph = '♪') {
  if (motionLevel() !== 'full' || typeof document === 'undefined' || !from?.isConnected) return
  const r = from.getBoundingClientRect()
  const note = document.createElement('span')
  note.className = 'motion-particle motion-note'
  note.textContent = glyph
  note.style.left = `${r.left + r.width * (.3 + Math.random() * .4)}px`
  note.style.top = `${r.top + 6}px`
  document.body.appendChild(note)
  const drift = (Math.random() - .5) * 40
  note.animate([
    { transform: 'translate(0,0) scale(.7)', opacity: 0 }, { transform: `translate(${drift / 3}px,-24px) scale(1)`, opacity: 1, offset: .25 },
    { transform: `translate(${drift}px,-80px) scale(1.1) rotate(${drift / 2}deg)`, opacity: 0 },
  ], { duration: 900, easing: 'ease-out' }).finished.finally(() => note.remove())
}

/** FLIP hop: the element already sits at its new place; it jumps there along an arc from where it was. */
export function hopFrom(el: Element | null | undefined, dx: number, dy: number, lift = 22, duration = 300) {
  return play(el, [
    { transform: `translate(${dx}px,${dy}px) scale(1,1)` },
    { transform: `translate(${dx / 2}px,${dy / 2 - lift}px) scale(.94,1.06)`, offset: .5 },
    { transform: 'translate(0,0) scale(1.08,.92)', offset: .85 },
    { transform: 'translate(0,0) scale(1,1)' },
  ], { duration, easing: 'ease-out' })
}

/** Not quite: pulled part of the way toward a target, then springs back (puzzle pieces, sorting). */
export function tug(el: Element | null | undefined, toward: Element | null | undefined, share = .22) {
  if (!el || !toward?.isConnected) return Promise.resolve()
  const a = centerOf(el), b = centerOf(toward)
  return play(el, [
    { transform: 'translate(0,0)' },
    { transform: `translate(${(b.x - a.x) * share}px,${(b.y - a.y) * share}px)`, offset: .4 },
    { transform: 'translate(0,0)' },
  ], { duration: 520, easing: EASE.bounce, ...ON_TOP })
}

/**
 * Damped swing into a resting transform, like a balance finding its level.
 * `at(f)` returns the transform for a fraction f of the final pose (0 = level, 1 = at rest).
 */
export function settle(el: Element | null | undefined, at: (f: number) => string, duration = 1500, delay = 0) {
  const path = [0, 1.45, .7, 1.18, .9, 1.04, 1]
  return play(el, path.map((f, i) => ({ transform: at(f), offset: i / (path.length - 1) })), { duration, delay, easing: 'ease-in-out', fill: 'backwards' })
}

/** A picture drops from where it is to a floor line, bounces once and takes a happy hop. */
export async function dropToFloor(source: Element | null | undefined, floorY: number) {
  if (motionLevel() !== 'full' || typeof document === 'undefined' || !source?.isConnected) return
  const r = source.getBoundingClientRect()
  const clone = source.cloneNode(true) as HTMLElement
  clone.classList.add('motion-particle')
  Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0' })
  document.body.appendChild(clone)
  const fall = Math.max(0, floorY - r.bottom)
  try {
    await clone.animate([
      { transform: 'translateY(0) scale(1)', easing: 'cubic-bezier(.5,0,1,1)' },
      { transform: `translateY(${fall}px) scale(1.06,.9)`, offset: .45, easing: 'ease-out' },
      { transform: `translateY(${fall - 26}px) scale(.96,1.05)`, offset: .62, easing: 'ease-in' },
      { transform: `translateY(${fall}px) scale(1.04,.95)`, offset: .78 },
      { transform: `translateY(${fall - 12}px) scale(1)`, offset: .9 },
      { transform: `translateY(${fall}px) scale(1)`, opacity: 0 },
    ], { duration: 1100 }).finished
  } catch { /* removed */ }
  clone.remove()
}

/** How each toy on the treasure shelf moves when touched. */
export type ToyMove = 'hop' | 'wiggle' | 'sway' | 'spin' | 'roll' | 'float' | 'swim' | 'flutter' | 'launch' | 'crawl'

const TOY_FRAMES: Record<ToyMove, [string[], number]> = {
  hop: [['translateY(0) scale(1)', 'translateY(0) scale(1.1,.9)', 'translateY(-30px) scale(.95,1.06)', 'translateY(0) scale(1.06,.94)', 'translateY(-12px)', 'translateY(0)'], 900],
  wiggle: [['rotate(0)', 'rotate(-12deg)', 'rotate(10deg)', 'rotate(-8deg)', 'rotate(6deg)', 'rotate(0)'], 900],
  sway: [['rotate(0)', 'rotate(-10deg)', 'rotate(9deg)', 'rotate(-5deg)', 'rotate(0)'], 1400],
  spin: [['perspective(400px) rotateY(0)', 'perspective(400px) rotateY(180deg) scale(1.12)', 'perspective(400px) rotateY(360deg)'], 900],
  roll: [['translateX(0) rotate(0)', 'translateX(26px) rotate(200deg)', 'translateX(-14px) rotate(-60deg)', 'translateX(0) rotate(0)'], 1300],
  float: [['translateY(0) rotate(0)', 'translateY(-26px) rotate(-6deg)', 'translateY(-14px) rotate(4deg)', 'translateY(0) rotate(0)'], 1700],
  swim: [['translateX(0) rotate(0)', 'translateX(-18px) rotate(-8deg)', 'translateX(18px) rotate(8deg)', 'translateX(0) rotate(0)'], 1200],
  flutter: [['translateY(0) scaleX(1)', 'translateY(-14px) scaleX(.6)', 'translateY(-22px) scaleX(1)', 'translateY(-10px) scaleX(.6)', 'translateY(0) scaleX(1)'], 1000],
  launch: [['translateY(0)', 'translateY(4px) scale(1.05,.95)', 'translateY(-90px)', 'translateY(-90px) scale(.6)', 'translateY(0) scale(1)'], 1400],
  crawl: [['translateX(0)', 'translateX(8px) rotate(3deg)', 'translateX(14px)', 'translateX(22px) rotate(-3deg)', 'translateX(0)'], 1600],
}

export function toyMove(el: Element | null | undefined, kind: ToyMove) {
  const [steps, duration] = TOY_FRAMES[kind]
  const frames: Keyframe[] = steps.map(transform => ({ transform }))
  if (kind === 'launch') { frames[3].opacity = 0; frames[4].opacity = 1 }
  return play(el, frames, { duration, easing: 'ease-in-out' }, [{ opacity: .5 }, { opacity: 1 }])
}
