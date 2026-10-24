/* Places, vehicles, Hà Nội landmarks and home objects (soft 3D, lit from the upper left). */
import { AO, Eyes, Gloss, L, Mouth, O, S, Smile, Blush, base, dark, light, v, type Draw, type Hue } from './kit'

/** A toy wheel: dark tyre, silver hub. */
const Wheel = ({ x, y = 78, r = 10 }: { x: number; y?: number; r?: number }) => <g>
  <circle cx={x} cy={y} r={r} fill="url(#v-dark)" />
  <circle cx={x} cy={y} r={r * .42} fill="url(#v-gray)" />
  <circle cx={x - r * .3} cy={y - r * .35} r={r * .16} fill="#fff" opacity=".45" />
</g>
/** A glass window with a white glint. */
const Glass = ({ d, gx, gy }: { d: string; gx: number; gy: number }) => <g>
  <path d={d} fill="url(#v-sky)" />
  <path d={`M${gx} ${gy}l6 -8`} stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
</g>
/** A small round tree for landscapes. */
const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => <g>
  <rect x={x - 1.6 * s} y={y} width={3.2 * s} height={8 * s} rx={1} fill={base('brown')} />
  <O cx={x} cy={y - 3 * s} rx={7 * s} ry={8 * s} h="leaf" />
  <Gloss cx={x - 2.5 * s} cy={y - 6 * s} rx={2.5 * s} ry={1.6 * s} o={.7} />
</g>
/** A simple child / adult for scenes. */
const Kid = ({ x, y, s = 1, shirt = 'red' as Hue, hair = 'hair' as Hue }: { x: number; y: number; s?: number; shirt?: Hue; hair?: Hue }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-7} y={20} width={5.5} height={16} rx={2.5} fill={base('dark')} />
  <rect x={1.5} y={20} width={5.5} height={16} rx={2.5} fill={dark('dark')} />
  <S d="M-9 26V16c0-5 4-8 9-8s9 3 9 8v10Z" h={shirt} />
  <O cx={0} cy={-2} r={11} h="skin" />
  <path d="M-11 -3c-1-9 5-14 11-14s12 4 11 13c-4-5-9-7-15-6-3 1-5 3-7 7Z" fill={v(hair)} />
  <Eyes x={0} y={0} gap={8.5} r={2.6} />
  <Smile x={0} y={5} w={4.5} />
  <Blush x={0} y={4} gap={14} r={2.6} />
</g>

const CAR = 'M8 60c0-7 4-11 11-12l13-2 10-16c2-3 5-4 8-4h16c4 0 7 2 9 5l9 15 9 2c5 1 8 5 8 10v12c0 3-2 5-5 5H13c-3 0-5-2-5-5Z'
/** The family car, used for 🚗 and the police car. */
const car = (c: Hue, police = false) => <g>
  {police && <g>
    <rect x="48" y="16" width="20" height="7" rx="3" fill="url(#v-gray)" />
    <rect x="49.5" y="17" width="8" height="5" rx="2" fill="url(#v-red)" />
    <rect x="58.5" y="17" width="8" height="5" rx="2" fill="url(#v-blue)" />
  </g>}
  <S d={CAR} h={c} />
  {police && <path d="M9 56h82v7H9Z" fill={base('blue')} />}
  <AO d={CAR} />
  <Glass d="M37 46l8-13c1-2 3-3 5-3h7v16Z" gx={42} gy={44} />
  <Glass d="M61 30h5c3 0 5 1 6 3l8 13H61Z" gx={64} gy={44} />
  <path d="M59 48v22" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.6" />
  <rect x="63" y="52" width="7" height="2.6" rx="1.3" fill={dark(c)} opacity=".6" />
  <circle cx="89" cy="58" r="3" fill="#fff8c2" />
  <rect x="8" y="56" width="4" height="5" rx="1.5" fill={base('orange')} />
  <rect x="6" y="66" width="88" height="5" rx="2.5" fill="url(#v-gray)" />
  <Wheel x={28} y={76} r={11} /><Wheel x={73} y={76} r={11} />
  <Gloss cx={52} cy={28} rx={10} ry={2.2} rot={0} o={.8} />
  <Gloss cx={22} cy={52} rx={8} ry={2.4} rot={-8} o={.7} />
</g>

