/*
 * Bé Vui Học drawing kit: soft 3D pictures in the spirit of animated films.
 * Every shape is lit from the upper left (light → colour → shade), has a glossy highlight,
 * and no hard outline. Characters get big shiny eyes. Pictures are drawn in a 100 × 100 box,
 * kept inside 6…94. The shared gradients live once in <ArtDefs/>, mounted at the app root.
 */
import type { SVGProps } from 'react'

/** Colour families: light, base, shade. Use only these so every picture belongs to the same world. */
export const PAL = {
  red: ['#ff9a8f', '#ff5a5f', '#c9303d'],
  orange: ['#ffc58a', '#ff9838', '#d8661a'],
  yellow: ['#fff2a8', '#ffd23f', '#e09e12'],
  green: ['#c6f59a', '#6fcf4f', '#2f9a3a'],
  leaf: ['#b7f08f', '#4fbf4a', '#23853a'],
  teal: ['#a8f1e8', '#3fcfc0', '#16958e'],
  blue: ['#b5e2ff', '#4fa8ff', '#2569cf'],
  sky: ['#f2fbff', '#c9ecff', '#8fcdf2'],
  purple: ['#dccbff', '#9d7bff', '#6343d6'],
  pink: ['#ffd3e5', '#ff8fbd', '#e0558f'],
  brown: ['#f1c08f', '#c4824b', '#8a5129'],
  wood: ['#ffe0b8', '#e8ad6e', '#b8783d'],
  skin: ['#fff0e2', '#ffd2ae', '#e8a47b'],
  hair: ['#9a6a52', '#5f3a2a', '#3a2118'],
  cream: ['#ffffff', '#fff3dc', '#efd3a5'],
  white: ['#ffffff', '#f6f8fb', '#cfd8e6'],
  gray: ['#f1f4f8', '#c3ccd8', '#8592a6'],
  dark: ['#8b91a8', '#4f5469', '#262a3a'],
  black: ['#6b6478', '#2f2838', '#120d18'],
} as const
export type Hue = keyof typeof PAL

/** Gradient fill for a colour family: "url(#v-red)". */
export const v = (h: Hue) => `url(#v-${h})`
/** The middle colour of a family, for flat details. */
export const base = (h: Hue) => PAL[h][1]
export const dark = (h: Hue) => PAL[h][2]
export const light = (h: Hue) => PAL[h][0]

/** Shared gradients. Mounted once per page (never inside display:none, or browsers drop them). */
export function ArtDefs() {
  return <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" focusable="false">
    <defs>
      {(Object.keys(PAL) as Hue[]).map(h => <radialGradient key={h} id={`v-${h}`} cx=".36" cy=".3" r=".85" fx=".3" fy=".24">
        <stop offset="0" stopColor={PAL[h][0]} /><stop offset=".5" stopColor={PAL[h][1]} /><stop offset="1" stopColor={PAL[h][2]} />
      </radialGradient>)}
      <radialGradient id="v-gloss" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".55" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id="v-blush" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ff6f91" stopOpacity=".55" /><stop offset="1" stopColor="#ff6f91" stopOpacity="0" /></radialGradient>
      <linearGradient id="v-ao" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stopColor="#1a0f2a" stopOpacity="0" /><stop offset="1" stopColor="#1a0f2a" stopOpacity=".28" /></linearGradient>
      <radialGradient id="v-iris" cx=".42" cy=".38" r=".7"><stop offset="0" stopColor="#a8714a" /><stop offset=".6" stopColor="#6b3d22" /><stop offset="1" stopColor="#2e160a" /></radialGradient>
      <radialGradient id="v-eyewhite" cx=".4" cy=".35" r=".75"><stop offset=".6" stopColor="#fff" /><stop offset="1" stopColor="#d9dfee" /></radialGradient>
    </defs>
  </svg>
}

/** Props for a drawing: an optional main colour family (from the label, e.g. "bóng đỏ") and the baby version. */
export interface Art { c?: Hue; baby?: boolean }
export type Draw = (p: Art) => JSX.Element

/** A lit shape: gradient fill and a faint darker edge so it separates from shapes behind it. */
export const S = ({ d, h, edge = true, ...rest }: { d: string; h: Hue; edge?: boolean } & SVGProps<SVGPathElement>) =>
  <path d={d} fill={v(h)} stroke={edge ? PAL[h][2] : 'none'} strokeOpacity=".35" strokeWidth="1.2" strokeLinejoin="round" {...rest} />
/** A lit circle / ellipse. */
export const O = ({ cx, cy, r, rx, ry, h, ...rest }: { cx: number; cy: number; r?: number; rx?: number; ry?: number; h: Hue } & SVGProps<SVGEllipseElement>) =>
  <ellipse cx={cx} cy={cy} rx={rx ?? r} ry={ry ?? r} fill={v(h)} stroke={PAL[h][2]} strokeOpacity=".35" strokeWidth="1.2" {...rest} />
