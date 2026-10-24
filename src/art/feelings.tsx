/* Feelings, polite gestures and body parts: soft-3D emotion faces, a cute child doing each gesture,
 * and friendly body parts in the same skin tones as the ear. */
import { AO, Blush, Eye, Eyes, Gloss, Mouth, O, PAL, S, base, dark, light, type Draw, type Hue } from './kit'

/* ---------- shared bits ---------- */

const MOUTH_IN = '#7a2a3a' // same mouth colours as the kit's <Mouth/>
const TONGUE = '#ff8fa3'
const INK = '#3a1f2a'

/** Round emotion face. */
const FACE = 'M50 12a40 40 0 1 1 0 80a40 40 0 1 1 0-80Z'
const FaceBall = ({ h = 'yellow' as Hue, tint }: { h?: Hue; tint?: Hue }) => <g>
  <S d={FACE} h={h} />
  {tint && <>
    <defs><linearGradient id={`fe-tint-${tint}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={base(tint)} stopOpacity=".85" /><stop offset=".55" stopColor={base(tint)} stopOpacity="0" />
    </linearGradient></defs>
    <path d={FACE} fill={`url(#fe-tint-${tint})`} />
  </>}
  <AO d={FACE} />
  <Gloss cx={31} cy={28} rx={12} ry={6} rot={-40} />
  <Gloss cx={68} cy={22} rx={3.5} ry={2} o={.6} />
</g>

/** Water drop (tear, sweat). Tip at (x, y). */
const drop = (x: number, y: number, s = 1) =>
  `M${x} ${y}c${4 * s} ${7 * s} ${8 * s} ${11 * s} ${8 * s} ${16 * s}a${8 * s} ${8 * s} 0 0 1 -${16 * s} 0c0 -${5 * s} ${4 * s} -${9 * s} ${8 * s} -${16 * s}Z`
const Drop = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g>
  <S d={drop(x, y, s)} h="blue" />
  <Gloss cx={x - 3 * s} cy={y + 13 * s} rx={2.2 * s} ry={3.4 * s} rot={-20} />
</g>

/** A soft rounded tube (arm, leg, sleeve) in a colour family. */
const Tube = ({ d, h, w }: { d: string; h: Hue; w: number }) => <g>
  <path d={d} fill="none" stroke={dark(h)} strokeOpacity=".5" strokeWidth={w + 1.4} strokeLinecap="round" strokeLinejoin="round" />
  <path d={d} fill="none" stroke={base(h)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  <path d={d} fill="none" stroke={light(h)} strokeOpacity=".8" strokeWidth={w * .3} strokeLinecap="round" strokeLinejoin="round" transform="translate(-.9 -.9)" />
</g>
const Limb = ({ d, w = 7 }: { d: string; w?: number }) => <Tube d={d} h="skin" w={w} />
/** Short sleeve: a fat tube from the shoulder along the arm. */
const Sleeve = ({ d, c, w = 10.5 }: { d: string; c: Hue; w?: number }) =>
  <path d={d} fill="none" stroke={base(c)} strokeWidth={w} strokeLinecap="round" />
const Fist = ({ x, y, r = 5.2 }: { x: number; y: number; r?: number }) => <g>
  <O cx={x} cy={y} r={r} h="skin" />
  <path d={`M${x - r * .5} ${y + r * .1}q${r * .5} ${r * .4} ${r} 0`} fill="none" stroke={dark('skin')} strokeWidth="1" strokeLinecap="round" />
</g>

/* An open hand in its own frame: palm centre (0,0), fingers up. */
const PALM = 'M-17-8C-18 4-16 16-10 21C-4 25 6 25 11 21C17 16 18 4 17-8C12-14-12-14-17-8Z'
const FINGERS: [number, number][] = [[-12.6, -38], [-4.2, -45], [4.2, -43], [12.6, -34]]
function HandShape({ spread = false, nails = false }: { spread?: boolean; nails?: boolean }) {
  const ang = spread ? [-20, -7, 7, 20] : [-3, -1, 1, 3]
  return <g>
    <g transform={`translate(-14 10) rotate(${spread ? -62 : -46})`}>
      <rect x={-4.4} y={-27} width={8.8} height={29} rx={4.4} fill={`url(#v-skin)`} stroke={dark('skin')} strokeOpacity=".4" strokeWidth="1.2" />
      {nails && <ellipse cx={0} cy={-22} rx={2.6} ry={3} fill={light('skin')} />}
    </g>
    {FINGERS.map(([x, top], i) => <g key={x} transform={`rotate(${ang[i]} ${x} -6)`}>
      <rect x={x - 4.3} y={top} width={8.6} height={-top} rx={4.3} fill={`url(#v-skin)`} stroke={dark('skin')} strokeOpacity=".4" strokeWidth="1.2" />
      {nails && <ellipse cx={x} cy={top + 5} rx={2.5} ry={3} fill={light('skin')} />}
    </g>)}
    <S d={PALM} h="skin" />
    <path d="M-9 4c6 4 14 4 18-1M-6 13c5 2 10 2 13-1" fill="none" stroke={dark('skin')} strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" />
  </g>
}
const Hand = ({ x, y, s = .4, rot = 0, spread = true, flip = false }: { x: number; y: number; s?: number; rot?: number; spread?: boolean; flip?: boolean }) =>
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}><HandShape spread={spread} /></g>

/* ---------- children ---------- */

const BANGS = 'M-23 3C-26-18-13-27 0-27C13-27 26-18 23 3C21-6 15-11 9-12C5-7-3-6-8-11C-13-7-18-3-23 3Z'
/** A child's head in its own frame (centre 0,0, about 22 radius). Face goes in children. */
function Head({ x, y, s = 1, rot = 0, girl = false, children }: { x: number; y: number; s?: number; rot?: number; girl?: boolean; children?: JSX.Element }) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {girl && <>
      <O cx={-18} cy={-20} r={8.5} h="hair" /><O cx={18} cy={-20} r={8.5} h="hair" />
      <O cx={-13} cy={-14} rx={4} ry={3} h="pink" /><O cx={13} cy={-14} rx={4} ry={3} h="pink" />
    </>}
    <O cx={0} cy={-2} rx={24} ry={23.5} h="hair" />
    {girl && <S d="M-24 0C-26 14-22 22-16 24L-14 6ZM24 0C26 14 22 22 16 24L14 6Z" h="hair" />}
    <O cx={-21.5} cy={5} rx={4.5} ry={5.5} h="skin" /><O cx={21.5} cy={5} rx={4.5} ry={5.5} h="skin" />
    <O cx={0} cy={2} rx={21.5} ry={20.5} h="skin" />
    <S d={BANGS} h="hair" />
    <Gloss cx={-10} cy={-19} rx={7} ry={3} rot={-20} o={.55} />
    {children}
  </g>
}
/* Faces for the child's head (head frame). */
const HappyFace = () => <g><Eyes x={0} y={4} gap={15} r={4.4} /><Mouth x={0} y={12} w={8} /><Blush x={0} y={11} gap={29} r={4.5} /></g>
const GlowFace = () => <g>
  <path d="M-11 5q3.5-5 7 0M4 5q3.5-5 7 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
  <Mouth x={0} y={11} w={9} /><Blush x={0} y={10} gap={29} r={5} />
</g>

/** A child's body below the neck at (x, y): shirt, legs, shoes. Shoulders at (x±11, y+7). */
function Body({ x = 50, y = 57, s = 1, c = 'blue' }: { x?: number; y?: number; s?: number; c?: Hue }) {
  const SHIRT = 'M-14 26C-16 12-11 0 0 0S16 12 14 26Z'
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Limb d="M-6 24v7M6 24v7" w={6.5} />
    <O cx={-7} cy={33} rx={6} ry={3.4} h="red" /><O cx={7} cy={33} rx={6} ry={3.4} h="red" />
    <S d={SHIRT} h={c} /><AO d={SHIRT} />
    <path d="M-5 1q5 4 10 0" fill="none" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
  </g>
}

/** Whole child: arms behind, body, head (with face), arms in front. Scaled around the feet. */
function Kid({ c = 'blue', girl = false, face, back, front, s = 1, dx = 0, headRot = 0 }:
  { c?: Hue; girl?: boolean; face: JSX.Element; back?: JSX.Element; front?: JSX.Element; s?: number; dx?: number; headRot?: number }) {
  return <g transform={`translate(${50 + dx} 91) scale(${s}) translate(-50 -91)`}>
    {back}
    <Body c={c} y={58} />
    <Head x={50} y={36} s={1.1} girl={girl} rot={headRot}>{face}</Head>
    {front}
  </g>
}

/* ---------- thumbs (built from rects/ellipses so they flip cleanly) ---------- */
function Thumb({ down = false }: { down?: boolean }) {
  const Y = (y: number, h = 0) => down ? 100 - y - h : y
  const R = ({ x, y, w, h, rx, hue }: { x: number; y: number; w: number; h: number; rx: number; hue: Hue }) =>
    <rect x={x} y={Y(y, h)} width={w} height={h} rx={rx} fill={`url(#v-${hue})`} stroke={PAL[hue][2]} strokeOpacity=".4" strokeWidth="1.2" />
  return <g>
    <R x={68} y={50} w={20} h={36} rx={6} hue="blue" />
    <rect x={70} y={Y(50, 36)} width={4} height={36} fill={dark('blue')} opacity=".35" />
    <R x={38} y={14} w={16} h={44} rx={8} hue="skin" />
    <ellipse cx={46} cy={Y(21)} rx={4.6} ry={4.2} fill={light('skin')} />
    <R x={30} y={46} w={44} h={40} rx={14} hue="skin" />
    {[54, 63, 72, 81].map(y => <ellipse key={y} cx={32} cy={Y(y)} rx={11.5} ry={5} fill="url(#v-skin)" stroke={dark('skin')} strokeOpacity=".45" strokeWidth="1.2" />)}
    <path d={`M50 ${Y(52)}q10 ${down ? -4 : 4} 18 0`} fill="none" stroke={dark('skin')} strokeOpacity=".4" strokeWidth="1.6" strokeLinecap="round" />
    <Gloss cx={down ? 44 : 43} cy={down ? 44 : 22} rx={down ? 9 : 3} ry={down ? 4 : 8} rot={down ? -20 : 0} o={.8} />
  </g>
}

/* ---------- side-view head for the bow ---------- */
const SIDE_HAIR = 'M-19 5C-23-13-9-23 4-22C14-21 21-13 20-6C11-10 3-8-2-4C-6 0-8 7-12 11C-16 13-19 9-19 5Z'

export const FEELINGS: Record<string, Draw> = {
  /* ---- emotion faces ---- */
  '😀': () => <g>
    <FaceBall />
    <Eyes x={50} y={42} gap={26} r={7} />
    <path d="M28 57Q50 92 72 57Q50 63 28 57Z" fill={MOUTH_IN} />
    <path d="M31 58.5Q50 63 69 58.5L67 63Q50 67 33 63Z" fill="#fff" />
    <path d="M40 74Q50 69 60 74Q50 80 40 74Z" fill={TONGUE} />
    <Blush x={50} y={58} gap={54} r={7} />
  </g>,

  '😢': () => <g>
    <FaceBall />
    <path d="M24 33L39 28M76 33L61 28" stroke={dark('yellow')} strokeWidth="3.4" strokeLinecap="round" />
    <Eyes x={50} y={45} gap={26} r={7} />
    {[37, 63].map(x => <path key={x} d={`M${x - 8.5} 41.5Q${x} 34 ${x + 8.5} 41.5L${x + 8.5} 36H${x - 8.5}Z`} fill={base('yellow')} />)}
    <path d="M39 73Q50 63 61 73" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
    <Drop x={33} y={52} s={1.15} />
    <Drop x={68} y={54} s={.8} />
  </g>,

  '😨': () => <g>
    <FaceBall tint="blue" />
    <path d="M25 31Q31 22 41 25M75 31Q69 22 59 25" fill="none" stroke={dark('yellow')} strokeWidth="3" strokeLinecap="round" />
    {[36, 64].map(x => <g key={x}>
      <ellipse cx={x} cy={44} rx={9} ry={10.5} fill="url(#v-eyewhite)" stroke={INK} strokeOpacity=".3" strokeWidth="1" />
      <circle cx={x} cy={45} r={3.4} fill="#160c10" /><circle cx={x + 1.1} cy={43.8} r={1.1} fill="#fff" />
    </g>)}
    <path d="M34 75C34 62 66 62 66 75C60 72 40 72 34 75Z" fill={MOUTH_IN} />
    <path d="M38 68C44 65 56 65 62 68L61 70C55 68 45 68 39 70Z" fill="#fff" />
    <Drop x={84} y={30} s={.75} />
    <path d="M8 46q-3 6 0 12M13 42q-4 10 0 20M92 54q3 6 0 12" fill="none" stroke={dark('blue')} strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
  </g>,

  '😠': () => <g>
    <FaceBall tint="red" />
    {[36, 64].map(x => <g key={x}><Eye x={x} y={47} r={6.5} /></g>)}
    <path d="M27 36L45 44V35H27Z" fill={base('yellow')} />
    <path d="M73 36L55 44V35H73Z" fill={base('yellow')} />
    <path d="M25 34L45 44M75 34L55 44" stroke={dark('red')} strokeWidth="4.6" strokeLinecap="round" />
    <rect x={35} y={64} width={30} height={12} rx={5} fill="#fff" stroke={MOUTH_IN} strokeWidth="2.4" />
    <path d="M35 70H65M42.5 64v12M50 64v12M57.5 64v12" stroke={MOUTH_IN} strokeOpacity=".5" strokeWidth="1.4" />
    {[[14, 18], [86, 18]].map(([x, y], i) => <g key={x} opacity=".92">
      <O cx={x} cy={y} r={6} h="white" /><O cx={x + (i ? -5 : 5)} cy={y + 4} r={4.4} h="white" /><O cx={x + (i ? 4 : -4)} cy={y - 5} r={3.6} h="white" />
    </g>)}
  </g>,

  '😮': () => <g>
    <FaceBall />
    <path d="M27 27Q35 20 43 25M73 27Q65 20 57 25" fill="none" stroke={dark('yellow')} strokeWidth="3" strokeLinecap="round" />
    <Eyes x={50} y={42} gap={28} r={8} />
    <ellipse cx={50} cy={69} rx={8.5} ry={11} fill={MOUTH_IN} />
    <ellipse cx={50} cy={74} rx={5} ry={3.6} fill={TONGUE} />
    <Blush x={50} y={58} gap={54} r={6} />
  </g>,

  '😆': () => <g>
    <FaceBall />
    <path d="M27 34L41 41L27 48M73 34L59 41L73 48" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 55Q50 96 76 55Q50 61 24 55Z" fill={MOUTH_IN} />
    <path d="M27 56.5Q50 61 73 56.5L71 61Q50 65 29 61Z" fill="#fff" />
    <path d="M38 76Q50 69 62 76Q50 84 38 76Z" fill={TONGUE} />
    <Drop x={19} y={44} s={.55} /><Drop x={81} y={44} s={.55} />
    <Blush x={50} y={56} gap={58} r={6} />
  </g>,

  '😊': () => <g>
    <FaceBall />
    <path d="M27 46Q36 35 45 46M55 46Q64 35 73 46" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M35 62Q50 76 65 62" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    <Blush x={50} y={57} gap={52} r={9} />
    <Blush x={50} y={57} gap={52} r={7} />
  </g>,

  '😴': () => <g>
    <g transform="translate(46 56) scale(.9) translate(-50 -52)">
      <FaceBall />
      <path d="M27 46Q36 54 45 46M55 46Q64 54 73 46" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 50l-2 3M36 52v3.4M42 50l2 3M58 50l-2 3M64 52v3.4M70 50l2 3" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx={50} cy={69} rx={5} ry={4} fill={MOUTH_IN} />
      <Blush x={50} y={60} gap={52} r={6} />
    </g>
    {[[70, 26, 8], [80, 15, 6], [88, 7, 4.5]].map(([x, y, s]) =>
      <path key={x} d={`M${x - s} ${y - s}H${x + s}L${x - s} ${y + s}H${x + s}`} fill="none" stroke={base('blue')} strokeWidth={s * .55} strokeLinecap="round" strokeLinejoin="round" />)}
  </g>,

  '🤐': () => <g>
    <FaceBall />
    <path d="M26 33Q34 28 42 31M74 33Q66 28 58 31" fill="none" stroke={dark('yellow')} strokeWidth="3" strokeLinecap="round" />
    <Eyes x={50} y={44} gap={26} r={7} />
    <rect x={26} y={62} width={48} height={9} rx={4.5} fill="url(#v-gray)" stroke={dark('gray')} strokeWidth="1.2" />
    <path d="M30 66.5H70" stroke={dark('gray')} strokeWidth="1.4" />
    {[31, 35, 39, 43, 47, 51, 55, 59, 63, 67].map(x => <path key={x} d={`M${x} 62.5v8`} stroke={dark('gray')} strokeWidth="1.3" />)}
    <rect x={70} y={63} width={9} height={14} rx={2.5} fill="url(#v-yellow)" stroke={dark('yellow')} strokeWidth="1.4" />
    <Blush x={50} y={57} gap={54} r={6} />
  </g>,

  /* ---- gestures (a child doing it) ---- */
  '🙋': () => <Kid s={.9} c="green"
    face={<HappyFace />}
    back={<><Limb d="M61 65Q74 56 78 28" w={7.5} /><Hand x={79} y={20} s={.4} rot={8} spread={false} /></>}
    front={<><Limb d="M39 65Q33 73 34 81" /><Fist x={34} y={82} />
      <Sleeve d="M40 65L35 70" c="green" /><Sleeve d="M60 65L66 60" c="green" /></>} />,

  '🙅': () => <Kid c="blue"
    face={<g>
      <path d="M-13-3l8 2M13-3l-8 2" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <Eyes x={0} y={5} gap={15} r={4.2} />
      <path d="M-5 14h10" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </g>}
    front={<>
      <Limb d="M39 65Q29 74 34 80L65 57" w={8} /><Limb d="M61 65Q71 74 66 80L35 57" w={8} />
      <Fist x={66} y={56} r={6} /><Fist x={34} y={56} r={6} />
      <Sleeve d="M40 65L35 71" c="blue" /><Sleeve d="M60 65L65 71" c="blue" />
    </>} />,

  '🤫': () => <Kid c="purple"
    face={<g>
      <Eyes x={0} y={3} gap={15} r={4.4} look={-1.4} />
      <path d="M-14-5q4-3 8-1M14-5q-4-3-8-1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx={0} cy={13.5} rx={3} ry={2.2} fill={MOUTH_IN} />
      <Blush x={0} y={10} gap={29} r={4.5} />
    </g>}
    front={<>
      <Limb d="M39 65Q33 73 34 81" /><Fist x={34} y={82} />
      <Limb d="M61 65Q63 61 57 59" w={7.5} />
      <rect x={47.4} y={37} width={5.8} height={19} rx={2.9} fill="url(#v-skin)" stroke={dark('skin')} strokeOpacity=".5" strokeWidth="1" />
      <ellipse cx={50.3} cy={40} rx={1.7} ry={2.1} fill={light('skin')} />
      <O cx={52.5} cy={57.5} rx={6.6} ry={5.6} h="skin" />
      <Sleeve d="M40 65L35 70" c="purple" /><Sleeve d="M60 65L64 61" c="purple" />
    </>} />,

  '🙈': () => <Kid c="orange"
    face={<g><path d="M-4 13q4 3 8 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" /><Blush x={0} y={11} gap={30} r={4.5} /></g>}
    front={<>
      <Limb d="M39 65Q26 62 34 49" w={7.5} /><Limb d="M61 65Q74 62 66 49" w={7.5} />
      <Hand x={41.5} y={43} s={.43} rot={12} spread={false} />
      <Hand x={58.5} y={43} s={.43} rot={-12} spread={false} flip />
      <Sleeve d="M40 65L35 66" c="orange" /><Sleeve d="M60 65L65 66" c="orange" />
    </>} />,

  '🙏': () => <Kid c="teal"
    face={<GlowFace />}
    front={<>
      <Limb d="M39 65Q29 76 44 78M61 65Q71 76 56 78" w={7.5} />
      <S d="M50 51C45 53 43 63 43 71C43 78 46 80 50 80Z" h="skin" />
      <S d="M50 51C55 53 57 63 57 71C57 78 54 80 50 80Z" h="skin" />
      <Gloss cx={46.5} cy={61} rx={1.6} ry={5} rot={0} o={.8} />
      <Sleeve d="M40 65L36 70" c="teal" /><Sleeve d="M60 65L64 70" c="teal" />
    </>} />,

  '🙇': () => <g transform="translate(-3 0)">
    <Limb d="M37 58L36 85" w={8} /><Limb d="M31 58L29 85" w={9} />
    <O cx={34} cy={88} rx={8.5} ry={4} h="red" /><O cx={40} cy={88} rx={7.5} ry={3.6} h="red" />
    <g transform="rotate(-8 42 52)"><rect x={21} y={41} width={42} height={23} rx={11.5} fill="url(#v-blue)" stroke={dark('blue')} strokeOpacity=".4" strokeWidth="1.2" /></g>
    <path d="M24 50q8-6 20-7" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.4" strokeLinecap="round" />
    <g transform="translate(72 60) rotate(70) scale(1.1)">
      <O cx={0} cy={0} r={19} h="skin" />
      <O cx={18} cy={4} r={3.6} h="skin" />
      <S d={SIDE_HAIR} h="hair" />
      <O cx={-4} cy={4} rx={4} ry={5} h="skin" />
      <path d="M5 3q4 3.5 8 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx={8} cy={10} rx={4} ry={2.6} fill="url(#v-blush)" />
      <path d="M12 13q2.5 1.5 4.5-.5" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <Gloss cx={-6} cy={-14} rx={7} ry={3} rot={-20} o={.5} />
    </g>
    <Limb d="M51 50Q53 64 51 76" w={7.5} /><Fist x={51} y={78} />
    <Sleeve d="M51 49L52 55" c="blue" />
  </g>,

  '🤗': () => <Kid c="pink" girl
    face={<GlowFace />}
    front={<>
      <Limb d="M39 65Q26 67 20 53" w={7.5} /><Limb d="M61 65Q74 67 80 53" w={7.5} />
      <Hand x={17} y={47} s={.4} rot={-35} />
      <Hand x={83} y={47} s={.4} rot={35} flip />
      <Sleeve d="M40 65L34 67" c="pink" /><Sleeve d="M60 65L66 67" c="pink" />
    </>} />,

  '🫂': () => <g>
    <Body x={33} y={60} s={.84} c="blue" />
    <Body x={67} y={60} s={.84} c="pink" />
    <Head x={36} y={39} s={.86} rot={12}><GlowFace /></Head>
    <Head x={64} y={39} s={.86} rot={-12} girl><GlowFace /></Head>
    <Limb d="M40 66Q56 68 71 63" w={6.5} /><O cx={72} cy={63} rx={5} ry={4.4} h="skin" />
    <Limb d="M60 71Q44 75 29 69" w={6.5} /><O cx={28} cy={68.5} rx={5} ry={4.4} h="skin" />
    <Sleeve d="M38 66L44 67" c="blue" w={9} /><Sleeve d="M62 71L56 72" c="pink" w={9} />
  </g>,

  '🤝': () => <g>
    <Body x={26} y={58} s={.82} c="green" />
    <Body x={74} y={58} s={.82} c="orange" />
    <Head x={26} y={38} s={.8} rot={6}><HappyFace /></Head>
    <Head x={74} y={38} s={.8} rot={-6} girl><HappyFace /></Head>
    <Limb d="M35 64Q39 75 46 70" w={7} /><Limb d="M65 64Q61 75 54 70" w={7} />
    <O cx={46.5} cy={69} rx={6.6} ry={5.6} h="skin" /><O cx={53.5} cy={70} rx={6.6} ry={5.6} h="skin" />
    <rect x={47} y={63.5} width={9} height={4.6} rx={2.3} fill="url(#v-skin)" stroke={dark('skin')} strokeOpacity=".5" strokeWidth="1" />
    <path d="M43 57q7-5 14 0M43 81q7 5 14 0" fill="none" stroke={dark('skin')} strokeWidth="2" strokeLinecap="round" />
    <Sleeve d="M33 64L36 68" c="green" w={9} /><Sleeve d="M67 64L64 68" c="orange" w={9} />
  </g>,

  '👋': () => <Kid c="yellow" dx={-6}
    face={<HappyFace />}
    front={<>
      <Limb d="M39 65Q33 73 34 81" /><Fist x={34} y={82} />
      <Limb d="M61 65Q76 67 77 45" w={7.5} />
      <Hand x={78} y={39} s={.4} rot={18} spread />
      <path d="M91 22q5 8 2 17M87 15q-8 0-12 5" fill="none" stroke={dark('yellow')} strokeWidth="2.4" strokeLinecap="round" />
      <Sleeve d="M40 65L35 70" c="yellow" /><Sleeve d="M60 65L66 66" c="yellow" />
    </>} />,

  '👍': () => <g transform="translate(0 2)"><Thumb /></g>,
  '👎': () => <g transform="translate(0 -2)"><Thumb down /></g>,

  '💪': () => <Kid c="red"
    face={<g>
      <path d="M-13-3l8 2.5M13-3l-8 2.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <Eyes x={0} y={5} gap={15} r={4.2} />
      <path d="M-7 11Q0 17 7 11Z" fill={MOUTH_IN} stroke={MOUTH_IN} strokeWidth="1" strokeLinejoin="round" />
      <Blush x={0} y={11} gap={29} r={4.5} />
    </g>}
    front={<>
      <Limb d="M39 65L20 63L16 45" w={8.5} /><Limb d="M61 65L80 63L84 45" w={8.5} />
      <O cx={28} cy={61} rx={7.4} ry={6} h="skin" /><O cx={72} cy={61} rx={7.4} ry={6} h="skin" />
      <Fist x={16} y={42} r={6.4} /><Fist x={84} y={42} r={6.4} />
      <Sleeve d="M40 65L36 65" c="red" w={11} /><Sleeve d="M60 65L64 65" c="red" w={11} />
    </>} />,

  '🤷': () => <Kid c="sky" headRot={-8}
    face={<g>
      <path d="M-13-6q4-4 8-2M13-6q-4-4-8-2" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <Eyes x={0} y={4} gap={15} r={4.4} look={1.6} />
      <path d="M-5 14q2.5-2 5 0t5 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>}
    front={<>
      <Limb d="M40 62Q30 77 24 71L16 65" w={7.5} /><Limb d="M60 62Q70 77 76 71L84 65" w={7.5} />
      <Hand x={14} y={63} s={.34} rot={-75} />
      <Hand x={86} y={63} s={.34} rot={75} flip />
      <Sleeve d="M40 62L37 67" c="sky" /><Sleeve d="M60 62L63 67" c="sky" />
    </>} />,

  /* ---- body parts ---- */
  '✋': () => <g>
    <S d="M40 78h20v14H40Z" h="skin" />
    <g transform="translate(50 60)"><HandShape nails /></g>
    <Gloss cx={38} cy={52} rx={6} ry={3} rot={-30} o={.7} />
  </g>,
  '🖐': () => <g>
    <S d="M40 78h20v14H40Z" h="skin" />
    <g transform="translate(50 60)"><HandShape spread nails /></g>
    <Gloss cx={38} cy={52} rx={6} ry={3} rot={-30} o={.7} />
  </g>,

  '🦶': () => {
    const SOLE = 'M33 42C33 31 47 29 60 31C72 33 80 39 79 49C78 61 70 67 66 77C63 87 58 92 50 92C42 92 38 86 38 76C38 64 33 54 33 42Z'
    return <g>
      <S d={SOLE} h="skin" /><AO d={SOLE} />
      {[[39, 22, 8.6], [54, 18, 6.4], [65, 21, 5.6], [73.5, 27, 4.9], [80, 35, 4.3]].map(([x, y, r]) => <g key={x}>
        <O cx={x} cy={y} rx={r} ry={r * 1.12} h="skin" />
        <ellipse cx={x - r * .1} cy={y - r * .35} rx={r * .5} ry={r * .38} fill={light('skin')} />
      </g>)}
      <Gloss cx={44} cy={44} rx={8} ry={4} rot={-60} o={.8} />
    </g>
  },

  '👃': () => {
    const BRIDGE = 'M43 16C45 30 43 44 37 58H63C57 44 55 30 57 16C53 12 47 12 43 16Z'
    return <g>
      <S d={BRIDGE} h="skin" edge={false} />
      <O cx={32} cy={71} rx={11} ry={10} h="skin" /><O cx={68} cy={71} rx={11} ry={10} h="skin" />
      <O cx={50} cy={66} rx={16.5} ry={16} h="skin" />
      <path d="M36 79q6 4 10 0M54 79q4 4 10 0" fill="none" stroke={MOUTH_IN} strokeOpacity=".6" strokeWidth="3.4" strokeLinecap="round" />
      <Gloss cx={45} cy={59} rx={6} ry={4} rot={-30} />
      <Gloss cx={48} cy={28} rx={2} ry={8} rot={0} o={.6} />
    </g>
  },
  '👄': () => {
    const LIPS = 'M12 48C24 38 36 30 44 34C47 35 49 37 50 37C51 37 53 35 56 34C64 30 76 38 88 48C78 74 62 82 50 82C38 82 22 74 12 48Z'
    const OPEN = 'M22 50C34 51 44 53 50 53C56 53 66 51 78 50C70 64 60 69 50 69C40 69 30 64 22 50Z'
    return <g>
      <S d={LIPS} h="red" /><AO d={LIPS} />
      <path d={OPEN} fill={MOUTH_IN} />
      <path d="M24 51C34 52 44 54 50 54C56 54 66 52 76 51L73 56C64 58 56 59 50 59C44 59 36 58 27 56Z" fill="#fff" />
      <path d="M38 64Q50 58 62 64Q50 70 38 64Z" fill={TONGUE} />
      <Gloss cx={34} cy={40} rx={7} ry={2.6} rot={-20} o={.8} />
      <Gloss cx={44} cy={74} rx={8} ry={2.8} rot={0} o={.7} />
    </g>
  },

  '🦷': () => {
    const TOOTH = 'M30 20C38 12 46 16 50 20C54 16 62 12 70 20C80 30 79 46 75 56C72 66 70 80 66 88C63 93 58 92 57 86C56 78 54 70 50 70C46 70 44 78 43 86C42 92 37 93 34 88C30 80 28 66 25 56C21 46 20 30 30 20Z'
    return <g>
      <S d={TOOTH} h="white" /><AO d={TOOTH} />
      <Eyes x={50} y={42} gap={20} r={5.6} />
      <Mouth x={50} y={52} w={8} />
      <Blush x={50} y={50} gap={34} r={5} />
      <Gloss cx={36} cy={28} rx={8} ry={4} rot={-40} />
      <path d="M84 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="url(#v-yellow)" />
    </g>
  },

  '🚫': () => {
    const RING = 'M50 10a40 40 0 1 1 0 80a40 40 0 1 1 0-80ZM50 21a29 29 0 1 0 0 58a29 29 0 1 0 0-58Z'
    return <g>
      <circle cx={50} cy={50} r={30} fill="url(#v-white)" />
      <g transform="rotate(45 50 50)"><rect x={19} y={43.5} width={62} height={13} fill="url(#v-red)" /></g>
      <path d={RING} fill="url(#v-red)" fillRule="evenodd" stroke={dark('red')} strokeOpacity=".35" strokeWidth="1.2" />
      <path d={RING} fill="url(#v-ao)" fillRule="evenodd" />
      <Gloss cx={28} cy={28} rx={9} ry={4} rot={-45} />
    </g>
  },
}
