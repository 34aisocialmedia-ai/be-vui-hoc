import { UiIcon } from './UiIcon'
import { Host } from '../player/Host'
import { useState, useEffect, useRef } from 'react'
import type { Game, MatchPair } from '../types'
import { playPop, playWrong, speak } from '../audio'
import { LearningPicture } from './LearningPicture'
import { shuffle, type AnswerResult } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { flyClone } from '../motion/motion'
import { useStageScale } from '../motion/stage'

interface Props {
  game: Game
  sound: boolean
  onPairMatched: (id: string) => AnswerResult
  onMismatch?: (id: string) => AnswerResult
  onComplete?: () => void
}

interface CardItem {
  uid: string
  key: string
  emoji: string
  label: string
  photo?: string
}

export function MemoryEngine({ game, sound, onPairMatched, onMismatch, onComplete }: Props) {
  const [cards, setCards] = useState<CardItem[]>([])
  const [flippedUids, setFlippedUids] = useState<string[]>([])
  const [matchedKeys, setMatchedKeys] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [round, setRound] = useState(0)
  const task = useGameTask()
  const k = useStageScale()
  const grid = useRef<HTMLDivElement>(null)
  const shelf = useRef<HTMLDivElement>(null)

  // Khởi tạo bộ bài lật 6 hoặc 8 thẻ (3-4 cặp)
  useEffect(() => {
    const rawPairs = game.rounds?.[round] || []
    let list: CardItem[] = []

    if (rawPairs.length > 0) {
      rawPairs.forEach((p: MatchPair, idx: number) => {
        list.push({ uid: `${idx}-L`, key: p.id, emoji: p.left.emoji, label: p.left.label, photo: p.left.photo })
        list.push({ uid: `${idx}-R`, key: p.id, emoji: p.right.emoji, label: p.right.label, photo: p.right.photo })
      })
    } else {
      // Fallback nếu không có rounds
      const samples = [
        { key: 'cat', emoji: '🐱', label: 'Con mèo' },
        { key: 'dog', emoji: '🐶', label: 'Con chó' },
        { key: 'duck', emoji: '🦆', label: 'Con vịt' },
        { key: 'turtle', emoji: '🐢', label: 'Cụ Rùa' },
      ]
      samples.forEach((s) => {
        list.push({ uid: s.key + '-1', key: s.key, emoji: s.emoji, label: s.label })
        list.push({ uid: s.key + '-2', key: s.key, emoji: s.emoji, label: s.label })
      })
    }

    // Xáo trộn ngẫu nhiên
    const shuffled = shuffle(list)
    setCards(shuffled)
    setFlippedUids([])
    setMatchedKeys([])
    setBusy(false)

    if (sound) {
      speak(game.prompt || 'Bé hãy lật tìm hai thẻ giống nhau nhé!')
    }
  }, [round, game.id])

  async function handleCardTap(card: CardItem) {
    if (task.busy.current || busy) return
    if (flippedUids.includes(card.uid) || matchedKeys.includes(card.key)) return

    playPop()
    const nextFlipped = [...flippedUids, card.uid]
    setFlippedUids(nextFlipped)

    if (nextFlipped.length === 2) {
      task.busy.current = true
      setBusy(true)
      const firstCard = cards.find((c) => c.uid === nextFlipped[0])!
      const secondCard = card

      if (firstCard.key === secondCard.key) {
        // Đúng cặp!
        const result = await onPairMatched(`${round}-${firstCard.key}`)
        if (!task.alive.current) return
        if (result !== true) {
          setFlippedUids([])
          setBusy(false)
          task.busy.current = false
          return
        }
        const now = [...matchedKeys, firstCard.key]
        // Both cards of the pair fly up to the display shelf.
        const slot = shelf.current?.children[matchedKeys.length]
        for (const uid of [firstCard.uid, secondCard.uid]) void flyClone(grid.current?.querySelector(`[data-uid="${uid}"] .card-front > :first-child`), slot, { scale: .4, lift: 70 })
        setMatchedKeys(now)
        setFlippedUids([])

        // Kiểm tra xem đã mở hết bài chưa
        const totalUniqueKeys = new Set(cards.map((c) => c.key)).size
        if (now.length >= totalUniqueKeys) {
          if (!await task.delay(450)) return
          if (round + 1 < (game.rounds?.length || 1)) setRound(round + 1)
          else onComplete?.()
        }
        setBusy(false)
        task.busy.current = false
      } else {
        // Sai cặp
        if (onMismatch) {
          await onMismatch(`${round}-${firstCard.key}`)
          if (!task.alive.current) return
        } else playWrong()
        if (!await task.delay(900)) return
        setFlippedUids([])
        setBusy(false)
        task.busy.current = false
      }
    }
  }

  return (
    <div className="engine-container memory-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button
          className="iconbtn big speaker-btn"
          onClick={() => sound && speak(game.prompt || 'Bé hãy lật tìm hai thẻ giống nhau nhé!')}
          aria-label="Nghe lại"
        >
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">
          Tìm hai bạn giống nhau
        </div>
      </div>

      <div className="memory-shelf" ref={shelf} aria-label={`Đã tìm được ${matchedKeys.length} cặp`}>
        {Array.from({ length: cards.length / 2 }, (_, i) => {
          const card = cards.find(c => c.key === matchedKeys[i])
          return <span key={`${round}-${i}`} className={card ? 'filled' : ''}>{card && <LearningPicture emoji={card.emoji} label={card.label} photo={card.photo} size={40 * k} />}</span>
        })}
      </div>

      <div key={round} ref={grid} className={`memory-cards-grid round-in pairs-${cards.length / 2}`}>
        {cards.map((c) => {
          const isFlipped = flippedUids.includes(c.uid)
          const isMatched = matchedKeys.includes(c.key)
          const isOpen = isFlipped || isMatched

          return (
            <button
              type="button"
              key={c.uid}
              data-uid={c.uid}
              aria-label={isOpen ? c.label : `Lật thẻ ${cards.indexOf(c) + 1}`}
              disabled={busy || isOpen}
              className={`memory-card-3d ${isOpen ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardTap(c)}
            >
              <div className="card-face card-back" aria-hidden={isOpen}>
                <span className="card-back-pattern" aria-hidden="true"/>
              </div>
              <div className="card-face card-front" aria-hidden={!isOpen}>
                <LearningPicture emoji={c.emoji} label={c.label} photo={c.photo} size={84 * k} className="card-front-photo" />
                <span className="card-label">{c.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <p className="sub memory-hint">
        👆 🃏 + 🃏 → ⭐
      </p>
    </div>
  )
}