/** Darkening towards the bottom of a shape (ambient occlusion). Give it the same path as the shape. */
export const AO = ({ d }: { d: string }) => <path d={d} fill="url(#v-ao)" />
/** Glossy highlight. */
export const Gloss = ({ cx, cy, rx, ry, rot = -30, o = 1 }: { cx: number; cy: number; rx: number; ry: number; rot?: number; o?: number }) =>
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#v-gloss)" opacity={o} transform={`rotate(${rot} ${cx} ${cy})`} />
/** A line detail (stems, whiskers, seams), in a dark tone of a family. */
export const L = ({ d, w = 2.4, h = 'black', o = 1, ...rest }: { d: string; w?: number; h?: Hue; o?: number } & SVGProps<SVGPathElement>) =>
  <path d={d} fill="none" stroke={PAL[h][2]} strokeOpacity={o} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" {...rest} />

/** One big shiny eye: white, brown iris, pupil, two highlights. */
export function Eye({ x, y, r = 6, look = 0 }: { x: number; y: number; r?: number; look?: number }) {
  return <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill="url(#v-eyewhite)" stroke="#2f2838" strokeOpacity=".25" strokeWidth="1" />
    <circle cx={x + look} cy={y + r * .12} r={r * .72} fill="url(#v-iris)" />
    <circle cx={x + look} cy={y + r * .15} r={r * .4} fill="#160c10" />
    <circle cx={x + look + r * .3} cy={y - r * .25} r={r * .26} fill="#fff" />
    <circle cx={x + look - r * .28} cy={y + r * .42} r={r * .12} fill="#fff" opacity=".9" />
  </g>
}
/** Two eyes. */
export const Eyes = ({ x = 50, y = 50, gap = 18, r = 6, look = 0 }: { x?: number; y?: number; gap?: number; r?: number; look?: number }) =>
  <g><Eye x={x - gap / 2} y={y} r={r} look={look} /><Eye x={x + gap / 2} y={y} r={r} look={look} /></g>
/** Small happy open mouth. */
export const Mouth = ({ x = 50, y = 60, w = 9 }: { x?: number; y?: number; w?: number }) => <g>
  <path d={`M${x - w / 2} ${y} q${w / 2} ${w * .75} ${w} 0 q-${w / 2} ${w * .18} -${w} 0Z`} fill="#7a2a3a" />
  <path d={`M${x - w * .22} ${y + w * .38} q${w * .22} -${w * .2} ${w * .44} 0 q-${w * .22} ${w * .14} -${w * .44} 0Z`} fill="#ff8fa3" />
</g>
/** Closed smile line. */
export const Smile = ({ x = 50, y = 60, w = 9 }: { x?: number; y?: number; w?: number }) =>
  <path d={`M${x - w / 2} ${y} q${w / 2} ${w * .5} ${w} 0`} fill="none" stroke="#3a1f2a" strokeWidth="2.2" strokeLinecap="round" />
/** Soft blush on the cheeks. */
export const Blush = ({ x = 50, y = 60, gap = 28, r = 5 }: { x?: number; y?: number; gap?: number; r?: number }) =>
  <g>{[-1, 1].map(s => <ellipse key={s} cx={x + s * gap / 2} cy={y} rx={r} ry={r * .62} fill="url(#v-blush)" />)}</g>
/** Eyes + mouth + blush in one. */
export const Face = ({ x = 50, y = 50, s = 1, open = true }: { x?: number; y?: number; s?: number; open?: boolean }) => <g>
  <Eyes x={x} y={y} gap={18 * s} r={5.2 * s} />
  {open ? <Mouth x={x} y={y + 9 * s} w={8 * s} /> : <Smile x={x} y={y + 9 * s} w={8 * s} />}
  <Blush x={x} y={y + 6 * s} gap={30 * s} r={5 * s} />
</g>

/** Words in a label that name a colour, so "Quả bóng đỏ" is drawn red. */
const COLOR_WORDS: [RegExp, Hue][] = [
  [/xanh lá|xanh lục/i, 'green'], [/xanh dương|xanh da trời|xanh lam|xanh nước biển/i, 'blue'],
  [/đỏ/i, 'red'], [/vàng/i, 'yellow'], [/\bcam\b/i, 'orange'], [/tím/i, 'purple'], [/hồng/i, 'pink'],
  [/nâu/i, 'brown'], [/xanh/i, 'blue'], [/trắng/i, 'white'], [/đen/i, 'dark'], [/xám/i, 'gray'],
]
export function colorFromLabel(label: string): Hue | undefined {
  for (const [re, h] of COLOR_WORDS) if (re.test(label)) return h
  return undefined
}

/** Baby animals: same drawing, smaller, sitting at the same spot on the ground. */
export const babyWrap = (baby: boolean | undefined, el: JSX.Element) =>
  baby ? <g transform="translate(50 92) scale(.76) translate(-50 -92)">{el}</g> : el
