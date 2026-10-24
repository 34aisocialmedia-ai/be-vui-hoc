import type { ModeId } from '../modes'
import { Companion, type CompanionKind } from '../motion/Companion'
import { UiIcon } from './UiIcon'

/*
 * Drawn scenes for the home page: the greeting banner and the three doors.
 * Vector art only; the small movements (waves, clouds, a swinging lamp, blinking footlights)
 * run in CSS and only at the "Đầy đủ" motion level.
 */

const Cloud = ({ x, y, s = 1, className = '' }: { x: number; y: number; s?: number; className?: string }) =>
  <g className={className} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff"><ellipse cx="0" cy="0" rx="26" ry="10" /><ellipse cx="12" cy="-7" rx="15" ry="11" /><ellipse cx="-11" cy="-3" rx="11" ry="8" /></g>

function IslandScene() {
  return <>
    <defs><linearGradient id="door-isl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fd0ff" /><stop offset="1" stopColor="#c9efff" /></linearGradient></defs>
    <rect width="300" height="170" fill="url(#door-isl-sky)" />
    <g className="art-spin" style={{ transformOrigin: '250px 34px' }}>{Array.from({ length: 8 }, (_, i) => <path key={i} d="M250 34 L244 -6 L256 -6Z" fill="#fff3b0" opacity=".7" transform={`rotate(${i * 45} 250 34)`} />)}</g>
    <circle cx="250" cy="34" r="17" fill="#ffd75e" />
    <Cloud x={60} y={34} className="art-drift" /><Cloud x={170} y={22} s={.7} className="art-drift slow" />
    <g className="art-wave"><path d="M-40 112 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V170 H-40Z" fill="#47c3dc" /></g>
    <g className="art-wave slow"><path d="M-40 126 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V170 H-40Z" fill="#33aecb" /></g>
    <ellipse cx="150" cy="142" rx="92" ry="18" fill="#ffe08a" />
    <ellipse cx="150" cy="136" rx="80" ry="13" fill="#7fd36b" />
    <g className="art-sway" style={{ transformOrigin: '232px 138px' }}>
      <path d="M232 138 q6 -26 2 -52" stroke="#b5793f" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M234 86 q-22 -6 -32 8 q16 -8 32 -8 q-6 -18 -24 -20 q18 4 24 20 q12 -18 30 -12 q-18 0 -30 12 q22 0 28 16 q-12 -12 -28 -16" fill="#3dbb6b" />
    </g>
    <g className="art-bob" style={{ transformOrigin: '46px 120px' }}><path d="M30 118 h34 l-6 10 h-22z" fill="#e2504c" /><path d="M47 118 V96 l14 16z" fill="#fff" /></g>
    <path className="art-drift" d="M110 52 q5 -5 10 0 q5 -5 10 0" stroke="#23324a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </>
}

function FriendScene() {
  return <>
    <rect width="300" height="170" fill="#ffe2c2" />
    <g fill="#fff" opacity=".5">{[20, 70, 120, 170, 220, 270].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 30 : 60} r="4" />)}</g>
    <g transform="translate(24 22)">
      <rect width="74" height="62" rx="10" fill="#bfeaff" />
      <clipPath id="door-win"><rect width="74" height="62" rx="10" /></clipPath>
      <g clipPath="url(#door-win)"><Cloud x={30} y={26} s={.7} className="art-drift" /></g>
      <path d="M37 0 V62 M0 31 H74" stroke="#fff" strokeWidth="5" />
      <rect width="74" height="62" rx="10" fill="none" stroke="#fff" strokeWidth="6" />
    </g>
    <g className="art-swing" style={{ transformOrigin: '236px 0px' }}><path d="M236 0 V30" stroke="#b8722f" strokeWidth="2" /><path d="M220 44 q16 -24 32 0z" fill="#ff9a3d" /><circle cx="236" cy="47" r="5" fill="#fff3b0" /></g>
    <rect x="196" y="86" width="90" height="7" rx="3.5" fill="#d9924b" />
    <circle cx="212" cy="77" r="9" fill="#ff6fa5" /><rect x="228" y="66" width="16" height="20" rx="4" fill="#7fd36b" /><path d="M252 86 l11 -22 l11 22Z" fill="#ffd75e" />
    <rect y="132" width="300" height="38" fill="#e9a96c" />
    <ellipse cx="150" cy="150" rx="110" ry="14" fill="#ffd0a0" />
    <g fill="#ff6fa5">
      <path className="art-float" d="M60 120 c-6 -8 -14 0 -6 8 l6 6 6 -6 c8 -8 0 -16 -6 -8z" />
      <path className="art-float late" d="M250 118 c-5 -7 -12 0 -5 7 l5 5 5 -5 c7 -7 0 -14 -5 -7z" />
    </g>
  </>
}

