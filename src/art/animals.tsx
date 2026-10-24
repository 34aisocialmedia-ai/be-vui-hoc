/* Animals: cute film characters (big head, big shiny eyes, whole body, front view when sitting).
 * Every animal takes `baby` (smaller, bigger eyes) so games can pair "mẹ / con". */
import { AO, Blush, Eye, Eyes, Gloss, L, Mouth, O, S, Smile, babyWrap, base, dark, light, v, type Draw, type Hue } from './kit'

/** Mirror an absolute path (pairs of x y only) across x = 50. */
const mx = (d: string) => { let i = 0; return d.replace(/-?\d*\.?\d+/g, n => (i++ % 2 ? n : String(Math.round((100 - parseFloat(n)) * 100) / 100))) }
/** Baby eyes are bigger. */
const big = (baby: boolean | undefined, r: number) => (baby ? r * 1.18 : r)
/** A thick lit stroke (tails, trunks, tentacles). */
const Tail = ({ d, h, w = 8 }: { d: string; h: Hue; w?: number }) =>
  <path d={d} fill="none" stroke={v(h)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
/** Shiny animal nose. */
const Nose = ({ x = 50, y = 50, w = 5, h = 'black' }: { x?: number; y?: number; w?: number; h?: Hue }) => <g>
  <ellipse cx={x} cy={y} rx={w} ry={w * .72} fill={base(h)} />
  <ellipse cx={x - w * .3} cy={y - w * .28} rx={w * .38} ry={w * .2} fill="#fff" opacity=".75" />
</g>
/** "w" shaped cat/dog mouth. */
const WMouth = ({ x = 50, y = 55, w = 5 }: { x?: number; y?: number; w?: number }) =>
  <path d={`M${x - w} ${y}q${w / 2} ${w * .5} ${w} 0q${w / 2} ${w * .5} ${w} 0`} fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
const Whiskers = ({ y = 50, x1 = 18, x2 = 30 }: { y?: number; x1?: number; x2?: number }) =>
  <path d={`M${x1} ${y}H${x2}M${x1 + 1} ${y + 6}L${x2} ${y + 3}M${100 - x1} ${y}H${100 - x2}M${99 - x1} ${y + 6}L${100 - x2} ${y + 3}`} stroke="#3a1f2a" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
const Paws = ({ h, y = 88, gap = 22, rx = 8 }: { h: Hue; y?: number; gap?: number; rx?: number }) =>
  <g><O cx={50 - gap / 2} cy={y} rx={rx} ry={4.6} h={h} /><O cx={50 + gap / 2} cy={y} rx={rx} ry={4.6} h={h} /></g>
const Leg = ({ x, y = 64, w = 7, h, hoof = 'hair' }: { x: number; y?: number; w?: number; h: Hue; hoof?: Hue }) => <g>
  <rect x={x} y={y} width={w} height={88 - y} rx={w / 2} fill={v(h)} stroke={dark(h)} strokeOpacity=".35" strokeWidth="1.2" />
  <rect x={x - .5} y={85} width={w + 1} height={5} rx={2} fill={v(hoof)} />
</g>

const SIT = 'M29 89C26 72 34 58 50 58C66 58 74 72 71 89Z'
const BELLY = 'M40 89C40 80 44 73 50 73C56 73 60 80 60 89Z'

export const ANIMALS: Record<string, Draw> = {
  /* Fish: side view facing left, fan tail, two big eyes. "Chú cá xanh" gives c. */
  '🐟': ({ c = 'orange', baby }) => {
    const BODY = 'M12 50C12 36 26 26 44 26C62 26 76 38 76 50C76 62 62 74 44 74C26 74 12 64 12 50Z'
    return babyWrap(baby, <g>
      <S d="M70 50C76 40 84 32 92 30C91 40 88 45 86 50C88 55 91 60 92 70C84 68 76 60 70 50Z" h={c} />
      <S d="M34 29C40 18 54 15 64 24C56 26 50 28 46 32Z" h={c} />
      <S d="M40 71C44 80 52 82 58 78C54 74 50 72 46 70Z" h={c} />
      <S d={BODY} h={c} /><AO d={BODY} />
      <path d="M56 32C62 40 62 60 56 68M66 37C70 44 70 56 66 63" fill="none" stroke={dark(c)} strokeOpacity=".35" strokeWidth="2.2" strokeLinecap="round" />
      <S d="M44 54C52 52 60 56 60 64C52 66 46 62 44 54Z" h={c} />
      <Eyes x={30} y={45} gap={15} r={big(baby, 6.2)} />
      <Mouth x={20} y={57} w={7} />
      <Blush x={28} y={56} gap={22} r={4} />
      <Gloss cx={34} cy={33} rx={10} ry={4} rot={-15} o={.8} />
    </g>)
  },

  '🐶': ({ c = 'wood', baby }) => {
    const EAR = 'M33 21C22 19 14 28 13 42C12 51 15 57 20 57C25 57 27 51 28 43C29 35 30 27 33 21Z'
    return babyWrap(baby, <g>
      <Tail d="M68 80C80 80 86 70 84 60" h={c} />
      <S d={SIT} h={c} /><S d={BELLY} h="cream" edge={false} />
      <Paws h={c} />
      <O cx={50} cy={42} rx={29} ry={25} h={c} />
      <ellipse cx="62" cy="37" rx="9" ry="8" fill={base('brown')} opacity=".55" />
      <S d={EAR} h="brown" /><S d={mx(EAR)} h="brown" />
      <O cx={50} cy={54} rx={13} ry={9} h="cream" />
      <Eyes x={50} y={39} gap={22} r={big(baby, 6.3)} />
      <Nose y={49} w={5} />
      <path d="M47.5 55C47.5 61.5 52.5 61.5 52.5 55Z" fill={base('pink')} />
      <WMouth y={54} />
      <Blush x={50} y={50} gap={38} r={5} />
      <Gloss cx={36} cy={25} rx={8} ry={4} rot={-25} o={.7} />
    </g>)
  },

  /* Hen: brown, red comb and wattle, tail feathers, front view. */
  '🐔': ({ c = 'wood', baby }) => {
    const BODY = 'M20 64C20 48 34 40 50 40C66 40 80 48 80 64C80 80 66 89 50 89C34 89 20 80 20 64Z'
    const WING = 'M24 58C16 64 16 78 26 84C32 80 34 68 30 58Z'
    return babyWrap(baby, <g>
      {[[-20, 76, 44], [10, 82, 52], [40, 84, 62]].map(([a, x, y]) => <O key={a} cx={x} cy={y} rx={6} ry={14} h="brown" transform={`rotate(${a} ${x} ${y})`} />)}
      <L d="M38 86L36 91M42 86L42 91M58 86L58 91M62 86L64 91" w={3} h="orange" />
      <S d={BODY} h={c} /><AO d={BODY} />
      <S d={WING} h="brown" /><S d={mx(WING)} h="brown" />
      <path d="M40 66Q50 72 60 66M42 74Q50 79 58 74" fill="none" stroke={dark(c)} strokeOpacity=".4" strokeWidth="2" strokeLinecap="round" />
      <O cx={42} cy={16} r={5.5} h="red" /><O cx={50} cy={12} r={6.5} h="red" /><O cx={58} cy={16} r={5.5} h="red" />
      <O cx={50} cy={34} r={19} h={c} />
      <Eyes x={50} y={31} gap={16} r={big(baby, 5.6)} />
      <O cx={50} cy={47} rx={3.6} ry={5} h="red" />
      <path d="M45 39H55L50 45Z" fill={v('orange')} />
      <Blush x={50} y={40} gap={28} r={4} />
      <Gloss cx={42} cy={22} rx={6} ry={3} rot={-25} o={.7} />
      <Gloss cx={32} cy={52} rx={7} ry={3.5} rot={-35} o={.6} />
    </g>)
  },

  '🐘': ({ baby }) => {
    const BODY = 'M24 90C21 70 31 56 50 56C69 56 79 70 76 90Z'
    const LEG = 'M34 72C34 67 47 67 47 72L47 89L34 89Z'
    const TRUNK = 'M44 50C44 62 44 72 50 79C55 84 64 82 66 75C67 71 63 69 61 72C59 75 56 74 55 71C54 64 55 56 56 50Z'
    return babyWrap(baby, <g>
      <S d={BODY} h="gray" /><AO d={BODY} />
      <S d={LEG} h="gray" /><S d={mx(LEG)} h="gray" />
      {[37, 40.5, 44, 56, 59.5, 63].map(x => <ellipse key={x} cx={x} cy="87" rx="1.6" ry="1.3" fill={light('gray')} />)}
      <O cx={22} cy={42} rx={15} ry={20} h="gray" /><O cx={78} cy={42} rx={15} ry={20} h="gray" />
      <ellipse cx="23" cy="43" rx="9.5" ry="14" fill={base('pink')} opacity=".55" />
      <ellipse cx="77" cy="43" rx="9.5" ry="14" fill={base('pink')} opacity=".55" />
      <O cx={50} cy={40} rx={24} ry={22} h="gray" />
      <S d={TRUNK} h="gray" />
      <path d="M45 60Q50 62 55 60M45.5 67Q50.5 69 55 66" fill="none" stroke={dark('gray')} strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" />
      <Eyes x={50} y={36} gap={22} r={big(baby, 6)} />
      <Blush x={50} y={47} gap={34} r={5} />
      <Gloss cx={40} cy={24} rx={8} ry={4} rot={-20} o={.7} />
    </g>)
  },

  '🦁': ({ baby }) => babyWrap(baby, <g>
    <Tail d="M68 84C80 86 86 78 84 68" h="yellow" w={5} />
    <O cx={84} cy={66} r={5} h="orange" />
    <S d={SIT} h="yellow" /><S d={BELLY} h="cream" edge={false} />
    <Paws h="yellow" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6
      return <O key={i} cx={50 + 25 * Math.cos(a)} cy={42 + 24 * Math.sin(a)} r={11} h="orange" />
    })}
    <circle cx="50" cy="42" r="27" fill={v('orange')} />
    <O cx={33} cy={24} r={6.5} h="yellow" /><O cx={67} cy={24} r={6.5} h="yellow" />
    <O cx={50} cy={45} rx={21} ry={19} h="yellow" />
    <O cx={45} cy={55} rx={7} ry={5.5} h="cream" /><O cx={55} cy={55} rx={7} ry={5.5} h="cream" />
    <path d="M45.5 49H54.5L50 53.5Z" fill={base('brown')} />
    <path d="M47 60Q50 62.5 53 60" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
    <Eyes x={50} y={41} gap={17} r={big(baby, 5.8)} />
    <Blush x={50} y={51} gap={32} r={4.5} />
    <Gloss cx={38} cy={32} rx={6} ry={3} rot={-25} o={.7} />
  </g>),

  /* Caterpillar: green segments crawling, big head raised on the right. */
  '🐛': ({ baby }) => babyWrap(baby, <g>
    {[[16, 79, 10], [29, 77, 12], [43, 73, 13.5], [57, 66, 14]].map(([x, y, r]) => <g key={x}>
      <ellipse cx={x} cy={y + r - 1} rx="3" ry="2.2" fill={dark('leaf')} />
      <O cx={x} cy={y} r={r} h="leaf" />
      <circle cx={x} cy={y - r * .35} r={r * .22} fill={base('yellow')} />
      <Gloss cx={x - r * .35} cy={y - r * .45} rx={r * .35} ry={r * .2} o={.7} />
    </g>)}
    <L d="M64 26C62 18 58 14 54 12M76 26C78 18 82 14 86 12" w={2.4} h="dark" />
    <O cx={54} cy={12} r={3} h="red" /><O cx={86} cy={12} r={3} h="red" />
    <O cx={70} cy={42} r={18} h="green" />
    <Eyes x={70} y={39} gap={15} r={big(baby, 6)} />
    <Mouth x={70} y={49} w={7} />
    <Blush x={70} y={47} gap={26} r={4} />
    <Gloss cx={62} cy={30} rx={6} ry={3} rot={-30} o={.8} />
  </g>),

  '🐒': ({ baby }) => {
    const FACE = 'M50 34C44 26 28 28 28 40C28 46 31 49 33 53C36 60 42 64 50 64C58 64 64 60 67 53C69 49 72 46 72 40C72 28 56 26 50 34Z'
    return babyWrap(baby, <g>
      <Tail d="M68 84C84 86 90 72 84 62C80 56 72 58 74 64" h="brown" w={5} />
      <S d={SIT} h="brown" /><S d={BELLY} h="skin" edge={false} />
      <Paws h="skin" />
      <O cx={19} cy={44} r={10} h="brown" /><O cx={81} cy={44} r={10} h="brown" />
      <O cx={19} cy={44} r={6} h="skin" /><O cx={81} cy={44} r={6} h="skin" />
      <O cx={50} cy={42} rx={28} ry={25} h="brown" />
      <S d="M44 19C44 12 52 9 57 13C53 13 51 15 51 19Z" h="brown" />
      <S d={FACE} h="skin" />
      <Eyes x={50} y={41} gap={18} r={big(baby, 6.3)} />
      <circle cx="48" cy="51" r="1.2" fill={base('hair')} /><circle cx="52" cy="51" r="1.2" fill={base('hair')} />
      <Mouth x={50} y={55} w={11} />
      <Blush x={50} y={52} gap={32} r={4.5} />
      <Gloss cx={36} cy={26} rx={7} ry={3.5} rot={-25} o={.7} />
    </g>)
  },

  /* Chick: yellow fluffy ball, tuft, tiny wings, orange beak and feet (also "vịt con"). */
  '🐥': ({ baby }) => babyWrap(baby, <g>
    <L d="M40 84V90M36 91L40 88L44 91M60 84V90M56 91L60 88L64 91" w={2.6} h="orange" />
    <O cx={50} cy={68} rx={25} ry={20} h="yellow" />
    <O cx={27} cy={66} rx={6} ry={10} h="yellow" transform="rotate(25 27 66)" />
    <O cx={73} cy={66} rx={6} ry={10} h="yellow" transform="rotate(-25 73 66)" />
    <S d="M47 20C44 12 48 8 52 10C50 13 50 16 51 20Z" h="yellow" />
    <S d="M50 20C52 13 58 12 60 16C56 16 54 18 53 21Z" h="yellow" />
    <O cx={50} cy={40} r={22} h="yellow" />
    <Eyes x={50} y={37} gap={18} r={big(baby, 6.5)} />
    <path d="M45 46L50 43L55 46L50 50Z" fill={v('orange')} />
    <path d="M45 46H55" stroke={dark('orange')} strokeWidth="1" />
    <Blush x={50} y={46} gap={30} r={4.5} />
    <Gloss cx={40} cy={26} rx={7} ry={3.5} rot={-25} o={.8} />
    <Gloss cx={36} cy={60} rx={6} ry={3} rot={-30} o={.6} />
  </g>),

  /* Giraffe: standing side view, long neck, head turned to us. */
  '🦒': ({ baby }) => {
    const NECK = 'M40 62C36 50 32 38 31 26L45 26C45 38 47 48 52 56Z'
    return babyWrap(baby, <g>
      <L d="M80 58C84 62 86 68 86 74" w={2} h="wood" />
      <O cx={86} cy={76} rx={2.5} ry={3.5} h="hair" />
      <Leg x={66} h="yellow" hoof="brown" /><Leg x={74} h="yellow" hoof="brown" />
      <O cx={61} cy={60} rx={21} ry={12} h="yellow" />
      <Leg x={45} h="yellow" hoof="brown" /><Leg x={54} h="yellow" hoof="brown" />
      <S d={NECK} h="yellow" />
      <path d="M45 27C45 38 47 47 53 54" fill="none" stroke={base('orange')} strokeWidth="3.5" strokeLinecap="round" />
      {[[52, 55, 5, 4], [64, 53, 5, 4], [75, 60, 3.6, 3.2], [60, 65, 4.5, 3.2], [70, 66, 3.5, 2.8], [44, 62, 2.5, 3], [37, 47, 3, 3.5], [39, 38, 2.6, 3], [41, 56, 2.6, 3], [35, 31, 2.4, 2.6]].map(([x, y, rx, ry]) =>
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx={rx} ry={ry} fill={v('brown')} />)}
      <L d="M32 13L30 9M44 13L46 9" w={3} h="wood" />
      <O cx={30} cy={9} r={2.8} h="brown" /><O cx={46} cy={9} r={2.8} h="brown" />
      <O cx={21} cy={20} rx={6.5} ry={3.6} h="yellow" transform="rotate(-20 21 20)" />
      <O cx={55} cy={20} rx={6.5} ry={3.6} h="yellow" transform="rotate(20 55 20)" />
      <O cx={38} cy={24} rx={16} ry={13} h="yellow" />
      <O cx={38} cy={32} rx={11} ry={7} h="wood" />
      <Eyes x={38} y={22} gap={15} r={big(baby, 5.6)} />
      <circle cx="34.5" cy="31" r="1.2" fill={base('hair')} /><circle cx="41.5" cy="31" r="1.2" fill={base('hair')} />
      <Smile x={38} y={34.5} w={6} />
      <Blush x={38} y={29} gap={25} r={3.8} />
      <Gloss cx={31} cy={14} rx={5} ry={2.5} rot={-25} o={.7} />
    </g>)
  },

  '🦋': ({ c = 'purple', baby }) => {
    const UP = 'M47 44C40 26 26 13 15 18C6 23 7 42 20 50C28 55 40 54 47 48Z'
    const LOW = 'M47 52C36 52 24 58 22 68C21 78 30 84 38 80C44 76 47 66 48 56Z'
    return babyWrap(baby, <g>
      <S d={LOW} h="pink" /><S d={mx(LOW)} h="pink" />
      <S d={UP} h={c} /><S d={mx(UP)} h={c} />
      {[[26, 32, 5.5], [17, 40, 3], [34, 68, 4]].map(([x, y, r]) => <g key={x}>
        <circle cx={x} cy={y} r={r} fill={v('yellow')} /><circle cx={100 - x} cy={y} r={r} fill={v('yellow')} />
      </g>)}
      <O cx={50} cy={60} rx={5.5} ry={21} h="dark" />
      <L d="M46 26C42 17 38 13 33 12M54 26C58 17 62 13 67 12" w={2} h="dark" />
      <O cx={33} cy={12} r={2.6} h="dark" /><O cx={67} cy={12} r={2.6} h="dark" />
      <O cx={50} cy={34} r={11} h="dark" />
      <Eyes x={50} y={33} gap={10} r={big(baby, 4)} />
      <path d="M47 39.5Q50 42 53 39.5" fill="none" stroke={base('pink')} strokeWidth="1.6" strokeLinecap="round" />
      <Gloss cx={22} cy={26} rx={6} ry={3} rot={-40} o={.8} />
      <Gloss cx={70} cy={24} rx={5} ry={2.5} rot={30} o={.6} />
    </g>)
  },

  /* Ladybug: red dome, black spots, black head with a face. */
  '🐞': ({ baby }) => {
    const BODY = 'M18 65C18 50 32 41 50 41C68 41 82 50 82 65C82 80 68 89 50 89C32 89 18 80 18 65Z'
    return babyWrap(baby, <g>
      <L d="M22 58L12 54M20 70L10 72M24 82L16 88" w={3} h="black" />
      <L d={mx('M22 58L12 54M20 70L10 72M24 82L16 88')} w={3} h="black" />
      <L d="M43 15C41 11 38 9 35 9M57 15C59 11 62 9 65 9" w={2.2} h="black" />
      <O cx={35} cy={9} r={2.6} h="black" /><O cx={65} cy={9} r={2.6} h="black" />
      <O cx={50} cy={29} rx={20} ry={16} h="black" />
      <S d={BODY} h="red" /><AO d={BODY} />
      <L d="M50 42V89" w={2} h="black" />
      {[[37, 55, 5], [63, 55, 5], [29, 69, 4.5], [71, 69, 4.5], [41, 80, 4], [59, 80, 4]].map(([x, y, r]) =>
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={v('black')} />)}
      <Eyes x={50} y={26} gap={16} r={big(baby, 5.5)} />
      <path d="M46 34Q50 37 54 34" fill="none" stroke={base('pink')} strokeWidth="1.8" strokeLinecap="round" />
      <Gloss cx={34} cy={50} rx={8} ry={4} rot={-30} o={.9} />
      <Gloss cx={42} cy={19} rx={4} ry={2} rot={-20} o={.5} />
    </g>)
  },

  '🐰': ({ baby }) => {
    const EAR = 'M40 34C34 26 30 14 33 8C37 3 44 8 46 18C47 24 47 30 46 34Z'
    const IN = 'M41 30C37 24 35 15 37 11C39 9 42 13 43 19C44 23 44 27 43 30Z'
    return babyWrap(baby, <g>
      <O cx={72} cy={82} r={6} h="white" />
      <S d={SIT} h="white" /><S d={BELLY} h="cream" edge={false} />
      <Paws h="white" rx={9} />
      <S d={EAR} h="white" /><S d={mx(EAR)} h="white" />
      <path d={IN} fill={base('pink')} opacity=".8" /><path d={mx(IN)} fill={base('pink')} opacity=".8" />
      <O cx={50} cy={50} rx={26} ry={21} h="white" />
      <Eyes x={50} y={46} gap={20} r={big(baby, 6.3)} />
      <path d="M47.5 55H52.5L50 57.5Z" fill={base('pink')} />
      <WMouth y={58} w={4} />
      <rect x="48" y="60" width="4" height="3.8" rx="1" fill="#fff" stroke={dark('white')} strokeWidth=".8" />
      <Whiskers y={55} x1={20} x2={32} />
      <Blush x={50} y={56} gap={32} r={4.5} />
      <Gloss cx={38} cy={36} rx={7} ry={3.5} rot={-25} o={.8} />
    </g>)
  },

  /* Duck: white, side view, wide flat orange bill (clearly not the chick). */
  '🦆': ({ baby }) => {
    const BODY = 'M18 64C18 52 28 48 40 50L62 52C72 52 80 48 86 42C90 54 86 66 78 74C70 82 58 86 46 86C28 86 18 76 18 64Z'
    const WING = 'M46 58C56 53 70 55 77 61C71 71 56 74 46 67Z'
    return babyWrap(baby, <g>
      <path d="M38 84V89M52 84V89" stroke={base('orange')} strokeWidth="3" strokeLinecap="round" />
      <path d="M31 90C33 86 37 86 41 88L43 91ZM45 90C47 86 51 86 55 88L57 91Z" fill={v('orange')} />
      <S d={BODY} h="white" /><AO d={BODY} />
      <S d={WING} h="white" />
      <path d="M54 62Q62 60 70 63M52 66Q60 66 68 67" fill="none" stroke={dark('white')} strokeWidth="1.5" strokeLinecap="round" />
      <O cx={34} cy={34} r={17} h="white" />
      <S d="M28 36C20 31 7 32 6 39C5 45 14 48 28 44Z" h="orange" />
      <path d="M8 41Q16 43 26 41" fill="none" stroke={dark('orange')} strokeWidth="1.4" strokeLinecap="round" />
      <Eyes x={35} y={30} gap={12} r={big(baby, 5.2)} />
      <Blush x={36} y={41} gap={18} r={3.5} />
      <Gloss cx={28} cy={22} rx={6} ry={3} rot={-25} o={.8} />
    </g>)
  },

  /* Cow: white with black patches, big pink muzzle, horns, bell. */
  '🐮': ({ baby }) => {
    const HORN = 'M33 24C28 21 26 15 28 10C31 14 35 16 39 17Z'
    return babyWrap(baby, <g>
      <L d="M70 84C80 84 84 76 84 68" w={3} h="white" />
      <O cx={84} cy={66} r={3.5} h="dark" />
      <S d={SIT} h="white" />
      <ellipse cx="62" cy="76" rx="7" ry="6" fill={v('black')} />
      <ellipse cx="36" cy="83" rx="5" ry="4.5" fill={v('black')} />
      <Paws h="dark" />
      <path d="M36 67Q50 74 64 67" fill="none" stroke={base('red')} strokeWidth="3.5" strokeLinecap="round" />
      <O cx={50} cy={74} r={5} h="yellow" />
      <S d={HORN} h="cream" /><S d={mx(HORN)} h="cream" />
      <O cx={19} cy={38} rx={10} ry={5.5} h="white" transform="rotate(20 19 38)" />
      <O cx={81} cy={38} rx={10} ry={5.5} h="white" transform="rotate(-20 81 38)" />
      <ellipse cx="20" cy="38.5" rx="6" ry="3" fill={base('pink')} transform="rotate(20 20 38.5)" />
      <ellipse cx="80" cy="38.5" rx="6" ry="3" fill={base('pink')} transform="rotate(-20 80 38.5)" />
      <O cx={50} cy={42} rx={26} ry={23} h="white" />
      <ellipse cx="38" cy="29" rx="8" ry="6.5" fill={v('black')} />
      <O cx={50} cy={57} rx={17} ry={11} h="pink" />
      <ellipse cx="44" cy="56" rx="2.4" ry="3.2" fill={dark('pink')} /><ellipse cx="56" cy="56" rx="2.4" ry="3.2" fill={dark('pink')} />
      <Smile x={50} y={62} w={8} />
      <Eyes x={50} y={38} gap={22} r={big(baby, 6.2)} />
      <Blush x={50} y={47} gap={40} r={4.5} />
      <Gloss cx={56} cy={26} rx={7} ry={3} rot={-10} o={.8} />
    </g>)
  },

  /* Bee: round yellow body with black stripes, see-through wings, antennae, stinger. */
  '🐝': ({ baby }) => {
    const BODY = 'M24 60C24 46 36 36 50 36C64 36 76 46 76 60C76 74 64 84 50 84C36 84 24 74 24 60Z'
    return babyWrap(baby, <g>
      <O cx={30} cy={30} rx={12} ry={17} h="sky" transform="rotate(-35 30 30)" opacity=".9" />
      <O cx={70} cy={30} rx={12} ry={17} h="sky" transform="rotate(35 70 30)" opacity=".9" />
      <L d="M44 38C42 30 38 24 34 22M56 38C58 30 62 24 66 22" w={2.2} h="black" />
      <O cx={34} cy={22} r={3} h="black" /><O cx={66} cy={22} r={3} h="black" />
      <path d="M45 82L50 91L55 82Z" fill={v('black')} />
      <S d={BODY} h="yellow" />
      <path d="M25 66Q50 71 75 66L72.5 72.5Q50 77.5 27.5 72.5Z" fill={v('black')} />
      <path d="M33 78.5Q50 82 67 78.5L61 82.5Q50 85 39 82.5Z" fill={v('black')} />
      <AO d={BODY} />
      <Eyes x={50} y={51} gap={18} r={big(baby, 6.2)} />
      <Mouth x={50} y={59} w={7} />
      <Blush x={50} y={58} gap={32} r={4.5} />
      <Gloss cx={36} cy={46} rx={7} ry={3.5} rot={-35} o={.9} />
      <Gloss cx={26} cy={24} rx={5} ry={2.5} rot={-35} o={.7} />
    </g>)
  },

  '🐯': ({ baby }) => babyWrap(baby, <g>
    <Tail d="M68 84C80 86 86 76 84 66" h="orange" w={7} />
    <path d="M79 84.5l1.5-5M84.5 78l-5-1M85.5 70l-5 .5" stroke={base('black')} strokeWidth="2.4" strokeLinecap="round" />
    <S d={SIT} h="orange" /><S d={BELLY} h="cream" edge={false} />
    <L d="M30 72L37 74M29 80L36 81" w={2.6} /><L d={mx('M30 72L37 74M29 80L36 81')} w={2.6} />
    <Paws h="orange" />
    <O cx={25} cy={22} r={9} h="orange" /><O cx={75} cy={22} r={9} h="orange" />
    <O cx={25} cy={22} r={4.5} h="cream" /><O cx={75} cy={22} r={4.5} h="cream" />
    <O cx={50} cy={43} rx={30} ry={25} h="orange" />
    <ellipse cx="40" cy="55" rx="11" ry="8" fill={v('cream')} /><ellipse cx="60" cy="55" rx="11" ry="8" fill={v('cream')} />
    <ellipse cx="50" cy="61" rx="6" ry="4" fill={v('cream')} />
    <L d="M44 19L46 26M50 18V27M56 19L54 26" w={2.8} />
    <L d="M20 36L28 39M20 44L28 45" w={2.8} /><L d={mx('M20 36L28 39M20 44L28 45')} w={2.8} />
    <Eyes x={50} y={40} gap={22} r={big(baby, 6.5)} />
    <path d="M46.5 50H53.5L50 53.5Z" fill={dark('pink')} />
    <WMouth y={55} />
    <Blush x={50} y={51} gap={40} r={5} />
    <Gloss cx={36} cy={27} rx={7} ry={3.5} rot={-25} o={.7} />
  </g>),

  '🐙': ({ c = 'purple', baby }) => {
    const ARMS = ['M30 58C22 66 12 70 12 80C12 86 19 87 20 82', 'M38 62C34 72 26 78 28 86C29 90 35 89 34 85', 'M46 64C46 74 40 80 42 87C43 90 48 90 48 86']
    return babyWrap(baby, <g>
      {[...ARMS, ...ARMS.map(mx)].map(d => <Tail key={d} d={d} h={c} w={9} />)}
      {[[16, 76], [29, 80], [44, 80], [84, 76], [71, 80], [56, 80]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.8" fill={light(c)} opacity=".9" />)}
      <O cx={50} cy={40} rx={30} ry={27} h={c} />
      <circle cx="66" cy="25" r="4" fill={light(c)} opacity=".55" /><circle cx="73" cy="37" r="2.6" fill={light(c)} opacity=".55" />
      <circle cx="59" cy="17" r="2.2" fill={light(c)} opacity=".55" />
      <Eyes x={50} y={44} gap={24} r={big(baby, 7)} />
      <Mouth x={50} y={56} w={8} />
      <Blush x={50} y={53} gap={40} r={5} />
      <Gloss cx={36} cy={24} rx={10} ry={5} rot={-30} o={.8} />
    </g>)
  },

  /* Small bird: blue, pointed tail, slim beak pointing left, cream breast. */
  '🐦': ({ c = 'blue', baby }) => {
    const BODY = 'M28 66C28 52 40 44 54 44C68 44 76 54 76 66C76 78 66 86 52 86C38 86 28 78 28 66Z'
    return babyWrap(baby, <g>
      <L d="M46 84V90M42 91L46 88L50 91M56 84V90M52 91L56 88L60 91" w={2.4} h="orange" />
      <S d="M70 60C78 56 86 50 92 44C92 56 86 68 74 74Z" h={c} />
      <S d={BODY} h={c} /><AO d={BODY} />
      <S d="M30 62C34 52 44 50 50 56C52 66 46 80 38 80C32 76 29 70 30 62Z" h="cream" edge={false} />
      <S d="M54 58C64 54 74 58 76 66C70 74 60 76 54 70C52 66 52 62 54 58Z" h={c} />
      <path d="M60 64Q66 64 72 66M58 69Q64 70 70 71" fill="none" stroke={dark(c)} strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
      <S d="M42 19C40 13 44 9 49 10C47 13 46 16 47 20Z" h={c} />
      <O cx={42} cy={38} r={18} h={c} />
      <path d="M26 38L14 42L26 46Z" fill={v('orange')} />
      <Eyes x={41} y={35} gap={14} r={big(baby, 5.6)} />
      <Blush x={41} y={44} gap={24} r={3.8} />
      <Gloss cx={34} cy={26} rx={6} ry={3} rot={-25} o={.8} />
    </g>)
  },

  /* Turtle (also used for the Hồ Gươm turtle legend). */
  '🐢': ({ baby }) => {
    const SHELL = 'M28 70C28 48 42 32 59 32C76 32 90 48 90 70Z'
    return babyWrap(baby, <g>
      <S d="M84 72C89 73 92 75 92 77C88 79 84 78 80 77Z" h="green" />
      <O cx={40} cy={82} rx={8} ry={8} h="green" /><O cx={78} cy={82} rx={8} ry={8} h="green" />
      <S d={SHELL} h="leaf" /><AO d={SHELL} />
      <path d="M53 43H65L71 53L65 63H53L47 53Z" fill={v('green')} opacity=".85" />
      <L d="M53 43L48 35M65 43L70 35M47 53H32M71 53H87M53 63L50 71M65 63L68 71" w={2} h="leaf" o={.7} />
      <S d="M26 72C26 69 28 68 30 68H88C90 68 92 69 92 72C92 76 89 79 85 79H33C29 79 26 76 26 72Z" h="wood" />
      <O cx={22} cy={56} r={15} h="green" />
      <Eyes x={22} y={53} gap={12} r={big(baby, 5)} />
      <Smile x={22} y={62} w={7} />
      <Blush x={22} y={60} gap={20} r={3.5} />
      <Gloss cx={47} cy={40} rx={8} ry={4} rot={-35} o={.8} />
      <Gloss cx={16} cy={47} rx={4} ry={2} rot={-30} o={.7} />
    </g>)
  },

  /* Hatching chick: yellow chick popping out of a cracked egg, shell cap on its head. */
  '🐣': ({ baby }) => babyWrap(baby, <g>
    <O cx={50} cy={50} r={22} h="yellow" />
    <O cx={27} cy={62} rx={5} ry={8} h="yellow" transform="rotate(-30 27 62)" />
    <O cx={73} cy={62} rx={5} ry={8} h="yellow" transform="rotate(30 73 62)" />
    <Eyes x={50} y={47} gap={18} r={big(baby, 6.5)} />
    <path d="M45 55L50 52L55 55L50 59Z" fill={v('orange')} />
    <Blush x={50} y={55} gap={30} r={4.5} />
    <S d="M22 62L29 56L35 63L42 55L50 63L58 55L65 63L71 56L78 62C80 80 68 90 50 90C32 90 20 80 22 62Z" h="cream" />
    <Gloss cx={32} cy={72} rx={6} ry={3.5} rot={-50} o={.9} />
    <S d="M33 33C34 20 64 18 67 31L61 27L56 33L50 26L44 33L39 27Z" h="cream" />
    <Gloss cx={44} cy={24} rx={6} ry={2.4} rot={-10} o={.8} />
  </g>),

  /* Whale: blue, side view, water spout, tail up. */
  '🐳': ({ c = 'blue', baby }) => {
    const BODY = 'M8 58C8 40 24 28 44 28C62 28 72 38 78 48C80 51 82 52 84 52C84 60 78 70 66 76C52 82 30 82 18 76C12 72 8 66 8 58Z'
    return babyWrap(baby, <g>
      <S d="M84 54C78 50 74 44 75 36C80 38 84 44 85 50C86 44 90 40 93 38C93 46 90 52 84 54Z" h={c} />
      <S d={BODY} h={c} />
      <path d="M11 66C20 76 40 80 60 75C52 81 30 83 19 77C15 74 12 70 11 66Z" fill={v('sky')} />
      <AO d={BODY} />
      <S d="M40 70C44 78 52 82 57 80C55 74 48 70 40 70Z" h={c} />
      <S d="M42 26C40 20 36 16 31 16C35 11 41 13 43 19C45 13 51 11 55 16C50 16 46 20 44 26Z" h="sky" />
      <O cx={28} cy={11} r={2.5} h="sky" /><O cx={58} cy={11} r={2.5} h="sky" />
      <Eyes x={30} y={50} gap={15} r={big(baby, 5.8)} />
      <path d="M14 62Q26 70 40 62" fill="none" stroke="#3a1f2a" strokeWidth="2" strokeLinecap="round" />
      <Blush x={30} y={60} gap={28} r={4} />
      <Gloss cx={34} cy={36} rx={12} ry={4} rot={-15} o={.8} />
    </g>)
  },

  /* Shrimp: orange, curled body of overlapping bands, fan tail, feelers. */
  '🦐': ({ c = 'orange', baby }) => {
    const segs = Array.from({ length: 11 }, (_, i) => [120 - i * 24, 8 + i * .55])
    const at = (a: number, R = 20) => [54 + R * Math.cos(a * Math.PI / 180), 54 + R * Math.sin(a * Math.PI / 180)]
    return babyWrap(baby, <g>
      <g transform="translate(50 52) scale(1.08) translate(-50 -52)">
      <L d="M20 40C15 28 22 17 36 14C50 11 62 13 72 20M22 42C20 31 29 23 42 21C54 19 62 22 68 27" w={1.8} h={c} />
      {[145, 180, 215].map(a => { const [x0, y0] = at(132), x = x0 + 8 * Math.cos(a * Math.PI / 180), y = y0 + 8 * Math.sin(a * Math.PI / 180); return <O key={a} cx={x} cy={y} rx={9} ry={4.6} h={c} transform={`rotate(${a} ${x} ${y})`} /> })}
      {segs.filter((_, i) => i % 2).map(([a]) => { const [x, y] = at(a, 12); const [x2, y2] = at(a + 6, 5); return <L key={a} d={`M${x} ${y}L${x2} ${y2 + 4}`} w={1.8} h={c} /> })}
      {segs.map(([a, r]) => { const [x, y] = at(a); return <g key={a}>
        <O cx={x} cy={y} rx={r * 1.12} ry={r * .8} h={c} transform={`rotate(${a} ${x} ${y})`} />
        <ellipse cx={x} cy={y} rx={r * .7} ry={r * .2} fill={light(c)} opacity=".55" transform={`rotate(${a} ${x} ${y})`} />
      </g> })}
      <path d="M18 40L9 36L18 46Z" fill={v(c)} />
      <O cx={31} cy={47} rx={15} ry={13} h={c} />
      <Eyes x={31} y={44} gap={12} r={big(baby, 5.2)} />
      <Smile x={28} y={54} w={6} />
      <Blush x={31} y={52} gap={21} r={3.5} />
      <Gloss cx={25} cy={39} rx={5} ry={2.5} rot={-30} o={.8} />
      <Gloss cx={54} cy={33} rx={6} ry={2.5} rot={-5} o={.7} />
      </g>
    </g>)
  },

  /* Ant: black, three body parts, six legs, bent feelers. */
  '🐜': ({ baby }) => babyWrap(baby, <g>
    <L d="M44 62L32 74L26 88M47 64L42 76L38 89M50 65L52 78L50 89M53 64L60 76L64 89M55 62L66 72L74 88" w={2.6} h="black" />
    <L d="M22 34C18 24 14 20 9 20M34 33C36 22 42 16 48 16" w={2.4} h="black" />
    <O cx={9} cy={20} r={3} h="black" /><O cx={48} cy={16} r={3} h="black" />
    <O cx={72} cy={60} rx={18} ry={15} h="black" />
    <O cx={50} cy={62} rx={9} ry={7} h="black" />
    <O cx={28} cy={48} r={17} h="black" />
    <Eyes x={28} y={46} gap={14} r={big(baby, 6)} />
    <Mouth x={28} y={56} w={7} />
    <Blush x={28} y={54} gap={26} r={4} />
    <Gloss cx={64} cy={51} rx={7} ry={3.5} rot={-25} o={.7} />
    <Gloss cx={20} cy={37} rx={5} ry={2.5} rot={-30} o={.7} />
  </g>),

  /* Sheep: fluffy white wool, dark face and legs. */
  '🐑': ({ baby }) => babyWrap(baby, <g>
    {[[33, 74, 11], [67, 74, 11], [50, 68, 12], [39, 80, 9], [61, 80, 9], [50, 79, 10]].map(([x, y, r]) => <O key={`${x}${y}`} cx={x} cy={y} r={r} h="white" />)}
    <O cx={40} cy={89} rx={5.5} ry={3.6} h="dark" /><O cx={60} cy={89} rx={5.5} ry={3.6} h="dark" />
    <O cx={25} cy={42} rx={10} ry={5} h="dark" transform="rotate(25 25 42)" />
    <O cx={75} cy={42} rx={10} ry={5} h="dark" transform="rotate(-25 75 42)" />
    <O cx={50} cy={46} rx={20} ry={21} h="dark" />
    {[[38, 26, 8], [62, 26, 8], [50, 22, 9], [44, 30, 6], [56, 30, 6]].map(([x, y, r]) => <O key={`${x}${y}`} cx={x} cy={y} r={r} h="white" />)}
    <Eyes x={50} y={45} gap={17} r={big(baby, 6.2)} />
    <ellipse cx="50" cy="55" rx="3" ry="2" fill={base('pink')} />
    <path d="M46 58Q50 61 54 58" fill="none" stroke={light('dark')} strokeWidth="1.8" strokeLinecap="round" />
    <Blush x={50} y={55} gap={26} r={4.5} />
    <Gloss cx={42} cy={18} rx={5} ry={2.5} rot={-25} o={.8} />
    <Gloss cx={40} cy={36} rx={5} ry={2.5} rot={-30} o={.4} />
  </g>),

  /* Crab: red, two big raised claws, eyes on stalks. */
  '🦀': ({ c = 'red', baby }) => {
    const CLAW = 'M22 16C12 16 7 26 11 34C14 40 21 43 28 39L21 32L30 29C32 22 28 16 22 16Z'
    const LEGS = 'M26 66L14 62L10 70M26 72L13 75L11 83M30 78L19 84L19 90'
    return babyWrap(baby, <g>
      <L d={LEGS} w={4} h={c} /><L d={mx(LEGS)} w={4} h={c} />
      <Tail d="M32 56L24 40" h={c} w={6} /><Tail d="M68 56L76 40" h={c} w={6} />
      <S d={CLAW} h={c} /><S d={mx(CLAW)} h={c} />
      <O cx={50} cy={64} rx={30} ry={20} h={c} />
      <L d="M43 48L41 38M57 48L59 38" w={3.5} h={c} />
      <Eye x={40} y={34} r={big(baby, 7)} /><Eye x={60} y={34} r={big(baby, 7)} />
      <Mouth x={50} y={63} w={10} />
      <Blush x={50} y={61} gap={36} r={5} />
      <Gloss cx={36} cy={53} rx={9} ry={4} rot={-20} o={.8} />
      <Gloss cx={16} cy={23} rx={4} ry={2} rot={-40} o={.8} />
    </g>)
  },

  /* Pony: standing side view, mane and tail. */
  '🐴': ({ c = 'brown', baby }) => {
    const MANE = 'M33 16C41 14 48 21 48 30C46 38 46 46 50 52C44 50 40 44 40 36C40 30 38 22 33 16Z'
    return babyWrap(baby, <g>
      <S d="M78 52C88 54 92 66 88 80C84 74 80 66 76 60Z" h="hair" />
      <Leg x={64} h={c} /><Leg x={73} h={c} />
      <O cx={56} cy={58} rx={24} ry={14} h={c} />
      <Leg x={37} h={c} /><Leg x={46} h={c} />
      <S d="M30 56C28 44 28 34 32 26L46 30C44 38 44 46 48 54Z" h={c} />
      <S d={MANE} h="hair" />
      <S d="M36 17L40 6L44 16Z" h={c} />
      <S d="M27 17L29 5L35 15Z" h={c} />
      <O cx={28} cy={28} rx={14} ry={13} h={c} />
      <O cx={17} cy={36} rx={10} ry={8} h="wood" />
      <S d="M26 16C30 12 36 13 37 18C34 18 32 20 31 23C30 20 28 18 26 16Z" h="hair" />
      <Eye x={29} y={26} r={big(baby, 6.5)} />
      <ellipse cx="12" cy="35" rx="1.6" ry="2.2" fill={base('hair')} />
      <path d="M11 40Q16 43 21 40" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
      <Blush x={30} y={36} gap={0} r={4} />
      <Gloss cx={44} cy={49} rx={8} ry={3.5} rot={-15} o={.7} />
    </g>)
  },

  /* Dolphin: gray, jumping arc, dorsal fin, beak. */
  '🐬': ({ c = 'gray', baby }) => {
    const BODY = 'M8 62C12 58 18 56 22 55C28 40 42 30 58 32C70 34 78 42 82 52C83 56 82 60 80 62C76 62 70 60 62 60C50 60 38 64 30 68C22 70 14 67 8 62Z'
    return babyWrap(baby, <g>
      <g transform="translate(48 50) scale(1.1) translate(-48 -50)">
      <S d="M52 34C56 24 62 19 69 19C66 25 64 31 64 36Z" h={c} />
      <S d="M78 58C82 64 86 70 87 79C83 76 80 72 79 68C76 72 72 74 66 74C70 70 74 65 78 58Z" h={c} />
      <S d={BODY} h={c} />
      <path d="M10 62C18 66 26 64 34 60C44 55 56 55 68 58C56 59 46 62 36 66C26 70 16 68 10 62Z" fill={v('white')} />
      <AO d={BODY} />
      <S d="M40 62C37 70 39 76 45 79C46 72 46 67 48 61Z" h={c} />
      <Eyes x={28} y={48} gap={11} r={big(baby, 5)} />
      <path d="M10 61Q18 64 26 60" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
      <Blush x={28} y={56} gap={20} r={3.5} />
      <Gloss cx={42} cy={39} rx={10} ry={3.5} rot={-25} o={.8} />
      </g>
    </g>)
  },

  '🐷': ({ baby }) => {
    const EAR = 'M24 36C20 28 20 18 24 12C31 14 37 19 40 25Z'
    return babyWrap(baby, <g>
      <path d="M70 80C76 80 80 76 77 73C74 70 71 74 74 76C77 78 82 77 84 73" fill="none" stroke={base('pink')} strokeWidth="3" strokeLinecap="round" />
      <S d={SIT} h="pink" />
      <path d={BELLY} fill={light('pink')} opacity=".7" />
      <Paws h="pink" />
      <path d="M39 85V91M61 85V91" stroke={dark('pink')} strokeWidth="1.4" />
      <S d={EAR} h="pink" /><S d={mx(EAR)} h="pink" />
      <O cx={50} cy={46} rx={29} ry={23} h="pink" />
      <O cx={50} cy={56} rx={12} ry={8.5} h="pink" />
      <ellipse cx="46" cy="56" rx="2" ry="3" fill={dark('pink')} /><ellipse cx="54" cy="56" rx="2" ry="3" fill={dark('pink')} />
      <Eyes x={50} y={40} gap={24} r={big(baby, 6)} />
      <Smile x={50} y={65.5} w={8} />
      <Blush x={50} y={54} gap={42} r={5} />
      <Gloss cx={34} cy={30} rx={8} ry={4} rot={-25} o={.7} />
    </g>)
  },

  /* Bear: dark brown real bear (not the teddy): no stitches, standing with arms down. */
  '🐻': ({ baby }) => babyWrap(baby, <g>
    <S d={SIT} h="hair" />
    <S d="M38 88C38 76 43 68 50 68C57 68 62 76 62 88Z" h="wood" edge={false} />
    <O cx={31} cy={72} rx={7} ry={11} h="hair" transform="rotate(15 31 72)" />
    <O cx={69} cy={72} rx={7} ry={11} h="hair" transform="rotate(-15 69 72)" />
    <Paws h="hair" />
    <O cx={27} cy={22} r={9} h="hair" /><O cx={73} cy={22} r={9} h="hair" />
    <O cx={27} cy={22} r={5} h="wood" /><O cx={73} cy={22} r={5} h="wood" />
    <O cx={50} cy={42} rx={28} ry={24} h="hair" />
    <O cx={50} cy={52} rx={13} ry={10} h="wood" />
    <Nose y={48} w={5} />
    <path d="M50 51.5V54M46 55Q50 58 54 55" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
    <Eyes x={50} y={37} gap={22} r={big(baby, 6)} />
    <Blush x={50} y={48} gap={38} r={5} />
    <Gloss cx={36} cy={27} rx={8} ry={4} rot={-25} o={.5} />
  </g>),

  /* Frog: green, eyes on top, wide smile, legs folded. */
  '🐸': ({ baby }) => babyWrap(baby, <g>
    <O cx={22} cy={80} rx={13} ry={9} h="green" /><O cx={78} cy={80} rx={13} ry={9} h="green" />
    <O cx={14} cy={88} rx={7} ry={3.5} h="green" /><O cx={86} cy={88} rx={7} ry={3.5} h="green" />
    <S d="M26 88C22 74 32 62 50 62C68 62 78 74 74 88Z" h="green" />
    <S d="M38 88C38 78 43 71 50 71C57 71 62 78 62 88Z" h="cream" edge={false} />
    <O cx={38} cy={88} rx={7} ry={4} h="green" /><O cx={62} cy={88} rx={7} ry={4} h="green" />
    <O cx={50} cy={50} rx={32} ry={19} h="green" />
    <O cx={32} cy={33} r={12} h="green" /><O cx={68} cy={33} r={12} h="green" />
    <Eye x={32} y={33} r={big(baby, 8)} /><Eye x={68} y={33} r={big(baby, 8)} />
    <circle cx="46" cy="49" r="1.2" fill={dark('green')} /><circle cx="54" cy="49" r="1.2" fill={dark('green')} />
    <path d="M30 55Q50 71 70 55" fill="none" stroke={dark('green')} strokeWidth="2.6" strokeLinecap="round" />
    <Blush x={50} y={57} gap={52} r={5} />
    <Gloss cx={30} cy={45} rx={7} ry={3} rot={-20} o={.6} />
  </g>),

  '🐭': ({ baby }) => babyWrap(baby, <g>
    <path d="M68 85C82 88 92 80 88 70C85 64 78 66 80 72" fill="none" stroke={base('pink')} strokeWidth="3" strokeLinecap="round" />
    <S d={SIT} h="gray" /><S d={BELLY} h="white" edge={false} />
    <Paws h="pink" rx={7} />
    <O cx={24} cy={25} r={15} h="gray" /><O cx={76} cy={25} r={15} h="gray" />
    <O cx={24} cy={25} r={9.5} h="pink" /><O cx={76} cy={25} r={9.5} h="pink" />
    <O cx={50} cy={47} rx={27} ry={22} h="gray" />
    <ellipse cx="50" cy="57" rx="12" ry="8" fill={light('gray')} />
    <Eyes x={50} y={43} gap={20} r={big(baby, 6.2)} />
    <circle cx="50" cy="54" r="3.6" fill={v('pink')} />
    <WMouth y={58.5} w={4} />
    <rect x="48" y="60.5" width="4" height="3.5" rx="1" fill="#fff" stroke={dark('white')} strokeWidth=".8" />
    <Whiskers y={53} x1={18} x2={33} />
    <Blush x={50} y={54} gap={34} r={4.5} />
    <Gloss cx={38} cy={32} rx={7} ry={3.5} rot={-25} o={.7} />
  </g>),
}
