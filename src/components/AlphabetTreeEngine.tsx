import { useState, useEffect, useMemo, useRef } from 'react'
import { Host } from '../player/Host'
import type { Game, Question, Option } from '../types'
import { playPop, speak, stopSpeech } from '../audio'
import { useGameTask } from '../useGameTask'
import { UiIcon } from './UiIcon'
import { shuffle } from '../gameLogic'
import { flyClone, pop } from '../motion/motion'

interface Props {
  game: Game
  sound: boolean
  onAnswer: (qid: string, ok: boolean) => Promise<boolean | null>
}

// Vị trí quả táo trên tán cây (phần trăm tọa độ x, y)
const APPLE_POSITIONS = [
  { x: 30, y: 22 },
  { x: 50, y: 15 },
  { x: 70, y: 22 },
  { x: 22, y: 38 },
  { x: 42, y: 32 },
  { x: 62, y: 32 },
  { x: 78, y: 40 },
]
const MANY_APPLE_POSITIONS = [
  { x: 22, y: 22 }, { x: 50, y: 14 }, { x: 78, y: 22 },
  { x: 14, y: 42 }, { x: 38, y: 40 }, { x: 62, y: 40 }, { x: 86, y: 42 },
]

export function AlphabetTreeEngine({ game, sound, onAnswer }: Props) {
  const [qIndex, setQIndex] = useState(0)
  const [pickedApple, setPickedApple] = useState<{ qid: string; label: string; correct: boolean } | null>(null)
  const [basketItems, setBasketItems] = useState<string[]>([])
  const task = useGameTask()
  const basket = useRef<HTMLDivElement>(null)
  // Bumped whenever Cô Thủy reads the letter, so the big letter glows in time with her voice.
  const [said, setSaid] = useState(0)

  const currentQ: Question | undefined = game.questions[qIndex]
  // Keep each letter in the same place throughout the session.
  const letters = useMemo(() => shuffle(game.questions[0].options.map(opt => opt.label)), [game.id])
  const selection = pickedApple?.qid === currentQ?.id ? pickedApple : null
  const targetLetter = currentQ?.options.find(opt => opt.correct)?.label

  const askCurrent = () => {
    if (sound && currentQ) {
      setSaid(n => n + 1)
      speak(currentQ.text)
    }
  }

  useEffect(() => {

    if (sound && currentQ) void speak(currentQ.text)
    return () => stopSpeech()
  }, [currentQ?.id, sound])

  async function handleAppleTap(opt: Option, apple: HTMLElement) {
    if (!currentQ || selection || task.busy.current) return
    task.busy.current = true

    playPop()
    setPickedApple({ qid: currentQ.id, label: opt.label, correct: opt.correct })

    if (opt.correct) {
      // The apple rolls into the basket at the foot of the tree.
      void flyClone(apple, basket.current, { scale: .5, lift: 40, spin: 360, duration: 700 }).then(() => pop(basket.current))
      const result = await onAnswer(currentQ.id, true)
      if (!task.alive.current) return
      if (result !== true) { setPickedApple(null); task.busy.current = false; return }
      setBasketItems((prev) => [...prev, opt.label])
        if (qIndex + 1 < game.questions.length) {
          setQIndex(index => index + 1)
        }
      task.busy.current = false
    } else {

      await onAnswer(currentQ.id, false)
      if (!task.alive.current) return
        setPickedApple(null)

      task.busy.current = false
    }
  }

  if (!currentQ) return null

  return (
    <div className="alphabet-tree-stage">
      {/* Khung hướng dẫn trong suốt không viền cứng */}
      <div className="organic-speech-bubble"><Host />
        <button className="iconbtn big bubble-speaker" onClick={() => askCurrent()} aria-label="Nghe lại">
          <UiIcon name="sound"/>
        </button>
        <span className="bubble-text">Hái chữ</span>
        <strong key={`${currentQ.id}-${said}`} className="alphabet-target-letter letter-say" aria-label={`Chữ ${targetLetter}`}>{targetLetter}</strong>
      </div>

      <div className="tree-play-area">
        {/* Cây chữ cái thần kỳ */}
        <div className="tree-wrapper">
          <img
            src="/assets/images/alphabet_tree.webp"
            alt="Cây chữ cái"
            className="organic-tree-img"
          />

          {/* Các quả táo chữ cái treo trên cành cây */}
          <div className={`apples-overlay ${letters.length > 3 ? 'apples-many' : ''}`}>
            {letters.map((letter, i) => {
              const opt = currentQ.options.find(option => option.label === letter)!
              const pos = letters.length === 2 ? { x: i ? 70 : 30, y: 22 } : letters.length > 3 ? MANY_APPLE_POSITIONS[i] : APPLE_POSITIONS[i]
              const isSelected = selection?.label === opt.label
              return (
                <button
                  key={`${currentQ.id}-${opt.id}`}
                  type="button"
                  className={`tree-apple-btn ${isSelected ? opt.correct ? 'apple-harvested' : 'apple-incorrect' : ''}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={e => handleAppleTap(opt, e.currentTarget)}
                  disabled={selection !== null}
                  aria-label={`Hái chữ ${opt.label}`}
                >
                  <img className="apple-skin" src="/assets/objects/apple-single.webp" alt="" />
                  <span className="apple-letter">{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Giỏ thu hoạch quả ở gốc cây */}
          <div className="tree-basket" ref={basket}>
            
            <div className="basket-collected">
              {basketItems.slice(-3).map((item, idx) => (
                <span key={Math.max(0, basketItems.length - 3) + idx} className="basket-letter-badge">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