function MoviesScene() {
  return <>
    <rect width="300" height="170" fill="#26306b" />
    <rect x="44" y="20" width="212" height="112" rx="8" fill="#3e4a8c" />
    <rect className="art-glow" x="54" y="28" width="192" height="96" rx="6" fill="#fff4dc" opacity=".22" />
    <g className="art-curtain left" style={{ transformOrigin: '0px 0px' }}><path d="M0 0 H86 Q62 80 78 170 H0Z" fill="#e2504c" /><path d="M24 0 Q36 80 22 170 M52 0 Q62 80 50 170" stroke="#b83a37" strokeWidth="4" fill="none" /></g>
    <g className="art-curtain right" style={{ transformOrigin: '300px 0px' }}><path d="M300 0 H214 Q238 80 222 170 H300Z" fill="#e2504c" /><path d="M276 0 Q264 80 278 170 M248 0 Q238 80 250 170" stroke="#b83a37" strokeWidth="4" fill="none" /></g>
    <path d="M0 0 H300 V18 Q275 30 250 18 Q225 30 200 18 Q175 30 150 18 Q125 30 100 18 Q75 30 50 18 Q25 30 0 18Z" fill="#b83a37" />
    <g fill="#ffd75e">{[96, 126, 156, 186, 216].map((x, i) => <circle key={x} className="art-blink" style={{ animationDelay: `${i * .25}s` }} cx={x} cy="150" r="5" />)}</g>
    <g fill="#fff"><path className="art-twinkle" d="M110 44 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" /><path className="art-twinkle late" d="M200 56 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /></g>
  </>
}

const DOOR_SCENES: Record<ModeId, () => JSX.Element> = { island: IslandScene, friend: FriendScene, movies: MoviesScene }

/** The drawn place inside a door on the home page. */
export function DoorScene({ world }: { world: ModeId }) {
  const Scene = DOOR_SCENES[world]
  return <svg className={`door-scene door-scene-${world}`} viewBox="0 0 300 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><Scene /></svg>
}

const FRIENDS: CompanionKind[] = ['rabbit', 'bear', 'monkey', 'turtle']

/** Greeting banner at the top of the home page: the four friends on a sunny hill; Cô Thủy says hello. */
export function HomeBanner({ onHello }: { onHello: () => void }) {
  return <section className="home-banner" aria-label="Chào bé">
    <svg className="home-banner-art" viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd6ff" /><stop offset="1" stopColor="#e4f7ff" /></linearGradient></defs>
      <rect width="800" height="260" fill="url(#hb-sky)" />
      <g fill="none" strokeWidth="14" opacity=".55"><path d="M470 250 A190 190 0 0 1 850 250" stroke="#ff8f8f" /><path d="M484 250 A176 176 0 0 1 836 250" stroke="#ffd75e" /><path d="M498 250 A162 162 0 0 1 822 250" stroke="#8fd86f" /><path d="M512 250 A148 148 0 0 1 808 250" stroke="#7fc8ff" /></g>
      <circle cx="560" cy="44" r="26" fill="#ffd75e" /><circle cx="560" cy="44" r="38" fill="#ffd75e" opacity=".3" />
      <Cloud x={260} y={60} s={1.3} className="art-drift" /><Cloud x={660} y={34} className="art-drift slow" />
      <g className="art-rise"><ellipse cx="700" cy="120" rx="16" ry="20" fill="#ff6fa5" /><path d="M700 140 q-4 14 2 30" stroke="#fff" strokeWidth="2" fill="none" /></g>
      <g className="art-rise late"><ellipse cx="740" cy="150" rx="13" ry="16" fill="#ffb547" /><path d="M740 166 q4 12 -2 24" stroke="#fff" strokeWidth="2" fill="none" /></g>
      <path d="M0 200 Q200 150 420 190 T800 180 V260 H0Z" fill="#a6e08c" />
      <path d="M0 226 Q260 196 520 222 T800 214 V260 H0Z" fill="#7fd36b" />
      <g transform="translate(640 150)"><rect width="56" height="40" rx="5" fill="#ff8f6b" /><path d="M-8 2 L28 -24 L64 2Z" fill="#e2504c" /><rect x="20" y="16" width="16" height="24" rx="3" fill="#fff4dc" /></g>
    </svg>
    <div className="home-banner-text">
      <h1>Chào bé!<br />Hôm nay mình chơi gì nào?</h1>
      <button className="home-banner-hello" aria-label="Nghe cô Thủy chào con" onClick={onHello}><UiIcon name="sound" size={26} /></button>
    </div>
    <div className="home-banner-friends" aria-hidden="true">
      {FRIENDS.map((kind, i) => <span key={kind} className={`hb-friend hb-${kind}`} style={{ '--i': i } as React.CSSProperties}><Companion kind={kind} mood="idle" /></span>)}
    </div>
  </section>
}