export const PLACES: Record<string, Draw> = {
  '🏠': () => {
    const ROOF = 'M8 50 47 15c2-2 4-2 6 0l39 35c2 2 1 5-2 5H10c-3 0-4-3-2-5Z'
    const WALL = 'M18 48h64v38c0 2-2 4-4 4H22c-2 0-4-2-4-4Z'
    return <g>
      <S d="M66 18h10v22H66Z" h="brown" />
      <S d={WALL} h="cream" /><AO d={WALL} />
      <S d={ROOF} h="red" /><AO d={ROOF} />
      <S d="M27 66c0-5 4-8 8-8s8 3 8 8v24H27Z" h="wood" />
      <circle cx="39" cy="77" r="1.8" fill={base('yellow')} />
      <rect x="54" y="60" width="18" height="16" rx="3" fill="url(#v-sky)" />
      <path d="M63 60v16M54 68h18" stroke={base('white')} strokeWidth="2.4" />
      <path d="M56 73l6-8" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
      <Gloss cx={34} cy={30} rx={10} ry={3} rot={-40} />
    </g>
  },

  '🚗': ({ c = 'red' }) => car(c),

  '🚲': ({ c = 'red' }) => <g>
    {[24, 76].map(x => <g key={x}>
      <circle cx={x} cy="68" r="17" fill="none" stroke={base('dark')} strokeWidth="5.5" />
      <circle cx={x} cy="68" r="13.5" fill="none" stroke={base('gray')} strokeWidth="1.4" />
      <path d={`M${x - 13} 68h26M${x} 55v26M${x - 9} 59l18 18M${x + 9} 59l-18 18`} stroke={base('gray')} strokeWidth="1" />
      <circle cx={x} cy="68" r="2.6" fill="url(#v-gray)" />
      <path d={`M${x - 12} ${56}q6 -5 13 -5`} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" />
    </g>)}
    <path d="M24 68 46 70 38 42ZM38 42h30L46 70M68 42l8 26" fill="none" stroke={dark(c)} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M24 68 46 70 38 42ZM38 42h30L46 70M68 42l8 26" fill="none" stroke={base(c)} strokeWidth="4.4" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M41 41h24" stroke={light(c)} strokeWidth="1.4" strokeLinecap="round" />
    <L d="M38 42l-2-6M68 42l-3-12" w={3.2} h="gray" />
    <path d="M60 29c3-2 7-2 11-1 3 1 4 3 3 5" fill="none" stroke={base('dark')} strokeWidth="4" strokeLinecap="round" />
    <S d="M28 33c2-3 7-4 12-3 3 0 4 3 2 5-4 2-10 2-13 1-2-1-2-2-1-3Z" h="dark" />
    <circle cx="46" cy="70" r="5" fill="url(#v-gray)" />
    <L d="M46 70l5 6" w={3} h="dark" />
    <rect x="48" y="74" width="8" height="3" rx="1.5" fill={base('dark')} />
  </g>,

  '🚂': ({ c = 'red' }) => {
    const BOILER = 'M40 38h44c4 0 6 7 6 15s-2 15-6 15H40Z'
    const CAB = 'M12 28h34v42H12Z'
    return <g>
      <O cx={82} cy={14} rx={7} ry={5.5} h="white" /><O cx={71} cy={9} rx={5} ry={4} h="white" /><O cx={61} cy={8} rx={3.5} ry={3} h="white" />
      <S d="M73 38l-2-17h13l-2 17Z" h="dark" />
      <rect x="69" y="17" width="17" height="5" rx="2" fill="url(#v-dark)" />
      <S d={BOILER} h={c} /><AO d={BOILER} />
      <O cx={58} cy={36} rx={6} ry={5} h="yellow" />
      {[52, 66, 80].map(x => <rect key={x} x={x} y="38" width="3" height="30" fill={base('yellow')} />)}
      <S d={CAB} h={c} /><AO d={CAB} />
      <rect x="18" y="33" width="21" height="15" rx="3" fill="url(#v-sky)" />
      <path d="M21 45l7 -9" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
      <S d="M8 28c0-4 3-7 7-7h28c4 0 7 3 7 7Z" h="dark" />
      <circle cx="88" cy="47" r="3.2" fill="#fff8c2" />
      <rect x="9" y="66" width="82" height="6" rx="2" fill="url(#v-dark)" />
      <path d="M86 68l8 12H83Z" fill="url(#v-gray)" />
      <Wheel x={27} y={78} r={12} /><Wheel x={56} y={81} r={9} /><Wheel x={76} y={81} r={9} />
      <L d="M27 81h49" w={3} h="gray" />
      <Gloss cx={60} cy={44} rx={14} ry={2.6} rot={0} o={.8} />
      <Gloss cx={18} cy={54} rx={3} ry={7} rot={0} o={.5} />
    </g>
  },

  '✈': ({ c = 'blue' }) => {
    const FUS = 'M8 51c0-7 5-11 12-11h54c11 0 19 5 20 11 0 6-8 12-17 12H20c-7 0-12-5-12-12Z'
    return <g>
      <path d="M50 42h14L42 22h-9Z" fill={dark(c)} />
      <S d="M12 46 7 17c0-3 3-4 5-2l22 31Z" h={c} />
      <S d={FUS} h="white" /><AO d={FUS} />
      <path d="M11 56h80" stroke={base(c)} strokeWidth="3.4" strokeLinecap="round" />
      {[28, 36, 44, 52, 60, 68].map(x => <circle key={x} cx={x} cy="49" r="2.8" fill="url(#v-sky)" />)}
      <path d="M79 43c6 0 11 2 14 7H79Z" fill="url(#v-sky)" />
      <S d="M6 53h16l-4 8H8Z" h={c} />
      <S d="M40 57h20L35 86c-1 2-3 2-4 2h-7Z" h={c} />
      <S d="M31 68h13c2 0 3 2 3 3.5S46 75 44 75H31Z" h="gray" />
      <Gloss cx={46} cy={42.5} rx={22} ry={2} rot={0} o={.9} />
    </g>
  },

  '🚢': ({ c = 'blue' }) => {
    const HULL = 'M6 56h88l-10 22c-1 3-4 5-7 5H24c-3 0-6-2-7-5Z'
    return <g>
      {[44, 61].map(x => <g key={x}>
        <S d={`M${x} 31l-2-15h12l-2 15Z`} h="red" />
        <path d={`M${x - 2} 16h12l-.5 4H${x - 1.5}Z`} fill={base('black')} />
      </g>)}
      <S d="M30 42v-9c0-2 2-4 4-4h34c2 0 4 2 4 4v9Z" h="white" />
      <S d="M20 57V45c0-2 2-4 4-4h52c2 0 4 2 4 4v12Z" h="white" />
      {[26, 36, 46, 56, 66].map(x => <rect key={x} x={x} y="46" width="7" height="6" rx="1.5" fill="url(#v-sky)" />)}
      {[37, 47, 57].map(x => <rect key={x} x={x} y="33" width="6" height="5" rx="1.5" fill="url(#v-sky)" />)}
      <S d={HULL} h={c} />
      <path d="M13 71h75l-4 7c-1 3-4 5-7 5H24c-3 0-6-2-7-5Z" fill={base('red')} />
      <AO d={HULL} />
      {[26, 40, 54, 68].map(x => <circle key={x} cx={x} cy="63" r="2.8" fill={light('sky')} />)}
      <path d="M8 88q6-4 12 0t12 0 12 0 12 0 12 0 12 0 12 0" fill="none" stroke={base('blue')} strokeWidth="3" strokeLinecap="round" />
      <Gloss cx={30} cy={59} rx={14} ry={1.8} rot={0} o={.8} />
    </g>
  },

  '🚒': ({ c = 'red' }) => {
    const BODY = 'M6 34c0-3 2-5 5-5h55v-2c0-2 2-4 4-4h10c4 0 7 2 8 5l7 15c1 2 1 4 1 6v22c0 3-2 5-5 5H11c-3 0-5-2-5-5Z'
    return <g>
      <rect x="72" y="17" width="10" height="6" rx="2.5" fill="url(#v-blue)" />
      <S d={BODY} h={c} /><AO d={BODY} />
      <path d="M8 22h58M8 29h58" stroke={base('gray')} strokeWidth="2.6" strokeLinecap="round" />
      {[12, 20, 28, 36, 44, 52, 60].map(x => <path key={x} d={`M${x} 22v7`} stroke={base('gray')} strokeWidth="2" />)}
      <Glass d="M71 29h8c2 0 4 1 5 3l6 12H71Z" gx={74} gy={42} />
      <path d="M6 52h86" stroke="#fff" strokeOpacity=".9" strokeWidth="3" />
      {[12, 30, 48].map(x => <rect key={x} x={x} y="36" width="14" height="12" rx="2" fill={dark(c)} opacity=".35" />)}
      <circle cx="90" cy="58" r="3" fill="#fff8c2" />
      <rect x="6" y="66" width="88" height="5" rx="2.5" fill="url(#v-gray)" />
      <Wheel x={22} y={77} r={10} /><Wheel x={44} y={77} r={10} /><Wheel x={77} y={77} r={10} />
      <Gloss cx={36} cy={33} rx={18} ry={2} rot={0} o={.7} />
    </g>
  },

  '🚑': () => {
    const VAN = 'M8 28c0-4 3-7 7-7h51c3 0 5 2 6 4l2 6h3c5 0 8 2 10 6l6 13c1 2 2 5 2 7v15c0 3-2 5-5 5H13c-3 0-5-2-5-5Z'
    return <g>
      <rect x="40" y="14" width="14" height="8" rx="3" fill="url(#v-blue)" />
      <S d={VAN} h="white" /><AO d={VAN} />
      <path d="M8 58h87" stroke={base('red')} strokeWidth="5" />
      <path d="M37 30h8v8h8v8h-8v8h-8v-8h-8v-8h8Z" fill="url(#v-red)" />
      <Glass d="M74 33h4c3 0 5 1 6 3l6 12H74Z" gx={77} gy={46} />
      <path d="M70 28v40" stroke={base('gray')} strokeWidth="1.6" />
      <circle cx="92" cy="63" r="2.8" fill="#fff8c2" />
      <rect x="8" y="68" width="88" height="5" rx="2.5" fill="url(#v-gray)" />
      <Wheel x={27} y={78} r={10.5} /><Wheel x={74} y={78} r={10.5} />
      <Gloss cx={30} cy={25} rx={16} ry={2.4} rot={0} o={.9} />
    </g>
  },

  '🚓': ({ c = 'white' }) => car(c, true),

  '🚙': ({ c = 'blue' }) => {
    const SUV = 'M7 58c0-6 4-10 10-10h4l7-19c1-3 4-5 7-5h37c3 0 6 2 7 5l7 19h2c5 0 8 4 8 9v14c0 3-2 5-5 5H12c-3 0-5-2-5-5Z'
    return <g>
      <path d="M32 21h42" stroke={base('dark')} strokeWidth="3" strokeLinecap="round" />
      <path d="M38 21v3M68 21v3" stroke={base('dark')} strokeWidth="2.4" />
      <S d={SUV} h={c} /><AO d={SUV} />
      <Glass d="M26 46l6-15c1-2 2-3 4-3h12v18Z" gx={31} gy={44} />
      <Glass d="M52 28h17v18H52Z" gx={55} gy={44} />
      <Glass d="M73 28h1c2 0 3 1 4 3l6 15H73Z" gx={75} gy={44} />
      <path d="M50 48v22" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.6" />
      <circle cx="90" cy="58" r="3" fill="#fff8c2" />
      <rect x="5" y="66" width="90" height="5" rx="2.5" fill="url(#v-gray)" />
      <Wheel x={27} y={77} r={12} /><Wheel x={73} y={77} r={12} />
      <Gloss cx={52} cy={26} rx={14} ry={2} rot={0} o={.8} />
      <Gloss cx={20} cy={54} rx={7} ry={2.4} rot={-8} o={.6} />
    </g>
  },

  '🚁': ({ c = 'orange' }) => {
    const BODY = 'M30 40c6-6 18-8 30-7 14 1 24 10 26 22 1 10-6 17-16 17H38c-10 0-16-6-16-15 0-7 3-13 8-17Z'
    return <g>
      <rect x="50" y="22" width="7" height="12" rx="2" fill="url(#v-gray)" />
      <rect x="8" y="18" width="88" height="5.5" rx="2.75" fill="url(#v-dark)" />
      <S d="M30 47 9 43c-2 0-3 2-2 4l2 4 22 5Z" h={c} />
      <S d="M11 46 6 32c0-2 2-2 3-1l7 15Z" h={c} />
      <path d="M2 38h16M10 30v16" stroke={base('dark')} strokeWidth="2.6" strokeLinecap="round" />
      <S d={BODY} h={c} /><AO d={BODY} />
      <path d="M62 36c11 2 21 9 23 19H62Z" fill="url(#v-sky)" />
      <path d="M66 50l8 -10" stroke="#fff" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="42" y="40" width="14" height="13" rx="3" fill="url(#v-sky)" />
      <path d="M38 72v11M66 72v11" stroke={base('gray')} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M22 84h58c3 0 5-2 6-4" fill="none" stroke={base('dark')} strokeWidth="4.4" strokeLinecap="round" />
      <Gloss cx={42} cy={37} rx={10} ry={3} rot={-12} />
    </g>
  },

  '🚸': () => <g>
    <path d="M6 84c0-3 2-5 5-5h78c3 0 5 2 5 5v4c0 3-2 5-5 5H11c-3 0-5-2-5-5Z" fill="url(#v-dark)" />
    {[10, 23, 36, 49, 62, 75].map(x => <path key={x} d={`M${x + 3} 80h8l-2 12h-8Z`} fill={base('white')} />)}
    <path d="M44 42c3 8 6 13 10 17" fill="none" stroke={base('skin')} strokeWidth="5" strokeLinecap="round" />
    <path d="M58 64c-2 0-3 0-4-4" fill="none" stroke={base('skin')} strokeWidth="4" strokeLinecap="round" />
    <Kid x={34} y={21} s={1.45} shirt="blue" />
    <Kid x={66} y={53} s={.88} shirt="yellow" />
    <circle cx="54.5" cy="60" r="3.2" fill="url(#v-skin)" />
  </g>,

  '🛣': () => {
    const LAND = 'M8 68c0-24 18-40 42-40s42 16 42 40c0 14-8 22-20 22H28c-12 0-20-8-20-22Z'
    return <g>
      <S d={LAND} h="leaf" /><AO d={LAND} />
      <path d="M26 90 47 29h6l21 61Z" fill="url(#v-gray)" />
      <path d="M26 90 47 29M74 90 53 29" stroke="#fff" strokeWidth="1.6" />
      <path d="M50 33v6M50 46v8M50 62v10M50 80v9" stroke={base('yellow')} strokeWidth="2.4" strokeLinecap="round" />
      <Tree x={22} y={56} /><Tree x={80} y={58} s={1.1} /><Tree x={34} y={38} s={.7} /><Tree x={68} y={39} s={.7} />
      <Gloss cx={28} cy={40} rx={8} ry={3} rot={-35} o={.7} />
    </g>
  },

  '🏫': () => {
    const WALL = 'M10 46h80v40c0 2-2 4-4 4H14c-2 0-4-2-4-4Z'
    return <g>
      <path d="M50 30V7" stroke={base('gray')} strokeWidth="2" strokeLinecap="round" />
      <path d="M51 7h17v11H51Z" fill="url(#v-red)" />
      <path d="M59.5 9.5l1.2 2.6 2.7.2-2.1 1.8.7 2.7-2.5-1.5-2.5 1.5.7-2.7-2.1-1.8 2.7-.2Z" fill={base('yellow')} />
      <S d={WALL} h="yellow" /><AO d={WALL} />
      <S d="M5 48l10-13h70l10 13c1 1 0 2-1 2H6c-1 0-2-1-1-2Z" h="red" />
      <S d="M34 44h32v46H34Z" h="cream" />
      <S d="M32 44 50 26l18 18Z" h="red" />
      <circle cx="50" cy="52" r="5" fill="url(#v-white)" />
      <path d="M50 49v3h2.5" stroke={base('dark')} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <S d="M41 68c0-4 4-7 9-7s9 3 9 7v22H41Z" h="wood" />
      <path d="M50 62v28" stroke={dark('wood')} strokeWidth="1.2" />
      {[14, 23, 70, 79].map(x => [56, 72].map(y => <rect key={`${x}${y}`} x={x} y={y} width="7" height="9" rx="1.5" fill="url(#v-sky)" />))}
      <Gloss cx={24} cy={39} rx={10} ry={2} rot={-6} o={.8} />
    </g>
  },

  /* Văn Miếu: the Khuê Văn Các pavilion (round sun window, two curved roofs, four brick pillars). */
  '🏛': () => {
    const ROOF1 = 'M8 26c7 2 13-1 18-8h48c5 7 11 10 18 8-2 5-7 8-12 8H20c-5 0-10-3-12-8Z'
    const ROOF2 = 'M4 54c7 2 13-1 18-7h56c5 6 11 9 18 7-2 5-7 8-12 8H16c-5 0-10-3-12-8Z'
    return <g>
      {[13, 31, 61, 79].map(x => <g key={x}>
        <S d={`M${x} 60h9v28h-9Z`} h="cream" />
        <rect x={x - 1.5} y="86" width="12" height="4" rx="1" fill="url(#v-gray)" />
      </g>)}
      <path d="M12 66h76" stroke={base('wood')} strokeWidth="2.4" />
      <S d={ROOF2} h="hair" /><AO d={ROOF2} />
      <S d="M28 32h44v16H28Z" h="red" />
      <circle cx="50" cy="40" r="7.2" fill="url(#v-yellow)" />
      {[0, 30, 60, 90, 120, 150].map(a => <path key={a} d="M43 40h14" transform={`rotate(${a} 50 40)`} stroke={dark('red')} strokeWidth="1.3" />)}
      <circle cx="50" cy="40" r="2" fill={dark('red')} />
      <S d={ROOF1} h="hair" /><AO d={ROOF1} />
      <path d="M24 16c2 2 4 3 6 3h40c2 0 4-1 6-3" fill="none" stroke={base('hair')} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M10 53q-3 -3 -2 -7M90 53q3 -3 2 -7M14 25q-3 -3 -2 -7M86 25q3 -3 2 -7" fill="none" stroke={base('hair')} strokeWidth="2.6" strokeLinecap="round" />
      <Gloss cx={34} cy={22} rx={12} ry={2} rot={-8} o={.6} />
      <Gloss cx={28} cy={50} rx={12} ry={2} rot={-8} o={.6} />
    </g>
  },

  /* Chùa Một Cột: small pagoda on one pillar in a lotus pond. */
  '🛕': () => {
    const ROOF = 'M10 40c8 3 15-2 19-11h42c4 9 11 14 19 11-2 6-8 9-15 9H25c-7 0-13-3-15-9Z'
    const POND = 'M6 82c0-6 18-10 44-10s44 4 44 10-18 10-44 10S6 88 6 82Z'
    return <g>
      <S d={POND} h="blue" />
      <ellipse cx="50" cy="80" rx="34" ry="5" fill={light('blue')} opacity=".45" />
      <S d="M44 58h12v24c0 2-3 3-6 3s-6-1-6-3Z" h="gray" />
      <path d="M44 62 30 56M56 62l14-6M47 60l-8-4M53 60l8-4" stroke={base('wood')} strokeWidth="2.8" strokeLinecap="round" />
      <S d="M24 53h52v5H24Z" h="wood" />
      <S d="M31 42h38v12H31Z" h="red" />
      {[36, 46, 56].map(x => <rect key={x} x={x} y="44" width="8" height="8.5" rx="1" fill={light('wood')} opacity=".85" />)}
      <S d={ROOF} h="hair" /><AO d={ROOF} />
      <path d="M12 39q-4 -3 -3 -8M88 39q4 -3 3 -8" fill="none" stroke={base('hair')} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M31 28h38" stroke={base('hair')} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="50" cy="23" r="3.6" fill="url(#v-yellow)" />
      <ellipse cx="20" cy="84" rx="7" ry="3" fill={base('leaf')} />
      <ellipse cx="80" cy="85" rx="7" ry="3" fill={base('leaf')} />
      <path d="M76 82c0-5 2-8 4-9 2 1 4 4 4 9Z" fill="url(#v-pink)" />
      <path d="M16 81c0-5 2-8 4-9 2 1 4 4 4 9Z" fill="url(#v-pink)" />
      <Gloss cx={30} cy={35} rx={10} ry={2.4} rot={-20} o={.6} />
    </g>
  },

  /* Cầu Long Biên: the old steel truss bridge over the Red River. */
  '🌉': () => {
    const spans: [number, number][] = [[7, 36], [36, 64], [64, 93]]
    const yb = 60, yc = 10
    return <g>
      <S d="M6 84q8-5 16 0t16 0 16 0 16 0 16 0 8-2v8H6Z" h="blue" edge={false} />
      {[36, 64].map(x => <g key={x}><S d={`M${x - 5} 63h10l2 24H${x - 7}Z`} h="gray" /></g>)}
      {spans.map(([x0, x1]) => {
        const n = 6, pts = Array.from({ length: n + 1 }, (_, i) => {
          const t = i / n
          return [x0 + (x1 - x0) * t, yb + 2 * t * (1 - t) * (yc - yb)]
        })
        const lat = pts.map(([x, y], i) => `M${x} ${yb}V${y}` + (i < n ? (i < n / 2 ? `M${x} ${yb}L${pts[i + 1][0]} ${pts[i + 1][1]}` : `M${x} ${y}L${pts[i + 1][0]} ${yb}`) : '')).join('')
        return <g key={x0}>
          <path d={lat} stroke={base('dark')} strokeWidth="2" strokeLinecap="round" />
          <path d={`M${x0} ${yb}Q${(x0 + x1) / 2} ${yc} ${x1} ${yb}`} fill="none" stroke={dark('dark')} strokeWidth="4.6" strokeLinecap="round" />
          <path d={`M${x0 + 3} ${yb - 4}Q${(x0 + x1) / 2} ${yc + 2} ${x1 - 6} ${yb - 9}`} fill="none" stroke={light('dark')} strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        </g>
      })}
      <S d="M5 58h90c1 0 2 1 2 2v3c0 1-1 2-2 2H5c-1 0-2-1-2-2v-3c0-1 1-2 2-2Z" h="brown" />
      <Gloss cx={22} cy={58.5} rx={12} ry={1} rot={0} o={.7} />
    </g>
  },

  '🏞': () => {
    const LAND = 'M8 70c0-20 18-34 42-34s42 14 42 34c0 13-8 20-20 20H28c-12 0-20-7-20-20Z'
    return <g>
      <S d="M14 56 36 18l26 38Z" h="teal" />
      <S d="M44 56l24-30 22 30Z" h="green" />
      <path d="M30 28l6-10 6 9-6 3Z" fill="#fff" opacity=".9" />
      <S d={LAND} h="leaf" /><AO d={LAND} />
      <path d="M48 37c8 3 10 8 4 13-7 6-16 12-12 40h12c-4-22 4-27 10-32 6-6 3-16-14-21Z" fill="url(#v-blue)" />
      <path d="M51 42c4 2 5 5 2 8" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
      <Tree x={22} y={62} s={1.3} /><Tree x={80} y={62} s={1.1} /><Tree x={32} y={78} s={.9} />
      <Gloss cx={24} cy={50} rx={7} ry={2.6} rot={-30} o={.7} />
    </g>
  },

  '🌄': () => <g>
    {[...Array(9)].map((_, i) => {
      const a = (-180 + i * 22.5) * Math.PI / 180
      return <path key={i} d={`M${50 + 30 * Math.cos(a)} ${54 + 30 * Math.sin(a)}L${50 + 40 * Math.cos(a)} ${54 + 40 * Math.sin(a)}`} stroke={base('orange')} strokeWidth="4.5" strokeLinecap="round" />
    })}
    <O cx={50} cy={54} r={25} h="yellow" />
    <Eyes x={50} y={46} gap={16} r={4.6} />
    <Mouth x={50} y={55} w={8} />
    <Blush x={50} y={53} gap={28} r={4} />
    <Gloss cx={38} cy={36} rx={7} ry={3.5} />
    <S d="M4 90 30 56l14 16 12-14 40 32Z" h="green" />
    <S d="M40 90l24-26 30 26Z" h="leaf" />
    <Gloss cx={24} cy={66} rx={6} ry={2.4} rot={-50} o={.6} />
  </g>,

  '🚪': () => {
    const DOOR = 'M31 17h38v71H31Z'
    return <g>
      <S d="M27 8h46c3 0 5 2 5 5v75H22V13c0-3 2-5 5-5Z" h="brown" />
      <S d={DOOR} h="wood" /><AO d={DOOR} />
      <rect x="36" y="23" width="28" height="24" rx="3" fill={dark('wood')} opacity=".3" />
      <rect x="36" y="54" width="28" height="28" rx="3" fill={dark('wood')} opacity=".3" />
      <rect x="37" y="24" width="26" height="22" rx="3" fill={light('wood')} opacity=".35" />
      <O cx={63} cy={52} r={3.6} h="yellow" />
      <rect x="16" y="86" width="68" height="6" rx="3" fill="url(#v-gray)" />
      <Gloss cx={38} cy={28} rx={4} ry={10} rot={0} o={.6} />
    </g>
  },

  '🧱': () => {
    const brick = (x: number, y: number) => {
      const d = `M${x + 3} ${y}h22c2 0 3 1 3 3v9c0 2-1 3-3 3H${x + 3}c-2 0-3-1-3-3v-9c0-2 1-3 3-3Z`
      return <g key={`${x}${y}`}>
        <S d={d} h="red" /><AO d={d} />
        <path d={`M${x + 4} ${y + 2.5}h18`} stroke={light('red')} strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
        <Gloss cx={x + 7} cy={y + 4.5} rx={4} ry={1.6} rot={-8} o={.6} />
      </g>
    }
    return <g>
      {[[7, 74], [36, 74], [65, 74], [21.5, 58], [50.5, 58], [36, 42]].map(([x, y]) => brick(x, y))}
      <g transform="rotate(-14 44 30)">{brick(30, 22)}</g>
    </g>
  },

  '🛏': ({ c = 'blue' }) => {
    const BLANKET = 'M40 50h43c3 0 5 2 5 5v17H40Z'
    return <g>
      <S d="M8 30c0-5 3-8 8-8h2c5 0 8 3 8 8v60H8Z" h="wood" />
      <S d="M80 50c0-3 2-5 5-5h2c3 0 5 2 5 5v40H80Z" h="wood" />
      <S d="M24 56h58v17H24Z" h="white" />
      <S d={BLANKET} h={c} /><AO d={BLANKET} />
      <path d="M40 54h44" stroke={light(c)} strokeWidth="3" strokeLinecap="round" />
      <O cx={36} cy={50} rx={14} ry={8} h="white" />
      <Gloss cx={31} cy={46} rx={6} ry={2.4} rot={-10} />
      <rect x="22" y="72" width="62" height="8" rx="2" fill="url(#v-brown)" />
      <Gloss cx={14} cy={34} rx={2.4} ry={8} rot={0} o={.6} />
    </g>
  },

  '🪑': () => <g>
    <S d="M60 58h6v28h-6Z" h="brown" /><S d="M32 58h6v26h-6Z" h="brown" />
    <S d="M28 14h6v40h-6ZM64 14h6v40h-6Z" h="brown" />
    <S d="M26 13c0-3 2-5 5-5h36c3 0 5 2 5 5v9H26Z" h="wood" />
    <S d="M31 33h36v6H31Z" h="wood" />
    <S d="M20 54c0-2 2-4 4-4h52c2 0 4 2 4 4v6c0 2-2 3-4 3H24c-2 0-4-1-4-3Z" h="wood" />
    <S d="M22 62h7v28h-7ZM71 62h7v28h-7Z" h="wood" />
    <Gloss cx={34} cy={13} rx={8} ry={2} rot={0} />
    <Gloss cx={34} cy={53} rx={10} ry={1.6} rot={0} o={.8} />
  </g>,

  '🗑': ({ c = 'green' }) => {
    const BIN = 'M22 34h56l-6 52c0 3-2 5-5 5H33c-3 0-5-2-5-5Z'
    return <g>
      <S d={BIN} h={c} /><AO d={BIN} />
      {[38, 50, 62].map(x => <path key={x} d={`M${x} 42v40`} stroke={dark(c)} strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />)}
      <S d="M42 20c0-3 2-5 5-5h6c3 0 5 2 5 5v4h-4v-3h-8v3h-4Z" h="dark" />
      <S d="M15 29c0-3 2-5 5-5h60c3 0 5 2 5 5v4c0 2-2 3-4 3H19c-2 0-4-1-4-3Z" h={c} />
      <Gloss cx={30} cy={28} rx={10} ry={1.8} rot={0} />
      <Gloss cx={30} cy={50} rx={2.4} ry={10} rot={4} o={.6} />
    </g>
  },

  '♻': ({ c = 'blue' }) => {
    const BIN = 'M20 36h60l-6 50c0 3-2 5-5 5H31c-3 0-5-2-5-5Z'
    return <g>
      <S d="M44 36l1-20c0-2 2-3 4-3h3c2 0 3 1 4 3l1 20Z" h="sky" />
      <rect x="45" y="9" width="10" height="5" rx="2" fill="url(#v-green)" />
      <S d={BIN} h={c} /><AO d={BIN} />
      <S d="M15 32c0-3 2-5 5-5h60c3 0 5 2 5 5v3c0 2-2 3-4 3H19c-2 0-4-1-4-3Z" h={c} />
      <g transform="translate(50 62)">
        {[0, 120, 240].map(a => <g key={a} transform={`rotate(${a})`}>
          <path d="M-2.5 -13.5 4.6 -1.4" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <path d="M1.4 4.6 12.6 3.2 7.8 -6.8Z" fill="#fff" />
        </g>)}
      </g>
      <Gloss cx={30} cy={31} rx={10} ry={1.8} rot={0} />
      <Gloss cx={28} cy={52} rx={2.4} ry={10} rot={4} o={.6} />
    </g>
  },

  '🚮': () => <g>
    <path d="M38 48c6 2 12 4 18 4" fill="none" stroke={base('skin')} strokeWidth="5" strokeLinecap="round" />
    <Kid x={28} y={36} s={1.4} shirt="red" />
    <O cx={62} cy={58} r={5.5} h="white" />
    <path d="M59 56l4 2-2 3M63 55l2 4" fill="none" stroke={base('gray')} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M70 52l4-3M71 58h5M69 64l4 3" stroke={base('gray')} strokeWidth="2" strokeLinecap="round" />
    <g transform="translate(56 76) scale(1.5) translate(-58 -80)"><path d="M58 88c2-6 6-8 10-8 3 0 4 2 2 3-3 1-5 3-6 5 3-3 8-4 11-2 2 1 1 2-1 2-4 0-7 1-9 2Z" fill="url(#v-yellow)" /></g>
    <g transform="rotate(-80 84 84)"><S d="M78 76h12v16H78Z" h="red" /><rect x="78" y="80" width="12" height="4" fill={base('white')} /></g>
  </g>,

  '📦': () => {
    const FRONT = 'M10 44h52v44H10Z', SIDE = 'M62 44l24-12v44L62 88Z'
    return <g>
      <S d="M10 44l24-12h52L62 44Z" h="wood" />
      <S d={SIDE} h="brown" />
      <S d={FRONT} h="wood" /><AO d={FRONT} />
      <path d="M30 44l24-12h8L38 44Z" fill={light('cream')} opacity=".85" />
      <path d="M30 44h8v12h-8Z" fill={light('cream')} opacity=".85" />
      <path d="M48 37l14-7" stroke={dark('wood')} strokeWidth="1" opacity=".6" />
      <path d="M18 72h10M18 78h16" stroke={dark('wood')} strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <Gloss cx={22} cy={52} rx={8} ry={2.4} rot={-8} o={.7} />
    </g>
  },

  /* Used for "Lan can" (balcony railing). */
  '🪜': () => <g>
    <S d="M6 80h88v6c0 2-2 4-4 4H10c-2 0-4-2-4-4Z" h="gray" />
    {[25, 37, 49, 61, 73].map(x => <g key={x}>
      <rect x={x - 2.5} y="34" width="5" height="46" rx="2.5" fill="url(#v-white)" />
      <circle cx={x} cy="57" r="4" fill="url(#v-white)" />
    </g>)}
    <S d="M10 28h8v52h-8ZM82 28h8v52h-8Z" h="wood" />
    <S d="M14 70h72v4H14Z" h="wood" />
    <S d="M6 27c0-3 2-5 5-5h78c3 0 5 2 5 5v3c0 3-2 5-5 5H11c-3 0-5-2-5-5Z" h="wood" />
    <Gloss cx={30} cy={25} rx={16} ry={1.8} rot={0} />
  </g>,

  '🪣': ({ c = 'red' }) => {
    const BUCKET = 'M16 42h68l-8 42c-1 4-3 6-7 6H31c-4 0-6-2-7-6Z'
    return <g>
      <path d="M17 42C17 14 83 14 83 42" fill="none" stroke={base('gray')} strokeWidth="3" strokeLinecap="round" />
      <S d={BUCKET} h={c} /><AO d={BUCKET} />
      <path d="M21 62h58" stroke={dark(c)} strokeOpacity=".4" strokeWidth="2" />
      <ellipse cx="50" cy="42" rx="35" ry="8" fill={v(c)} />
      <ellipse cx="50" cy="42.5" rx="30.5" ry="5.6" fill="url(#v-blue)" />
      <ellipse cx="42" cy="41.5" rx="12" ry="2" fill={light('blue')} opacity=".8" />
      <path d="M58 30c3 4 4 6 2 8-2 1-4 0-4-2 0-2 1-3 2-6Z" fill="url(#v-blue)" />
      <Gloss cx={28} cy={56} rx={3} ry={10} rot={8} o={.7} />
    </g>
  },

  '🧯': () => {
    const TANK = 'M32 36c0-6 7-10 18-10s18 4 18 10v50c0 3-2 5-5 5H37c-3 0-5-2-5-5Z'
    return <g>
      <path d="M44 22C24 22 22 40 22 58" fill="none" stroke={base('black')} strokeWidth="4.5" strokeLinecap="round" />
      <S d="M18 56h8l2 12h-12Z" h="dark" />
      <S d={TANK} h="red" /><AO d={TANK} />
      <S d="M43 16h14v12H43Z" h="dark" />
      <S d="M50 15l22-6c2 0 3 2 1 3L56 19Z" h="gray" />
      <S d="M50 18l18 2c2 0 2 3 0 3l-18 0Z" h="gray" />
      <rect x="36" y="48" width="28" height="22" rx="3" fill={base('white')} />
      <path d="M50 52c2 4 6 6 6 10s-3 5-6 5-6-2-6-5c0-3 2-4 3-6 1 2 1 3 1 4 1-2 2-5 2-8Z" fill={base('orange')} />
      <Gloss cx={38} cy={40} rx={3} ry={10} rot={6} />
    </g>
  },

  '🔥': () => {
    const FLAME = 'M50 6c4 14 22 22 24 42 2 18-10 32-24 32S24 66 26 50c1-10 8-14 10-22 4 6 4 10 3 14 6-6 9-20 11-36Z'
    const CORE = 'M50 38c3 8 13 13 13 26 0 9-6 15-13 15s-13-6-13-15c0-6 4-10 6-15 2 4 3 6 3 9 3-4 5-11 4-20Z'
    return <g>
      <S d="M14 78c-2 4 0 8 4 8l64 0c4 0 6-4 4-8Z" h="brown" transform="rotate(10 50 82)" />
      <S d="M14 78c-2 4 0 8 4 8l64 0c4 0 6-4 4-8Z" h="brown" transform="rotate(-10 50 82)" />
      <S d={FLAME} h="orange" edge={false} />
      <path d={FLAME} fill={base('red')} opacity=".18" />
      <S d={CORE} h="yellow" edge={false} />
      <Gloss cx={42} cy={30} rx={5} ry={9} rot={-20} o={.6} />
    </g>
  },

  /* Phích nước nóng: a Vietnamese hot-water flask, steaming. */
  '♨': ({ c = 'red' }) => {
    const BODY = 'M33 38c0-4 3-7 7-7h18c4 0 7 3 7 7v46c0 4-3 6-7 6H40c-4 0-7-2-7-6Z'
    return <g>
      <path d="M41 16c-4-4 4-6 0-10M49 15c-4-4 4-6 0-10M57 16c-4-4 4-6 0-10" fill="none" stroke={base('gray')} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M65 40c8 0 9 4 9 10s-1 10-9 10" fill="none" stroke={base('gray')} strokeWidth="4.5" strokeLinecap="round" />
      <S d={BODY} h={c} /><AO d={BODY} />
      <S d="M39 26h20c2 0 4 2 4 4v4H35v-4c0-2 2-4 4-4Z" h="gray" />
      <S d="M42 19h14v8H42Z" h="dark" />
      <rect x="33" y="80" width="32" height="7" rx="2" fill="url(#v-gray)" />
      {[[43, 50], [55, 62], [44, 72]].map(([x, y]) => <g key={x + y}>
        {[0, 72, 144, 216, 288].map(a => <circle key={a} cx={x} cy={y - 3} r="2.4" fill={light('pink')} transform={`rotate(${a} ${x} ${y})`} />)}
        <circle cx={x} cy={y} r="1.6" fill={base('yellow')} />
      </g>)}
      <Gloss cx={38} cy={52} rx={2.4} ry={12} rot={0} />
    </g>
  },

  '💡': () => {
    const BULB = 'M50 8c-17 0-28 12-28 27 0 10 5 16 10 22 3 4 4 7 4 11h28c0-4 1-7 4-11 5-6 10-12 10-22 0-15-11-27-28-27Z'
    return <g>
      {[[12, 34, 4, 34], [14, 16, 8, 10], [86, 16, 92, 10], [88, 34, 96, 34]].map(([x1, y1, x2, y2]) =>
        <path key={x1 + y1} d={`M${x1} ${y1}L${x2} ${y2}`} stroke={base('yellow')} strokeWidth="4" strokeLinecap="round" />)}
      <S d={BULB} h="yellow" /><AO d={BULB} />
      <path d="M43 66V50l-4-8M57 66V50l4-8M39 42q3 4 5.5 0t5.5 0 5.5 0 5.5 0" fill="none" stroke={base('orange')} strokeWidth="2" strokeLinecap="round" />
      <S d="M35 68h30v6c0 2-1 3-3 3H38c-2 0-3-1-3-3Z" h="gray" />
      <S d="M36 77h28v5c0 2-1 3-3 3H39c-2 0-3-1-3-3Z" h="gray" />
      <S d="M42 85h16l-3 5h-10Z" h="dark" />
      <Gloss cx={36} cy={24} rx={9} ry={5} rot={-45} />
    </g>
  },

  /* "để sáng mãi": a desk lamp left switched on. */
  '🔆': ({ c = 'teal' }) => <g>
    <path d="M58 46 84 88H30Z" fill={base('yellow')} opacity=".45" />
    <path d="M58 46 72 88H44Z" fill={light('yellow')} opacity=".7" />
    <O cx={24} cy={86} rx={16} ry={5} h="gray" />
    <path d="M24 84 34 52 56 30" fill="none" stroke={base('gray')} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <O cx={34} cy={52} r={4} h="gray" />
    <S d="M50 22c6-6 18-6 24 2 4 5 4 12 0 18l-28-6c-2-5-1-10 4-14Z" h={c} />
    <O cx={60} cy={42} rx={9} ry={6} h="yellow" transform="rotate(12 60 42)" />
    <Gloss cx={56} cy={23} rx={6} ry={2.6} rot={-15} />
  </g>,

  /* Vòi nước: a tap with running water. */
  '🚰': () => {
    const PIPE = 'M16 30h44c10 0 16 6 16 16v6H64v-4c0-3-2-6-5-6H16Z'
    return <g>
      <O cx={12} cy={36} rx={6} ry={12} h="gray" />
      <S d={PIPE} h="gray" /><AO d={PIPE} />
      <S d="M62 52h16v5H62Z" h="gray" />
      <S d="M36 20h8v10h-8Z" h="gray" />
      <S d="M26 16c0-3 2-4 4-4h20c2 0 4 1 4 4s-2 4-4 4H30c-2 0-4-1-4-4Z" h="blue" />
      <path d="M64 58h12c0 10-1 20-2 28h-8c-1-8-2-18-2-28Z" fill="url(#v-blue)" opacity=".9" />
      <path d="M68 62v20" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="70" cy="88" rx="18" ry="4" fill={base('blue')} opacity=".5" />
      <path d="M52 82c2 3 3 5 1.5 6.5s-4 .5-4-1.5c0-1 1-2 2.5-5ZM88 78c2 3 3 5 1.5 6.5s-4 .5-4-1.5c0-1 1-2 2.5-5Z" fill="url(#v-blue)" />
      <Gloss cx={34} cy={33} rx={12} ry={1.8} rot={0} />
    </g>
  },

  '🚿': () => <g>
    <path d="M20 90V30c0-8 5-12 12-12h24" fill="none" stroke={dark('gray')} strokeWidth="7" strokeLinecap="round" />
    <path d="M20 90V30c0-8 5-12 12-12h24" fill="none" stroke={base('gray')} strokeWidth="4.5" strokeLinecap="round" />
    <O cx={20} cy={64} r={6} h="red" />
    <S d="M54 12h8v8h-8Z" h="gray" />
    <S d="M48 26c2-6 7-8 10-8s8 2 10 8l6 6H42Z" h="gray" />
    <O cx={58} cy={33} rx={17} ry={4} h="gray" />
    {[44, 51, 58, 65, 72].map((x, i) => <path key={x} d={`M${x} 40l${(i - 2) * 4} 40`} stroke={base('blue')} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="7 6" strokeDashoffset={i * 3} />)}
    <Gloss cx={52} cy={24} rx={4} ry={2} rot={-20} />
  </g>,

  '⏰': ({ c = 'red' }) => <g>
    <path d="M30 76 22 90M70 76l8 14" stroke={base('dark')} strokeWidth="5" strokeLinecap="round" />
    <path d="M28 22 50 14 72 22" fill="none" stroke={base('dark')} strokeWidth="3.4" strokeLinecap="round" />
    <O cx={25} cy={26} rx={12} ry={10} h="yellow" transform="rotate(-35 25 26)" />
    <O cx={75} cy={26} rx={12} ry={10} h="yellow" transform="rotate(35 75 26)" />
    <O cx={50} cy={56} r={32} h={c} />
    <O cx={50} cy={56} r={25} h="white" />
    {[0, 90, 180, 270].map(a => <rect key={a} x="48.6" y="34" width="2.8" height="6" rx="1.4" fill={base('dark')} transform={`rotate(${a} 50 56)`} />)}
    <path d="M50 56V41M50 56l10 6" stroke={base('black')} strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="50" cy="56" r="2.6" fill={base('red')} />
    <Gloss cx={32} cy={36} rx={8} ry={4} rot={-45} />
  </g>,

  '⏳': () => {
    const GLASS = 'M28 18h44c0 18-16 24-16 32s16 14 16 32H28c0-18 16-24 16-32S28 36 28 18Z'
    return <g>
      <path d={GLASS} fill="url(#v-sky)" opacity=".85" />
      <path d="M34 32h32c-3 8-12 12-16 17-4-5-13-9-16-17Z" fill="url(#v-yellow)" />
      <path d="M50 49v26" stroke={base('yellow')} strokeWidth="1.8" />
      <path d="M31 82c3-9 12-14 19-14s16 5 19 14Z" fill="url(#v-yellow)" />
      <path d="M33 22c1 8 6 12 9 16" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 18v64M76 18v64" stroke={base('wood')} strokeWidth="4" strokeLinecap="round" />
      <S d="M18 12c0-2 2-4 4-4h56c2 0 4 2 4 4v4c0 2-2 3-4 3H22c-2 0-4-1-4-3Z" h="wood" />
      <S d="M18 84c0-2 2-3 4-3h56c2 0 4 1 4 3v4c0 2-2 4-4 4H22c-2 0-4-2-4-4Z" h="wood" />
      <Gloss cx={32} cy={11} rx={8} ry={1.6} rot={0} />
    </g>
  },

  '📞': ({ c = 'red' }) => {
    const BASE = 'M22 56c2-10 12-15 28-15s26 5 28 15l5 24c1 5-3 9-8 9H25c-5 0-9-4-8-9Z'
    const HAND = 'M10 34c0-11 18-18 40-18s40 7 40 18c0 4-3 7-7 7H72c-4 0-6-3-6-6v-3c-5-2-10-3-16-3s-11 1-16 3v3c0 3-2 6-6 6H17c-4 0-7-3-7-7Z'
    return <g>
      <S d={BASE} h={c} /><AO d={BASE} />
      <rect x="35" y="52" width="30" height="28" rx="5" fill="url(#v-white)" />
      {[0, 1, 2].map(r => [0, 1, 2].map(k => <circle key={`${r}${k}`} cx={42 + k * 8} cy={59 + r * 7} r="2.4" fill={base('dark')} />))}
      <S d={HAND} h={c} /><AO d={HAND} />
      <Gloss cx={30} cy={22} rx={10} ry={3} rot={-12} />
      <Gloss cx={28} cy={60} rx={2.4} ry={7} rot={20} o={.6} />
    </g>
  },
}
