/* Reference drawings: the look every other drawing follows (soft 3D, lit from the upper left). */
import { AO, Blush, Eye, Eyes, Gloss, L, Mouth, O, S, babyWrap, dark, type Draw } from './kit'

const APPLE = 'M50 30C39 21 15 25 15 51c0 23 17 38 28 36 4-1 10-1 14 0 11 2 28-13 28-36 0-26-24-30-35-21Z'
const BERRY = 'M50 90C30 83 17 59 20 44c3-13 18-13 30-10 12-3 27-3 30 10 3 15-10 39-30 46Z'
const BALL = 'M50 18a34 34 0 1 1 0 68a34 34 0 1 1 0-68Z'

export const CORE: Record<string, Draw> = {
  '🍎': ({ c = 'red' }) => <g>
    <S d={APPLE} h={c} /><AO d={APPLE} />
    <path d="M44 33c-3-4-10-5-14-3" fill="none" stroke={dark(c)} strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
    <L d="M50 31q0-10 5-16" w={4.5} h="brown" />
    <S d="M54 22c9-11 22-10 27-4-7 10-19 11-27 4Z" h="leaf" />
    <path d="M57 21c7-3 14-3 20-1" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
    <Gloss cx={31} cy={42} rx={9} ry={5.5} rot={-55} />
    <Gloss cx={66} cy={36} rx={3} ry={2} o={.7} />
  </g>,

  '🍓': ({ c = 'red' }) => <g>
    <S d={BERRY} h={c} /><AO d={BERRY} />
    {[[34, 48], [50, 45], [66, 48], [41, 60], [59, 60], [50, 73], [44, 82]].map(([x, y]) =>
      <g key={`${x}${y}`}><ellipse cx={x} cy={y + .6} rx="2.2" ry="3" fill={dark(c)} opacity=".45" /><ellipse cx={x} cy={y} rx="1.7" ry="2.5" fill="#ffe37a" /></g>)}
    <S d="M29 37l8-13 7 8 6-14 6 14 7-8 8 13c-13 8-29 8-42 0Z" h="leaf" />
    <Gloss cx={31} cy={48} rx={6} ry={4} rot={-60} />
  </g>,

  '⚽': ({ c }) => c
    ? <g><S d={BALL} h={c} /><path d="M17 56c10 6 56 6 66 0" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="7" /><AO d={BALL} /><Gloss cx={36} cy={33} rx={10} ry={6} /></g>
    : <g>
      <S d={BALL} h="white" />
      <path d="M50 39l11 8-4 13H43l-4-13Z" fill="#2f2838" />
      <path d="M50 39V24M61 47l14-4M57 60l8 13M43 60l-8 13M39 47l-14-4" stroke="#2f2838" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      <path d="M44 20c4-2 9-2 13 0l-2 5h-9ZM80 39c3 4 4 9 3 13l-5-1-2-8ZM70 80c-3 3-8 5-12 5l-1-5 6-4ZM30 80c3 3 8 5 12 5l1-5-6-4ZM20 39c-3 4-4 9-3 13l5-1 2-8Z" fill="#2f2838" />
      <AO d={BALL} /><Gloss cx={35} cy={32} rx={11} ry={6} />
    </g>,

  '🌸': ({ c = 'pink' }) => <g>
    <L d="M50 60C49 74 52 83 50 93" w={5} h="leaf" />
    <S d="M51 80c8-10 19-10 23-5-6 8-16 10-23 5Z" h="leaf" />
    {[0, 72, 144, 216, 288].map(a => <g key={a} transform={`rotate(${a} 50 40)`}><ellipse cx="50" cy="22" rx="13" ry="15.5" fill={`url(#v-${c})`} /></g>)}
    <circle cx="50" cy="40" r="12" fill="url(#v-yellow)" />
    <Eyes x={50} y={38} gap={9} r={3} /><Mouth x={50} y={43.5} w={4.5} />
  </g>,

  '🐱': ({ c = 'orange', baby }) => babyWrap(baby, <g>
    <path d="M70 82c16 1 20-14 12-20" fill="none" stroke={`url(#v-${c})`} strokeWidth="8" strokeLinecap="round" />
    <S d="M29 89c-3-17 5-31 21-31s24 14 21 31Z" h={c} />
    <S d="M41 89c0-9 4-15 9-15s9 6 9 15Z" h="cream" edge={false} />
    <S d="M22 32 19 9l20 12ZM78 32l3-23-20 12Z" h={c} />
    <path d="M24 25l-1-10 8 6ZM76 25l1-10-8 6Z" fill="#ffb3c8" />
    <O cx={50} cy={42} rx={30} ry={25} h={c} />
    <path d="M44 19l2 7M50 18v8M56 19l-2 7" stroke={dark(c)} strokeOpacity=".6" strokeWidth="2.6" strokeLinecap="round" />
    <ellipse cx="50" cy="53" rx="13" ry="8" fill="#fff4e6" opacity=".9" />
    <Eyes x={50} y={41} gap={22} r={baby ? 7.5 : 6.5} />
    <path d="M47.5 49h5l-2.5 3Z" fill="#ff7fa0" />
    <path d="M45 55q2.5 2 5 0q2.5 2 5 0" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 46h11M18 52l11-2M82 46H71M82 52l-11-2" stroke="#3a1f2a" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
    <Blush x={50} y={51} gap={36} r={5} />
    <Gloss cx={34} cy={28} rx={8} ry={4} rot={-25} o={.7} />
  </g>),

  '🧸': () => <g>
    <O cx={26} cy={24} r={10} h="brown" /><O cx={74} cy={24} r={10} h="brown" />
    <circle cx="26" cy="24" r="5" fill="#f1c08f" /><circle cx="74" cy="24" r="5" fill="#f1c08f" />
    <S d="M28 88c-4-19 6-31 22-31s26 12 22 31Z" h="brown" />
    <ellipse cx="50" cy="76" rx="12" ry="10" fill="#f1c08f" opacity=".9" />
    <O cx={21} cy={70} rx={8} ry={10} h="brown" /><O cx={79} cy={70} rx={8} ry={10} h="brown" />
    <O cx={33} cy={88} rx={10} ry={6} h="brown" /><O cx={67} cy={88} rx={10} ry={6} h="brown" />
    <O cx={50} cy={41} r={26} h="brown" />
    <ellipse cx="50" cy="51" rx="12" ry="9" fill="#f6cfa3" />
    <ellipse cx="50" cy="47" rx="4.5" ry="3.2" fill="#2f2838" /><circle cx="51.5" cy="46" r="1.2" fill="#fff" />
    <path d="M50 50v3M46 54q4 3 8 0" fill="none" stroke="#3a1f2a" strokeWidth="1.8" strokeLinecap="round" />
    <Eyes x={50} y={37} gap={20} r={5} />
    <Blush x={50} y={47} gap={34} r={5} />
    <Gloss cx={37} cy={25} rx={8} ry={4} rot={-20} o={.6} />
  </g>,

  /* A pair of eyes with lids, lashes and brows: "đôi mắt" reads at a glance. */
  '👁': () => <g>
    {[29, 71].map((x, i) => <g key={x}>
      <path d={`M${x - 13} ${i ? 29 : 30}q13 -8 26 ${i ? 1 : -1}`} fill="none" stroke="#5f3a2a" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx={x} cy="55" rx="19" ry="15" fill="#ffd2ae" />
      <Eye x={x} y={55} r={12} />
      <path d={`M${x - 17} 49c8-9 26-9 34 0`} fill="none" stroke="#2f2838" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${x - 15} 46l-4 -4M${x - 7} 43l-2 -5M${x + 7} 43l2 -5M${x + 15} 46l4 -4`} fill="none" stroke="#2f2838" strokeWidth="2.2" strokeLinecap="round" />
    </g>)}
  </g>,
  '👀': p => CORE['👁'](p),

  '👂': () => {
    const EAR = 'M37 21c17-11 42-3 42 22 0 14-8 19-13 25-4 5-4 13-10 18-8 6-20 3-22-6-1-5 4-8 8-5 3 2 6 1 7-2 2-8 9-12 13-19 4-7 3-18-6-22-9-4-20 2-21 11-1 5-8 5-8-1 0-9 4-16 10-21Z'
    return <g>
      <S d={EAR} h="skin" /><AO d={EAR} />
      <path d="M45 44c0-7 6-11 11-9 7 2 7 11 1 15-3 3-6 2-7 5" fill="none" stroke="#e8a47b" strokeWidth="3.2" strokeLinecap="round" />
      <Gloss cx={52} cy={24} rx={10} ry={4} rot={-10} o={.8} />
    </g>
  },

  '🚌': ({ c = 'yellow' }) => {
    const BODY = 'M11 30c0-5 4-9 9-9h51c8 0 13 4 16 12l3 12v27c0 3-2 5-5 5H16c-3 0-5-2-5-5Z'
    return <g>
      <S d={BODY} h={c} /><AO d={BODY} />
      <path d="M11 55h79" stroke={dark(c)} strokeOpacity=".5" strokeWidth="2" />
      {[18, 37, 56].map(x => <g key={x}><rect x={x} y="29" width="15" height="15" rx="3" fill="url(#v-sky)" /><path d={`M${x + 2} ${42}l8 -11`} stroke="#fff" strokeOpacity=".7" strokeWidth="2" /></g>)}
      <path d="M76 29h4c3 0 5 2 6 5l2 10H76Z" fill="url(#v-sky)" />
      <circle cx="86" cy="62" r="3.2" fill="#fff8c2" />
      <rect x="11" y="66" width="79" height="6" rx="2" fill="url(#v-gray)" />
      {[30, 72].map(x => <g key={x}><circle cx={x} cy="78" r="10" fill="url(#v-dark)" /><circle cx={x} cy="78" r="4" fill="url(#v-gray)" /></g>)}
      <Gloss cx={34} cy={24} rx={16} ry={2.6} rot={0} o={.8} />
    </g>
  },
}
