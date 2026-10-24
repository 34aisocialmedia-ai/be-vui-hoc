import { UiIcon } from './UiIcon'
import { Host } from '../player/Host'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Game, MatchSide } from '../types'
import { shuffle } from '../gameLogic'
import { playLearningNote, playPop, speak, stopSpeech } from '../audio'
import { useGameTask } from '../useGameTask'
import { LearningPicture } from './LearningPicture'
import { connect, flyClone, floatNote, pop } from '../motion/motion'
import { useStageScale } from '../motion/stage'

interface Props {
  game: Game
  sound: boolean
  paused: boolean
  finished: boolean
  onAnswer: (qid: string, ok: boolean) => Promise<boolean | null>
}
function Header({ children, read }: { children: React.ReactNode; read: () => void }) {
  return <div className="qcard creative-header"><Host /><button className="iconbtn big speaker-btn" aria-label="Nghe lại" onClick={read}><UiIcon name="sound"/></button>{children}</div>
}

export function StoryOrderEngine({ game, sound, paused, finished, onAnswer }: Props) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [replay, setReplay] = useState(false)
  const task = useGameTask()
  const k = useStageScale()
  const slots = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLDivElement>(null)
  const q = game.questions[index]
  const steps = q.steps!
  const order = useMemo(() => shuffle(steps.map((_, i) => i)), [q.id])
  const blocked = paused || finished
  const read = () => { if (sound) void speak(`Con xếp chuyện nhé. ${steps.map((s, i) => `${i === 0 ? 'Đầu tiên' : i === steps.length - 1 ? 'Cuối cùng' : 'Tiếp theo'}, ${s.label}`).join('. ')}.`) }
  useEffect(() => { read(); return () => stopSpeech() }, [q.id, sound])
  async function choose(value: number) {
    if (blocked || task.busy.current || selected.includes(value)) return
    task.busy.current = true
    playPop()
    try {
      if (value !== selected.length) {
        setWrong(value)
        await onAnswer(q.id, false)
        if (task.alive.current) setWrong(null)
        return
      }
      const next = [...selected, value]
      if (sound) void speak(steps[value].label)
      // The picture travels from the card into its numbered slot.
      const slot = slots.current?.children[selected.length]
      await flyClone(cards.current?.querySelector(`[data-step="${value}"] > :first-child`), slot, { scale: .85, lift: 50, duration: 480 })
      if (!task.alive.current) return
      setSelected(next)
      void pop(slot)
      if (next.length === steps.length) {
        setReplay(true) // play the finished story back, slot by slot, like a short film
        const result = await onAnswer(q.id, true)
        if (!task.alive.current) return
        setReplay(false)
        if (result === true && index + 1 < game.questions.length) { setIndex(i => i + 1); setSelected([]) }
        else if (result !== true) setSelected(selected)
      }
    } finally { task.busy.current = false }
  }
  return <div className="creative-engine story-engine">
    <Header read={read}><span>Xếp chuyện</span><span aria-hidden="true">1 › 2 › {steps.length === 3 ? '3' : '✓'}</span></Header>
    <div className={`story-slots ${replay ? 'replay' : ''}`} ref={slots} aria-label="Thứ tự câu chuyện">
      {steps.map((step, i) => <div key={i} style={{ '--i': i } as React.CSSProperties} className={`story-slot ${i === selected.length ? 'next-slot' : ''}`}>
        <b>{i + 1}</b>{selected.includes(i) ? <LearningPicture {...step} size={88 * k} /> : <span className="slot-question">?</span>}
      </div>)}
    </div>
    <div key={q.id} className="story-cards round-in" ref={cards}>{order.map(value => <button key={`${q.id}-${value}`} type="button" aria-label={`Chọn tranh ${steps[value].label}`}
      data-step={value}
      className={`story-card ${selected.includes(value) ? 'placed' : ''} ${wrong === value ? 'try-again' : ''}`}
      disabled={blocked || selected.includes(value)} onClick={() => choose(value)}>
      <LearningPicture {...steps[value]} size={104 * k} /><span>{steps[value].label}</span>
    </button>)}</div>
  </div>
}

