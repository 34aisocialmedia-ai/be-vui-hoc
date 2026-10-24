/* People: Vietnamese children and grown-ups at work. Big round head, dark hair, big shiny eyes, small body.
 * Every job is told by its hat, uniform and tool. One shared figure builder keeps them alike in style. */
import { AO, Blush, Eyes, Gloss, L, Mouth, O, S, Smile, base, dark, light, v, type Draw, type Hue } from './kit'

type Pt = [number, number]
type Hair = 'short' | 'long' | 'bun' | 'pony' | 'bob' | 'none'

const HEAD_X = 50, HEAD_Y = 36
const TORSO = 'M37 81c-4-6-5-13-4-18 1-5 7-7 17-7s16 2 17 7c1 5 0 12-4 18Z'
const HAIR_CAP = 'M30 40C27 24 36 14 50 14S73 24 70 40C68 34 65 30 62 27C55 31 44 32 36 28C33 31 31 35 30 40Z'
const HAIR_GIRL = 'M30 43C27 24 36 14 50 14S73 24 70 43C67 33 62 27 56 24C50 30 41 31 33 30C31 34 30 38 30 43Z'
const HAIR_BACK = 'M28 38C26 22 36 13 50 13s24 9 22 25l2 22c-3 4-8 4-11 1l-1-14H37l-1 14c-3 3-8 3-11-1Z'
const HAIR_BOB = 'M27 38C25 22 36 13 50 13s25 9 23 25l1 13c-3 3-7 3-10 0V40H36v11c-3 3-7 3-10 0Z'

