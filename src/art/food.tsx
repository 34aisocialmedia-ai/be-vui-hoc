/* Food, fruit, vegetables and tableware: soft 3D objects (no faces), lit from the upper left. */
import { AO, Gloss, L, O, S, base, dark, light, v, type Draw } from './kit'

const BANANA = 'M70 20C88 36 90 66 68 80C54 90 32 92 14 86C10 84 11 79 16 79C38 76 54 64 58 48C61 38 61 30 59 22Z'
const APPLE_BITE = 'M50 30C39 21 15 25 15 51c0 23 17 38 28 36 4-1 10-1 14 0C66 88 76 80 81 69Q70 67 71 59Q66 52 71 46Q70 38 81 35C76 26 60 22 50 30Z'
const CAP = 'M8 56C8 30 27 12 50 12S92 30 92 56C92 63 80 65 50 65S8 63 8 56Z'
const STEM = 'M37 62C35 74 33 84 36 89Q50 94 64 89C67 84 65 74 63 62Z'
const NUT = 'M50 12C60 22 86 40 86 63C86 81 70 91 50 91S14 81 14 63C14 40 40 22 50 12Z'
const CARROT = 'M30 34C38 26 64 26 70 34C72 52 60 78 48 91C46 93 43 92 43 90C36 72 28 52 30 34Z'
const BOWL_LOW = 'M8 46C8 71 28 89 50 89S92 71 92 46C92 53 73 59 50 59S8 53 8 46Z'
const RICE_BOWL = 'M10 52C10 73 28 89 50 89S90 73 90 52Z'
const RICE = 'M12 53C12 34 29 22 50 22S88 34 88 53C76 59 24 59 12 53Z'
const EGG = 'M50 10C69 10 81 40 81 61C81 80 67 91 50 91S19 80 19 61C19 40 31 10 50 10Z'
const PAN = 'M6 54C6 72 22 84 42 84S78 72 78 54Z'
const CUP = 'M24 30H76L69 87Q50 92 31 87Z'
const GLASS = 'M21 12H79L71 86Q70 91 65 91H35Q30 91 29 86Z'
const MILK = 'M25 32H75L68.5 85Q68 88 65 88H35Q32 88 31.5 85Z'
const POT = 'M27 30C12 40 10 63 19 77C28 91 72 91 81 77C90 63 88 40 73 30Z'
const POTATO = 'M16 52C12 33 30 20 50 24C70 18 90 32 86 54C90 74 70 90 48 86C26 90 18 70 16 52Z'
const COOKIE = 'M85.7 41A38 38 0 1 1 63 18.3Q64 29 71 27Q71.7 35 79 33Q78.4 41.4 85.7 41Z'
const STEAK = 'M20 36C30 20 60 18 76 28C92 38 92 62 78 74C64 86 34 88 20 76C8 66 10 48 20 36Z'
const BOX = 'M17 42Q50 55 83 42L75 90Q50 94 25 90Z'
const TRAY = 'M15 20H85Q93 20 93 28V80Q93 88 85 88H15Q7 88 7 80V28Q7 20 15 20Z'

/** Little green star of sepals on top of a tomato / strawberry-like fruit. */
const sepals = (x: number, y: number, r: number) =>
  `M${x} ${y - r * .2}${[0, 1, 2, 3, 4].map(i => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5, b = a + Math.PI / 5
    return `L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r * .55).toFixed(1)}L${(x + Math.cos(b) * r * .32).toFixed(1)} ${(y + Math.sin(b) * r * .25).toFixed(1)}`
  }).join('')}Z`

