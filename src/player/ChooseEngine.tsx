import { useEffect, useMemo, useRef, useState } from 'react'
import { Host } from './Host'
import type { Game, Option } from '../types'
import { speak, stopSpeech, playPop } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { VisualCard } from '../components/VisualCard'
import { shuffle } from '../gameLogic'
import { AGE_PLAY_POLICY } from '../agePolicy'
import { flyClone, hopEach } from '../motion/motion'
import type { Api } from './types'

/* ============================ G01 – Chọn đáp án ============================ */
export function ChooseEngine({ game, api }: { game: Game; api: Api }) {
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [right, setRight] = useState<string | null>(null)
  const q = game.questions[idx]
  const card = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const opts = useMemo(() => shuffle(q.options), [q.id])

  // Pictures grow with the free space: about 100 px on a phone, up to 220 px on a tablet.
  // Pictures stand on the scene (no card around them), so they can take most of the room.
  const extra = q.showPhoto ? Math.min(260, (api.stage.height || 600) * .34) : q.show || q.groups || q.sequence || q.pattern ? 150 : 0
  // Try each number of columns and keep the one that gives the biggest pictures for this screen.
  const sizeFor = (cols: number) => {
    const rows = Math.ceil(opts.length / cols)
    return Math.min(280, (api.stage.height - 180 - extra) / rows - 68, (api.stage.width - 40) / cols - 22)
  }
  const choices = opts.length <= 2 ? [opts.length, 1] : opts.length === 4 ? [2, 4] : [opts.length, 2]
  const cols = api.stage.width ? choices.reduce((best, c) => sizeFor(c) > sizeFor(best) + 8 ? c : best) : choices[0]
  const picture = api.stage.width ? Math.max(92, sizeFor(cols)) : 110
  // Things to count or compare are shown big on the scene, not squeezed into the question bubble.
  const shown = q.show ? Array.from(q.show.replace(/[\s\uFE0F]/g, '')) : []
  const showSize = Math.max(44, Math.min(96, ((api.stage.width || 360) - 40) / Math.max(4, Math.min(shown.length, 6)) - 12))
  const patternSize = q.pattern ? Math.max(40, Math.min(92, ((api.stage.width || 360) - 40) / (q.pattern.length + 1) - 10)) : 0
  const show = useRef<HTMLDivElement>(null)
  const hintAfter = AGE_PLAY_POLICY[game.age]?.hintAfter ?? 2

  const say = (o: Option) => (o.say !== undefined ? o.say : o.label)
  const readQuestion = () => {
    if (api.sound) speak(q.text)
  }

  useEffect(() => {
    readQuestion()
    return () => stopSpeech()
  }, [q.id])

  async function pick(o: Option) {
    playPop()
    setRight(o.correct ? o.id : null)
    const picture = grid.current?.children[opts.indexOf(o)]?.querySelector('.card-visual-media > *')
    if (o.correct) {
      // The companion "picks up" the right answer.
      void flyClone(picture, document.querySelector('.player-companion .companion-body'), { scale: .35, lift: 60 })
    } else if (q.show || q.groups || q.pattern) {
      // Counting and pattern questions: the objects hop one by one so the child can count again.
      hopEach(show.current?.querySelectorAll('.qshow > *, .learning-group > *, .fruit-pattern > *') ?? [])
    }
    const res = await api.answer(q.id, o.correct)
    if (res === null) return
    if (res) {
      setRight(null)
      setWrong([])
      if (idx + 1 < game.questions.length) setIdx(idx + 1)
    } else {
      setWrong((w) => [...w, o.id])
    }
  }

  return (
    <>
      <div className="qcard bouncy-card" ref={card}><Host />
        <button className="iconbtn big speaker-btn" onClick={() => { playPop(); readQuestion(); }} aria-label="Nghe lại">
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">{q.text}</div>
      </div>

      {(q.show || q.showPhoto || q.groups || q.sequence || q.pattern) && <div key={`show-${q.id}`} className="scene-show round-in" ref={show}>
        {q.showPhoto && <img className="qshow-photo" src={q.showPhoto} alt="" />}
        {q.show && <div className="qshow">{Array.from(q.show.replace(/[\s\uFE0F]/g, '')).map((emoji, i) => <LearningPicture key={i} emoji={emoji} size={showSize} />)}</div>}
        {q.groups && <div className="learning-groups" aria-label="Các nhóm đồ vật">
          {q.groups.map((group, i) => <div className="learning-group" key={i}>{group.map((emoji, j) => <LearningPicture key={j} emoji={emoji} size={Math.round(showSize * .85)} />)}</div>)}
        </div>}
        {q.sequence && <div className="number-sequence" role="img" aria-label={`Dãy số ${q.sequence.map(n => n ?? 'ô trống').join(', ')}`}>
          {q.sequence.map((n, i) => <b key={i} className={n === null ? 'missing' : ''}>{n ?? '?'}</b>)}
        </div>}
        {q.pattern && <div className="fruit-pattern" role="img" aria-label="Quy luật các loại quả, tìm quả tiếp theo">
          {q.patternBlank === 'start' && <b>?</b>}{q.pattern.map((emoji, i) => <LearningPicture key={i} emoji={emoji} size={Math.round(patternSize)} />)}{q.patternBlank !== 'start' && <b>?</b>}
        </div>}
      </div>}

      <div key={q.id} ref={grid} className={`options-cards-grid stickers round-in drop n${opts.length} cols-${cols}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {opts.map((o) => (
          <VisualCard
            key={o.id}
            label={o.label}
            emoji={o.emoji}
            photo={o.photo}
            scale={(o.scale ?? 1) * picture / 96}
            sound={api.sound}
            spokenLabel={say(o)}
            disabled={wrong.includes(o.id)}
            highlight={right === o.id}
            hint={o.correct && wrong.length >= hintAfter}
            onClick={() => pick(o)}
          />
        ))}
      </div>
    </>
  )
}