const star = (cx: number, cy: number, r: number) => {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`
  }
  return d + 'Z'
}

/** The head: back hair, ears, face, front hair. Drawn around (50, 36). */
function Head({ hair = 'short', hh = 'black', face, hat }: { hair?: Hair; hh?: Hue; face?: JSX.Element; hat?: JSX.Element }) {
  return <g>
    {hair === 'long' && <S d={HAIR_BACK} h={hh} />}
    {hair === 'bob' && <S d={HAIR_BOB} h={hh} />}
    {hair === 'bun' && <O cx={50} cy={13} r={8} h={hh} />}
    {hair === 'pony' && <S d="M66 24c10-2 17 6 15 18-1 7-4 12-9 15 2-8 0-15-7-20Z" h={hh} />}
    <O cx={30.5} cy={40} r={4.2} h="skin" /><O cx={69.5} cy={40} r={4.2} h="skin" />
    <O cx={HEAD_X} cy={HEAD_Y} rx={20.5} ry={19.5} h="skin" />
    {face ?? <g>
      <Eyes x={50} y={39} gap={17} r={5.2} />
      <Mouth x={50} y={47} w={8} />
    </g>}
    <Blush x={50} y={45.5} gap={29} r={4.5} />
    {hair !== 'none' && <S d={hair === 'short' ? HAIR_CAP : HAIR_GIRL} h={hh} />}
    {hair !== 'none' && <Gloss cx={40} cy={20} rx={6} ry={2.6} rot={-25} o={.55} />}
    {hat}
  </g>
}

interface Fig {
  shirt: Hue; pants?: Hue; shoes?: Hue; sleeve?: Hue; skinLegs?: boolean
  hair?: Hair; hh?: Hue
  torso?: string
  l?: Pt; le?: Pt; r?: Pt; re?: Pt
  legs?: [Pt, Pt, Pt, Pt, Pt, Pt]
  back?: JSX.Element; detail?: JSX.Element; held?: JSX.Element; hat?: JSX.Element; top?: JSX.Element; face?: JSX.Element
  hideL?: boolean; hideR?: boolean
  /** Straight upper arm + forearm (sharp elbow) instead of a soft curve. */
  lBent?: boolean; rBent?: boolean
  /** Draw legs in front of the body (lifted knees). */
  legsOver?: boolean
}

/** A whole standing figure, feet on y≈90. */
function Kid(o: Fig) {
  const { shirt, pants = 'blue', shoes = 'dark', sleeve = shirt, torso = TORSO } = o
  const l = o.l ?? [31, 78], r = o.r ?? [69, 78]
  const le = o.le ?? [30, 69], re = o.re ?? [70, 69]
  const legs = o.legs ?? [[45, 77], [43.5, 84], [44, 89], [55, 77], [56.5, 84], [56, 89]]
  const leg = (i: number) => {
    const [hip, knee, foot] = [legs[i * 3], legs[i * 3 + 1], legs[i * 3 + 2]]
    return <g key={i}>
      <path d={`M${hip[0]} ${hip[1]}Q${knee[0]} ${knee[1]} ${foot[0]} ${foot[1]}`} fill="none" stroke={v(pants)} strokeWidth="8.5" strokeLinecap="round" />
      {o.skinLegs && <path d={`M${(knee[0] + foot[0]) / 2} ${(knee[1] + foot[1]) / 2}L${foot[0]} ${foot[1]}`} stroke={base('skin')} strokeWidth="7" strokeLinecap="round" />}
      <O cx={foot[0] + (i ? 1 : -1)} cy={foot[1] + 1.6} rx={5.6} ry={3.4} h={shoes} />
    </g>
  }
  const arm = (s: Pt, e: Pt, h: Pt, bent?: boolean) =>
    <path d={`M${s[0]} ${s[1]}${bent ? 'L' : 'Q'}${e[0]} ${e[1]} ${bent ? 'L' : ''}${h[0]} ${h[1]}`} fill="none" stroke={v(sleeve)} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  return <g>
    {o.back}
    {!o.legsOver && <g>{leg(0)}{leg(1)}</g>}
    {!o.hideL && arm([38, 63], le, l, o.lBent)}
    {!o.hideR && arm([62, 63], re, r, o.rBent)}
    <S d={torso} h={shirt} /><AO d={torso} />
    {o.detail}
    {o.legsOver && <g>{leg(0)}{leg(1)}</g>}
    <Gloss cx={42} cy={64} rx={4} ry={2.2} rot={-35} o={.6} />
    <Head hair={o.hair} hh={o.hh} face={o.face} hat={o.hat} />
    {o.held}
    {!o.hideL && <O cx={l[0]} cy={l[1]} r={4.3} h="skin" />}
    {!o.hideR && <O cx={r[0]} cy={r[1]} r={4.3} h="skin" />}
    {o.top}
  </g>
}

/** Scale a figure about its feet so tall hats or props fit in the box. */
const fit = (s: number, x: number, el: JSX.Element) => <g transform={`translate(${x} 91) scale(${s}) translate(-50 -91)`}>{el}</g>

const WATER = 'M6 63c5-5 10-5 15 0s10 5 15 0 10-5 15 0 10 5 15 0 10-5 15 0 10 5 13 2V92c0 1-1 2-2 2H8c-1 0-2-1-2-2Z'
const TUNIC = 'M35 88c-3-17 2-31 15-31s18 14 15 31Z'
const COAT = 'M34 85c-2-17 3-28 16-28s18 11 16 28Z'

export const PEOPLE: Record<string, Draw> = {
  /* Running: big stride, bent arms pumping, leaning forward, speed lines behind. */
  '🏃': () => <g transform="rotate(-8 50 90)">
    {[46, 56, 66].map((y, i) => <L key={y} d={`M${80 + i * 2} ${y}h${11 - i * 2}`} w={3} h="sky" />)}
    <Kid shirt="red" pants="blue" shoes="orange"
      legs={[[45, 77], [35, 80], [27, 87], [56, 77], [66, 90], [80, 81]]}
      lBent l={[24, 54]} le={[27, 67]} rBent r={[78, 58]} re={[72, 70]} />
  </g>,

  /* Walking: an easy step, arms swinging, a school bag on one shoulder. */
  '🚶': () => <Kid shirt="teal" pants="dark" shoes="red"
    legs={[[46, 77], [41, 83], [37, 89], [54, 77], [60, 83], [64, 88]]}
    l={[31, 76]} le={[31, 70]} r={[70, 72]} re={[69, 69]}
    held={<g>
      <path d="M41 58Q56 64 67 74" fill="none" stroke={base('orange')} strokeWidth="2.6" />
      <S d="M63 72h16c2 0 3 1 3 3v9c0 2-1 3-3 3H63c-2 0-3-1-3-3v-9c0-2 1-3 3-3Z" h="orange" />
      <path d="M60 78h22" stroke={dark('orange')} strokeOpacity=".5" strokeWidth="1.4" />
    </g>} />,

  /* Climbing a wooden ladder: hands up on the rungs, one knee lifted. */
  '🧗': () => {
    const RUNGS = [12, 30, 48, 66, 84]
    return <g>
      {RUNGS.map(y => <rect key={y} x="26" y={y - 2.5} width="48" height="5" rx="2.5" fill={v('wood')} />)}
      <rect x="22" y="6" width="7" height="88" rx="3.5" fill={v('wood')} />
      <rect x="71" y="6" width="7" height="88" rx="3.5" fill={v('wood')} />
      <g transform="translate(0 -4)">
        <Kid shirt="yellow" pants="blue" shoes="red"
          legsOver legs={[[45, 77], [41, 83], [41, 86], [56, 76], [70, 72], [65, 67]]}
          l={[33, 16]} le={[28, 42]} r={[67, 34]} re={[72, 52]} />
      </g>
    </g>
  },

  /* Swimming: head and arm above blue water, splashes. */
  '🏊': () => <g>
    <path d="M60 58Q70 44 77 26" fill="none" stroke={v('skin')} strokeWidth="8" strokeLinecap="round" />
    <O cx={77} cy={24} r={4.6} h="skin" />
    <g transform="translate(-4 8)">
      <Head hair="none" hat={<g>
        <S d="M29 34C28 20 38 14 50 14S72 20 71 34C64 27 36 27 29 34Z" h="red" />
        <Gloss cx={40} cy={20} rx={6} ry={2.6} rot={-25} o={.7} />
      </g>} />
    </g>
    <S d={WATER} h="blue" /><AO d={WATER} />
    <path d="M10 70c4-3 7-3 10 0M40 74c4-3 7-3 10 0M70 70c4-3 7-3 10 0" fill="none" stroke={light('blue')} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M22 62Q18 64 16 68" fill="none" stroke={v('skin')} strokeWidth="8" strokeLinecap="round" />
    <O cx={15} cy={66} r={4.4} h="skin" />
    {[[84, 34, 2.6], [88, 44, 2], [70, 18, 2.2], [86, 22, 1.8]].map(([x, y, r]) => <circle key={x + y} cx={x} cy={y} r={r} fill={v('sky')} />)}
    <Gloss cx={30} cy={72} rx={10} ry={2.5} rot={0} o={.5} />
  </g>,

  /* Teacher: áo dài, long hair, pointer at a green board with chalk letters, book in hand. */
  '👩‍🏫': () => <g>
    <rect x="5" y="20" width="38" height="30" rx="3" fill={v('wood')} />
    <rect x="8" y="23" width="32" height="24" rx="2" fill={dark('leaf')} />
    <text x="24" y="41" textAnchor="middle" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" fontWeight="700" fontSize="13" fill="#fff" opacity=".92">abc</text>
    {fit(.9, 60, <Kid shirt="purple" pants="white" shoes="dark" hair="long" torso={TUNIC}
      detail={<path d="M44 86h12" stroke={dark('purple')} strokeWidth="1.6" strokeOpacity=".5" />}
      l={[24, 56]} le={[28, 66]} r={[68, 74]} re={[71, 66]}
      held={<g>
        <L d="M22 56L1 37" w={2.6} h="brown" />
        <S d="M60 66h16v14H60Z" h="red" />
        <path d="M62 68h12" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" />
      </g>} />)}
  </g>,

  /* Farmer: nón lá, brown áo bà ba, rolled trousers, a bunch of golden rice. */
  '🧑‍🌾': () => fit(.98, 50, <Kid shirt="brown" pants="brown" shoes="brown" skinLegs
    detail={<g>{[66, 72, 78].map(y => <circle key={y} cx="50" cy={y} r="1.3" fill={dark('brown')} />)}<path d="M50 59v24" stroke={dark('brown')} strokeOpacity=".4" strokeWidth="1.2" /></g>}
    l={[31, 76]} r={[72, 68]} re={[73, 72]}
    held={<g>
      {[8, 15, 22, 29].map((a, i) => <g key={a} transform={`rotate(${a} 72 70)`}>
        <L d="M72 74V36" w={2} h="yellow" />
        {[0, 1, 2, 3].map(k => <ellipse key={k} cx={72 + (k % 2 ? 2.2 : -2.2)} cy={38 + k * 4 + i} rx="2" ry="3.2" fill={v('yellow')} />)}
      </g>)}
    </g>}
    hat={<g>
      <S d="M50 3L9 28q41 9 82 0Z" h="cream" /><AO d="M50 3L9 28q41 9 82 0Z" />
      <path d="M22 22q28 6 56 0M34 15q16 4 32 0M43 9q7 2 14 0" fill="none" stroke={dark('cream')} strokeWidth="1.3" strokeOpacity=".8" />
      <Gloss cx={38} cy={14} rx={7} ry={2.4} rot={-32} o={.8} />
    </g>} />),

  /* Chef: tall white toque, white coat with buttons, red scarf, wooden spoon and a steaming pot. */
  '🧑‍🍳': () => fit(.92, 52, <Kid shirt="white" pants="dark" shoes="dark" hair="short"
    torso={COAT}
    detail={<g>
      <path d="M43 58l7 8 7-8Z" fill={v('red')} />
      {[68, 74, 80].map(y => <g key={y}><circle cx="45" cy={y} r="1.4" fill={base('gray')} /><circle cx="55" cy={y} r="1.4" fill={base('gray')} /></g>)}
    </g>}
    l={[26, 70]} le={[28, 66]} r={[72, 58]} re={[74, 68]}
    held={<g>
      <S d="M8 66h28v12c0 5-4 8-9 8h-10c-5 0-9-3-9-8Z" h="red" /><AO d="M8 66h28v12c0 5-4 8-9 8h-10c-5 0-9-3-9-8Z" />
      <rect x="6" y="63" width="32" height="5" rx="2.5" fill={v('gray')} />
      <path d="M15 58c-3-4 3-6 0-10M24 58c-3-4 3-6 0-10" fill="none" stroke={base('gray')} strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      <L d="M72 62L86 22" w={3.6} h="wood" />
      <O cx={87} cy={18} rx={5} ry={7} h="wood" transform="rotate(20 87 18)" />
    </g>}
    hat={<g>
      <O cx={37} cy={15} r={9.5} h="white" /><O cx={63} cy={15} r={9.5} h="white" /><O cx={50} cy={11} r={11} h="white" />
      <S d="M32 30V19q18-4 36 0v11q-18-3-36 0Z" h="white" />
      <Gloss cx={44} cy={7} rx={5} ry={2.4} rot={-20} o={.9} />
    </g>} />),

  /* Firefighter: red helmet with gold shield, dark suit with yellow stripes, hose spraying water. */
  '🧑‍🚒': () => <g>
    {fit(.95, 44, <Kid shirt="dark" pants="dark" shoes="black" hair="short"
      detail={<g><rect x="35" y="73" width="30" height="4" fill={base('yellow')} /><path d="M41 58v26M59 58v26" stroke={base('yellow')} strokeWidth="3" /></g>}
      legs={[[45, 80], [43.5, 85], [44, 89], [55, 80], [56.5, 85], [56, 89]]}
      l={[60, 74]} le={[46, 80]} r={[74, 66]} re={[72, 74]}
      held={<g>
        <path d="M4 92C20 92 22 80 36 78S58 74 76 64" fill="none" stroke={v('black')} strokeWidth="7" strokeLinecap="round" />
        <path d="M74 66l12-8" stroke={v('yellow')} strokeWidth="7" strokeLinecap="round" />
      </g>}
      hat={<g>
        <S d="M28 30c0-14 10-21 22-21s22 7 22 21Z" h="red" />
        <S d="M20 30c0-2 2-3 4-3h52c2 0 4 1 4 3s-2 4-5 4H25c-3 0-5-2-5-4Z" h="red" />
        <S d="M44 12h12l1 10-7 5-7-5Z" h="yellow" />
        <Gloss cx={36} cy={17} rx={6} ry={3} rot={-35} o={.8} />
      </g>} />)}
    <path d="M84 52c4-8 6-16 6-26M84 52c6-6 9-12 10-20M84 52c2-10 1-18-2-26" fill="none" stroke={base('blue')} strokeWidth="3.2" strokeLinecap="round" strokeDasharray="5 4" />
    {[[90, 18], [82, 20], [94, 26]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.2" fill={v('sky')} />)}
  </g>,

  /* Doctor: white coat over a blue shirt, stethoscope round the neck, red cross. */
  '🧑‍⚕': () => <Kid shirt="white" pants="blue" shoes="dark" torso={COAT}
    detail={<g>
      <path d="M44 58l6 14 6-14Z" fill={v('sky')} />
      <path d="M43 58l7 26M57 58l-7 26" stroke={dark('white')} strokeWidth="1.2" />
      <path d="M41 60Q38 74 46 76M59 60Q62 74 54 76M46 76q4 2 8 0" fill="none" stroke={base('dark')} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 77v4" stroke={base('dark')} strokeWidth="2.2" />
      <circle cx="50" cy="83" r="3.4" fill={v('gray')} />
      <path d="M57 72h8M61 68v8" stroke={base('red')} strokeWidth="3.2" strokeLinecap="round" />
    </g>}
    r={[72, 60]} re={[74, 70]}
    held={<g>
      <rect x="66" y="52" width="16" height="20" rx="2" fill={v('wood')} transform="rotate(10 74 62)" />
      <rect x="68.5" y="55" width="11" height="14" rx="1" fill="#fff" transform="rotate(10 74 62)" />
      <path d="M70 59h7M69.6 62h7M69.2 65h5" stroke={base('gray')} strokeWidth="1.2" transform="rotate(10 74 62)" />
    </g>}
    hat={<g>
      <path d="M31 30Q50 20 69 30" fill="none" stroke={base('dark')} strokeWidth="3" strokeLinecap="round" />
      <O cx={50} cy={22} r={7.5} h="gray" />
      <circle cx="50" cy="22" r="5" fill={v('white')} /><circle cx="50" cy="22" r="1.6" fill={base('dark')} />
    </g>} />,

  /* Pilot: navy cap with gold badge, navy jacket with gold cuffs, a little plane in hand. */
  '🧑‍✈': () => <g>
    {fit(.95, 46, <Kid shirt="dark" pants="dark" shoes="black"
      detail={<g>
        <path d="M44 58l6 10 6-10Z" fill="#fff" /><path d="M50 61l-2 3 2 10 2-10Z" fill={base('blue')} />
        <path d="M38 68h8M39 70h6" stroke={base('yellow')} strokeWidth="1.6" strokeLinecap="round" />
      </g>}
      sleeve="dark" r={[74, 50]} re={[76, 62]}
      hat={<g>
        <S d="M26 22c0-7 11-12 24-12s24 5 24 12l-3 5H29Z" h="dark" />
        <rect x="29" y="22" width="42" height="6" rx="1.5" fill={base('black')} />
        <path d="M30 28h40c-2 4-9 6-20 6s-18-2-20-6Z" fill={v('black')} />
        <path d="M45 18q5-3 10 0" stroke={base('yellow')} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="18" r="2.4" fill={v('yellow')} />
        <Gloss cx={38} cy={15} rx={6} ry={2.2} rot={-15} o={.6} />
      </g>} />)}
    <g transform="translate(2 -4) rotate(-24 80 32)">
      <S d="M62 32c0-3 3-5 7-5h20c3 0 5 2 5 5s-2 5-5 5H69c-4 0-7-2-7-5Z" h="white" />
      <S d="M78 31l-6-12h5l9 12ZM78 34l-6 10h5l9-10Z" h="blue" edge={false} />
      <S d="M64 31l-3-9h4l5 8Z" h="red" edge={false} />
      {[80, 84, 88].map(x => <circle key={x} cx={x} cy="31" r="1.3" fill={base('blue')} />)}
    </g>
  </g>,

  /* Painter: red beret, apron with paint spots, palette and brush. */
  '🧑‍🎨': () => <Kid shirt="sky" pants="blue" shoes="dark" sleeve="teal"
    detail={<g>
      <path d="M40 66h20v18H40Z" fill={v('white')} />
      {([[44, 72, 'red'], [55, 70, 'yellow'], [51, 79, 'blue']] as [number, number, Hue][]).map(([x, y, h]) => <circle key={h} cx={x} cy={y} r="1.8" fill={base(h)} />)}
    </g>}
    l={[24, 70]} le={[27, 74]} r={[72, 56]} re={[75, 68]}
    held={<g>
      <S d="M6 62c3-9 16-11 24-7 7 4 6 11 0 13-4 1-4 5-1 7 3 3-2 7-9 7C10 82 3 72 6 62Z" h="wood" />
      {([[12, 63, 'red'], [20, 59, 'yellow'], [27, 62, 'blue'], [11, 72, 'green'], [18, 77, 'purple']] as [number, number, Hue][]).map(([x, y, h]) =>
        <circle key={h} cx={x} cy={y} r="3.3" fill={v(h)} />)}
      <L d="M72 58L86 26" w={2.8} h="wood" />
      <path d="M85 29l3-7 3 1-2 7Z" fill={base('gray')} />
      <path d="M88 22l2-6c1-1 3 0 3 1l-2 6Z" fill={v('red')} />
    </g>}
    hat={<g>
      <S d="M27 27c-3-9 9-16 24-15 14 1 23 7 20 15-6 3-38 3-44 0Z" h="red" />
      <path d="M50 12q1-4 4-4" stroke={base('red')} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <Gloss cx={37} cy={17} rx={7} ry={2.4} rot={-15} o={.7} />
    </g>} />,

  /* Singer: shiny dress with a star, microphone at the mouth, music notes. */
  '🧑‍🎤': () => <g>
    {[[14, 22, 'pink'], [84, 16, 'blue'], [88, 44, 'purple']].map(([x, y, h]) => <g key={x as number}>
      <ellipse cx={x as number} cy={(y as number) + 10} rx="4" ry="3.2" fill={v(h as Hue)} transform={`rotate(-20 ${x} ${(y as number) + 10})`} />
      <path d={`M${(x as number) + 3.4} ${(y as number) + 9}V${y}l5 2`} fill="none" stroke={base(h as Hue)} strokeWidth="2" strokeLinecap="round" />
    </g>)}
    <Kid shirt="pink" pants="purple" shoes="purple" hair="long"
      detail={<path d={star(50, 72, 6)} fill={v('yellow')} />}
      l={[20, 56]} le={[25, 66]} r={[62, 58]} re={[70, 70]}
      face={<g><Eyes x={50} y={39} gap={17} r={5.2} /><ellipse cx="50" cy="48.5" rx="3.6" ry="4" fill="#7a2a3a" /></g>}
      held={<g>
        <L d="M62 58L58 50" w={3.4} h="black" />
        <O cx={57} cy={48} r={4.6} h="gray" />
        <path d="M54 46.5h6M54 49h6" stroke={dark('gray')} strokeWidth="1" />
      </g>} />
  </g>,

  /* Builder: yellow hard hat, orange vest with silver stripes, hammer, stack of bricks. */
  '👷': () => <g>
    {[[8, 84], [22, 84], [15, 76]].map(([x, y]) => <g key={x + y}>
      <S d={`M${x} ${y}h13v7H${x}Z`} h="red" />
    </g>)}
    {fit(1, 54, <Kid shirt="orange" pants="blue" shoes="brown" sleeve="blue"
      detail={<g>
        <path d="M36 74h28" stroke={light('gray')} strokeWidth="3.5" /><path d="M41 58v26M59 58v26" stroke={light('gray')} strokeWidth="3" />
        <path d="M46 58l4 6 4-6Z" fill={v('blue')} />
      </g>}
      r={[72, 56]} re={[76, 68]}
      held={<g>
        <L d="M72 60L84 24" w={4} h="wood" />
        <S d="M76 22c0-3 3-5 6-4l10 3c2 1 2 4 0 5l-11 2c-3 0-5-2-5-6Z" h="gray" />
      </g>}
      hat={<g>
        <S d="M29 30c0-13 9-20 21-20s21 7 21 20Z" h="yellow" />
        <rect x="45" y="11" width="10" height="19" rx="4" fill={v('yellow')} />
        <S d="M24 29h52c2 0 3 2 2 4H22c-1-2 0-4 2-4Z" h="yellow" />
        <Gloss cx={36} cy={17} rx={5} ry={2.4} rot={-35} o={.8} />
      </g>} />)}
  </g>,

  /* Chú bộ đội: green pith helmet (mũ cối) with a star badge, green uniform, red collar tabs, saluting. */
  '💂': () => <Kid shirt="green" pants="green" shoes="black"
    detail={<g>
      <path d="M43 58l7 6 7-6" fill="none" stroke={dark('green')} strokeWidth="1.6" />
      <path d="M40 59l4 3-1 3ZM60 59l-4 3 1 3Z" fill={v('red')} />
      <rect x="35" y="76" width="30" height="4" fill={v('brown')} /><rect x="47" y="75.5" width="6" height="5" rx="1" fill={v('yellow')} />
      {[68, 72].map(y => <circle key={y} cx="50" cy={y} r="1.2" fill={dark('green')} />)}
    </g>}
    rBent r={[67, 31]} re={[77, 50]}
    hat={<g>
      <S d="M27 30c0-13 10-20 23-20s23 7 23 20Z" h="green" />
      <S d="M19 30c0-2 3-3 6-3h50c3 0 6 1 6 3 0 3-3 5-8 5H27c-5 0-8-2-8-5Z" h="green" />
      <circle cx="50" cy="20" r="5.6" fill={v('yellow')} />
      <circle cx="50" cy="20" r="4.2" fill={v('red')} />
      <path d={star(50, 20.3, 3.2)} fill={light('yellow')} />
      <Gloss cx={35} cy={17} rx={6} ry={2.6} rot={-35} o={.8} />
    </g>} />,

  /* Hairdresser: ponytail, pink apron, big scissors in one hand, comb in the other. */
  '💇': () => <Kid shirt="pink" pants="dark" shoes="pink" hair="pony"
    detail={<g>
      <path d="M40 64h20v20H40Z" fill={v('white')} />
      <path d="M43 70h6v5h-6Z" fill={light('pink')} />
    </g>}
    l={[25, 58]} le={[25, 70]} r={[72, 62]} re={[74, 72]}
    held={<g>
      <rect x="12" y="44" width="8" height="26" rx="2" fill={v('blue')} transform="rotate(-18 16 57)" />
      {[0, 1, 2, 3, 4, 5].map(k => <rect key={k} x="19.2" y={46 + k * 3.8} width="5" height="1.8" rx=".9" fill={base('blue')} transform="rotate(-18 16 57)" />)}
      <S d="M74 56L79.5 43 93 20 82.5 45Z" h="gray" />
      <S d="M88 55L80.5 43 67 22 78.5 45.5Z" h="gray" />
      <circle cx="72" cy="61" r="5.2" fill="none" stroke={v('red')} strokeWidth="3.4" />
      <circle cx="90" cy="59" r="5.2" fill="none" stroke={v('red')} strokeWidth="3.4" />
      <circle cx="80.5" cy="44" r="1.8" fill={dark('gray')} />
    </g>} />,

  /* Cô công an: friendly traffic police lady, white cap with red band, khaki shirt, whistle, striped baton. */
  '👮': () => <Kid shirt="yellow" pants="leaf" shoes="black" hair="bob"
    detail={<g>
      <path d="M43 58l7 6 7-6" fill="none" stroke={dark('yellow')} strokeWidth="1.6" />
      <path d="M40 59l4 3-1 3ZM60 59l-4 3 1 3Z" fill={v('red')} />
      <path d={star(58, 70, 3.2)} fill={v('red')} />
      <path d="M45 62Q44 70 42 72" fill="none" stroke={base('gray')} strokeWidth="1.3" />
      <rect x="39" y="71" width="5" height="3" rx="1.4" fill={v('gray')} />
    </g>}
    l={[31, 78]} r={[72, 52]} re={[76, 64]}
    held={<g transform="rotate(14 74 50)">
      <rect x="71.5" y="22" width="6" height="34" rx="3" fill={v('white')} />
      {[25, 33, 41].map(y => <rect key={y} x="71.5" y={y} width="6" height="4" fill={base('red')} />)}
    </g>}
    hat={<g>
      <S d="M25 22c0-7 11-12 25-12s25 5 25 12l-3 5H28Z" h="white" />
      <rect x="28" y="22" width="44" height="6" rx="1.5" fill={v('red')} />
      <path d="M30 28h40c-2 4-9 6-20 6s-18-2-20-6Z" fill={v('black')} />
      <circle cx="50" cy="18" r="3.2" fill={v('yellow')} /><circle cx="50" cy="18" r="1.6" fill={base('red')} />
    </g>} />,

  /* Grandma: grey hair in a bun, glasses, purple áo bà ba, walking stick. */
  '👵': () => <Kid shirt="purple" pants="dark" shoes="brown" hair="bun" hh="gray"
    face={<g>
      <Eyes x={50} y={39} gap={17} r={4.6} />
      <g fill="none" stroke={base('brown')} strokeWidth="1.8"><circle cx="41.5" cy="39" r="6.8" /><circle cx="58.5" cy="39" r="6.8" /><path d="M48.3 38.5q1.7-1.5 3.4 0" /></g>
      <Smile x={50} y={47.5} w={9} />
      <path d="M34 47q2 2 4 1.5M66 47q-2 2-4 1.5" fill="none" stroke={dark('skin')} strokeWidth="1.2" strokeLinecap="round" />
    </g>}
    detail={<g>{[64, 70, 76].map(y => <circle key={y} cx="50" cy={y} r="1.4" fill={light('purple')} />)}<path d="M50 58v26" stroke={dark('purple')} strokeOpacity=".4" strokeWidth="1.2" /></g>}
    r={[72, 68]} re={[73, 70]}
    held={<g>
      <path d="M73 68L75 92" stroke={v('wood')} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M73 68c-1-6 6-8 8-3" fill="none" stroke={v('wood')} strokeWidth="3.6" strokeLinecap="round" />
    </g>} />,

  /* Talking: a child with mouth wide open and a speech bubble. */
  '🗣': () => <g>
    <S d="M56 8h30c4 0 7 3 7 7v14c0 4-3 7-7 7H72l-8 8 1-8h-9c-4 0-7-3-7-7V15c0-4 3-7 7-7Z" h="white" />
    {[62, 71, 80].map(x => <circle key={x} cx={x} cy="22" r="3" fill={base('dark')} />)}
    <S d="M8 94c0-13 13-21 32-21s32 8 32 21Z" h="orange" /><AO d="M8 94c0-13 13-21 32-21s32 8 32 21Z" />
    <g transform="translate(40 50) scale(1.3) translate(-50 -36)">
      <Head hair="short" face={<g>
        <Eyes x={50} y={38} gap={17} r={5.2} />
        <path d="M43.5 45q6.5-1 13 0q-1.5 9-6.5 9t-6.5-9Z" fill="#7a2a3a" />
        <path d="M46 51q4-2.5 8 0q-4 2.6-8 0Z" fill="#ff8fa3" />
      </g>} />
    </g>
    <path d="M70 60q4 4 0 9M76 56q7 8 0 17" fill="none" stroke={base('gray')} strokeWidth="2.6" strokeLinecap="round" />
  </g>,

  /* Stethoscope: ear tips, metal tubes, rubber tube, silver chest piece. No face. */
  '🩺': () => <g>
    <path d="M30 14Q24 40 40 50M70 14Q76 40 60 50" fill="none" stroke={v('gray')} strokeWidth="4" strokeLinecap="round" />
    <O cx={30} cy={12} rx={4} ry={3.4} h="dark" /><O cx={70} cy={12} rx={4} ry={3.4} h="dark" />
    <path d="M40 50Q50 58 60 50" fill="none" stroke={v('blue')} strokeWidth="6" strokeLinecap="round" />
    <path d="M50 55C50 74 40 88 26 84S14 66 24 60" fill="none" stroke={v('blue')} strokeWidth="6" strokeLinecap="round" />
    <path d="M50 55C50 74 40 88 26 84S14 66 24 60" fill="none" stroke={light('blue')} strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" transform="translate(-1 -1)" />
    <rect x="21" y="54" width="6" height="8" rx="2" fill={v('gray')} />
    <O cx={24} cy={46} r={11} h="gray" />
    <circle cx="24" cy="46" r="7" fill={v('white')} />
    <Gloss cx={20} cy={41} rx={4} ry={2.2} />
  </g>,
}