export const FOOD: Record<string, Draw> = {
  /* Fruit */
  '🍌': () => <g>
    <S d={BANANA} h="yellow" /><AO d={BANANA} />
    <path d="M66 24C79 40 79 64 61 76C49 84 34 87 20 84" fill="none" stroke={dark('yellow')} strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
    <path d="M63 27C68 42 66 58 54 68" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
    <S d="M59 23L60 9Q64 6 68 9L70 21Z" h="green" />
    <ellipse cx="14" cy="83" rx="3" ry="2.6" fill={base('hair')} />
    <Gloss cx={75} cy={44} rx={4.5} ry={11} rot={-12} o={.85} />
  </g>,

  '🍊': () => <g>
    <O cx={50} cy={57} r={34} h="orange" /><AO d="M16 57a34 34 0 1 0 68 0a34 34 0 1 0-68 0Z" />
    {[[36, 50], [56, 44], [66, 62], [44, 70], [30, 64], [60, 78], [72, 48], [48, 56]].map(([x, y]) =>
      <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" fill={dark('orange')} opacity=".4" />)}
    <path d="M45 24h10l-5 5Z" fill={dark('green')} />
    <L d="M50 25q0-8 3-12" w={3.5} h="brown" />
    <S d="M53 18c8-10 22-10 27-3-7 9-19 10-27 3Z" h="leaf" />
    <path d="M56 17c7-3 14-3 20-1" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
    <Gloss cx={34} cy={42} rx={9} ry={5.5} rot={-50} />
  </g>,

  '🍉': () => <g>
    <O cx={40} cy={42} rx={33} ry={28} h="leaf" />
    {[-30, -15, 0, 15, 30].map(k => <path key={k} d={`M8 42C20 ${42 + k} 60 ${42 + k} 73 42`} fill="none" stroke={dark('leaf')} strokeWidth="4" strokeOpacity=".75" />)}
    <AO d="M7 42a33 28 0 1 0 66 0a33 28 0 1 0-66 0Z" />
    <Gloss cx={26} cy={26} rx={9} ry={4} rot={-30} o={.8} />
    <S d="M30 58A32 32 0 0 0 94 58Z" h="leaf" />
    <path d="M33.5 58A28.5 28.5 0 0 0 90.5 58Z" fill={v('cream')} />
    <S d="M36 58A26 26 0 0 0 88 58Z" h="red" edge={false} />
    {[[50, 65], [62, 68], [74, 65], [55, 76], [69, 76], [62, 84]].map(([x, y]) =>
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="1.9" ry="3" fill={base('black')} />)}
    <Gloss cx={47} cy={62} rx={7} ry={2.2} rot={0} o={.7} />
  </g>,

  '🍇': () => <g>
    <L d="M50 22q0-8 6-14" w={4} h="brown" />
    <S d="M52 16c-10-9-24-8-30 0 9 8 22 8 30 0Z" h="leaf" />
    {[[23, 30], [41, 30], [59, 30], [77, 30], [32, 46], [50, 46], [68, 46], [41, 62], [59, 62], [50, 78]].map(([x, y]) =>
      <g key={`${x}${y}`}><O cx={x} cy={y} r={10} h="purple" /><ellipse cx={x} cy={y} rx="10" ry="10" fill="url(#v-ao)" />
        <Gloss cx={x - 4} cy={y - 4} rx={3.4} ry={2.2} rot={-40} /></g>)}
  </g>,

  '🍏': () => <g>
    <S d={APPLE_BITE} h="green" /><AO d={APPLE_BITE} />
    <path d="M81 69Q70 67 71 59Q66 52 71 46Q70 38 81 35Q62 42 63 52Q64 63 81 69Z" fill={v('cream')} />
    <ellipse cx="68" cy="52" rx="1.6" ry="2.8" fill={base('hair')} />
    <path d="M44 33c-3-4-10-5-14-3" fill="none" stroke={dark('green')} strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
    <L d="M50 31q0-10 5-16" w={4.5} h="brown" />
    <S d="M54 22c9-11 22-10 27-4-7 10-19 11-27 4Z" h="leaf" />
    <Gloss cx={31} cy={42} rx={9} ry={5.5} rot={-55} />
  </g>,

  '🍄': () => <g>
    <S d={STEM} h="cream" /><AO d={STEM} />
    <ellipse cx="50" cy="61" rx="34" ry="5.5" fill={dark('cream')} />
    <S d={CAP} h="red" /><AO d={CAP} />
    {[[30, 40, 6, 5], [52, 26, 7, 5], [70, 42, 6.5, 5.5], [50, 50, 5, 4], [16, 54, 3, 3], [84, 54, 3, 3]].map(([x, y, rx, ry]) =>
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx={rx} ry={ry} fill={v('white')} />)}
    <Gloss cx={30} cy={25} rx={10} ry={4.5} rot={-30} o={.8} />
  </g>,

  '🌰': () => <g>
    <S d={NUT} h="brown" /><AO d={NUT} />
    <path d="M18 72Q50 62 82 72Q76 90 50 91Q24 90 18 72Z" fill={v('wood')} />
    <path d="M47 14q3-6 6 0" fill={base('wood')} />
    <Gloss cx={36} cy={42} rx={10} ry={5} rot={-55} />
    <Gloss cx={58} cy={30} rx={3} ry={2} o={.7} />
  </g>,

  '🥕': () => <g>
    <S d="M48 30C44 18 36 10 26 8C36 6 46 14 52 28Z" h="leaf" />
    <S d="M50 30C50 18 54 10 60 6C62 16 58 24 54 30Z" h="green" />
    <S d="M52 31C58 20 68 14 78 14C72 22 64 28 56 33Z" h="leaf" />
    <S d={CARROT} h="orange" /><AO d={CARROT} />
    {['M34 44l8 1', 'M58 50l9-1', 'M40 60l7 1', 'M54 70l7-1', 'M44 80l5 1'].map(d =>
      <path key={d} d={d} stroke={dark('orange')} strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />)}
    <Gloss cx={40} cy={40} rx={4} ry={10} rot={-15} o={.85} />
  </g>,

  '🍅': () => <g>
    <O cx={50} cy={57} rx={38} ry={33} h="red" /><AO d="M12 57a38 33 0 1 0 76 0a38 33 0 1 0-76 0Z" />
    <path d="M36 30C30 46 30 70 38 88M64 30C70 46 70 70 62 88" fill="none" stroke={dark('red')} strokeOpacity=".25" strokeWidth="2" />
    <S d={sepals(50, 28, 20)} h="leaf" />
    <L d="M50 27q0-8 4-12" w={4} h="green" />
    <Gloss cx={30} cy={43} rx={9} ry={5} rot={-45} />
  </g>,

  '🫐': () => <g>
    <S d="M58 22c4-12 18-16 28-10-4 11-18 15-28 10Z" h="leaf" />
    {[[50, 34, 19], [28, 62, 20], [70, 64, 20]].map(([x, y, r]) => <g key={x}>
      <O cx={x} cy={y} r={r} h="blue" /><ellipse cx={x} cy={y} rx={r} ry={r} fill="url(#v-ao)" />
      <path d={sepals(x, y - r * .62, r * .32)} fill={dark('blue')} />
      <Gloss cx={x - r * .42} cy={y - r * .2} rx={r * .28} ry={r * .16} rot={-55} />
    </g>)}
  </g>,

  '🍒': () => <g>
    <path d="M30 70C34 46 46 24 58 14M68 66C66 44 62 28 58 14" fill="none" stroke={dark('leaf')} strokeWidth="3.5" strokeLinecap="round" />
    <S d="M58 14c8-8 22-6 28 2-10 6-22 6-28-2Z" h="leaf" />
    <O cx={30} cy={72} r={19} h="red" /><AO d="M11 72a19 19 0 1 0 38 0a19 19 0 1 0-38 0Z" />
    <O cx={68} cy={68} r={19} h="red" /><AO d="M49 68a19 19 0 1 0 38 0a19 19 0 1 0-38 0Z" />
    <Gloss cx={22} cy={64} rx={6} ry={3.5} rot={-45} />
    <Gloss cx={60} cy={60} rx={6} ry={3.5} rot={-45} />
  </g>,

  /* Vegetables */
  '🥬': () => <g>
    <S d="M50 52C36 46 32 24 38 13C42 5 58 5 62 13C68 24 64 46 50 52Z" h="leaf" />
    <S d="M28 58C12 50 6 30 15 18C23 9 38 12 41 25C44 38 38 52 28 58Z" h="green" />
    <S d="M72 58C88 50 94 30 85 18C77 9 62 12 59 25C56 38 62 52 72 58Z" h="green" />
    <path d="M50 46V16M28 52Q26 36 22 22M72 52Q74 36 78 22" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" strokeLinecap="round" />
    <S d="M43 90C38 76 30 64 26 54L35 50C40 62 46 74 50 90Z" h="white" />
    <S d="M57 90C62 76 70 64 74 54L65 50C60 62 54 74 50 90Z" h="white" />
    <S d="M43 90C41 72 43 58 45 46H55C57 58 59 72 57 90Q50 93 43 90Z" h="white" />
    <path d="M43 90C41 72 43 58 45 46H55C57 58 59 72 57 90Q50 93 43 90Z" fill={light('green')} opacity=".55" />
    <AO d="M30 88C34 80 66 80 70 88Q50 96 30 88Z" />
    <Gloss cx={44} cy={20} rx={5} ry={3} rot={-40} o={.7} />
  </g>,

  '🥦': () => <g>
    <S d="M39 54L35 88Q50 93 65 88L61 54Z" h="green" />
    <path d="M39 54L35 88Q50 93 65 88L61 54Z" fill="#fff" opacity=".35" />
    <L d="M44 62l-8-6M57 64l8-7" w={4} h="green" o={.5} />
    {[[30, 42, 16], [70, 42, 16], [50, 30, 18], [37, 26, 12], [64, 25, 12], [50, 50, 13], [21, 54, 9], [79, 54, 9]].map(([x, y, r]) =>
      <g key={`${x}${y}`}><O cx={x} cy={y} r={r} h="leaf" />
        <circle cx={x + r * .25} cy={y + r * .25} r={r * .22} fill={dark('leaf')} opacity=".35" />
        <circle cx={x - r * .35} cy={y - r * .35} r={r * .2} fill="#fff" opacity=".45" /></g>)}
    <Gloss cx={42} cy={20} rx={7} ry={3.5} rot={-30} o={.6} />
  </g>,

  '🌽': () => {
    const COB = 'M50 7C63 7 69 24 69 48C69 70 61 86 50 86S31 70 31 48C31 24 37 7 50 7Z'
    const kernels: [number, number][] = []
    for (let y = 15; y <= 78; y += 7) {
      const w = 17 * Math.sqrt(Math.max(0, 1 - ((y - 46) / 41) ** 2))
      for (let x = -14; x <= 14; x += 7) if (Math.abs(x) < w - 2) kernels.push([50 + x + (((y - 15) / 7) % 2 ? 3.5 : 0) * 0, y])
    }
    return <g>
      <S d={COB} h="yellow" />
      {kernels.map(([x, y]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.2" ry="3" fill={v('yellow')} stroke={dark('yellow')} strokeOpacity=".45" strokeWidth=".8" />)}
      <AO d={COB} />
      <S d="M50 93C28 88 14 66 18 34C28 50 40 66 52 76Z" h="leaf" />
      <S d="M50 93C72 88 86 66 82 34C72 50 60 66 48 76Z" h="green" />
      <path d="M24 46C28 62 36 76 46 86M76 46C72 62 64 76 54 86" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      <Gloss cx={42} cy={22} rx={3.5} ry={8} rot={-10} o={.8} />
    </g>
  },

  '🥔': () => <g>
    <S d={POTATO} h="wood" /><AO d={POTATO} />
    {[[34, 44], [60, 36], [70, 60], [44, 68], [26, 60], [56, 54]].map(([x, y]) => <g key={`${x}${y}`}>
      <path d={`M${x - 2.5} ${y}q2.5 2 5 0`} fill="none" stroke={dark('wood')} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={x} cy={y + 1.6} r="1" fill={dark('brown')} opacity=".6" />
    </g>)}
    <Gloss cx={32} cy={36} rx={10} ry={5} rot={-35} />
    <Gloss cx={66} cy={30} rx={4} ry={2} rot={-20} o={.6} />
  </g>,

  '🥗': () => <g>
    <S d="M50 52C34 50 20 44 16 34C24 28 34 30 40 36C40 24 50 18 58 22C62 14 76 16 78 26C88 26 90 38 84 46C74 52 62 54 50 52Z" h="leaf" />
    <S d="M14 52C10 42 18 34 28 38C30 30 40 28 46 36C44 44 30 52 14 52Z" h="green" />
    <S d="M54 52C54 40 64 32 74 36C80 32 90 38 86 50Z" h="green" />
    <O cx={34} cy={42} rx={8} ry={6} h="red" /><circle cx="32" cy="41" r="1.4" fill={light('yellow')} />
    <O cx={68} cy={38} rx={7} ry={5.5} h="red" />
    <circle cx="52" cy="40" r="7" fill={v('leaf')} /><circle cx="52" cy="40" r="5" fill={light('green')} />
    <path d="M50 38.5h4M52 37.5v5" stroke={dark('leaf')} strokeOpacity=".4" strokeWidth="1" />
    <S d="M74 46l12-8 2 3-12 8Z" h="orange" />
    <S d="M22 46l-6-12 3-1 6 12Z" h="orange" />
    <S d={RICE_BOWL} h="wood" /><AO d={RICE_BOWL} />
    <path d="M16 64Q50 76 84 64" fill="none" stroke={dark('wood')} strokeOpacity=".5" strokeWidth="2.4" />
    <rect x="38" y="87" width="24" height="5" rx="2" fill={v('wood')} />
    <Gloss cx={26} cy={60} rx={8} ry={3} rot={20} o={.7} />
  </g>,

  /* Dishes */
  '🍚': () => <g>
    <rect x="37" y="86" width="26" height="6" rx="2" fill={v('white')} />
    <S d={RICE} h="white" />
    {[[30, 42, 20], [42, 33, -30], [56, 30, 30], [68, 40, -20], [48, 46, 10], [36, 50, -10], [62, 50, 40], [76, 50, 0], [22, 50, 30], [52, 38, -50]].map(([x, y, r]) =>
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="3.8" ry="2" fill="#fff" stroke={dark('gray')} strokeOpacity=".6" strokeWidth=".9" transform={`rotate(${r} ${x} ${y})`} />)}
    <S d={RICE_BOWL} h="white" /><AO d={RICE_BOWL} />
    <path d="M14 63Q50 75 86 63" fill="none" stroke={base('blue')} strokeWidth="3.2" />
    <path d="M18 70Q50 81 82 70" fill="none" stroke={base('blue')} strokeOpacity=".6" strokeWidth="1.6" />
    <S d="M6 58L92 42L93 45L7 61Z" h="wood" />
    <S d="M7 64L93 50L94 53L8 67Z" h="wood" />
    <Gloss cx={34} cy={30} rx={8} ry={4} rot={-20} o={.8} />
    <Gloss cx={24} cy={70} rx={6} ry={3} rot={30} o={.7} />
  </g>,

  '🍜': () => <g>
    {['M30 30c-5-5 5-9 0-16', 'M50 26c-5-5 5-9 0-16', 'M70 30c-5-5 5-9 0-16'].map(d =>
      <path key={d} d={d} fill="none" stroke={base('gray')} strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />)}
    <O cx={50} cy={46} rx={42} ry={13} h="white" />
    <ellipse cx="50" cy="47" rx="37" ry="10" fill={v('wood')} />
    {['M20 47q4-3 8 0t8 0t8 0t8 0', 'M30 51q4-3 8 0t8 0t8 0t8 0', 'M44 43q4-3 8 0t8 0t8 0'].map(d =>
      <path key={d} d={d} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />)}
    <ellipse cx="34" cy="43" rx="8" ry="3.5" fill={v('brown')} transform="rotate(-8 34 43)" />
    <ellipse cx="68" cy="48" rx="8" ry="3.5" fill={v('brown')} transform="rotate(8 68 48)" />
    <path d="M48 42c3-4 8-4 10 0-3 3-7 3-10 0ZM74 41c3-4 8-4 10 0-3 3-7 3-10 0ZM20 46c3-4 8-4 10 0-3 3-7 3-10 0Z" fill={v('leaf')} />
    {[[58, 51], [26, 51], [80, 46]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" fill="none" stroke={base('green')} strokeWidth="1.6" />)}
    <S d={BOWL_LOW} h="white" /><AO d={BOWL_LOW} />
    <path d="M14 64Q50 80 86 64" fill="none" stroke={base('blue')} strokeWidth="3.2" />
    <S d="M58 33L88 7L90 10L61 35Z" h="wood" />
    <S d="M61 35L92 13L93 16L63 38Z" h="wood" />
    <path d="M60 35c-3 4 3 7 0 12M63 36c-2 4 3 7 1 11" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <Gloss cx={24} cy={66} rx={7} ry={3} rot={30} o={.7} />
  </g>,

  '🥣': ({ c = 'blue' }) => <g>
    <O cx={50} cy={46} rx={42} ry={13} h={c} />
    <ellipse cx="50" cy="47" rx="38" ry="10.5" fill={v('white')} />
    <ellipse cx="50" cy="51" rx="30" ry="6" fill={base('gray')} opacity=".35" />
    <ellipse cx="46" cy="50" rx="11" ry="5" fill={v('gray')} transform="rotate(-12 46 50)" />
    <S d="M54 48L84 14Q88 10 91 14L60 50Z" h="gray" />
    <S d={BOWL_LOW} h={c} /><AO d={BOWL_LOW} />
    {[22, 36, 50, 64, 78].map((x, i) => <circle key={x} cx={x} cy={i % 4 ? 70 : 66} r="3" fill={light(c)} opacity=".85" />)}
    <rect x="37" y="86" width="26" height="6" rx="2" fill={v(c)} />
    <Gloss cx={26} cy={64} rx={7} ry={3} rot={30} o={.7} />
  </g>,

  '🍱': () => <g>
    <S d={TRAY} h="gray" /><AO d={TRAY} />
    <rect x="13" y="26" width="36" height="56" rx="7" fill={base('gray')} stroke={dark('gray')} strokeOpacity=".7" strokeWidth="1.4" />
    <rect x="54" y="26" width="33" height="26" rx="7" fill={base('gray')} stroke={dark('gray')} strokeOpacity=".7" strokeWidth="1.4" />
    <rect x="54" y="56" width="33" height="26" rx="7" fill={base('gray')} stroke={dark('gray')} strokeOpacity=".7" strokeWidth="1.4" />
    <S d="M17 72C15 48 20 32 31 32S47 48 45 72Q31 80 17 72Z" h="white" />
    {[[25, 44], [34, 40], [30, 54], [39, 58], [22, 62], [34, 68]].map(([x, y]) =>
      <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2.6" ry="1.4" fill="#fff" stroke={base('gray')} strokeWidth=".8" />)}
    <S d="M58 46C56 36 64 30 70 36C74 28 84 32 83 42C84 48 62 50 58 46Z" h="leaf" />
    <circle cx="75" cy="44" r="4" fill={v('orange')} />
    <rect x="58" y="62" width="14" height="14" rx="4" fill={v('brown')} />
    <O cx={78} cy={69} rx={7} ry={8} h="white" />
    <circle cx="78" cy="70" r="4" fill={v('yellow')} />
    <Gloss cx={22} cy={23} rx={8} ry={2} rot={0} o={.8} />
  </g>,

  '🥩': () => <g>
    <path d={STEAK} transform="translate(0 6)" fill={dark('red')} />
    <path d={STEAK} fill={v('cream')} stroke={dark('cream')} strokeOpacity=".5" strokeWidth="1.2" />
    <S d="M26 40C34 28 58 26 72 34C84 42 84 60 74 68C62 78 38 80 26 70C16 62 18 50 26 40Z" h="red" />
    <AO d={STEAK} />
    <path d="M34 46c8 2 12-4 20-2M40 60c6-2 10 3 18 0M60 50c4 2 8 0 12 2" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="66" cy="60" r="6" fill={v('cream')} stroke={dark('cream')} strokeWidth="1.2" />
    <Gloss cx={36} cy={36} rx={9} ry={4} rot={-20} o={.8} />
  </g>,

  '🥚': () => <g>
    <S d={EGG} h="cream" /><AO d={EGG} />
    <Gloss cx={37} cy={34} rx={7} ry={11} rot={20} />
    <Gloss cx={62} cy={22} rx={2.5} ry={1.8} o={.7} />
  </g>,

  '🍳': () => <g>
    <S d="M72 48L88 37Q93 34 94 40L79 56Z" h="black" />
    <S d={PAN} h="dark" />
    <O cx={42} cy={54} rx={36} ry={20} h="dark" />
    <ellipse cx="42" cy="55" rx="30" ry="15" fill={v('black')} />
    <S d="M24 54C21 45 32 41 40 43C50 38 62 44 60 53C63 62 50 67 41 64C31 67 25 62 24 54Z" h="white" />
    <O cx={43} cy={52} rx={9} ry={7.5} h="yellow" />
    <Gloss cx={39} cy={49} rx={3} ry={2} o={.9} />
    <Gloss cx={18} cy={44} rx={6} ry={2} rot={-25} o={.5} />
  </g>,

  '🍽': () => <g>
    <O cx={50} cy={54} r={31} h="white" />
    <circle cx="50" cy="54" r="21" fill={v('white')} stroke={dark('white')} strokeWidth="1.6" />
    <AO d="M19 54a31 31 0 1 0 62 0a31 31 0 1 0-62 0Z" />
    <Gloss cx={36} cy={36} rx={9} ry={4} rot={-35} o={.8} />
    <path d="M7 14V30Q7 36 12.5 37V86M12.5 14V30M18 14V30Q18 36 12.5 37" fill="none" stroke={base('gray')} strokeWidth="3.2" strokeLinecap="round" />
    <path d="M12.5 40V86" stroke={dark('gray')} strokeWidth="5" strokeLinecap="round" />
    <path d="M12.5 40V86" stroke={base('gray')} strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="87.5" cy="26" rx="6.5" ry="10" fill={v('gray')} />
    <path d="M87.5 38V86" stroke={dark('gray')} strokeWidth="5" strokeLinecap="round" />
    <path d="M87.5 38V86" stroke={base('gray')} strokeWidth="3" strokeLinecap="round" />
    <Gloss cx={85} cy={22} rx={2} ry={4} rot={0} o={.8} />
  </g>,

  '🥄': () => <g transform="rotate(32 50 52)">
    <S d="M46 46Q48 54 47 62L45.5 87Q50 94 54.5 87L53 62Q52 54 54 46Z" h="gray" />
    <O cx={50} cy={27} rx={17} ry={22} h="gray" />
    <ellipse cx="50" cy="28" rx="12.5" ry="17" fill={v('white')} opacity=".9" />
    <ellipse cx="51" cy="33" rx="8" ry="10" fill={base('gray')} opacity=".35" />
    <Gloss cx={44} cy={20} rx={3} ry={7} rot={10} />
  </g>,

  '🥛': () => <g>
    <path d={GLASS} fill={v('sky')} opacity=".6" />
    <path d={MILK} fill={v('white')} stroke={base('gray')} strokeOpacity=".6" strokeWidth="1" />
    <ellipse cx="50" cy="32" rx="25" ry="4" fill="#fff" stroke={base('gray')} strokeOpacity=".5" strokeWidth="1" />
    <path d={GLASS} fill="none" stroke={dark('sky')} strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="50" cy="12" rx="29" ry="4" fill="none" stroke={dark('sky')} strokeWidth="2" />
    <path d="M28 18L34 82" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
    <path d="M36 20L38 30" stroke="#fff" strokeOpacity=".6" strokeWidth="2.4" strokeLinecap="round" />
  </g>,

  '🥤': ({ c = 'red' }) => <g>
    <path d="M54 20L59 6L72 6" fill="none" stroke={light('pink')} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M54 20L59 6L72 6" fill="none" stroke={base('pink')} strokeWidth="5" strokeDasharray="3 3" strokeLinecap="butt" strokeLinejoin="round" />
    <S d={CUP} h={c} /><AO d={CUP} />
    <path d="M27 54Q38 46 50 54T73 54L71.5 66Q61 58 50 66T28.3 66Z" fill="#fff" opacity=".9" />
    {[[38, 74, 2.5], [56, 78, 2], [48, 40, 2.2], [62, 42, 1.6], [34, 38, 1.5]].map(([x, y, r]) =>
      <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" opacity=".75" />)}
    <S d="M20 25Q20 19 26 19H74Q80 19 80 25V30H20Z" h="white" />
    <Gloss cx={32} cy={44} rx={3} ry={10} rot={-5} o={.8} />
  </g>,

  '🍯': () => <g>
    <S d={POT} h="orange" /><AO d={POT} />
    <S d="M24 22C24 18 76 18 76 22V30C76 34 24 34 24 30Z" h="wood" />
    <ellipse cx="50" cy="21" rx="25" ry="3.5" fill={v('yellow')} />
    <path d="M24 28C24 36 26 44 29 44S33 36 33 32C35 34 36 50 40 50S45 38 46 33C50 34 52 42 55 42S59 34 60 33C63 34 64 48 68 48S72 36 73 32C75 34 75 38 77 38S80 32 76 28Z" fill={v('yellow')} />
    <S d="M50 22L74 9L76 12L53 25Z" h="wood" />
    <g transform="rotate(-28 82 10)"><rect x="74" y="4" width="16" height="12" rx="5" fill={v('wood')} stroke={dark('wood')} strokeOpacity=".5" />
      <path d="M78 4.5v11M82 4.5v11M86 4.5v11" stroke={dark('wood')} strokeWidth="1.4" /></g>
    <Gloss cx={30} cy={52} rx={5} ry={12} rot={10} />
  </g>,

  /* Sweets */
  '🍬': ({ c = 'pink' }) => <g>
    <S d="M30 50L8 32Q2 50 8 68Z" h={c} />
    <S d="M70 50L92 32Q98 50 92 68Z" h={c} />
    <path d="M12 40L26 48M12 60L26 52M88 40L74 48M88 60L74 52" stroke={dark(c)} strokeOpacity=".4" strokeWidth="1.6" strokeLinecap="round" />
    <O cx={50} cy={50} rx={24} ry={19} h={c} />
    <path d="M36 36Q42 50 36 64M50 31Q57 50 50 69M64 36Q70 50 64 64" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
    <AO d="M26 50a24 19 0 1 0 48 0a24 19 0 1 0-48 0Z" />
    <Gloss cx={40} cy={40} rx={7} ry={3.5} rot={-25} />
  </g>,

  '🍭': ({ c = 'pink' }) => <g>
    <rect x="47" y="62" width="6" height="32" rx="3" fill={v('white')} stroke={dark('white')} strokeWidth="1" />
    <O cx={50} cy={36} r={30} h={c} />
    <path d="M50 36a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0a12 12 0 0 1-24 0a15 15 0 0 1 30 0a18 18 0 0 1-36 0a21 21 0 0 1 42 0a24 24 0 0 1-48 0"
      fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="4.5" strokeLinecap="round" />
    <AO d="M20 36a30 30 0 1 0 60 0a30 30 0 1 0-60 0Z" />
    <path d="M42 66l8 6 8-6-2 9-6-3-6 3Z" fill={v('blue')} />
    <Gloss cx={34} cy={20} rx={8} ry={4} rot={-35} />
  </g>,

  '🍪': () => <g>
    <S d={COOKIE} h="wood" /><AO d={COOKIE} />
    {[[30, 46, 5], [48, 36, 4.5], [40, 66, 5.5], [62, 60, 5], [56, 80, 4], [26, 70, 4], [66, 44, 3.5], [74, 72, 4], [48, 52, 3]].map(([x, y, r]) =>
      <path key={`${x}${y}`} d={`M${x - r} ${y}q0-${r} ${r} -${r}q${r * 1.2} 0 ${r} ${r * .9}q-.3 ${r * .8}-${r} ${r * .9}q-${r * .9} 0-${r}-${r * .8}Z`} fill={v('hair')} />)}
    <circle cx="74" cy="22" r="1.6" fill={v('wood')} /><circle cx="82" cy="28" r="1.2" fill={v('wood')} />
    <Gloss cx={30} cy={32} rx={9} ry={4} rot={-40} o={.7} />
  </g>,

  '🍰': () => <g transform="translate(50 60) scale(1.1) translate(-50 -60)">
    <path d="M12 58L88 48V82L12 88Z" fill={v('yellow')} stroke={dark('yellow')} strokeOpacity=".4" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M12 58L88 48V82L12 88Z" fill="#fff" opacity=".45" />
    <path d="M12 69L88 62V69L12 76Z" fill={v('pink')} />
    <path d="M12 58L88 48V54L12 63Z" fill={v('white')} />
    <AO d="M12 58L88 48V82L12 88Z" />
    <path d="M12 58L62 34Q78 32 88 48Z" fill={v('white')} stroke={dark('white')} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M40 46q4-6 9-2q5-5 9 0q-4 6-9 4q-5 4-9-2Z" fill={v('white')} stroke={dark('white')} strokeWidth="1" />
    <path d="M60 37C54 30 56 20 64 20S74 30 68 37Q64 40 60 37Z" fill={v('red')} />
    <path d="M58 22l6-5 6 5-6 2Z" fill={v('leaf')} />
    <Gloss cx={60} cy={26} rx={2} ry={3.2} rot={-20} />
    <Gloss cx={30} cy={70} rx={8} ry={2} rot={-6} o={.6} />
  </g>,

  '🍟': ({ c = 'red' }) => <g>
    <S d="M17 42Q50 30 83 42Q50 55 17 42Z" h={c} />
    {[[24, 20, -12], [33, 12, -6], [42, 18, -2], [51, 9, 3], [60, 16, 7], [69, 11, 12], [76, 22, 16], [46, 26, 0], [62, 28, 4]].map(([x, y, r]) =>
      <rect key={`${x}${y}`} x={x - 4} y={y} width="8" height="38" rx="2" fill={v('yellow')} stroke={dark('yellow')} strokeOpacity=".5" strokeWidth="1" transform={`rotate(${r} ${x} ${y + 38})`} />)}
    <S d={BOX} h={c} /><AO d={BOX} />
    <path d="M30 70Q50 78 70 70" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
    <Gloss cx={30} cy={58} rx={3} ry={9} rot={-8} o={.8} />
  </g>,

  '🍦': ({ c = 'pink' }) => <g>
    <path d="M28 50L48 92Q50 95 52 92L72 50Z" fill={v('wood')} stroke={dark('wood')} strokeOpacity=".5" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M34 56L58 80M44 54L64 70M56 54L66 60M30 62L48 84M66 56L42 84M58 54L36 74M46 54L32 66" stroke={dark('wood')} strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
    <AO d="M28 50L48 92Q50 95 52 92L72 50Z" />
    <S d="M22 50C18 40 28 34 50 34S82 40 78 50C74 57 26 57 22 50Z" h={c} />
    <S d="M29 37C26 28 36 23 50 23S74 28 71 37C68 42 32 42 29 37Z" h={c} />
    <S d="M36 25C34 17 42 14 50 13C54 10 56 7 58 6C60 10 62 16 64 25C62 29 38 29 36 25Z" h={c} />
    <Gloss cx={36} cy={40} rx={6} ry={2.4} rot={-10} o={.8} />
    <Gloss cx={44} cy={18} rx={4} ry={2} rot={-30} o={.8} />
  </g>,
}
