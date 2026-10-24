import { sessionEntries } from '../agePolicy'
import { Host } from '../player/Host'
import { useState, useEffect, useRef } from 'react'
import { settle } from '../motion/motion'
import { SCALE_QUESTIONS } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { LearningPicture } from './LearningPicture'
import { UiIcon } from './UiIcon'
import type { Game } from '../types'
import { playPop, speak, stopSpeech } from '../audio'

interface Props {
  game: Game
  sound: boolean
  onAnswer: (qid: string, ok: boolean) => Promise<boolean | null>
}

export function BalanceScaleEngine({ game, sound, onAnswer }: Props) {
  const QUESTIONS = sessionEntries(game, SCALE_QUESTIONS)
  const [qIdx, setQIdx] = useState(0)
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null)
  const task = useGameTask()

  const curQ = QUESTIONS[qIdx % QUESTIONS.length]
  const beam = useRef<HTMLDivElement>(null)
  const pans = useRef<HTMLDivElement>(null)

  const ask = () => {
    if (sound) {
      speak(
        curQ.askMore
          ? `Bên nào có NHIỀU ${curQ.itemLabel} hơn? Bé hãy chạm vào đĩa cân nhé!`
          : `Bên nào có ÍT ${curQ.itemLabel} hơn? Bé hãy chạm vào đĩa cân nhé!`
      )
    }
  }

  useEffect(() => {
    setSelectedSide(null)
    ask()
    return () => stopSpeech()
  }, [qIdx])

  async function handlePanTap(side: 'left' | 'right') {
    if (selectedSide || task.busy.current) return
    task.busy.current = true

    playPop()
    setSelectedSide(side)

    const isLeftCorrect = curQ.askMore
      ? curQ.leftCount > curQ.rightCount
      : curQ.leftCount < curQ.rightCount

    const isCorrect = side === 'left' ? isLeftCorrect : !isLeftCorrect

    if (isCorrect) {
      const result = await onAnswer(curQ.id, true)
      if (!task.alive.current) return
      if (result !== true) { setSelectedSide(null); task.busy.current = false; return }
        if (qIdx + 1 < QUESTIONS.length) {
          setQIdx(qIdx + 1)
        }
      task.busy.current = false
    } else {
      await onAnswer(curQ.id, false)
      if (!task.alive.current) return
      setSelectedSide(null)
      task.busy.current = false
    }
  }

  // Góc nghiêng tự nhiên của cân (nặng hơn thì nghiêng xuống)
  const tiltDeg = (curQ.leftCount - curQ.rightCount) * 2.5

  // New question: the items land on the pans, then the balance swings and comes to rest.
  useEffect(() => {
    const landed = Math.max(curQ.leftCount, curQ.rightCount) * 90 + 250
    void settle(beam.current, f => `rotate(${-tiltDeg * .4 * f}deg)`, 1500, landed)
    const [left, right] = Array.from(pans.current?.children ?? [])
    void settle(left, f => `translateY(${(tiltDeg > 0 ? 12 : -12) * f}px)`, 1500, landed)
    void settle(right, f => `translateY(${(tiltDeg < 0 ? 12 : -12) * f}px)`, 1500, landed)
  }, [qIdx])

  return (
    <div className="balance-scale-stage">
      {/* Lời dẫn không viền cứng */}
      <div className="organic-speech-bubble"><Host />
        <button className="iconbtn big bubble-speaker" onClick={() => ask()} aria-label="Nghe lại">
          <UiIcon name="sound"/>
        </button>
        <span className="bubble-text">
          <strong>{curQ.askMore ? 'Nhiều hơn?' : 'Ít hơn?'}</strong>
        </span>
      </div>

      {/* Sân khấu chiếc cân thăng bằng 3D */}
      <div className="scale-display-center">
        {/* Hình ảnh chiếc cân 3D tách nền */}
        <div className="scale-structure" aria-hidden="true">
          <div className="scale-stem"/><div className="scale-foot"/>
          <div className="scale-beam" ref={beam} style={{transform:`rotate(${-tiltDeg * .4}deg)`}}/>
          <div className="scale-pivot"/>
        </div>

        {/* Hai đĩa cân tương tác trực tiếp (không viền nút) */}
        <div className="scale-interactive-pans" ref={pans}>
          {/* Đĩa bên trái */}
          <button
            type="button"
            className={`scale-pan-btn pan-left ${selectedSide === 'left' ? 'pan-active' : ''}`}
            onClick={() => handlePanTap('left')}
            disabled={!!selectedSide}
            aria-label={`Chọn bên trái, ${curQ.leftCount} ${curQ.itemLabel}`}
            style={{ transform: `translateY(${tiltDeg > 0 ? 12 : -12}px)` }}
          >
            <div className="pan-items-grid" key={curQ.id}>
              {Array.from({ length: curQ.leftCount }).map((_, i) => (
                <span key={i} className="pan-item-emoji" style={{ '--i': i } as React.CSSProperties}>
                  <LearningPicture emoji={curQ.itemEmoji} label={curQ.itemLabel} size={44} />
                </span>
              ))}
            </div>
            <div className="pan-base-plate">
              <span className="pan-count-badge">{curQ.leftCount}</span>
            </div>
          </button>

          {/* Đĩa bên phải */}
          <button
            type="button"
            className={`scale-pan-btn pan-right ${selectedSide === 'right' ? 'pan-active' : ''}`}
            onClick={() => handlePanTap('right')}
            disabled={!!selectedSide}
            aria-label={`Chọn bên phải, ${curQ.rightCount} ${curQ.itemLabel}`}
            style={{ transform: `translateY(${tiltDeg < 0 ? 12 : -12}px)` }}
          >
            <div className="pan-items-grid" key={curQ.id}>
              {Array.from({ length: curQ.rightCount }).map((_, i) => (
                <span key={i} className="pan-item-emoji" style={{ '--i': i } as React.CSSProperties}>
                  <LearningPicture emoji={curQ.itemEmoji} label={curQ.itemLabel} size={44} />
                </span>
              ))}
            </div>
            <div className="pan-base-plate">
              <span className="pan-count-badge">{curQ.rightCount}</span>
            </div>
          </button>
        </div>
      </div>


    </div>
  )
}