export function SpatialEngine({ game, sound, paused, finished, onAnswer }: Props) {
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [right, setRight] = useState<string | null>(null)
  const task = useGameTask()
  const k = useStageScale()
  const wanted = useRef<HTMLSpanElement>(null)
  const reference = useRef<HTMLDivElement>(null)
  const q = game.questions[index]
  const target = q.options.find(o => o.correct)!
  const read = () => { if (sound) void speak(q.text) }
  useEffect(() => { read(); return () => stopSpeech() }, [q.id, sound])
  async function pick(id: string, correct: boolean, el: HTMLElement) {
    if (paused || finished || task.busy.current) return
    task.busy.current = true
    playPop()
    if (correct) {
      setRight(id)
      // The asked-for picture flies to the spot, and a line shows where it is from the reference.
      void connect(reference.current, el, '#7bca98')
      void flyClone(wanted.current, el, { scale: 1.3, lift: 50 })
    } else setWrong(id)
    try {
      const result = await onAnswer(q.id, correct)
      if (!task.alive.current) return
      if (result === true && index + 1 < game.questions.length) setIndex(i => i + 1)
      setWrong(null); setRight(null)
    } finally { task.busy.current = false }
  }
  return <div className="creative-engine spatial-engine">
    <Header read={read}><span>Tìm ở đâu?</span><span ref={wanted} className="spatial-wanted"><LearningPicture emoji={target.emoji} size={46} icon /></span><b className={`position-arrow position-${q.position}`} aria-label={target.label}>↑</b></Header>
    <div className="spatial-board round-in" key={q.id}>
      <div className="spatial-reference" ref={reference}><LearningPicture {...q.reference!} size={Math.round(90 * k)} icon /></div>
      {q.options.map(o => <button key={`${q.id}-${o.id}`} className={`spatial-object ${wrong === o.id ? 'try-again' : ''} ${right === o.id ? 'found-object' : ''}`}
        type="button" style={{ left: `${o.x}%`, top: `${o.y}%` }} aria-label={o.label} disabled={paused || finished} onClick={e => pick(o.id, o.correct, e.currentTarget)}>
        <LearningPicture {...o} size={Math.round(80 * k)} icon />
      </button>)}
    </div>
  </div>
}

export function RhythmEngine({ game, sound, paused, finished, onAnswer }: Props) {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [activePad, setActivePad] = useState<number | null>(null)
  const [demonstrating, setDemonstrating] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)
  const [demoStep, setDemoStep] = useState<number | null>(null)
  const task = useGameTask()
  const k = useStageScale()
  const padRow = useRef<HTMLDivElement>(null)
  const q = game.questions[index]
  const pads = game.pads!
  const notes = q.notes!
  const muted = useRef(!sound); muted.current = !sound
  const blocked = useRef(paused || finished); blocked.current = paused || finished
  const demonstration = useRef(0)
  useEffect(() => () => { demonstration.current++ }, [])
  useEffect(() => { if (paused || finished) { demonstration.current++; setDemonstrating(false); setActivePad(null) } }, [paused, finished])
  async function demo() {
    if (blocked.current || task.busy.current) return
    const token = ++demonstration.current
    setDemonstrating(true)
    try {
      for (const [step, note] of notes.entries()) {
        if (!task.alive.current || token !== demonstration.current || blocked.current) return
        setDemoStep(step)
        setActivePad(note)
        if (!muted.current) playLearningNote(note)
        if (!await task.delay(430)) return
        if (token !== demonstration.current) return
        setActivePad(null)
        if (!await task.delay(180)) return
      }
    } finally {
      if (task.alive.current && token === demonstration.current) { setDemonstrating(false); setActivePad(null); setDemoStep(null) }
    }
  }
  // Each sound sends a music note floating up from its pad.
  useEffect(() => { if (activePad !== null) floatNote(padRow.current?.children[activePad]) }, [activePad])
  useEffect(() => {
    setProgress(0); setWrong(null)
    void demo()
    return () => { demonstration.current++ }
  }, [q.id])
  async function hit(note: number) {
    if (blocked.current || demonstrating || task.busy.current) return
    task.busy.current = true
    setActivePad(note)
    if (sound) playLearningNote(note)
    try {
      if (note !== notes[progress]) {
        setWrong(note)
        await onAnswer(q.id, false)
        if (task.alive.current) setWrong(null)
      } else {
        const next = progress + 1
        setProgress(next)
        if (next === notes.length) {
          const result = await onAnswer(q.id, true)
          if (!task.alive.current) return
          if (result === true && index + 1 < game.questions.length) setIndex(i => i + 1)
          else if (result !== true) setProgress(progress)
        } else await task.delay(160)
      }
    } finally { if (task.alive.current) setActivePad(null); task.busy.current = false }
  }
  return <div className="creative-engine rhythm-engine">
    <Header read={demo}><span>Gõ theo nhạc</span><button type="button" className="rhythm-demo" onClick={demo} disabled={demonstrating || paused || finished} aria-label="Nghe và xem giai điệu mẫu">▶ ♪</button></Header>
    <div className="rhythm-sequence" aria-label="Mẫu giai điệu">
      {notes.map((note, i) => <span key={`${q.id}-${i}`} className={`${i < progress ? 'note-complete' : ''} ${i === progress && !demonstrating ? 'note-next' : ''} ${demoStep === i ? 'note-demo' : ''}`}>
        <LearningPicture {...pads[note]} size={52 * k} />{i < progress && <b>✓</b>}
      </span>)}
    </div>
    <div className="rhythm-pads" ref={padRow}>{pads.map((pad: MatchSide, i) => <button type="button" key={i} className={`rhythm-pad pad-color-${i} ${activePad === i ? 'pad-playing' : ''} ${wrong === i ? 'try-again' : ''}`}
      aria-label={`Gõ ${pad.label}`} disabled={demonstrating || paused || finished} onClick={() => hit(i)}>
      <LearningPicture {...pad} size={85 * k} />
    </button>)}</div>
  </div>
}
