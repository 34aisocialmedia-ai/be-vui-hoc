import { useEffect, useMemo, useRef, useState } from 'react'
import { Host } from './Host'
import type { Game, MatchPair } from '../types'
import { speak, stopSpeech, playPop } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { shuffle } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import type { Api } from './types'
import { connect, lean } from '../motion/motion'
import { useStageScale } from '../motion/stage'

/* ============================ G02 – Ghép đôi ============================ */
export function MatchEngine({ game, api }: { game: Game; api: Api }) {
  const task = useGameTask()
  const rounds = game.rounds!
  const [ri, setRi] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [bad, setBad] = useState<string | null>(null)
  const round = rounds[ri]
  const k = useStageScale()
  const wrap = useRef<HTMLDivElement>(null)
  const rightOrder = useMemo(() => shuffle(round), [ri])

  useEffect(() => {
    if (api.sound) speak(game.prompt ?? 'Con hãy ghép đôi nhé!')
    return () => stopSpeech()
  }, [ri])

  const hear = (t: string) => {
    if (api.sound) speak(t)
  }

  function pickLeft(p: MatchPair) {
    if (task.busy.current) return
    playPop()
    if (matched.includes(p.id)) return
    setSel(p.id)
    hear(p.left.label)
  }

  async function pickRight(p: MatchPair) {
    if (task.busy.current) return
    playPop()
    if (matched.includes(p.id)) return
    if (!sel) {
      hear(p.right.label)
      return
    }
    const leftId = sel
    task.busy.current = true
    const ok = leftId === p.id
    if (ok) {
      // A line joins the two partners, then they lean toward each other.
      const a = wrap.current?.querySelector(`[data-left="${leftId}"]`), b = wrap.current?.querySelector(`[data-right="${p.id}"]`)
      void connect(a, b)
      void lean(a, 12); void lean(b, -12)
    }
    const res = await api.answer(`match-${ri}-${leftId}`, ok)
    if (!task.alive.current) return
    if (res === null) { task.busy.current = false; return }

    if (res) {
      const now = [...matched, leftId]
      setMatched(now)
      setSel(null)
      if (round.every((r) => now.includes(r.id)) && ri + 1 < rounds.length) {
        if (!await task.delay(350)) return
        setRi(ri + 1)
        setMatched([])
      }
    } else {
      setBad(p.id)
      setSel(null)
      task.delay(500).then(active => { if (active) setBad(null) })
    }
    task.busy.current = false
  }

  return (
    <>
      <div className="qcard bouncy-card"><Host />
        <button className="iconbtn big speaker-btn" onClick={() => { playPop(); hear(game.prompt ?? ''); }} aria-label="Nghe lại">
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">Ghép hai bạn</div>
      </div>

      <div key={ri} ref={wrap} className="matchwrap round-in-cols">
        <div className="mcol">
          {round.map((p) => (
            <button
              key={p.id}
              data-left={p.id}
              className={'mcard opt-3d' + (sel === p.id ? ' sel' : '') + (matched.includes(p.id) ? ' ok' : '')}
              onClick={() => pickLeft(p)}
              disabled={matched.includes(p.id)}
              aria-pressed={sel === p.id}
            >
              <LearningPicture emoji={p.left.emoji} label={p.left.label} photo={p.left.photo} size={80 * k} />
              {p.left.label && <span className="olabel">{p.left.label}</span>}
            </button>
          ))}
        </div>
        <div className="mcol">
          {rightOrder.map((p) => (
            <button
              key={p.id}
              data-right={p.id}
              className={'mcard opt-3d' + (matched.includes(p.id) ? ' ok' : '') + (bad === p.id ? ' wrong' : '')}
              onClick={() => pickRight(p)}
              disabled={matched.includes(p.id)}
            >
              <LearningPicture emoji={p.right.emoji} label={p.right.label} photo={p.right.photo} size={80 * k} />
              {p.right.label && <span className="olabel">{p.right.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
