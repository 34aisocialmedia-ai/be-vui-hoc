import { useEffect, useMemo, useState } from 'react'
import { Host } from './Host'
import type { Game, Option } from '../types'
import { speak, stopSpeech, playPop, playBubblePop } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { shuffle } from '../gameLogic'
import type { Api } from './types'
import { centerOf, dropToFloor, sparkle } from '../motion/motion'
import { useStageScale } from '../motion/stage'

/* ======================== BUBBLE – BÓNG BAY NỔ ======================== */
export function BubbleEngine({ game, api }: { game: Game; api: Api }) {
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [poppingId, setPoppingId] = useState<string | null>(null)
  const q = game.questions[idx]
  const opts = useMemo(() => shuffle(q.options), [q.id])
  const k = useStageScale()

  const readQuestion = () => {
    if (api.sound) speak(q.text)
  }

  useEffect(() => {
    readQuestion()
    return () => stopSpeech()
  }, [q.id])

  async function handlePop(o: Option, bubble: HTMLElement) {
    if (poppingId) return
    playBubblePop()
    setPoppingId(o.id)
    if (o.correct) {
      // The bubble bursts into droplets and the friend inside drops onto the grass.
      const soap = bubble.querySelector('.soap-bubble')
      if (soap) sparkle(centerOf(soap), { colors: ['#bfe6f4', '#8fcbe6', '#ffffff'], count: 12, distance: 70, size: 11 })
      const floor = bubble.closest('.scene-frame')?.getBoundingClientRect().bottom
      if (floor) void dropToFloor(bubble.querySelector('.bubble-learning-picture'), floor - 18)
    }

    if (api.sound && (o.say || o.label)) {
      speak(o.say || o.label)
    }

    const res = await api.answer(q.id, o.correct)
    if (res === null) {
      setPoppingId(null)
      return
    }
    if (res) {
      setPoppingId(null)
      setWrong([])
      if (idx + 1 < game.questions.length) setIdx(idx + 1)
    } else {
      setWrong((w) => [...w, o.id])
      setPoppingId(null)
    }
  }

  return (
    <div className="engine-container bubble-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button
          className="iconbtn big speaker-btn"
          onClick={() => { playPop(); readQuestion(); }}
          aria-label="Nghe lại"
        >
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">{q.text}</div>
        {q.show && <div className="qshow">{q.show}</div>}
      </div>

      <div key={q.id} className="bubbles-floating-stage round-in">
        {opts.map((o, i) => {
          const isWrong = wrong.includes(o.id)
          const isPopping = poppingId === o.id
          return (
            <button
              type="button"
              key={o.id}
              aria-label={`Chọn ${o.label}`}
              disabled={isWrong || !!poppingId}
              className={`bubble-float-wrapper bubble-delay-${i % 4} ${isWrong ? 'bubble-burst' : ''} ${isPopping ? 'popping' : ''}`}
              onClick={e => !isWrong && handlePop(o, e.currentTarget)}
            >
              <div className="soap-bubble">
                <LearningPicture emoji={o.emoji} label={o.label} photo={o.photo} size={Math.round(96 * k)} className="bubble-learning-picture" />
              </div>
              <span className="bubble-caption">{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
