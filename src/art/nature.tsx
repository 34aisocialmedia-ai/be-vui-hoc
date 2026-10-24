/* Nature, weather, water, shapes and music: soft 3D pictures in the style of core.tsx. */
import { AO, Blush, Eyes, Gloss, L, Mouth, O, S, Smile, base, dark, light, type Draw, type Hue } from './kit'

type Pt = [number, number]
const f = (n: number) => Math.round(n * 10) / 10

/** A polygon with rounded corners (k = how much of each edge is used for the rounding). */
function roundPoly(pts: Pt[], k: number | number[]): string {
  const n = pts.length
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]
    const kk = Array.isArray(k) ? k[i % k.length] : k
    const s: Pt = [p[0] + (a[0] - p[0]) * kk, p[1] + (a[1] - p[1]) * kk]
    const e: Pt = [p[0] + (b[0] - p[0]) * kk, p[1] + (b[1] - p[1]) * kk]
    d += `${i ? 'L' : 'M'}${f(s[0])} ${f(s[1])}Q${f(p[0])} ${f(p[1])} ${f(e[0])} ${f(e[1])}`
  }
  return d + 'Z'
}
/** Five-pointed star points. */
const starPts = (cx: number, cy: number, R: number, r: number): Pt[] =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as Pt
  })
/** A water drop, tip up; (x, y) is the middle of the round part, s its radius. */
const drop = (x: number, y: number, s: number) =>
  `M${x} ${y - s * 1.7}C${x + s * .5} ${y - s * .9} ${x + s} ${y - s * .4} ${x + s} ${y + s * .2}a${s} ${s} 0 0 1 ${-2 * s} 0C${x - s} ${y - s * .4} ${x - s * .5} ${y - s * .9} ${x} ${y - s * 1.7}Z`
/** Point and angle (deg) on a quadratic curve. */
function qp(t: number, a: Pt, b: Pt, c: Pt): [number, number, number] {
  const u = 1 - t
  const x = u * u * a[0] + 2 * u * t * b[0] + t * t * c[0]
  const y = u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]
  const dx = 2 * u * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), dy = 2 * u * (b[1] - a[1]) + 2 * t * (c[1] - b[1])
  return [x, y, Math.atan2(dy, dx) * 180 / Math.PI]
}

