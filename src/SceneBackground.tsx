import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { FitScaleContext, MIN_FIT } from './motion/stage'
import type { SceneTheme } from './types'

/*
 * Calm vector worlds behind the play area. Colours stay soft so answer cards remain the
 * brightest thing on screen; only clouds and fish move, slowly (26–95 s cycles), on a composited layer.
 * The art sits outside the scrolling area so it never scrolls with the cards.
 */
const CloudShape = () => <g fill="#fff"><ellipse cx="0" cy="0" rx="62" ry="22" /><ellipse cx="34" cy="-14" rx="38" ry="24" /><ellipse cx="-30" cy="-6" rx="30" ry="18" /></g>

const Tuft = ({ x, y, color = '#8fca7f' }: { x: number; y: number; delay?: number; color?: string }) =>
  <path d={`M${x} ${y} q5 -34 10 0 q6 -26 12 0 q5 -22 10 0Z`} fill={color} />

function Farm() {
  return <>
    <defs><linearGradient id="farm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d8f0fa" /><stop offset=".55" stopColor="#f3f8ec" /></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#farm-sky)" />
    <circle cx="660" cy="140" r="54" fill="#ffe7a3" /><circle cx="660" cy="140" r="78" fill="#ffe7a3" opacity=".35" />
    
    <path d="M0 640 Q160 560 330 610 T800 580 V1000 H0Z" fill="#cfe9c0" />
    <path d="M0 720 Q220 660 430 700 T800 690 V1000 H0Z" fill="#b8dfa6" />
    <g transform="translate(560 560)"><rect width="120" height="92" rx="8" fill="#e99a82" /><path d="M-12 6 L60 -46 L132 6Z" fill="#d07a64" /><rect x="44" y="40" width="32" height="52" rx="4" fill="#fbe6cc" /><path d="M44 40 L76 92 M76 40 L44 92" stroke="#e99a82" strokeWidth="4" /></g>
    <g stroke="#e6c79c" strokeWidth="8" strokeLinecap="round"><path d="M40 760 H330" /><path d="M60 735 V790 M130 735 V790 M200 735 V790 M270 735 V790" /></g>
    <Tuft x={90} y={880} /><Tuft x={380} y={900} delay={-2} /><Tuft x={640} y={870} delay={-4} /><Tuft x={240} y={960} delay={-1} />
    <g fill="#fff"><circle cx="470" cy="820" r="7" /><circle cx="160" cy="930" r="6" /><circle cx="700" cy="940" r="7" /></g>
    <g fill="#f6c453"><circle cx="470" cy="820" r="3" /><circle cx="160" cy="930" r="2.5" /><circle cx="700" cy="940" r="3" /></g>
  </>
}

function Pond() {
  return <>
    <defs><linearGradient id="pond-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe6f4" /><stop offset="1" stopColor="#9fd5ea" /></linearGradient></defs>
    <rect width="800" height="1000" fill="#e5f5fb" />
    
    <path d="M0 470 Q400 430 800 470 V1000 H0Z" fill="url(#pond-water)" />
    <g stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7">
      <path d="M90 600 q30 -12 60 0" /><path d="M520 650 q30 -12 60 0" /><path d="M300 800 q30 -12 60 0" /><path d="M620 900 q30 -12 60 0" />
    </g>
    <g fill="#9fd08f"><ellipse cx="660" cy="560" rx="62" ry="18" /><ellipse cx="140" cy="900" rx="54" ry="16" /></g>
    <circle cx="676" cy="548" r="11" fill="#f7b4cc" />
    <g fill="#8cc47c"><path d="M40 480 q8 -90 16 0Z" /><path d="M64 482 q8 -70 16 0Z" /><path d="M760 480 q8 -80 16 0Z" /></g>
  </>
}

function Room() {
  return <>
    <rect width="800" height="1000" fill="#fbf1de" />
    <rect y="700" width="800" height="300" fill="#f0dcbb" />
    <g transform="translate(520 120)"><rect width="200" height="160" rx="22" fill="#d4effb" stroke="#fff" strokeWidth="12" /><path d="M100 0 V160 M0 80 H200" stroke="#fff" strokeWidth="8" />
      <ellipse cx="60" cy="60" rx="34" ry="12" fill="#fff" /></g>
    <rect x="60" y="300" width="300" height="16" rx="8" fill="#ddb07a" />
    <circle cx="110" cy="276" r="24" fill="#f6a8c0" /><rect x="160" y="246" width="46" height="54" rx="10" fill="#9bd0ee" /><path d="M250 300 l34 -60 l34 60Z" fill="#ffd877" />
    <ellipse cx="400" cy="880" rx="300" ry="54" fill="#eacb9e" /><ellipse cx="400" cy="880" rx="220" ry="34" fill="#f3dab3" />
  </>
}

function Sky() {
  return <>
    <defs><linearGradient id="sky-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8e2fb" /><stop offset="1" stopColor="#dff1fb" /></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#sky-bg)" />
    <g fill="none" strokeWidth="26" opacity=".45">
      <path d="M60 900 A340 340 0 0 1 740 900" stroke="#f6abab" /><path d="M86 900 A314 314 0 0 1 714 900" stroke="#ffd98d" />
      <path d="M112 900 A288 288 0 0 1 688 900" stroke="#ade3a5" /><path d="M138 900 A262 262 0 0 1 662 900" stroke="#a6d5f2" />
    </g>
    
    <ellipse cx="400" cy="1000" rx="520" ry="120" fill="#fff" />
  </>
}

