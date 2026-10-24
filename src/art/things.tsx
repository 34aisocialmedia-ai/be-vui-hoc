/* Things: school things, clothes, toys, bathroom / cleaning items, gifts. Objects have no faces. */
import { AO, Gloss, L, O, S, base, dark, light, v, type Draw, type Hue } from './kit'

/** Rounded rectangle as a path string. */
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}Z`
/** Ellipse as a path string (for holes with evenodd). */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 -${2 * rx} 0Z`
/** A second colour that always differs from the main one. */
const other = (c: Hue, a: Hue, b: Hue) => (c === a ? b : a)

/* ---------- school things ---------- */
const book = (x: number, y: number, w: number, h: number, c: Hue, key: string) => {
  const d = rr(x, y, w, h, 3.5)
  return <g key={key}>
    <S d={d} h={c} /><AO d={d} />
    <rect x={x + w - 13} y={y + 3} width="11" height={h - 6} rx="1.5" fill="url(#v-cream)" />
    <path d={`M${x + w - 12} ${y + h * .4}h9M${x + w - 12} ${y + h * .62}h9`} stroke={dark('cream')} strokeWidth="1" />
    <path d={`M${x + 8} ${y + 1}v${h - 2}M${x + w - 22} ${y + 1}v${h - 2}`} stroke={light(c)} strokeOpacity=".8" strokeWidth="2.2" />
    <rect x={x + 16} y={y + h / 2 - 3} width={w - 44} height="6" rx="3" fill="#fff" opacity=".75" />
  </g>
}

const BRUSH_HANDLE = 'M8 67c0-5 4-9 9-9 15 0 28 1 40 1h33c3 0 5 2 5 5v3c0 3-2 5-5 5H57c-12 0-25 3-40 3-5 0-9-3-9-8Z'
const PASTE = 'M60 44c-3-7 3-12 9-10 2-6 11-7 14-2 6-2 12 1 12 6 3 3 1 7-2 8H62Z'

const CRAYON = 'M9 44c0-3 2-6 5-6h59l16 7c3 1.5 3 8.5 0 10l-16 7H14c-3 0-5-3-5-6Z'
const PENCIL_BODY = 'M24 41h48v18H24Z'

const SCIS_RING = (cx: number) => `${ell(cx, 78, 14, 12)}${ell(cx, 78, 8, 6.5)}`

const PALETTE = `M50 13C77 13 94 30 92 52c-2 16-15 24-28 22-9-2-12 5-8 11 3 5-1 9-12 9C24 94 7 77 7 54 7 30 25 13 50 13Z${ell(30, 70, 6, 5)}`

const ENVELOPE = rr(10, 32, 80, 54, 5)

/* ---------- clothes ---------- */
const SHOE_UP = 'M12 76V48c0-7 4-11 10-11h15c3 7 9 11 16 11l8-2c14 4 26 13 30 28v4Z'
const SHOE_SOLE = 'M8 74h85c2 0 3 2 3 4v3c0 5-3 8-8 8H15c-4 0-7-3-7-7Z'
const CAP_CROWN = 'M22 66c0-26 13-42 33-42s32 16 32 40c0 3-2 4-5 4H26c-3 0-4-1-4-2Z'
const CAP_BRIM = 'M28 58C16 58 5 64 4 74c12 4 30 2 44-4Z'
const SHIRT = 'M36 13q14 10 28 0l22 9 9 22-15 6v38c0 2-2 4-4 4H24c-2 0-4-2-4-4V50L5 44l9-22Z'
const PANTS = 'M24 9h52l6 80c0 2-1 4-3 4H59c-2 0-3-1-3-3L50 40l-6 50c0 2-1 3-3 3H21c-2 0-3-2-3-4Z'
const SOCK = 'M24 14c0-2 2-4 4-4h18c2 0 4 2 4 4v40l20 14c6 4 8 12 4 18-4 6-12 7-18 3L30 72c-4-3-6-7-6-12Z'
const COAT = 'M34 17l-15 7c-6 3-9 8-10 14L5 82c0 3 2 5 5 5h9l3-34v36c0 2 2 4 4 4h48c2 0 4-2 4-4V53l3 34h9c3 0 5-2 5-5l-4-44c-1-6-4-11-10-14l-15-7Z'
const AODAI = 'M42 12h16l14 5c5 2 7 5 8 9l12 34-9 4-10-28v6c0 7-2 11-3 15l-1 35H31l-1-35c-1-4-3-8-3-15v-6L17 64l-9-4 12-34c1-4 3-7 8-9Z'
const SHORTS = 'M20 22h60l9 53c0 2-1 4-3 4H58l-8-28-8 28H14c-2 0-3-2-3-4Z'
const HELMET = 'M14 64c0-27 17-45 39-45s35 18 35 41c0 4-2 6-6 6H20c-4 0-6-1-6-2Z'
const UMBRELLA = 'M7 56C7 32 26 13 50 13s43 19 43 43c-4-5-15-5-21.5 0-6-5-15-5-21.5 0-6-5-15-5-21.5 0-7-5-18-5-21.5 0Z'

/* ---------- toys & gifts ---------- */
const TOP_BODY = 'M12 44c0-13 17-21 38-21s38 8 38 21c0 11-17 24-31 37l-7 8-7-8C29 68 12 55 12 44Z'
const PAD = 'M28 30h44c12 0 18 10 20 24 2 14 0 26-8 26-6 0-10-6-14-12H30c-4 6-8 12-14 12-8 0-10-12-8-26 2-14 8-24 20-24Z'
const BOX = 'M17 47h66v38c0 3-2 5-5 5H22c-3 0-5-2-5-5Z'
const LID = rr(12, 35, 76, 14, 3)