const CLOUD = 'M25 68a16 16 0 0 1-2-32a20 20 0 0 1 35-12a17 17 0 0 1 22 16a14.5 14.5 0 0 1-2 28Q51 72 25 68Z'
const Cloud = ({ x, y, s, h = 'white' }: { x: number; y: number; s: number; h?: Hue }) =>
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -46)`}>
    <S d={CLOUD} h={h} /><AO d={CLOUD} /><Gloss cx={36} cy={34} rx={12} ry={6} rot={-20} o={.8} />
  </g>

const TRUNK = 'M36 92c6-3 8-10 8-20 0-7-1-13-2-18h16c-1 5-2 11-2 18 0 10 2 17 8 20Z'
const SOIL = 'M16 91c1-11 16-17 34-17s33 6 34 17Z'
const LEAF_BIG = 'M16 86C10 50 34 16 86 12c4 46-24 76-70 74Z'
const LEAF_UP = 'M50 90C28 74 22 42 50 10c28 32 22 64 0 80Z'
const HEART = 'M50 46C40 38 27 30 31 18c3-8 15-9 19-1 4-8 16-7 19 1 4 12-9 20-19 28Z'
const BALLOON = 'M50 10c-19 0-31 14-31 32 0 19 15 33 29 37h4c14-4 29-18 29-37 0-18-12-32-31-32Z'
const BIGDROP = drop(50, 58, 27)
const MOON = 'M64 13.5A38 38 0 1 0 64 86.5A40 40 0 0 1 64 13.5Z'
const WAVE = 'M8 90C8 56 26 26 56 24C78 22 93 38 89 55C87 63 77 66 72 59C80 55 78 43 68 43C56 43 50 55 54 67C58 79 72 85 92 85L92 90Z'
const NEST = 'M10 58c2 20 18 33 40 33s38-13 40-33c-12 7-26 9-40 9s-28-2-40-9Z'
const POT = 'M27 66h46l-5 24H32Z'
const RIM = 'M24 56h52a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z'
const COCOON = 'M52 26c14 4 20 18 20 33 0 16-8 29-20 31-12-2-20-15-20-31 0-15 6-29 20-33Z'
const GUITAR = 'M50 30c-9 0-15 6-15 14 0 5 3 8 3 11 0 3-7 6-7 15 0 11 8 19 19 19s19-8 19-19c0-9-7-12-7-15 0-3 3-6 3-11 0-8-6-14-15-14Z'
const VIOLIN = 'M50 28c-10 0-16 4-16 11 0 5 4 7 4 10 0 2-3 3-3 6s3 4 3 6c0 3-6 5-6 12 0 9 8 14 18 14s18-5 18-14c0-7-6-9-6-12 0-2 3-3 3-6s-3-4-3-6c0-3 4-5 4-10 0-7-6-11-16-11Z'
const DRUM = 'M14 46v30c0 7 16 13 36 13s36-6 36-13V46c0 7-16 12-36 12S14 53 14 46Z'
const BELL = 'M62 44C74 42 84 32 89 24c3 8 3 44 0 52-5-8-15-18-27-20Z'
const HORN = 'M22 44L66 24c3-1 5 1 5 4v44c0 3-2 5-5 4L22 56Z'

/** Tiny five-petal flower (hoa sữa cluster). */
const Floret = ({ x, y, r = 4 }: { x: number; y: number; r?: number }) => <g>
  {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={x} cy={y - r} rx={r * .8} ry={r * 1.05} fill="url(#v-cream)" stroke={dark('cream')} strokeOpacity=".6" strokeWidth=".8" transform={`rotate(${a} ${x} ${y})`} />)}
  <circle cx={x} cy={y} r={r * .5} fill={base('leaf')} />
</g>

/** One rice stalk: stem plus drooping panicle of golden grains. */
const RiceStalk = ({ stem, pan }: { stem: string; pan: [Pt, Pt, Pt] }) => <g>
  <path d={stem} fill="none" stroke={base('yellow')} strokeWidth="3" strokeLinecap="round" />
  <path d={`M${pan[0][0]} ${pan[0][1]}Q${pan[1][0]} ${pan[1][1]} ${pan[2][0]} ${pan[2][1]}`} fill="none" stroke={dark('yellow')} strokeWidth="2" strokeLinecap="round" />
  {Array.from({ length: 9 }, (_, i) => {
    const [x, y, a] = qp(.08 + i * .115, ...pan), side = i % 2 ? 1 : -1
    const nx = -Math.sin(a * Math.PI / 180) * 3.2 * side, ny = Math.cos(a * Math.PI / 180) * 3.2 * side
    return <ellipse key={i} cx={f(x + nx)} cy={f(y + ny)} rx="3" ry="5" fill="url(#v-yellow)" stroke={dark('yellow')} strokeOpacity=".5" strokeWidth=".8" transform={`rotate(${f(a + 90 + side * 30)} ${f(x + nx)} ${f(y + ny)})`} />
  })}
</g>

export const NATURE: Record<string, Draw> = {
  /* Tree: bumpy round crown on a brown trunk. */
  '🌳': () => <g>
    <S d={TRUNK} h="brown" /><AO d={TRUNK} />
    <L d="M50 66l9-8M50 72l-8-7" w={3} h="brown" o={.6} />
    <O cx={27} cy={47} r={17} h="green" /><O cx={73} cy={47} r={17} h="green" /><O cx={50} cy={22} r={17} h="green" />
    <O cx={36} cy={32} r={18} h="leaf" /><O cx={64} cy={33} r={18} h="leaf" /><O cx={50} cy={50} r={19} h="leaf" />
    <O cx={34} cy={52} r={13} h="leaf" /><O cx={66} cy={52} r={13} h="leaf" />
    <Gloss cx={30} cy={25} rx={8} ry={4.5} rot={-35} /><Gloss cx={58} cy={24} rx={6} ry={3.5} o={.7} /><Gloss cx={42} cy={44} rx={6} ry={3} o={.6} />
  </g>,

  /* Sprout: two leaves on a stem from a mound of soil. */
  '🌱': () => <g>
    <path d="M50 80C50 70 49 60 50 50" fill="none" stroke={dark('leaf')} strokeWidth="6" strokeLinecap="round" />
    <path d="M50 80C50 70 49 60 50 50" fill="none" stroke={base('leaf')} strokeWidth="3.5" strokeLinecap="round" />
    <S d="M50 54C38 60 18 54 13 36c16-7 35-2 37 18Z" h="leaf" />
    <S d="M50 50C54 32 72 22 88 26c-2 18-20 28-38 24Z" h="leaf" />
    <L d="M47 52C38 50 28 45 20 39M53 47C62 40 72 33 82 29" w={1.6} h="leaf" o={.6} />
    <S d={SOIL} h="brown" /><AO d={SOIL} />
    <circle cx="34" cy="83" r="1.8" fill={dark('brown')} opacity=".5" /><circle cx="62" cy="86" r="1.6" fill={dark('brown')} opacity=".5" /><circle cx="48" cy="87" r="1.4" fill={dark('brown')} opacity=".5" />
    <Gloss cx={24} cy={41} rx={6} ry={3} rot={-20} /><Gloss cx={66} cy={31} rx={6} ry={3} rot={-25} />
    <Gloss cx={34} cy={78} rx={8} ry={2.5} rot={-8} o={.6} />
  </g>,

  /* Hoa sữa: round clusters of tiny cream flowers above a whorl of long green leaves. */
  '🌼': () => <g>
    <path d="M50 92C49 82 50 72 50 62" fill="none" stroke={base('wood')} strokeWidth="5" strokeLinecap="round" />
    {[-115, -78, -42, 42, 78, 115].map(a => <g key={a} transform={`rotate(${a} 50 62)`}>
      <ellipse cx="50" cy="40" rx="6" ry="20" fill={`url(#v-${Math.abs(a) === 78 ? 'leaf' : 'green'})`} stroke={dark('green')} strokeOpacity=".35" strokeWidth="1" />
      <path d="M50 58V24" stroke={light('leaf')} strokeWidth="1.2" opacity=".7" />
    </g>)}
    {([[34, 44, 14], [66, 44, 14], [50, 30, 17]] as [number, number, number][]).map(([x, y, r]) => <O key={x} cx={x} cy={y} r={r} h="cream" />)}
    {([[38, 18], [50, 14], [62, 18], [34, 30], [46, 26], [58, 27], [68, 32], [24, 42], [37, 40], [52, 39], [64, 42], [76, 44], [30, 53], [44, 51], [58, 52], [71, 54]] as Pt[])
      .map(([x, y]) => <Floret key={`${x}-${y}`} x={x} y={y} r={5} />)}
    <Gloss cx={38} cy={20} rx={7} ry={3.5} rot={-30} o={.8} />
  </g>,

  /* Sunflower with a smiling face. */
  '🌻': () => <g>
    <path d="M50 60C49 74 52 83 50 93" fill="none" stroke={base('leaf')} strokeWidth="6" strokeLinecap="round" />
    <S d="M51 78c8-11 21-12 26-6-7 9-18 11-26 6Z" h="leaf" />
    <S d="M49 84c-8-10-20-11-25-5 7 9 18 10 25 5Z" h="leaf" />
    {Array.from({ length: 14 }, (_, i) => <ellipse key={`b${i}`} cx="50" cy="15" rx="6.5" ry="12" fill="url(#v-orange)" transform={`rotate(${i * 360 / 14 + 13} 50 38)`} />)}
    {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx="50" cy="16" rx="6.5" ry="12" fill="url(#v-yellow)" stroke={dark('yellow')} strokeOpacity=".35" strokeWidth="1" transform={`rotate(${i * 360 / 14} 50 38)`} />)}
    <O cx={50} cy={38} r={15} h="brown" />
    {[[42, 31], [50, 28], [58, 31], [40, 46], [60, 46], [50, 49]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill={dark('brown')} opacity=".6" />)}
    <Eyes x={50} y={36} gap={11} r={3.6} /><Mouth x={50} y={42.5} w={6} />
    <Blush x={50} y={42} gap={20} r={3} />
    <Gloss cx={43} cy={29} rx={4} ry={2.2} o={.6} />
  </g>,

  /* Red rose: cupped petals with a spiral top, thorny stem, leaves. */
  '🌹': ({ c = 'red' }) => <g>
    <path d="M50 58C49 72 52 82 50 93" fill="none" stroke={base('green')} strokeWidth="5.5" strokeLinecap="round" />
    <path d="M51 70l5-3M49 82l-5-2" stroke={dark('green')} strokeWidth="2.5" strokeLinecap="round" />
    <S d="M51 76c7-11 20-13 26-7-6 10-18 12-26 7Z" h="leaf" />
    <S d="M49 66c-7-10-19-11-24-5 6 9 17 10 24 5Z" h="leaf" />
    <S d="M50 14C36 14 26 22 26 34c0 4 1 7 3 10 4-6 12-10 21-10s17 4 21 10c2-3 3-6 3-10 0-12-10-20-24-20Z" h={c} />
    <S d="M27 33C25 50 35 62 50 62s25-12 23-29c-4 6-9 10-14 11-3-4-6-6-9-6s-6 2-9 6c-5-1-10-5-14-11Z" h={c} />
    <S d="M38 28c2-8 7-12 12-12s10 4 12 12c-4 4-8 6-12 6s-8-2-12-6Z" h={c} />
    <path d="M50 22c5 0 7 4 4 7-3 2-8 1-8-3 0-5 6-8 11-6" fill="none" stroke={dark(c)} strokeWidth="2" strokeLinecap="round" opacity=".75" />
    <path d="M30 40c5 6 12 9 20 9M70 40c-5 6-12 9-20 9M40 58c-4-4-6-9-6-14M60 58c4-4 6-9 6-14" fill="none" stroke={dark(c)} strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
    <path d="M38 60l-6 4 10 0ZM62 60l6 4-10 0Z" fill={base('leaf')} />
    <Gloss cx={34} cy={24} rx={6} ry={3.5} rot={-35} /><Gloss cx={34} cy={46} rx={4} ry={2.4} rot={-60} o={.6} />
  </g>,

  /* Four-leaf clover. */
  '🍀': () => <g>
    <path d="M50 46C52 62 58 78 64 92" fill="none" stroke={base('leaf')} strokeWidth="5" strokeLinecap="round" />
    {[45, 135, 225, 315].map((a, i) => <g key={a} transform={`rotate(${a} 50 46)`}>
      <S d={HEART} h={i % 2 ? 'green' : 'leaf'} />
      <path d="M50 44V22" stroke={light('leaf')} strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    </g>)}
    <circle cx="50" cy="46" r="3" fill={dark('green')} opacity=".5" />
    <Gloss cx={34} cy={30} rx={6} ry={3.5} rot={-40} /><Gloss cx={66} cy={30} rx={4} ry={2.4} rot={40} o={.7} />
  </g>,

  /* One big green leaf. */
  '🍃': () => <g>
    <path d="M18 84l-8 8" stroke={dark('leaf')} strokeWidth="4" strokeLinecap="round" />
    <S d={LEAF_BIG} h="leaf" /><AO d={LEAF_BIG} />
    <path d="M18 84C36 66 56 42 80 18" fill="none" stroke={light('leaf')} strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
    <path d="M34 66l-4-16M34 66l14 4M48 50l-2-16M48 50l16 2M62 36l0-14M62 36l14 0" fill="none" stroke={light('leaf')} strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    <Gloss cx={36} cy={38} rx={10} ry={5} rot={-50} />
  </g>,

  /* Dry autumn leaves: a yellow and an orange one, brown veins. */
  '🍂': () => <g>
    {([['orange', -30, -6], ['yellow', 22, 6]] as [Hue, number, number][]).map(([h, a, dx]) => <g key={h} transform={`translate(${dx} 0) rotate(${a} 50 84) translate(0 -2) scale(1 .92)`}>
      <S d={LEAF_UP} h={h} /><AO d={LEAF_UP} />
      <path d="M50 96V16M50 70l-12-12M50 70l12-12M50 50l-11-11M50 50l11-11M50 32l-7-7M50 32l7-7" fill="none" stroke={dark('brown')} strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
      <path d="M43 34c-2 4-8 6-11 4" fill="none" stroke={dark('brown')} strokeWidth="1.6" strokeLinecap="round" opacity=".4" />
      <Gloss cx={39} cy={40} rx={7} ry={3.5} rot={-70} o={.8} />
    </g>)}
  </g>,

  /* Grass: a lawn mound with a tuft of blades. */
  '🌿': () => {
    const blade = (x: number, w: number, tx: number, ty: number) => `M${x - w} 82Q${x - w * .6} ${(82 + ty) / 2} ${tx} ${ty}Q${x + w * .9} ${(82 + ty) / 2 + 4} ${x + w} 82Z`
    const back: [number, number, number, number][] = [[22, 5, 10, 34], [38, 5, 30, 14], [58, 5, 66, 12], [76, 5, 90, 32]]
    const front: [number, number, number, number][] = [[28, 5, 18, 46], [44, 6, 42, 22], [52, 6, 54, 18], [66, 5, 78, 28], [34, 4, 34, 40], [72, 4, 84, 50]]
    return <g>
      {back.map(b => <S key={`b${b[0]}`} d={blade(...b)} h="green" />)}
      {front.map(b => <S key={b[0]} d={blade(...b)} h="leaf" />)}
      <S d="M8 90c1-9 18-14 42-14s41 5 42 14Z" h="green" />
      <AO d="M8 90c1-9 18-14 42-14s41 5 42 14Z" />
      <Gloss cx={44} cy={36} rx={1.8} ry={8} rot={4} o={.7} /><Gloss cx={30} cy={78} rx={10} ry={2.2} rot={-4} o={.6} />
    </g>
  },

  /* Golden rice stalks with drooping grains. */
  '🌾': () => <g>
    <S d="M46 92C36 76 24 70 12 70c12 4 22 12 30 22Z" h="green" />
    <S d="M54 92C64 74 76 66 90 66c-12 5-24 14-32 26Z" h="green" />
    <RiceStalk stem="M48 92Q44 52 58 22" pan={[[58, 22], [78, 8], [86, 44]]} />
    <RiceStalk stem="M50 92Q50 58 36 30" pan={[[36, 30], [18, 20], [14, 56]]} />
    <RiceStalk stem="M52 92Q58 66 64 48" pan={[[64, 48], [80, 44], [80, 72]]} />
    <S d="M50 92C46 72 38 58 28 50c6 12 12 26 16 42Z" h="leaf" />
  </g>,

  /* Potted plant (tưới nước cho cây). */
  '🪴': () => <g>
    {[-32, 32].map(a => <g key={a} transform={`rotate(${a} 50 60)`}>
      <ellipse cx="50" cy="34" rx="9" ry="22" fill="url(#v-green)" />
    </g>)}
    {[-58, 0, 58].map(a => <g key={a} transform={`rotate(${a} 50 60)`}>
      <ellipse cx="50" cy={a ? 38 : 30} rx="11" ry={a ? 19 : 22} fill="url(#v-leaf)" stroke={dark('leaf')} strokeOpacity=".35" strokeWidth="1.2" />
      <path d={`M50 ${a ? 56 : 52}V${a ? 22 : 12}`} stroke={light('leaf')} strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </g>)}
    <S d={POT} h="orange" /><AO d={POT} />
    <S d={RIM} h="orange" />
    <Gloss cx={34} cy={74} rx={3} ry={8} rot={10} o={.7} /><Gloss cx={34} cy={59} rx={8} ry={1.8} rot={0} o={.8} />
    <Gloss cx={44} cy={18} rx={3} ry={6} rot={10} o={.7} />
  </g>,

  /* Bird's nest with eggs. */
  '🪺': () => <g>
    <ellipse cx="50" cy="58" rx="39" ry="11" fill={dark('brown')} />
    <O cx={34} cy={52} rx={10} ry={12} h="cream" />
    <O cx={66} cy={52} rx={10} ry={12} h="cream" />
    <O cx={50} cy={48} rx={11} ry={13} h="blue" />
    <Gloss cx={31} cy={46} rx={3} ry={4} rot={-20} /><Gloss cx={47} cy={41} rx={3.2} ry={4.5} rot={-20} /><Gloss cx={63} cy={46} rx={3} ry={4} rot={-20} />
    <S d={NEST} h="wood" /><AO d={NEST} />
    <path d="M14 62c12 6 28 8 40 7M22 72c12 6 30 7 46 2M30 82c10 4 24 4 36-1M54 64c12 0 22-2 32-6M18 66c8 10 20 14 30 15M60 80c10-2 18-8 24-16" fill="none" stroke={dark('wood')} strokeWidth="2" strokeLinecap="round" opacity=".7" />
    <path d="M10 58c-2-3 0-6 3-5M90 58c3-3 1-6-3-5" fill="none" stroke={dark('wood')} strokeWidth="2.4" strokeLinecap="round" />
  </g>,

  /* Smiling star (đèn ông sao, ngôi sao). */
  '⭐': ({ c = 'yellow' }) => {
    const d = roundPoly(starPts(50, 53, 44, 21), [.2, .14])
    return <g>
      <S d={d} h={c} /><AO d={d} />
      <Eyes x={50} y={52} gap={16} r={5} /><Mouth x={50} y={61} w={8} />
      <Blush x={50} y={59} gap={26} r={4.5} />
      <Gloss cx={36} cy={38} rx={7} ry={3.5} rot={-40} />
    </g>
  },

  /* Balloon on a string. */
  '🎈': ({ c = 'red' }) => <g>
    <path d="M50 83c-5 3 4 6 0 10" fill="none" stroke={base('gray')} strokeWidth="1.8" strokeLinecap="round" />
    <S d={BALLOON} h={c} /><AO d={BALLOON} />
    <path d="M45.5 84l4.5-6 4.5 6Z" fill={dark(c)} />
    <Gloss cx={34} cy={28} rx={8} ry={12} rot={25} />
    <Gloss cx={62} cy={22} rx={3} ry={2} o={.6} />
  </g>,

  /* Rain: a grey cloud with falling drops. */
  '🌧': () => <g>
    {([[28, 74, 6.5], [50, 82, 7], [72, 74, 6.5]] as [number, number, number][]).map(([x, y, s]) =>
      <g key={x}><S d={drop(x, y, s)} h="blue" /><Gloss cx={x - s * .35} cy={y - s * .2} rx={s * .25} ry={s * .5} rot={15} /></g>)}
    <g transform="translate(50 30) scale(.86) translate(-50 -44)">
      <S d={CLOUD} h="gray" /><AO d={CLOUD} /><Gloss cx={36} cy={34} rx={12} ry={6} rot={-20} o={.8} />
    </g>
    <Eyes x={50} y={33} gap={16} r={4.5} /><Smile x={50} y={40.5} w={6} />
    <Blush x={50} y={39} gap={26} r={4} />
  </g>,

  /* A clean water drop. */
  '💧': () => <g>
    <S d={BIGDROP} h="blue" /><AO d={BIGDROP} />
    <Gloss cx={38} cy={58} rx={5} ry={12} rot={10} />
    <Gloss cx={42} cy={38} rx={2.5} ry={5} rot={25} o={.7} />
  </g>,

  /* Splashing water: drops flying out. */
  '💦': () => <g>
    {([[34, 66, 15, -35], [66, 44, 12, 30], [70, 78, 9, 50], [26, 30, 7, -55]] as [number, number, number, number][]).map(([x, y, s, a]) =>
      <g key={x + y} transform={`rotate(${a} ${x} ${y})`}>
        <S d={drop(x, y, s)} h="blue" /><AO d={drop(x, y, s)} />
        <Gloss cx={x - s * .4} cy={y - s * .1} rx={s * .22} ry={s * .5} rot={12} />
      </g>)}
    <circle cx="52" cy="22" r="3.5" fill="url(#v-blue)" /><circle cx="86" cy="62" r="3" fill="url(#v-blue)" /><circle cx="16" cy="56" r="2.6" fill="url(#v-blue)" />
  </g>,

  /* Smiling sun with rays. */
  '☀': () => <g>
    {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="50" cy="14" rx="5.5" ry="8" fill="url(#v-orange)" stroke={dark('orange')} strokeOpacity=".3" strokeWidth="1" transform={`rotate(${i * 30} 50 50)`} />)}
    <O cx={50} cy={50} r={28} h="yellow" />
    <Eyes x={50} y={47} gap={20} r={6} /><Mouth x={50} y={58} w={10} />
    <Blush x={50} y={56} gap={34} r={5.5} />
    <Gloss cx={37} cy={34} rx={9} ry={5} rot={-35} />
  </g>,

  /* Cloud with a smile (c = 'dark' for mây đen). */
  '☁': ({ c = 'white' }) => <g>
    <g transform="translate(50 52) scale(1.1) translate(-50 -46)">
      <S d={CLOUD} h={c} /><AO d={CLOUD} /><Gloss cx={36} cy={34} rx={12} ry={6} rot={-20} o={.8} />
    </g>
    <Eyes x={50} y={54} gap={19} r={5.6} /><Mouth x={50} y={63.5} w={8.5} />
    <Blush x={50} y={61} gap={32} r={5} />
  </g>,

  /* Rainbow with little clouds at its feet. */
  '🌈': () => {
    const hues: Hue[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
    const band = (R: number, w: number) => `M${50 - R} 74A${R} ${R} 0 0 1 ${50 + R} 74H${50 + R - w}A${R - w} ${R - w} 0 0 0 ${50 - R + w} 74Z`
    return <g>
      {hues.map((h, i) => <S key={h} d={band(44 - i * 6.6, 7)} h={h} />)}
      <path d="M12 62A40 40 0 0 1 38 34" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
      <Cloud x={20} y={78} s={.44} /><Cloud x={80} y={78} s={.44} />
    </g>
  },

  /* Sleepy crescent moon with a tiny star (buổi tối, đến giờ ngủ). */
  '🌙': () => {
    const st = roundPoly(starPts(76, 44, 11, 5), [.22, .12])
    return <g>
      <S d={MOON} h="yellow" /><AO d={MOON} />
      <path d="M17 44q4 4 8 0M30 44q4 4 8 0" fill="none" stroke="#3a1f2a" strokeWidth="2.2" strokeLinecap="round" />
      <Smile x={27} y={53} w={7} />
      <Blush x={27} y={51} gap={22} r={4} />
      <Gloss cx={28} cy={24} rx={8} ry={4} rot={-40} />
      <S d={st} h="yellow" /><S d={roundPoly(starPts(84, 72, 6, 2.7), [.22, .12])} h="yellow" />
    </g>
  },

  /* Snowflake (trời lạnh). */
  '❄': () => <g>
    {[0, 60, 120, 180, 240, 300].map(a => <g key={a} transform={`rotate(${a} 50 50)`}>
      <path d="M50 50V12M50 30l-9-9M50 30l9-9M50 20l-5-5M50 20l5-5" fill="none" stroke={dark('blue')} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 50V12M50 30l-9-9M50 30l9-9M50 20l-5-5M50 20l5-5" fill="none" stroke={base('blue')} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M49 46V14" fill="none" stroke={light('blue')} strokeWidth="1.8" strokeLinecap="round" />
    </g>)}
    <O cx={50} cy={50} r={9} h="sky" />
    <Gloss cx={47} cy={47} rx={3} ry={2} />
  </g>,

  /* Wind: a cloud blowing swirly gusts and a leaf. */
  '🌬': () => <g>
    <path d="M58 40h20c8 0 10-10 4-13-4-2-8 1-7 4M60 54h28M56 68h18c8 0 10 10 4 13-4 2-8-1-7-4" fill="none" stroke={base('blue')} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M58 40h20M60 54h28M56 68h18" fill="none" stroke={light('blue')} strokeWidth="1.5" strokeLinecap="round" />
    <g transform="translate(78 86) rotate(-30)"><S d="M-9 0C-5-7 5-7 9 0C5 7-5 7-9 0Z" h="leaf" /><path d="M-8 0H8" stroke={dark('leaf')} strokeWidth="1" /></g>
    <g transform="translate(33 54) scale(.7) translate(-50 -46)">
      <S d={CLOUD} h="white" /><AO d={CLOUD} /><Gloss cx={36} cy={34} rx={12} ry={6} rot={-20} o={.8} />
    </g>
    <Eyes x={29} y={52} gap={13} r={4} />
    <ellipse cx="42" cy="59" rx="3.4" ry="3.8" fill="#7a2a3a" />
    <Blush x={32} y={59} gap={20} r={4} />
  </g>,

  /* A big curling wave. */
  '🌊': () => <g>
    <S d={WAVE} h="blue" /><AO d={WAVE} />
    <path d="M58 70C62 78 74 82 90 82" fill="none" stroke={light('blue')} strokeWidth="2" strokeLinecap="round" opacity=".7" />
    <path d="M14 82c6-3 10-3 16 0s10 3 16 0" fill="none" stroke={light('blue')} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
    {([[40, 30, 5], [50, 26, 5.5], [61, 25, 5.5], [72, 27, 5], [81, 33, 4.5], [87, 42, 4], [89, 51, 3.5]] as [number, number, number][]).map(([x, y, r]) => <O key={x} cx={x} cy={y} r={r} h="white" />)}
    <Gloss cx={28} cy={54} rx={5} ry={12} rot={30} o={.8} />
  </g>,

  /* Square: a puffy foam play-mat tile (c changes its colour). */
  '🟩': ({ c = 'green' }) => {
    const sq = 'M24 12h52a12 12 0 0 1 12 12v52a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V24a12 12 0 0 1 12-12Z'
    return <g>
      <S d={sq} h={c} /><AO d={sq} />
      <rect x="22" y="22" width="56" height="56" rx="7" fill={light(c)} opacity=".35" />
      <rect x="22" y="22" width="56" height="56" rx="7" fill="none" stroke={dark(c)} strokeOpacity=".35" strokeWidth="1.5" />
      <Gloss cx={30} cy={22} rx={12} ry={4} rot={-20} />
    </g>
  },

  /* Triangle puzzle piece. */
  '🔺': ({ c = 'red' }) => {
    const tri = roundPoly([[50, 10], [92, 86], [8, 86]], .14)
    const inner = roundPoly([[50, 28], [78, 78], [22, 78]], .14)
    return <g>
      <S d={tri} h={c} /><AO d={tri} />
      <path d={inner} fill={light(c)} opacity=".3" stroke={dark(c)} strokeOpacity=".35" strokeWidth="1.5" />
      <Gloss cx={38} cy={40} rx={8} ry={3.5} rot={-60} />
    </g>
  },

  /* Cocoon hanging from a twig. */
  '🟤': () => <g>
    <path d="M10 20C34 14 60 22 90 14" fill="none" stroke={dark('brown')} strokeWidth="7" strokeLinecap="round" />
    <path d="M10 20C34 14 60 22 90 14" fill="none" stroke={base('brown')} strokeWidth="4.5" strokeLinecap="round" />
    <S d="M76 16c4-10 14-12 18-8-4 8-12 10-18 8Z" h="leaf" />
    <path d="M52 19v8" stroke={dark('wood')} strokeWidth="2" />
    <S d={COCOON} h="wood" /><AO d={COCOON} />
    <path d="M36 44c8 4 24 2 32-4M33 58c10 5 28 3 38-4M34 72c10 4 26 3 36-4M40 84c6 2 16 2 22-2M40 34c6 3 16 2 22-2" fill="none" stroke={dark('wood')} strokeWidth="2" strokeLinecap="round" opacity=".6" />
    <Gloss cx={43} cy={44} rx={4} ry={10} rot={15} />
  </g>,

  /* Big puffy question mark. */
  '❓': () => {
    const q = 'M31 34c0-14 9-23 20-23s20 8 20 19c0 10-6 14-12 18-5 3-8 6-8 13v3'
    return <g>
      <path d={q} fill="none" stroke={dark('red')} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 2)" />
      <path d={q} fill="none" stroke="url(#v-red)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 30c1-8 7-14 14-14" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="51" cy="84" r="9" fill={dark('red')} />
      <O cx={51} cy={82} r={8.5} h="red" />
      <Gloss cx={48} cy={79} rx={3} ry={2} />
    </g>
  },

  /* Toy keyboard (đàn phím). */
  '🎹': () => {
    const body = 'M14 28h72a6 6 0 0 1 6 6v44a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V34a6 6 0 0 1 6-6Z'
    const n = 10, x0 = 13, w = 7.4, y0 = 46, kh = 33
    return <g>
      <S d={body} h="red" /><AO d={body} />
      <circle cx="20" cy="37" r="4.5" fill={dark('red')} />
      {[-2, 0, 2].map(d => <circle key={d} cx={20 + d} cy={37} r=".9" fill={base('black')} />)}
      {([['yellow', 56], ['blue', 66], ['green', 76]] as [Hue, number][]).map(([h, x]) => <O key={h} cx={x} cy={37} r={3.4} h={h} />)}
      <rect x="31" y="34" width="18" height="6" rx="2" fill="url(#v-dark)" />
      <rect x={x0 - 1} y={y0 - 1} width={n * w + 2} height={kh + 2} rx="2.5" fill={dark('red')} />
      {Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * w + .4} y={y0} width={w - .8} height={kh} rx="1.6" fill="url(#v-white)" stroke={base('gray')} strokeWidth=".8" />)}
      {[1, 2, 4, 5, 6, 8, 9].map(i => <rect key={`k${i}`} x={x0 + i * w - 2.4} y={y0} width="4.8" height="19" rx="1.2" fill="url(#v-black)" />)}
      <Gloss cx={30} cy={30} rx={14} ry={2} rot={0} o={.8} />
    </g>
  },

  /* Acoustic guitar, tilted. */
  '🎸': () => <g transform="translate(0 4) rotate(40 50 50)">
    <rect x="45.5" y="2" width="9" height="44" rx="2" fill="url(#v-brown)" />
    {[10, 17, 24, 31, 38].map(y => <path key={y} d={`M45.5 ${y}h9`} stroke={light('gray')} strokeWidth="1" opacity=".8" />)}
    <S d="M43 -10h14a2 2 0 0 1 2 2v12H41V-8a2 2 0 0 1 2-2Z" h="hair" />
    {[-6, -1, 4].map(y => <g key={y}><circle cx="39" cy={y} r="2.4" fill="url(#v-gray)" /><circle cx="61" cy={y} r="2.4" fill="url(#v-gray)" /></g>)}
    <S d={GUITAR} h="orange" /><AO d={GUITAR} />
    <circle cx="50" cy="55" r="8.5" fill={light('orange')} opacity=".6" />
    <circle cx="50" cy="55" r="6.5" fill={dark('brown')} />
    <rect x="42" y="74" width="16" height="4.5" rx="2" fill={base('hair')} />
    {[47.2, 49.1, 50.9, 52.8].map(x => <path key={x} d={`M${x} 76V-6`} stroke="#fff" strokeOpacity=".9" strokeWidth=".7" />)}
    <Gloss cx={42} cy={40} rx={4} ry={6} rot={-20} /><Gloss cx={37} cy={68} rx={5} ry={9} rot={-10} o={.8} />
  </g>,

  /* Violin with its bow. */
  '🎻': () => <g>
    <g transform="translate(50 52) scale(1.14) rotate(-30) translate(-50 -50)">
      <S d={VIOLIN} h="brown" /><AO d={VIOLIN} />
      <path d="M47 24h6l2 40h-10Z" fill="url(#v-black)" />
      <rect x="46.5" y="10" width="7" height="16" rx="2" fill="url(#v-hair)" />
      <circle cx="50" cy="8" r="5" fill="url(#v-hair)" /><path d="M50 8m-2.5 0a2.5 2.5 0 1 1 2.5 2.5" fill="none" stroke={light('hair')} strokeWidth="1.2" />
      <path d="M45 15h-3M45 20h-3M55 15h3M55 20h3" stroke={base('black')} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M41 58c-3 2-1 6 0 8s3 6 0 8M59 58c3 2 1 6 0 8s-3 6 0 8" fill="none" stroke={dark('black')} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M44 70h12l-1 3H45Z" fill={base('cream')} />
      <path d="M46 76h8l-1 12h-6Z" fill="url(#v-black)" />
      {[48, 49.4, 50.6, 52].map(x => <path key={x} d={`M${x} 77V14`} stroke="#fff" strokeOpacity=".75" strokeWidth=".6" />)}
      <Gloss cx={41} cy={36} rx={3.5} ry={6} rot={-10} /><Gloss cx={39} cy={74} rx={4} ry={7} rot={-10} o={.7} />
    </g>
    <path d="M14 84L88 20" stroke={dark('hair')} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M18 86L89 25" stroke={light('cream')} strokeWidth="1.5" strokeLinecap="round" opacity=".95" />
    <rect x="11" y="81" width="10" height="6" rx="1.5" fill="url(#v-black)" transform="rotate(-41 16 84)" />
  </g>,

  /* Golden trumpet, side view. */
  '🎺': () => <g transform="translate(50 56) scale(1.08) translate(-50 -50)">
    <path d="M60 52h8a10 10 0 0 1 0 20H32a10 10 0 0 1 0-20h4" fill="none" stroke={dark('yellow')} strokeWidth="8" />
    <path d="M60 52h8a10 10 0 0 1 0 20H32a10 10 0 0 1 0-20h4" fill="none" stroke={base('yellow')} strokeWidth="5.5" />
    <path d="M30 69.5h38" stroke={light('yellow')} strokeWidth="1.4" strokeLinecap="round" />
    {[38, 47, 56].map(x => <g key={x}>
      <rect x={x} y={30} width="7" height="32" rx="2" fill="url(#v-yellow)" stroke={dark('yellow')} strokeOpacity=".5" strokeWidth="1" />
      <rect x={x + 2.5} y={24} width="2" height="7" fill={dark('yellow')} />
      <ellipse cx={x + 3.5} cy={23} rx="4.5" ry="2.4" fill="url(#v-cream)" stroke={dark('cream')} strokeWidth=".8" />
    </g>)}
    <rect x="12" y="41" width="54" height="7" rx="3" fill="url(#v-yellow)" stroke={dark('yellow')} strokeOpacity=".5" strokeWidth="1" />
    <path d="M14 42.5h48" stroke={light('yellow')} strokeWidth="1.4" strokeLinecap="round" />
    <S d={BELL} h="yellow" /><AO d={BELL} />
    <ellipse cx="89" cy="50" rx="4" ry="26" fill="url(#v-orange)" />
    <ellipse cx="89.5" cy="50" rx="2.2" ry="20" fill={dark('yellow')} />
    <S d="M6 40.5c3 0 5 2 7 3v2c-2 1-4 3-7 3Z" h="gray" />
    <Gloss cx={78} cy={36} rx={6} ry={2} rot={-35} />
  </g>,

  /* Drum with two crossed drumsticks. */
  '🥁': () => <g>
    <S d={DRUM} h="red" /><AO d={DRUM} />
    <path d="M14 74c0 7 16 13 36 13s36-6 36-13" fill="none" stroke={base('yellow')} strokeWidth="5" />
    <path d="M18 58L28 82L39 61L50 85L61 61L72 82L82 58" fill="none" stroke={light('cream')} strokeWidth="2.4" strokeLinejoin="round" />
    <ellipse cx="50" cy="46" rx="36" ry="12" fill="url(#v-yellow)" />
    <ellipse cx="50" cy="45.5" rx="33" ry="10" fill="url(#v-white)" />
    <Gloss cx={34} cy={42} rx={10} ry={3} rot={-6} o={.8} />
    <Gloss cx={22} cy={64} rx={2.5} ry={8} rot={8} o={.6} />
    {[[20, 12, 56, 40], [80, 12, 44, 40]].map(([x1, y1, x2, y2]) => <g key={x1}>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={dark('wood')} strokeWidth="5.5" strokeLinecap="round" />
      <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke={base('wood')} strokeWidth="3.8" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r="3.6" fill="url(#v-wood)" />
    </g>)}
  </g>,

  /* Hand-held microphone. */
  '🎤': () => <g transform="rotate(22 50 58)">
    <S d="M42 52h16l-3 36c0 3-10 3-10 0Z" h="dark" />
    <path d="M44 56l1 28" stroke={light('dark')} strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    <rect x="45.5" y="64" width="9" height="6" rx="2" fill="url(#v-purple)" />
    <S d="M36 44h28l-3 9H39Z" h="purple" />
    <O cx={50} cy={27} r={19} h="gray" />
    {[-12, -6, 0, 6, 12].map(o => {
      const hw = Math.sqrt(19 * 19 - o * o) - 1.5
      return <g key={o}>
        <path d={`M${f(50 - hw)} ${27 + o}H${f(50 + hw)}`} stroke={dark('gray')} strokeWidth="1" opacity=".45" />
        <path d={`M${50 + o} ${f(27 - hw)}V${f(27 + hw)}`} stroke={dark('gray')} strokeWidth="1" opacity=".45" />
      </g>
    })}
    <Gloss cx={42} cy={18} rx={7} ry={4} rot={-35} />
  </g>,

  /* Music note. */
  '🎵': () => <g>
    <S d="M53 12c5 12 26 18 28 34 1 8-2 13-5 17 1-11-6-18-23-22Z" h="purple" />
    <rect x="47" y="12" width="7.5" height="66" rx="3" fill="url(#v-purple)" />
    <O cx={39} cy={78} rx={15} ry={11} h="purple" transform="rotate(-22 39 78)" />
    <Gloss cx={33} cy={73} rx={5} ry={3} rot={-25} />
    <Gloss cx={49.5} cy={34} rx={1.2} ry={12} rot={0} o={.7} />
  </g>,

  /* Múa rối nước: chú Tễu rising from the water. */
  '🎭': () => <g>
    <path d="M6 80q8-6 16 0t16 0t16 0t16 0t16 0t16 0V92H6Z" fill="url(#v-teal)" />
    <O cx={78} cy={62} rx={6} ry={10} h="skin" transform="rotate(30 78 62)" />
    <O cx={25} cy={50} rx={6} ry={11} h="skin" transform="rotate(-40 25 50)" />
    <O cx={18} cy={40} r={6} h="skin" />
    <O cx={50} cy={68} rx={21} ry={17} h="skin" />
    <path d="M49 66q1.5 2 3 0" fill="none" stroke={dark('skin')} strokeWidth="1.6" strokeLinecap="round" />
    <S d="M30 74q20 8 40 0v7q-20 8-40 0Z" h="red" />
    <O cx={29} cy={35} r={5} h="skin" /><O cx={71} cy={35} r={5} h="skin" />
    <O cx={50} cy={34} r={21} h="skin" />
    <path d="M44 16c-2-6 3-10 6-7 2-5 9-3 7 3-3-2-6-1-7 2-2-1-4 0-6 2Z" fill="url(#v-hair)" />
    <Eyes x={50} y={34} gap={16} r={5} /><Mouth x={50} y={44} w={12} />
    <Blush x={50} y={42} gap={28} r={5} />
    <Gloss cx={39} cy={21} rx={7} ry={4} rot={-30} /><Gloss cx={40} cy={58} rx={5} ry={3} rot={-30} o={.7} />
    <path d="M6 84q8-6 16 0t16 0t16 0t16 0t16 0t16 0V92H6Z" fill="url(#v-blue)" />
    <path d="M10 85q6-4 12 0M42 85q6-4 12 0M74 85q6-4 12 0" fill="none" stroke={light('blue')} strokeWidth="1.8" strokeLinecap="round" />
  </g>,

  /* Megaphone with sound waves (la hét). */
  '📢': () => <g>
    <path d="M36 54v16h8V56" fill="none" stroke={dark('dark')} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <S d="M10 42h12v16H10a2 2 0 0 1-2-2V44a2 2 0 0 1 2-2Z" h="gray" />
    <S d={HORN} h="red" /><AO d={HORN} />
    <path d="M40 36L40 64M54 30V70" stroke="#fff" strokeOpacity=".9" strokeWidth="4" />
    <ellipse cx="70" cy="50" rx="6" ry="25" fill="url(#v-white)" />
    <ellipse cx="71" cy="50" rx="3.5" ry="20" fill={dark('red')} />
    <path d="M81 38q5 12 0 24M88 30q9 20 0 40" fill="none" stroke={base('orange')} strokeWidth="4" strokeLinecap="round" />
    <Gloss cx={42} cy={34} rx={10} ry={2.5} rot={-24} o={.8} />
  </g>,
}
