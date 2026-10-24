import { useEffect, useRef, useState } from 'react'
import { Host } from './Host'
import type { Game, MatchPair } from '../types'
import { speak, stopSpeech, playPop } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { Icon3D } from '../components/Icon3D'
import { useGameTask } from '../useGameTask'
import type { Api } from './types'
import { flyClone, tug } from '../motion/motion'

/* ==================== PUZZLE – KHỚP BÓNG MONTESSORI ==================== */
export function PuzzleEngine({ game, api }: { game: Game; api: Api }) {
  const [idx, setIdx] = useState(0)
  const [matched, setMatched] = useState<string[]>([])
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null)
  const [snapping, setSnapping] = useState<string | null>(null)
  const [snapped, setSnapped] = useState<string | null>(null)
  const tray = useRef<HTMLDivElement>(null)
  const task = useGameTask()
  const currentRound = game.rounds?.[idx] || []

  const readRound = () => {
    if (api.sound && currentRound.length) {
      speak(game.prompt || 'Bé hãy tìm và ghép đúng bóng của các hình nhé!')
    }
  }

  useEffect(() => {
    readRound()
    return () => stopSpeech()
  }, [idx])

  async function handleSilhouetteTap(pair: MatchPair, slot: HTMLElement) {
    if (task.busy.current || matched.includes(pair.id)) return
    if (!selectedPiece) {
      playPop()
      if (api.sound) speak('Bé hãy chọn mảnh ghép bên dưới trước nhé!')
      return
    }

    const piece = tray.current?.querySelector('.piece-selected > :first-child')
    if (selectedPiece === pair.id) {
      task.busy.current = true
      setSnapping(pair.id)
      await flyClone(piece, slot, { scale: 1.05, lift: 16, duration: 430, easing: 'cubic-bezier(.55,0,.9,.4)' })
      if (!task.alive.current) return
      setSnapped(pair.id)
      const res = await api.answer(`puzzle-${idx}-${pair.id}`, true)
      if (!task.alive.current) return
      setSnapping(null); setSnapped(null)
      if (res !== true) { task.busy.current = false; return }
      setMatched((m) => [...m, pair.id])
      setSelectedPiece(null)
      if (res && matched.length + 1 >= currentRound.length) {
        if (!await task.delay(450)) return
        setMatched([])
        if (idx + 1 < (game.rounds?.length || 0)) setIdx(idx + 1)
      }
      task.busy.current = false
    } else {
      // api.answer already plays the "wrong" sound once.
      task.busy.current = true
      void tug(piece, slot, .3)
      await api.answer(`puzzle-${idx}-${pair.id}`, false)
      task.busy.current = false
      if (api.sound) speak('Bóng này chưa khớp rồi, bé thử lại nhé!')
    }
  }

  return (
    <div className="engine-container puzzle-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button
          className="iconbtn big speaker-btn"
          onClick={() => { playPop(); readRound(); }}
          aria-label="Nghe lại"
        >
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">Ghép đúng bóng</div>
      </div>

      <div className="puzzle-shadow-stage">
        {currentRound.map((pair) => {
          const isDone = matched.includes(pair.id) || snapped === pair.id
          return (
            <button
              type="button"
              key={pair.id}
              aria-label={`Ghép bóng ${pair.right.label}`}
              disabled={isDone}
              className={`puzzle-slot ${isDone ? 'slot-completed' : 'slot-shadow'}`}
              onClick={e => !isDone && handleSilhouetteTap(pair, e.currentTarget)}
            >
              <Icon3D
                emoji={pair.right.emoji}
                size={64}
                className={`puzzle-emoji ${isDone ? 'active-color' : 'shadow-mask'}`}
              />
              <span className="puzzle-label">{isDone ? '⭐' : '❓'}</span>
            </button>
          )
        })}
      </div>

      <div className="puzzle-pieces-tray" ref={tray}>
        {currentRound
          .filter((pair) => !matched.includes(pair.id))
          .map((pair) => (
            <button
              key={pair.id}
              className={`puzzle-piece-btn ${selectedPiece === pair.id ? 'piece-selected' : ''} ${snapping === pair.id ? 'is-flying' : ''}`}
              onClick={() => {
                playPop()
                setSelectedPiece(pair.id)
                if (api.sound) speak(pair.left.label)
              }}
            >
              <Icon3D emoji={pair.left.emoji} size={60} />
              <span className="piece-name">{pair.left.label}</span>
            </button>
          ))}
      </div>
      <p className="sub puzzle-hint">👆 🧩 → ❓</p>
    </div>
  )
}