/* ---------- bathroom & recycling ---------- */
const BAG = `M23 10h54c3 0 5 2 5 5l2 14c6 14 8 34 6 54-1 5-5 8-10 8H20c-5 0-9-3-10-8-2-20 0-40 6-54l2-14c0-3 2-5 5-5Z${rr(35, 16, 30, 12, 6)}`
const BOTTLE = 'M40 24h20v5c0 3 12 6 12 16v40c0 4-3 6-7 6H35c-4 0-7-2-7-6V45c0-10 12-13 12-16Z'
const CAN = 'M30 25c0-4 5-7 20-7s20 3 20 7l2 5v53c0 5-9 8-22 8s-22-3-22-8V30Z'
const SOAP = 'M12 62c0-8 6-14 14-14h40c8 0 14 6 14 14v12c0 8-6 13-14 13H26c-8 0-14-5-14-13Z'

export const THINGS: Record<string, Draw> = {
  /* Stack of four books, pages showing at the ends. */
  '📚': () => <g>
    {book(10, 71, 78, 18, 'red', 'a')}
    {book(16, 54, 70, 17, 'blue', 'b')}
    {book(12, 37, 72, 17, 'green', 'c')}
    <g transform="rotate(-5 50 28)">{book(20, 20, 62, 17, 'yellow', 'd')}</g>
    <Gloss cx={30} cy={24} rx={8} ry={2.4} rot={-5} o={.8} />
  </g>,

  /* Toothbrush with a swirl of toothpaste. */
  '🪥': ({ c = 'blue' }) => <g transform="rotate(-22 50 58)">
    <S d={BRUSH_HANDLE} h={c} /><AO d={BRUSH_HANDLE} />
    <rect x="18" y="63" width="26" height="7" rx="3.5" fill={light(c)} opacity=".8" />
    <rect x="62" y="43" width="30" height="17" rx="2.5" fill="url(#v-white)" stroke={dark('white')} strokeWidth="1" />
    <path d="M67 45v14M72.5 45v14M78 45v14M83.5 45v14M89 45v14" stroke={dark('white')} strokeWidth="1.4" />
    <S d={PASTE} h="white" />
    <path d="M64 40c5-3 9-1 13-4 5 1 10-1 15 0" fill="none" stroke={base('teal')} strokeWidth="3" strokeLinecap="round" />
    <Gloss cx={28} cy={62} rx={10} ry={2.2} rot={-2} o={.85} />
  </g>,

  /* School backpack, front view. */
  '🎒': ({ c = 'red' }) => {
    const BODY = 'M20 86V46c0-17 13-28 30-28s30 11 30 28v40c0 3-2 5-5 5H25c-3 0-5-2-5-5Z'
    const POCKET = rr(29, 58, 42, 28, 7)
    return <g>
      <path d="M40 20c0-11 20-11 20 0" fill="none" stroke={dark(c)} strokeWidth="5" strokeLinecap="round" />
      <path d="M17 50v30M83 50v30" stroke={dark(c)} strokeWidth="6" strokeLinecap="round" />
      <S d={BODY} h={c} /><AO d={BODY} />
      <path d="M27 44c4-13 42-13 46 0" fill="none" stroke={dark(c)} strokeOpacity=".7" strokeWidth="2" />
      <circle cx="70" cy="42" r="2.6" fill="url(#v-yellow)" />
      <S d={POCKET} h={c} /><AO d={POCKET} />
      <path d="M31 66h38" stroke={dark(c)} strokeOpacity=".7" strokeWidth="2" />
      <rect x="47" y="64" width="6" height="9" rx="2" fill="url(#v-yellow)" />
      <path d="M38 75h24" stroke={light(c)} strokeOpacity=".9" strokeWidth="3" strokeLinecap="round" />
      <Gloss cx={34} cy={30} rx={9} ry={4.5} rot={-35} />
    </g>
  },

  /* Woven basket with a handle. */
  // A coloured basket when the label names a colour ("Rổ đỏ"), otherwise a wicker basket.
  '🧺': ({ c }) => {
    const BODY = 'M14 50h72l-7 34c-1 4-4 6-8 6H29c-4 0-7-2-8-6Z'
    return <g>
      <path d="M22 50C22 8 78 8 78 50" fill="none" stroke="url(#v-brown)" strokeWidth="7" strokeLinecap="round" />
      <path d="M25 48C26 16 74 16 75 48" fill="none" stroke={light('brown')} strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      <S d={BODY} h={c ?? 'wood'} /><AO d={BODY} />
      {[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5, 6].map(i => {
        const x = 20 + i * 10 + (r % 2) * 5; const y = 59 + r * 8
        return x < 84 - r * 2 && x > 16 + r * 2 ? <rect key={`${r}${i}`} x={x - 4} y={y - 2.4} width="8" height="4.8" rx="2.4" fill={light(c ?? 'wood')} opacity=".8" /> : null
      }))}
      <S d={rr(10, 43, 80, 11, 5.5)} h={c ?? 'brown'} />
      <Gloss cx={30} cy={46} rx={10} ry={2.2} rot={0} o={.7} />
    </g>
  },

  /* Wax crayon with a paper wrapper. */
  '🖍': ({ c = 'red' }) => <g transform="rotate(-35 50 50)">
    <S d={CRAYON} h={c} />
    <rect x="19" y="36.5" width="52" height="27" rx="2" fill={v(c)} stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.2" />
    <path d="M24 36.5v27M30 36.5v27M60 36.5v27M66 36.5v27" stroke={dark(c)} strokeWidth="2.6" />
    <ellipse cx="45" cy="50" rx="10" ry="7.5" fill="#fff" opacity=".85" />
    <path d="M39.5 50q2.75-3.5 5.5 0t5.5 0" fill="none" stroke={base(c)} strokeWidth="2" strokeLinecap="round" />
    <AO d={CRAYON} />
    <Gloss cx={79} cy={44} rx={5} ry={1.8} rot={10} o={.9} />
    <Gloss cx={38} cy={40} rx={14} ry={2} rot={0} o={.8} />
  </g>,

  /* Yellow pencil: pink eraser, wood tip, dark lead. */
  '✏': () => <g transform="translate(50 50) scale(1.1) rotate(-35) translate(-50 -50)">
    <path d="M72 41l17 6c3 1 3 5 0 6l-17 6Z" fill="url(#v-wood)" />
    <path d="M85 45.6l7 2.6c2 .8 2 2.8 0 3.6l-7 2.6Z" fill="url(#v-dark)" />
    <S d={PENCIL_BODY} h="yellow" />
    <rect x="24" y="47" width="48" height="6" fill={light('yellow')} opacity=".6" />
    <path d="M24 53h48v6H24Z" fill={dark('yellow')} opacity=".45" />
    <path d="M72 41v18" stroke={dark('yellow')} strokeWidth="1" />
    <S d={rr(15, 40, 11, 20, 1.5)} h="gray" />
    <path d="M18.5 40v20M22.5 40v20" stroke={dark('gray')} strokeWidth="1.2" />
    <S d="M17 40H11c-3 0-5 3-5 6v8c0 3 2 6 5 6h6Z" h="pink" />
    <Gloss cx={44} cy={43.5} rx={14} ry={1.6} rot={0} o={.9} />
  </g>,

  /* Ruler with tick marks and numbers. */
  '📏': () => {
    const R = rr(4, 38, 92, 24, 3)
    return <g transform="rotate(-28 50 50)">
      <S d={R} h="yellow" /><AO d={R} />
      {Array.from({ length: 21 }, (_, i) => {
        const x = 10 + i * 4; const long = i % 5 === 0
        return <path key={i} d={`M${x} 38v${long ? 9 : 5}`} stroke={dark('brown')} strokeWidth={long ? 1.6 : 1.1} />
      })}
      {[0, 1, 2, 3, 4].map(n => <text key={n} x={10 + n * 20} y="56" fontSize="7" fontWeight="700" fontFamily="sans-serif" textAnchor="middle" fill={dark('brown')}>{n}</text>)}
      <Gloss cx={30} cy={41} rx={18} ry={1.6} rot={0} o={.8} />
    </g>
  },

  /* Open scissors, blades up, coloured handles. */
  '✂': ({ c = 'red' }) => <g>
    <S d="M45 58 72 8c2-2 5-1 5 2L57 60Z" h="gray" />
    <S d="M55 58 28 8c-2-2-5-1-5 2l20 50Z" h="gray" />
    <path d="M48 52 73 10M52 52 27 10" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M38 70 50 56 62 70" fill="none" stroke={v(c)} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <S d={SCIS_RING(32)} h={c} fillRule="evenodd" />
    <S d={SCIS_RING(68)} h={c} fillRule="evenodd" />
    <circle cx="50" cy="56" r="4.5" fill="url(#v-gray)" /><circle cx="50" cy="56" r="1.6" fill={dark('gray')} />
    <Gloss cx={26} cy={73} rx={4} ry={2} rot={-40} o={.8} />
    <Gloss cx={62} cy={73} rx={4} ry={2} rot={-40} o={.8} />
  </g>,

  /* Painter's palette with paint blobs and a brush. */
  '🎨': () => <g>
    <S d={PALETTE} h="wood" fillRule="evenodd" /><path d={PALETTE} fill="url(#v-ao)" fillRule="evenodd" />
    {([[32, 34, 'red'], [52, 26, 'yellow'], [72, 34, 'blue'], [79, 53, 'green'], [52, 48, 'purple'], [30, 52, 'white']] as [number, number, Hue][]).map(([x, y, h]) =>
      <g key={h}><O cx={x} cy={y} rx={8} ry={7} h={h} /><Gloss cx={x - 3} cy={y - 3} rx={3} ry={1.8} /></g>)}
    <g transform="rotate(-38 70 78)">
      <rect x="50" y="75" width="34" height="6" rx="3" fill="url(#v-wood)" stroke={dark('wood')} strokeOpacity=".5" />
      <rect x="44" y="74" width="8" height="8" rx="1" fill="url(#v-gray)" />
      <path d="M44 74c-6 0-10 2-12 4 2 2 6 4 12 4Z" fill="url(#v-red)" />
    </g>
    <Gloss cx={30} cy={22} rx={10} ry={4} rot={-30} o={.8} />
  </g>,

  /* Framed picture hanging on a nail. */
  '🖼': () => {
    const FRAME = `${rr(10, 26, 80, 64, 4)}${rr(19, 35, 62, 46, 1)}`
    return <g>
      <path d="M22 30 50 9 78 30" fill="none" stroke={dark('brown')} strokeWidth="1.8" />
      <circle cx="50" cy="9" r="3" fill="url(#v-gray)" />
      <rect x="19" y="35" width="62" height="46" fill="url(#v-sky)" />
      <circle cx="68" cy="47" r="7" fill="url(#v-yellow)" />
      <path d="M19 81V70c10-12 18-14 26-6 8-10 22-14 36 0v17Z" fill="url(#v-green)" />
      <path d="M45 64c8-10 22-14 36 0v17H48Z" fill={dark('green')} opacity=".35" />
      <path d="M28 70c3-3 6-4 9-3" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
      <S d={FRAME} h="orange" fillRule="evenodd" />
      <path d={FRAME} fill="url(#v-ao)" fillRule="evenodd" />
      <Gloss cx={24} cy={30} rx={10} ry={2.2} rot={-8} o={.9} />
    </g>
  },

  /* Love letter: envelope with a heart seal. */
  '💌': () => <g transform="rotate(-8 50 60)">
    <S d={ENVELOPE} h="white" /><AO d={ENVELOPE} />
    <path d="M12 84 42 60M88 84 58 60" stroke={dark('white')} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11 35 50 64 89 35" fill={light('pink')} stroke={dark('white')} strokeWidth="1.6" strokeLinejoin="round" />
    <S d="M50 72c-9-6-13-11-13-15 0-4 3-7 6.5-7 3 0 5.5 2 6.5 4 1-2 3.5-4 6.5-4 3.5 0 6.5 3 6.5 7 0 4-4 9-13 15Z" h="red" />
    <Gloss cx={44.5} cy={55} rx={3} ry={1.8} />
    <S d="M70 26c-5-3-7-6-7-8 0-2 1.5-3.5 3.5-3.5 1.5 0 3 1 3.5 2 .5-1 2-2 3.5-2 2 0 3.5 1.5 3.5 3.5 0 2-2 5-7 8Z" h="pink" />
    <S d="M28 22c-3.5-2-5-4-5-6 0-1.5 1-2.5 2.5-2.5 1 0 2 .7 2.5 1.5.5-.8 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.5 0 2-1.5 4-5 6Z" h="red" />
    <Gloss cx={24} cy={40} rx={8} ry={2.5} rot={-10} o={.8} />
  </g>,

  /* Post box with a letter going into the slot. */
  '📮': ({ c = 'red' }) => {
    const BODY = 'M24 40c0-15 11-26 26-26s26 11 26 26v46H24Z'
    return <g>
      <S d={BODY} h={c} /><AO d={BODY} />
      <rect x="22" y="36" width="56" height="7" rx="3" fill={dark(c)} opacity=".75" />
      <rect x="32" y="28" width="26" height="20" rx="2" fill="url(#v-white)" stroke={dark('white')} strokeWidth="1" transform="rotate(-8 45 38)" />
      <path d="M33 30l12 8 12-9" fill="none" stroke={dark('white')} strokeWidth="1.4" transform="rotate(-8 45 38)" />
      <rect x="32" y="46" width="36" height="7" rx="3.5" fill="#2f2838" />
      <rect x="33" y="52" width="34" height="2.5" rx="1.2" fill={light(c)} opacity=".6" />
      <S d={rr(36, 60, 28, 18, 3)} h={c} />
      <path d="M41 66h18M41 71h12" stroke={light(c)} strokeWidth="2" strokeLinecap="round" />
      <S d={rr(19, 84, 62, 8, 3)} h="dark" />
      <Gloss cx={35} cy={24} rx={8} ry={4} rot={-40} />
    </g>
  },

  /* Ticket with notches and a star. */
  '🎫': ({ c = 'orange' }) => {
    const T = 'M15 30h70c3 0 5 2 5 5v9a6 6 0 0 0 0 12v9c0 3-2 5-5 5H15c-3 0-5-2-5-5v-9a6 6 0 0 0 0-12v-9c0-3 2-5 5-5Z'
    return <g transform="rotate(-14 50 50)">
      <S d={T} h={c} /><AO d={T} />
      <rect x="16" y="36" width="49" height="28" rx="3" fill="none" stroke={light(c)} strokeWidth="1.6" strokeDasharray="0" />
      <path d="M68 33v34" stroke={light(c)} strokeWidth="2.4" strokeDasharray="3 3" />
      <S d="M40 38l3.5 7 7.5 1-5.5 5.2 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6L29 46l7.5-1Z" h="yellow" />
      <path d="M74 42v16M80 42v16" stroke={dark(c)} strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <Gloss cx={24} cy={36} rx={8} ry={2.5} rot={-5} o={.9} />
    </g>
  },

  /* Old folded newspaper. */
  '📰': () => {
    const P = 'M14 16h66l6 6v66H20l-6-6Z'
    return <g transform="rotate(-6 50 52)">
      <S d={P} h="cream" /><AO d={P} />
      <path d="M50 16v72" stroke={dark('cream')} strokeWidth="1.4" />
      <path d="M50 16h30l6 6v66H50Z" fill={dark('cream')} opacity=".25" />
      <rect x="20" y="22" width="60" height="9" rx="1.5" fill="url(#v-dark)" />
      <rect x="20" y="36" width="25" height="18" rx="1.5" fill="url(#v-sky)" />
      <path d="M20 54l8-8 6 5 5-4 6 7Z" fill={base('leaf')} opacity=".8" />
      {[60, 66, 72, 78].map(y => <path key={y} d={`M21 ${y}h23`} stroke={dark('gray')} strokeWidth="2.2" strokeLinecap="round" />)}
      {[38, 44, 50, 56, 62, 68, 74, 80].map(y => <path key={y} d={`M55 ${y}h${y % 12 === 2 ? 18 : 24}`} stroke={dark('gray')} strokeWidth="2.2" strokeLinecap="round" />)}
      <Gloss cx={26} cy={19} rx={8} ry={1.6} rot={0} o={.7} />
    </g>
  },

  /* Plastic carrier bag with cut-out handles. */
  '🛍': ({ c = 'pink' }) => <g>
    <S d={BAG} h={c} fillRule="evenodd" opacity=".85" />
    <path d={BAG} fill="url(#v-ao)" fillRule="evenodd" />
    <path d="M19 33h62" stroke={dark(c)} strokeOpacity=".45" strokeWidth="1.6" />
    <path d="M30 40c-2 6-6 10-10 12M72 40c2 8 6 12 10 14M28 89c5-6 6-16 2-24M73 89c-4-8-3-16 2-22M42 58c5 7 11 9 17 7M50 90c0-5 2-9 6-12M40 75c3 3 7 4 10 3" fill="none" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 46c-3 12-3 26-1 38" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".9" />
    <path d="M25 14v14M64 40l-4 20" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75" />
    <Gloss cx={30} cy={50} rx={7} ry={3} rot={-60} o={.8} />
  </g>,

  /* Plastic water bottle. */
  '🧴': () => <g>
    <path d={BOTTLE} fill="url(#v-sky)" stroke={dark('sky')} strokeWidth="1.2" />
    <path d={BOTTLE} fill="url(#v-ao)" />
    <path d="M29 58h42M29 78h42" stroke={dark('sky')} strokeWidth="1.6" />
    <rect x="28" y="61" width="44" height="14" fill="url(#v-blue)" />
    <path d="M30 70c6-4 10 2 16-1s10-4 16 0 8 1 10-1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <S d={rr(38, 8, 24, 13, 3)} h="blue" />
    <path d="M42 10v9M46 10v9M50 10v9M54 10v9M58 10v9" stroke={dark('blue')} strokeOpacity=".6" strokeWidth="1.2" />
    <rect x="38" y="20" width="24" height="4" rx="1.5" fill={dark('blue')} />
    <path d="M35 40c-2 4-2 14-1 20" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".9" />
    <Gloss cx={40} cy={12} rx={4} ry={1.6} rot={0} o={.9} />
  </g>,

  /* Drink can with a pull tab. */
  '🥫': ({ c = 'red' }) => <g>
    <S d={CAN} h={c} /><AO d={CAN} />
    <path d="M28 52c10 6 18-6 28 0s14 2 16 0v12c-4 3-10 4-16 0s-18 6-28 0Z" fill="#fff" opacity=".9" />
    <path d="M28 83c0 5 9 8 22 8s22-3 22-8v-3c0 5-9 8-22 8s-22-3-22-8Z" fill="url(#v-gray)" />
    <ellipse cx="50" cy="25" rx="20" ry="6" fill="url(#v-gray)" stroke={dark('gray')} strokeWidth="1" />
    <ellipse cx="50" cy="25.5" rx="15" ry="4" fill={base('gray')} />
    <path d="M45 24.5h8c2 0 3 1 3 2s-1 2-3 2h-8" fill="none" stroke={light('gray')} strokeWidth="2" strokeLinecap="round" />
    <path d="M36 32c-2 14-2 34 0 48" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    <Gloss cx={38} cy={36} rx={7} ry={2.5} rot={-70} />
  </g>,

  /* Roll of paper towel with a sheet hanging down. */
  '🧻': () => {
    const ROLL = 'M22 32h56v46c0 6-12 10-28 10s-28-4-28-10Z'
    const SHEET = 'M44 40h30v50l-3-2-3 2-3-2-3 2-3-2-3 2-3-2-3 2-3-2-3 2Z'
    return <g>
      <S d={ROLL} h="white" /><AO d={ROLL} />
      <S d={SHEET} h="white" />
      <path d="M45 62h28" stroke={dark('white')} strokeWidth="1.4" strokeDasharray="2 2.5" />
      <path d="M44 40h30v8H44Z" fill={dark('white')} opacity=".25" />
      <ellipse cx="50" cy="32" rx="28" ry="10" fill="url(#v-white)" stroke={dark('white')} strokeWidth="1.2" />
      <ellipse cx="50" cy="32" rx="10" ry="3.8" fill="url(#v-wood)" />
      <ellipse cx="50" cy="32.6" rx="7" ry="2.4" fill={dark('brown')} />
      <ellipse cx="50" cy="32" rx="20" ry="6.5" fill="none" stroke={dark('white')} strokeOpacity=".6" strokeWidth="1" />
      <Gloss cx={30} cy={50} rx={10} ry={3} rot={-80} o={.9} />
    </g>
  },

  /* Bar of soap with bubbles. */
  '🧼': () => <g>
    <S d={SOAP} h="pink" /><AO d={SOAP} />
    <path d="M18 60c0-6 4-9 10-9h36c6 0 10 3 10 9v1c0 4-4 7-10 7H28c-6 0-10-3-10-7Z" fill={light('pink')} opacity=".9" />
    <ellipse cx="46" cy="59" rx="16" ry="4.5" fill="none" stroke={dark('pink')} strokeOpacity=".45" strokeWidth="2" />
    {([[66, 34, 10], [84, 50, 6.5], [44, 32, 6], [82, 22, 7], [58, 15, 4.5]] as number[][]).map(([x, y, r]) =>
      <g key={x}><circle cx={x} cy={y} r={r} fill="url(#v-sky)" opacity=".75" stroke={dark('sky')} strokeOpacity=".6" strokeWidth="1" />
        <Gloss cx={x - r * .35} cy={y - r * .35} rx={r * .4} ry={r * .25} /></g>)}
    <Gloss cx={28} cy={54} rx={7} ry={2.4} rot={-10} o={.8} />
  </g>,

  /* Straw broom. */
  '🧹': () => {
    const BRISTLE = 'M38 58h24c6 10 14 22 18 32-4 2-8 1-10 0-2 2-6 2-8 0-2 2-7 2-9 0-3 2-7 2-9 0-2 1-6 2-10 0-4 1-8 1-10-1 4-10 12-21 18-31Z'
    return <g transform="rotate(22 50 50)">
      <S d={rr(46.5, 4, 7, 56, 3.5)} h="wood" />
      <S d={BRISTLE} h="yellow" /><AO d={BRISTLE} />
      <path d="M44 62 30 88M50 62v26M56 62l14 26M47 62l-9 26M53 62l9 26" stroke={dark('yellow')} strokeOpacity=".6" strokeWidth="1.3" />
      <S d={rr(37, 54, 26, 9, 3)} h="red" />
      <Gloss cx={48.5} cy={18} rx={1.4} ry={8} rot={0} o={.9} />
    </g>
  },

  /* Sneaker, side view. */
  '👟': ({ c = 'blue' }) => <g>
    <S d={SHOE_UP} h={c} /><AO d={SHOE_UP} />
    <path d="M68 52c10 4 18 10 22 22H66c-4-8-2-16 2-22Z" fill={light(c)} opacity=".55" />
    <path d="M14 46c6 0 12 4 16 12" fill="none" stroke={dark(c)} strokeOpacity=".5" strokeWidth="2" />
    <path d="M40 46c6 3 14 4 20 2" fill="none" stroke={dark(c)} strokeWidth="4" strokeLinecap="round" opacity=".6" />
    {[44, 51, 58].map(x => <path key={x} d={`M${x} 47l6 7`} stroke="#fff" strokeWidth="3" strokeLinecap="round" />)}
    <path d="M22 66c12-2 26-6 36-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".9" />
    <S d={SHOE_SOLE} h="white" />
    <path d="M10 82h82" stroke={dark('white')} strokeWidth="1.6" />
    <Gloss cx={24} cy={44} rx={6} ry={3} rot={-40} />
  </g>,

  /* Baseball cap. */
  '🧢': ({ c = 'red' }) => <g>
    <S d={CAP_CROWN} h={c} /><AO d={CAP_CROWN} />
    <path d="M55 24c-12 6-18 22-18 42M55 24c8 8 12 24 12 42" fill="none" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.6" />
    <rect x="22" y="60" width="65" height="7" rx="3" fill={dark(c)} opacity=".45" />
    <S d={CAP_BRIM} h={c} />
    <path d="M28 64C18 65 11 69 8 73" fill="none" stroke={light(c)} strokeOpacity=".8" strokeWidth="1.6" strokeLinecap="round" />
    <O cx={55} cy={24} rx={4.5} ry={2.6} h={c} />
    <Gloss cx={40} cy={36} rx={9} ry={4.5} rot={-40} />
  </g>,

  /* T-shirt. */
  '👕': ({ c = 'blue' }) => <g>
    <S d={SHIRT} h={c} /><AO d={SHIRT} />
    <path d="M36 13q14 14 28 0" fill="none" stroke={dark(c)} strokeWidth="4" strokeLinecap="round" />
    <path d="M14 22 5 44M86 22l9 22" stroke={light(c)} strokeOpacity=".6" strokeWidth="2" />
    <path d="M20 50 24 30M80 50l-4-20" stroke={dark(c)} strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8 40l14 6M92 40l-14 6M21 86h58" stroke={dark(c)} strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="56" r="9" fill="#fff" opacity=".85" />
    <path d="M50 51l1.6 3.4 3.7.4-2.8 2.5.8 3.7-3.3-1.9-3.3 1.9.8-3.7-2.8-2.5 3.7-.4Z" fill="url(#v-yellow)" />
    <Gloss cx={32} cy={30} rx={9} ry={4} rot={-40} />
  </g>,

  /* Long trousers. */
  '👖': ({ c = 'blue' }) => <g>
    <S d={PANTS} h={c} /><AO d={PANTS} />
    <path d="M24 18h52" stroke={dark(c)} strokeWidth="2" />
    {[30, 50, 70].map(x => <rect key={x} x={x - 2} y="9" width="4" height="10" rx="1" fill={dark(c)} opacity=".6" />)}
    <circle cx="54" cy="14" r="2.4" fill="url(#v-yellow)" />
    <path d="M50 19v20M30 19c0 7 4 11 10 11M70 19c0 7-4 11-10 11" fill="none" stroke={light('yellow')} strokeWidth="1.4" strokeDasharray="2.5 2" />
    <path d="M19 84h24M57 84h24" stroke={dark(c)} strokeOpacity=".6" strokeWidth="2" />
    <path d="M28 30c0 20-2 40-4 52" fill="none" stroke={light(c)} strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" />
    <Gloss cx={32} cy={26} rx={6} ry={3} rot={-60} />
  </g>,

  /* A pair of socks. */
  '🧦': ({ c = 'red' }) => {
    const sock = (dx: number, dy: number, k: string, back: boolean) => <g key={k} transform={`translate(${dx} ${dy})`}>
      <S d={SOCK} h={c} /><AO d={SOCK} />
      {back && <path d={SOCK} fill={dark(c)} opacity=".25" />}
      <S d={rr(23, 9, 28, 13, 4)} h="white" />
      <path d="M29 11v9M35 11v9M41 11v9M47 11v9" stroke={dark('white')} strokeWidth="1.2" />
      <path d="M24 34h26M24 42h26" stroke="#fff" strokeWidth="3.5" opacity=".9" />
      <path d="M58 76c4-6 12-6 16 0 2 4 1 8-2 10-4 3-9 3-13 0Z" fill="#fff" opacity=".85" />
      <path d="M50 54c-6 0-10 4-10 9" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="4" strokeLinecap="round" />
    </g>
    return <g transform="translate(-4 -1)">
      {sock(18, -2, 'b', true)}
      {sock(0, 4, 'a', false)}
      <Gloss cx={30} cy={30} rx={2} ry={6} rot={0} o={.7} />
    </g>
  },

  /* Hooded jacket with a zip. */
  '🧥': ({ c = 'orange' }) => <g>
    <S d={COAT} h={c} /><AO d={COAT} />
    <path d="M34 17c-4-12 36-12 32 0-6 8-26 8-32 0Z" fill={dark(c)} />
    <path d="M37 16c4-7 22-7 26 0" fill="none" stroke={light(c)} strokeOpacity=".7" strokeWidth="2" />
    <path d="M22 53V36M78 53V36" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.6" />
    <path d="M50 24v66" stroke={dark('gray')} strokeWidth="2.6" />
    <path d="M50 24v66" stroke={light('gray')} strokeWidth="1" strokeDasharray="1.5 1.5" />
    <rect x="47.5" y="30" width="5" height="9" rx="2" fill="url(#v-gray)" />
    <path d="M30 66l8-4M70 66l-8-4" stroke={dark(c)} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M26 84h48M6 80h12M82 80h12" stroke={dark(c)} strokeOpacity=".6" strokeWidth="2.4" />
    <Gloss cx={28} cy={32} rx={8} ry={4} rot={-45} />
  </g>,

  /* Áo dài: high collar, long sleeves, side slits over white trousers. */
  '👗': ({ c = 'pink' }) => <g>
    <path d="M27 55h46l7 37H58l-8-30-8 30H20Z" fill="url(#v-white)" stroke={dark('white')} strokeWidth="1.2" />
    <S d={AODAI} h={c} /><AO d={AODAI} />
    <S d={rr(42, 5, 16, 10, 3)} h={c} />
    <path d="M52 15c4 5 12 8 21 8" fill="none" stroke={dark(c)} strokeOpacity=".7" strokeWidth="1.8" />
    <path d="M31 55c6 3 32 3 38 0" fill="none" stroke={dark(c)} strokeOpacity=".4" strokeWidth="1.6" />
    {([[42, 68], [57, 76], [45, 85], [60, 34], [38, 40]] as number[][]).map(([x, y]) => <g key={`${x}${y}`}>
      {[0, 72, 144, 216, 288].map(a => <circle key={a} cx={x} cy={y - 2.2} r="1.7" fill="#fff" opacity=".9" transform={`rotate(${a} ${x} ${y})`} />)}
      <circle cx={x} cy={y} r="1.3" fill="url(#v-yellow)" /></g>)}
    <Gloss cx={38} cy={28} rx={6} ry={3} rot={-50} />
  </g>,

  /* Shorts. */
  '🩳': ({ c = 'orange' }) => <g>
    <S d={SHORTS} h={c} /><AO d={SHORTS} />
    <S d={rr(18, 18, 64, 11, 4)} h={c} />
    <path d="M22 23.5h56" stroke={dark(c)} strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M47 27c-2 6-4 10-6 12M53 27c2 6 4 10 6 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M50 29v14" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.6" />
    <path d="M17 32l-4 40M83 32l4 40" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".85" />
    <path d="M13 72h29M58 72h29" stroke={dark(c)} strokeOpacity=".55" strokeWidth="2" />
    <Gloss cx={30} cy={38} rx={6} ry={3} rot={-60} />
  </g>,

  /* A pair of gloves. */
  '🧤': ({ c = 'red' }) => {
    const glove = (k: string, flip: boolean) => <g key={k} transform={flip ? 'translate(100 0) scale(-1 1)' : undefined}>
      <g transform="rotate(-10 30 60)">
        {[0, 1, 2, 3].map(i => <S key={i} d={rr(15 + i * 8, 22 + [6, 0, 2, 8][i], 8, 34, 4)} h={c} />)}
        <S d={rr(-2, 0, 9, 24, 4.5)} h={c} transform="translate(9 50) rotate(-40)" />
        <S d={rr(14, 44, 34, 30, 9)} h={c} />
        <path d={rr(14, 44, 34, 30, 9)} fill="url(#v-ao)" />
        <S d={rr(16, 70, 30, 14, 3)} h="white" />
        <path d="M22 72v10M28 72v10M34 72v10M40 72v10" stroke={dark('white')} strokeWidth="1.2" />
        <Gloss cx={22} cy={50} rx={4} ry={2} rot={-40} />
      </g>
    </g>
    return <g transform="translate(0 2)">{glove('l', false)}{glove('r', true)}</g>
  },

  /* Motorbike helmet with a visor and chin strap. */
  '⛑': ({ c = 'red' }) => <g>
    <path d="M30 64c2 14 8 22 18 22s16-8 18-22" fill="none" stroke="#2f2838" strokeWidth="3" />
    <rect x="44" y="83" width="8" height="5" rx="1.5" fill="url(#v-gray)" />
    <S d={HELMET} h={c} /><AO d={HELMET} />
    <path d="M34 22c8 6 12 22 12 44" fill="none" stroke="#fff" strokeWidth="6" opacity=".9" />
    <path d="M42 20c8 6 12 22 12 46" fill="none" stroke={light(c)} strokeWidth="2.5" opacity=".9" />
    <S d={rr(12, 60, 77, 9, 4.5)} h="dark" />
    <S d="M14 54C10 54 5 57 4 62c8 2 18 2 26 0-2-5-8-8-16-8Z" h="dark" />
    <path d="M66 36h10M68 42h12" stroke={dark(c)} strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
    <Gloss cx={30} cy={34} rx={10} ry={5} rot={-40} />
  </g>,

  /* Open umbrella with a curved handle. */
  '☂': ({ c = 'blue' }) => <g>
    <path d="M50 54v30c0 7-11 7-11 0" fill="none" stroke="url(#v-brown)" strokeWidth="5" strokeLinecap="round" />
    <S d={UMBRELLA} h={c} /><AO d={UMBRELLA} />
    <path d="M50 13C40 22 32 38 28.5 56M50 13c10 9 18 25 21.5 43M50 13v43" fill="none" stroke={dark(c)} strokeOpacity=".55" strokeWidth="1.8" />
    <path d="M50 13C44 22 38 38 35 54" fill="none" stroke={light(c)} strokeOpacity=".6" strokeWidth="5" />
    <path d="M50 13v-5" stroke={dark('gray')} strokeWidth="3" strokeLinecap="round" />
    <Gloss cx={26} cy={30} rx={10} ry={5} rot={-45} />
  </g>,

  /* Diamond kite with a bow tail. */
  '🪁': ({ c = 'red' }) => {
    const K = 'M50 6 82 34 50 70 18 34Z'
    const c2 = other(c, 'yellow', 'blue')
    return <g>
      <path d="M50 70c-10 6 6 10-4 16s-10 4-14 6" fill="none" stroke={dark('gray')} strokeWidth="1.8" strokeLinecap="round" />
      {([[46, 77, 'blue'], [40, 88, 'green']] as [number, number, Hue][]).map(([x, y, h]) =>
        <path key={x} d={`M${x} ${y}l-8-6v12ZM${x} ${y}l8-6v12Z`} fill={v(other(c, h, 'yellow'))} />)}
      <S d={K} h={c} />
      <path d="M50 6 82 34H50ZM50 34H18l32 36Z" fill={v(c2)} />
      <AO d={K} />
      <path d="M50 6v64M18 34h64" stroke={dark('wood')} strokeWidth="2" />
      <Gloss cx={38} cy={24} rx={8} ry={4} rot={-42} />
    </g>
  },

  /* Spinning top (con quay) with stripes. */
  '🪀': ({ c = 'red' }) => <g>
    <path d="M10 74c4 6 10 8 16 8M90 74c-4 6-10 8-16 8" fill="none" stroke={dark('gray')} strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
    <S d={rr(45, 6, 10, 22, 4)} h="wood" />
    <S d={TOP_BODY} h={c} />
    <path d="M13 44c10 10 64 10 74 0" fill="none" stroke={v(other(c, 'yellow', 'blue'))} strokeWidth="6" />
    <path d="M24 60c12 7 40 7 52 0" fill="none" stroke={v(other(c, 'blue', 'green'))} strokeWidth="5" />
    <AO d={TOP_BODY} />
    <path d="M45 82l5 10 5-10Z" fill="url(#v-gray)" />
    <ellipse cx="50" cy="26" rx="14" ry="4" fill={light(c)} opacity=".6" />
    <Gloss cx={28} cy={34} rx={10} ry={4} rot={-20} />
  </g>,

  /* Game controller. */
  '🎮': ({ c = 'dark' }) => <g>
    <S d={PAD} h={c} /><AO d={PAD} />
    <path d="M26 40h7v7h7v7h-7v7h-7v-7h-7v-7h7Z" fill="#120d18" opacity=".85" />
    {([[70, 40, 'yellow'], [78, 48, 'red'], [62, 48, 'blue'], [70, 56, 'green']] as [number, number, Hue][]).map(([x, y, h]) =>
      <g key={h}><circle cx={x} cy={y} r="4.5" fill={v(h)} /><circle cx={x - 1.4} cy={y - 1.6} r="1.4" fill="#fff" opacity=".8" /></g>)}
    <rect x="42" y="42" width="6" height="3" rx="1.5" fill={light(c)} opacity=".7" />
    <rect x="52" y="42" width="6" height="3" rx="1.5" fill={light(c)} opacity=".7" />
    <Gloss cx={26} cy={34} rx={8} ry={2.6} rot={-10} o={.8} />
  </g>,

  /* Gift box with a ribbon bow. */
  '🎁': ({ c = 'red' }) => {
    const rib = other(c, 'yellow', 'red')
    return <g>
      <S d={BOX} h={c} /><AO d={BOX} />
      <rect x="43" y="47" width="14" height="43" fill={v(rib)} />
      <S d={LID} h={c} />
      <rect x="42" y="35" width="16" height="14" fill={v(rib)} />
      <rect x="17" y="49" width="66" height="3" fill={dark(c)} opacity=".35" />
      <S d="M50 34C40 18 24 18 26 28c1 6 12 7 24 6Z" h={rib} />
      <S d="M50 34c10-16 26-16 24-6-1 6-12 7-24 6Z" h={rib} />
      <O cx={50} cy={33} rx={6} ry={5} h={rib} />
      <Gloss cx={26} cy={40} rx={7} ry={2.4} rot={-10} />
      <Gloss cx={33} cy={25} rx={4} ry={2} rot={-30} />
    </g>
  },

  /* Sparkling cut diamond. */
  '💎': () => {
    const A = [28, 24], M = [50, 24], B = [72, 24], D = [8, 42], G1 = [30, 42], G2 = [50, 42], G3 = [70, 42], C = [92, 42], P = [50, 90]
    const f = (pts: number[][], fill: string, k: string) =>
      <path key={k} d={`M${pts.map(p => p.join(' ')).join('L')}Z`} fill={fill} stroke="#fff" strokeOpacity=".7" strokeWidth="1" strokeLinejoin="round" />
    return <g>
      {f([D, A, G1], light('blue'), '1')}
      {f([A, G2, G1], 'url(#v-sky)', '2')}
      {f([A, B, G2], light('sky'), '3')}
      {f([B, G3, G2], 'url(#v-blue)', '4')}
      {f([B, C, G3], base('blue'), '5')}
      {f([D, G1, P], base('blue'), '6')}
      {f([G1, G2, P], 'url(#v-sky)', '7')}
      {f([G2, G3, P], 'url(#v-blue)', '8')}
      {f([G3, C, P], dark('blue'), '9')}
      <path d={`M${M.join(' ')}`} />
      <Gloss cx={36} cy={32} rx={8} ry={3} rot={-20} />
      <path d="M82 10l1.6 4.4L88 16l-4.4 1.6L82 22l-1.6-4.4L76 16l4.4-1.6Z" fill="#fff" />
      <path d="M16 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#fff" />
    </g>
  },

  /* Medicine capsule and a round tablet. */
  '💊': () => {
    const CAP = rr(12, 36, 72, 26, 13)
    return <g>
      <g transform="rotate(-35 48 49)">
        <path d={CAP} fill="url(#v-white)" stroke={dark('white')} strokeWidth="1.2" />
        <path d="M48 36H25a13 13 0 0 0 0 26h23Z" fill="url(#v-red)" />
        <path d="M48 36v26" stroke={dark('red')} strokeOpacity=".5" strokeWidth="1.2" />
        <AO d={CAP} />
        <Gloss cx={30} cy={42} rx={10} ry={2.6} rot={0} />
        <Gloss cx={64} cy={42} rx={8} ry={2.2} rot={0} o={.8} />
      </g>
      <O cx={76} cy={78} rx={13} ry={11} h="yellow" />
      <path d="M66 78h20" stroke={dark('yellow')} strokeWidth="1.8" strokeLinecap="round" />
      <Gloss cx={72} cy={72} rx={4} ry={2} rot={-20} />
    </g>
  },

  /* Kitchen knife. */
  '🔪': () => {
    const BLADE = 'M38 40h42c8 0 14 3 16 5-8 10-30 15-58 15Z'
    return <g transform="rotate(-38 52 50)">
      <S d={BLADE} h="gray" /><AO d={BLADE} />
      <path d="M40 57c22 0 42-4 54-11" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
      <Gloss cx={58} cy={45} rx={14} ry={2} rot={0} o={.9} />
      <S d={rr(34, 38, 7, 24, 2)} h="gray" />
      <S d={rr(4, 41, 32, 18, 8)} h="dark" />
      {[13, 21, 29].map(x => <circle key={x} cx={x} cy="50" r="2" fill="url(#v-gray)" />)}
      <Gloss cx={14} cy={44.5} rx={7} ry={1.6} rot={0} o={.6} />
    </g>
  },
}
