import { useState, useRef, useEffect } from 'react'
import { Host } from '../player/Host'
import type { Game } from '../types'
import { playPop, playStarDing, speak } from '../audio'
import { useGameTask } from '../useGameTask'
import { Icon3D } from './Icon3D'

interface Props {
  game: Game
  sound: boolean
  onNotePlayed?: (note: string) => void
  onComplete?: () => void
}

interface NoteInfo {
  note: string
  solfege: string
  freq: number
  color: string
  emoji: string
  label: string
}

const NOTES: NoteInfo[] = [
  { note: 'C4', solfege: 'Đồ', freq: 261.63, color: '#EF4444', emoji: '🐶', label: 'Cún' },
  { note: 'D4', solfege: 'Rê', freq: 293.66, color: '#F97316', emoji: '🐱', label: 'Mèo' },
  { note: 'E4', solfege: 'Mi', freq: 329.63, color: '#FBBF24', emoji: '🐸', label: 'Ếch' },
  { note: 'F4', solfege: 'Pha', freq: 349.23, color: '#10B981', emoji: '🐦', label: 'Chim' },
  { note: 'G4', solfege: 'Son', freq: 392.00, color: '#06B6D4', emoji: '🦁', label: 'Sư tử' },
  { note: 'A4', solfege: 'La', freq: 440.00, color: '#3B82F6', emoji: '🐮', label: 'Bò' },
  { note: 'B4', solfege: 'Si', freq: 493.88, color: '#8B5CF6', emoji: '🐻', label: 'Gấu' },
  { note: 'C5', solfege: 'Đố', freq: 523.25, color: '#EC4899', emoji: '🐭', label: 'Chuột' },
]

// Giai điệu thiếu nhi: "Kìa con bướm vàng"
const SONG_BUTTERFLY = [
  { noteIndex: 0, delay: 400 }, // Kìa (Đồ)
  { noteIndex: 1, delay: 400 }, // con (Rê)
  { noteIndex: 2, delay: 400 }, // bướm (Mi)
  { noteIndex: 0, delay: 600 }, // vàng (Đồ)
  { noteIndex: 0, delay: 400 }, // Kìa (Đồ)
  { noteIndex: 1, delay: 400 }, // con (Rê)
  { noteIndex: 2, delay: 400 }, // bướm (Mi)
  { noteIndex: 0, delay: 600 }, // vàng (Đồ)
  { noteIndex: 2, delay: 400 }, // Xòe (Mi)
  { noteIndex: 3, delay: 400 }, // đôi (Pha)
  { noteIndex: 4, delay: 700 }, // cánh (Son)
  { noteIndex: 2, delay: 400 }, // Xòe (Mi)
  { noteIndex: 3, delay: 400 }, // đôi (Pha)
  { noteIndex: 4, delay: 700 }, // cánh (Son)
]

export function XylophoneEngine({ sound, onNotePlayed, onComplete }: Props) {
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const [isPlayingSong, setIsPlayingSong] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const task = useGameTask()
  const countRef = useRef(0)
  const soundRef = useRef(sound)
  soundRef.current = sound
  useEffect(() => () => { void audioCtxRef.current?.close() }, [])
  useEffect(() => {
    if (!sound && audioCtxRef.current?.state === 'running') void audioCtxRef.current.suspend().catch(() => {})
  }, [sound])

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new Ctx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  function playTone(freq: number) {
    if (!soundRef.current || !task.alive.current) return
    try {
      const ctx = getAudioCtx()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Âm thanh mộc đàn chuông mầm non
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.45, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.62)
    } catch {
      /* Bỏ qua */
    }
  }

  function handleKeyTap(index: number) {
    if (task.busy.current || isPlayingSong) return
    const noteInfo = NOTES[index]
    playTone(noteInfo.freq)
    setActiveKey(index)
    task.delay(250).then(active => { if (active) setActiveKey(null) })

    const nextCount = ++countRef.current
    setPlayCount(nextCount)
    onNotePlayed?.(noteInfo.solfege)

    if (nextCount === 5) {
      task.busy.current = true
      playStarDing()
      onComplete?.()
    }
  }

  async function playAutoSong() {
    if (isPlayingSong || task.busy.current) return
    task.busy.current = true
    setIsPlayingSong(true)
    playPop()
    if (sound) await speak('Mời bé cùng nghe giai điệu Kìa Con Bướm Vàng nhé!')

    for (const step of SONG_BUTTERFLY) {
      if (!task.alive.current || !soundRef.current) break
      playTone(NOTES[step.noteIndex].freq)
      setActiveKey(step.noteIndex)
      if (!await task.delay(step.delay)) return
      setActiveKey(null)
    }

    if (!task.alive.current) return
    setIsPlayingSong(false)
    task.busy.current = false
    if (sound) speak('Bé hãy gõ thử các phím đàn xem nào!')
  }

  return (
    <div className="engine-container xylophone-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button className="iconbtn big speaker-btn" onClick={() => playAutoSong()} aria-label="Nghe bài hát mẫu">
          🎵
        </button>
        <div className="qtext">
          Cùng gõ đàn! 🎵
        </div>
      </div>

      <div className="xylophone-board">
        {NOTES.map((n, i) => {
          const isActive = activeKey === i
          // Độ cao thanh đàn so le tự nhiên
          const heightPx = 140 + i * 16
          return (
            <button
              key={n.note}
              type="button"
              className={`xylo-bar ${isActive ? 'active-pressed' : ''}`}
              style={{
                backgroundColor: n.color,
                height: `${heightPx}px`,
              }}
              onClick={() => handleKeyTap(i)}
              disabled={isPlayingSong}
              aria-label={`Gõ nốt ${n.solfege}`}
            >
              <div className="xylo-pin top" />
              <span className="xylo-emoji"><Icon3D emoji={n.emoji} size={32} /></span>
              <span className="xylo-solfege">{n.solfege}</span>
              <div className="xylo-pin bot" />
            </button>
          )
        })}
      </div>

      <div className="xylo-controls">
        <button
          type="button"
          className="btn juicy-btn"
          style={{ background: '#F472B6' }}
          onClick={playAutoSong}
          disabled={isPlayingSong || !sound}
        >
          {isPlayingSong ? '🎵 …' : '🎶 Nghe nhạc'}
        </button>
        <span className="xylo-counter">🎵 <b>{Math.min(playCount, 5)}/5</b> ⭐</span>
      </div>
    </div>
  )
}