function Hanoi() {
  return <>
    <defs><linearGradient id="hanoi-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde9cf" /><stop offset="1" stopColor="#f7f3e3" /></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#hanoi-sky)" />
    <circle cx="150" cy="170" r="46" fill="#ffd8a0" opacity=".8" />
    
    <path d="M0 560 Q400 530 800 560 V1000 H0Z" fill="#bfe1d3" />
    <g stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".6"><path d="M120 700 q30 -12 60 0" /><path d="M560 760 q30 -12 60 0" /></g>
    {/* Tháp Rùa on its islet, drawn simply */}
    <ellipse cx="560" cy="610" rx="90" ry="16" fill="#a9d29b" />
    <g transform="translate(520 500)" fill="#e9dcc2" stroke="#c9b48e" strokeWidth="3">
      <rect x="0" y="60" width="80" height="48" /><rect x="10" y="26" width="60" height="34" /><rect x="22" y="0" width="36" height="26" />
      <path d="M-6 60 H86 M4 26 H76 M16 0 H64" />
      <path d="M22 108 v-22 a8 8 0 0 1 16 0 v22 M44 108 v-22 a8 8 0 0 1 16 0 v22" fill="#c9b48e" stroke="none" />
    </g>
    {/* Cầu Thê Húc */}
    <path d="M0 650 Q140 600 280 640" fill="none" stroke="#e0705e" strokeWidth="14" strokeLinecap="round" />
    <g stroke="#e0705e" strokeWidth="6"><path d="M50 632 V660 M120 616 V650 M190 618 V650" /></g>
    <g fill="#8fc488"><circle cx="740" cy="520" r="54" /><circle cx="690" cy="540" r="38" /></g>
  </>
}

const WORLDS: Record<SceneTheme, () => JSX.Element> = { farm: Farm, pond: Pond, room: Room, sky: Sky, hanoi: Hanoi }

/** Clouds (and the pond's fish) per world: vertical position, size, cycle length and start offset. */
const MOVERS: Record<SceneTheme, { top: string; size: number; seconds: number; offset: number; fish?: boolean }[]> = {
  farm: [{ top: '13%', size: 150, seconds: 70, offset: .2 }, { top: '7%', size: 105, seconds: 95, offset: .6 }],
  pond: [{ top: '12%', size: 120, seconds: 95, offset: .25 }, { top: '19%', size: 90, seconds: 70, offset: .7 }, { top: '74%', size: 70, seconds: 26, offset: .1, fish: true }],
  room: [],
  sky: [{ top: '18%', size: 150, seconds: 70, offset: .15 }, { top: '11%', size: 120, seconds: 95, offset: .65 }, { top: '38%', size: 90, seconds: 80, offset: .4 }],
  hanoi: [{ top: '12%', size: 110, seconds: 95, offset: .55 }],
}

const Mover = ({ fish }: { fish?: boolean }) => fish
  ? <svg viewBox="-30 -16 74 32"><g fill="#f4b467" opacity=".6"><ellipse cx="0" cy="0" rx="26" ry="12" /><path d="M22 0 l18 -12 v24z" /></g></svg>
  : <svg viewBox="-96 -42 176 72"><CloudShape /></svg>

/**
 * Keeps the whole game on screen. Small children do not scroll, so when a game is taller than
 * the play area (small phones, phones held sideways) it is drawn smaller to fit, down to MIN_FIT.
 * While fitted, the content stops stretching, so its height is its natural height and does not
 * depend on the scale; that keeps the measurement stable.
 */
function useFitToStage() {
  const box = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<{ scale: number; height: number } | null>(null)
  useLayoutEffect(() => {
    const outer = box.current, inner = content.current
    if (!outer || !inner || typeof ResizeObserver === 'undefined') return
    let current: { scale: number; height: number } | null = null
    const measure = () => {
      const style = getComputedStyle(outer)
      const room = outer.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      if (room <= 0) return
      // Not fitted yet: only act once the game no longer fits.
      if (!current && outer.scrollHeight <= outer.clientHeight + 2) return
      const height = inner.offsetHeight
      const next = height <= room + 1 ? null : { height, scale: Math.max(MIN_FIT, Math.floor(room / height * 100) / 100) }
      if (next?.scale === current?.scale && next?.height === current?.height) return
      current = next
      setFit(next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    measure()
    return () => observer.disconnect()
  }, [])
  const style = fit ? { flex: '0 0 auto', transform: `scale(${fit.scale})`, transformOrigin: 'top center', marginBottom: fit.height * (fit.scale - 1) } : undefined
  return { box, content, style, scale: fit?.scale ?? 1 }
}

export function SceneBackground({ theme = 'farm', children }: { theme?: SceneTheme; children?: ReactNode }) {
  const World = WORLDS[theme] ?? Farm
  const fit = useFitToStage()
  return <div className={`scene-frame scene-${theme}`}>
    <svg className="scene-art" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><World /></svg>
    <div className="scene-movers" aria-hidden="true">
      {(MOVERS[theme] ?? []).map((m, i) => <div key={i} className="scene-mover" style={{ top: m.top, animationDuration: `${m.seconds}s`, animationDelay: `${-m.offset * m.seconds}s` }}>
        <div style={{ width: m.size }}><Mover fish={m.fish} /></div>
      </div>)}
    </div>
    <div className="scene-container" ref={fit.box}>
      <div className="scene-content" ref={fit.content} style={fit.style} data-fit={fit.scale < 1 ? fit.scale : undefined}>
        <FitScaleContext.Provider value={fit.scale}>{children}</FitScaleContext.Provider>
      </div>
    </div>
  </div>
}
