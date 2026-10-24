import { sessionEntries } from '../agePolicy'
import { Host } from '../player/Host'
import { UiIcon } from './UiIcon'
import { useState, useEffect, useRef } from 'react'
import type { Game } from '../types'
import { playPop, playWrong, speak, stopSpeech } from '../audio'
import { TRAIN_ROUNDS, type AnswerResult } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { LearningPicture } from './LearningPicture'
import { flyClone } from '../motion/motion'

interface Props {
  game: Game
  sound: boolean
  onComplete?: () => void
  onCargoLoaded: (round: number) => AnswerResult
}

export function NumberTrainEngine({ game, sound, onComplete, onCargoLoaded }: Props) {
  const ROUNDS = sessionEntries(game, TRAIN_ROUNDS)
  const [roundIdx, setRoundIdx] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)
  const [isDeparting, setIsDeparting] = useState(false)
  const task = useGameTask()
  const loadedRef = useRef(0)
  const bay = useRef<HTMLDivElement>(null)

  const curRound = ROUNDS[roundIdx % ROUNDS.length]

  const askTask = () => {
    if (sound) {
      speak(`Toa xe cần chở ${curRound.targetNumber} ${curRound.itemLabel}! Bé hãy chạm để xếp lên toa nhé!`)
    }
  }

  useEffect(() => {
    setLoadedCount(0)
    loadedRef.current = 0
    setIsDeparting(false)
    askTask()
    return () => stopSpeech()
  }, [roundIdx])

  async function handleItemTap(item: Element | null) {
    if (isDeparting || task.busy.current) return
    if (loadedRef.current < curRound.targetNumber) void flyClone(item, bay.current, { scale: .75, lift: 90, duration: 520 })

    playPop()
    const next = ++loadedRef.current
    setLoadedCount(next)

    if (sound) {
      speak(String(next))
    }

    if (next === curRound.targetNumber) {
      // Đủ số lượng! Tàu lăn bánh
      task.busy.current = true
      setIsDeparting(true)
      const result = await onCargoLoaded(roundIdx)
      if (!task.alive.current) return
      if (result !== true) { loadedRef.current = 0; setLoadedCount(0); setIsDeparting(false); task.busy.current = false; return }
      if (!await task.delay(600)) return
        if (roundIdx + 1 < ROUNDS.length) {
          setRoundIdx(roundIdx + 1)
        } else {
          onComplete?.()
        }
      task.busy.current = false
    } else if (next > curRound.targetNumber) {
      playWrong()
      if (sound) speak(`Nhiều quá rồi, chỉ cần ${curRound.targetNumber} thôi nhé!`)
      setLoadedCount(0)
    }
  }

  return (
    <div className="number-train-stage">
      {/* Lời dẫn không viền cứng */}
      <div className="organic-speech-bubble"><Host />
        <button className="iconbtn big bubble-speaker" onClick={() => askTask()} aria-label="Nghe lại">
          <UiIcon name="sound"/>
        </button>
        <span className="bubble-text">
          <strong className="train-target">{curRound.targetNumber} × <LearningPicture emoji={curRound.itemEmoji} label={curRound.itemLabel} size={40}/></strong>
        </span>
      </div>

      {/* Đường ray và đoàn tàu số học 3D */}
      <div className={`train-track-area ${isDeparting ? 'train-rolling' : ''}`}>
        <div className="train-steam-cloud" aria-hidden="true"><i/><i/><i/></div>

        {/* Đầu tàu 3D tách nền tự nhiên */}
        <div className="train-engine-wrapper">
          <img
            src="/assets/images/train_locomotive.webp"
            alt="Đầu tàu hơi nước"
            className="organic-train-img"
          />
        </div>

        {/* Toa chở hàng gắn liền kề */}
        <div className="train-wagon">
          <div className="wagon-number-badge">{curRound.targetNumber}</div>
          <div className="wagon-cargo-bay" ref={bay}>
            {Array.from({ length: loadedCount }).map((_, i) => (
              <span key={i} className="loaded-cargo-item">
                <LearningPicture emoji={curRound.itemEmoji} label={curRound.itemLabel} size={42} />
              </span>
            ))}
          </div>
          <div className="wagon-wheels">
            <div className="wheel"></div>
            <div className="wheel"></div>
          </div>
        </div>

        {/* Đường ray xe lửa */}
        <div className="railroad-track"></div>
      </div>

      {/* Kho hàng hóa tự nhiên trên bãi cỏ (không khung nút) */}
      <div className="train-station-items">
        <p className="items-prompt" aria-label={`Đã xếp ${loadedCount} trên ${curRound.targetNumber}`}>{loadedCount}/{curRound.targetNumber}</p>
        <div className="loose-items-row">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              className="loose-tactile-item"
              onClick={e => handleItemTap(e.currentTarget.firstElementChild)}
              disabled={isDeparting || i < loadedCount}
              aria-label={`Xếp ${curRound.itemLabel} lên tàu`}
            >
              <span className="tactile-emoji"><LearningPicture emoji={curRound.itemEmoji} label={curRound.itemLabel} size={56} /></span>
              <span className="tactile-shadow"></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
