import { sessionEntries } from '../agePolicy'
import { Host } from '../player/Host'
import { useState, useRef, useEffect } from 'react'
import type { Game } from '../types'
import { playPop, speak } from '../audio'
import { DOT_LEVELS, nextDotCount, type AnswerResult } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { LearningPicture } from './LearningPicture'
import { toyMove, type ToyMove } from '../motion/motion'

const FILLS = ['#ffd98d', '#f6abab', '#a6d5f2', '#ade3a5', '#d9c7f5']
const ALIVE: Record<string, ToyMove> = { '⭐': 'spin', '💎': 'spin', '🏠': 'hop', '💖': 'hop', '⛵': 'swim', '✉️': 'flutter', '🌲': 'sway', '⛰️': 'float' }

interface Props {
  game: Game
  sound: boolean
  onShapeCompleted: (id: string) => AnswerResult
  onComplete?: () => void
}

export function ConnectDotsEngine({ game, sound, onShapeCompleted, onComplete }: Props) {
  const LEVELS = sessionEntries(game, DOT_LEVELS)
  const [levelIdx, setLevelIdx] = useState(0)
  const [connectedCount, setConnectedCount] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLSpanElement>(null)
  const task = useGameTask()

  const curLevel = LEVELS[levelIdx % LEVELS.length]
  const dots = curLevel.dots

  useEffect(() => {
    setConnectedCount(0)
    setIsDone(false)
    if (sound) {
      speak(`Bé hãy nối các số từ 1 đến ${dots.length} để vẽ ${curLevel.name} nhé!`)
    }
  }, [levelIdx])

  useEffect(() => {
    if (!isDone) return
    const timer = setTimeout(() => void toyMove(revealRef.current, ALIVE[curLevel.emoji] ?? 'hop'), 700)
    return () => clearTimeout(timer)
  }, [isDone])

  async function handleDotTap(targetIdx: number) {
    if (isDone || task.busy.current) return

    // Điểm kế tiếp cần chạm là connectedCount (1-indexed)
    if (targetIdx === connectedCount) {
      playPop()
      const nextCount = nextDotCount(connectedCount, targetIdx, dots.length)
      setConnectedCount(nextCount)

      if (nextCount === dots.length) {
        task.busy.current = true
        // Hoàn thành hình vẽ!
        setIsDone(true)
        const result = await onShapeCompleted(String(levelIdx))
        if (!task.alive.current) return
        if (result !== true) { setConnectedCount(dots.length - 1); setIsDone(false); task.busy.current = false; return }
        if (!await task.delay(600)) return
          if (levelIdx + 1 < LEVELS.length) {
            setLevelIdx(levelIdx + 1)
          } else {
            onComplete?.()
          }
        task.busy.current = false
      } else {
        if (sound) speak(String(nextCount))
      }
    }
  }

  return (
    <div className="engine-container connect-dots-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button
          className="iconbtn big speaker-btn"
          onClick={() => sound && speak(`Bé nối các số từ 1 đến ${dots.length} nhé!`)}
          aria-label="Nghe lại"
        >
          ✏️
        </button>
        <div className="qtext">
          {curLevel.emoji} 1 → 2 → 3
        </div>
      </div>

      <div className="dots-canvas-wrapper" ref={containerRef}>
        {/* SVG đường nối */}
        <svg className="dots-svg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {isDone && <polygon className="dots-fill" points={dots.map(p => `${p.x},${p.y}`).join(' ')} fill={FILLS[levelIdx % FILLS.length]} />}
          {dots.slice(0, connectedCount).map((p, i) => {
            if (i === 0) return null
            const prev = dots[i - 1]
            return (
              <line
                key={i}
                x1={prev.x}
                y1={prev.y}
                x2={p.x}
                y2={p.y}
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                className="animated-draw-line"
              />
            )
          })}
          {/* Nối điểm cuối về điểm đầu nếu đã xong */}
          {isDone && (
            <line
              x1={dots[dots.length - 1].x}
              y1={dots[dots.length - 1].y}
              x2={dots[0].x}
              y2={dots[0].y}
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Các nút số */}
        {dots.map((p, i) => {
          const num = i + 1
          const isPassed = i < connectedCount
          const isNext = i === connectedCount
          return (
            <button
              key={num}
              type="button"
              className={`dot-node ${isPassed ? 'passed' : ''} ${isNext ? 'next-pulse' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => handleDotTap(i)}
              aria-label={`Nối số ${num}`}
              disabled={isDone || isPassed}
            >
              <span>{num}</span>
            </button>
          )
        })}

        {/* Khi hoàn thành: Bung tỏa vật phẩm */}
        {isDone && (
          <div className="dots-reveal-celebration">
            <span className="reveal-emoji" ref={revealRef}><LearningPicture emoji={curLevel.emoji} label={curLevel.name} size={120} /></span>
            <span className="reveal-title">{curLevel.name}</span>
          </div>
        )}
      </div>

      <p className="sub dots-hint">
        👆 {Math.min(connectedCount + 1, dots.length)} → ✨
      </p>
    </div>
  )
}
