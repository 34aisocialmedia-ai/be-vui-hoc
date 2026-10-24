import { UiIcon } from './UiIcon'
import { Host } from '../player/Host'
import { Icon3D } from './Icon3D'
import { useState, useEffect } from 'react'
import type { Game } from '../types'
import { playPop, speak } from '../audio'
import { TRAFFIC_ROUNDS as MAX_ROUNDS, type AnswerResult } from '../gameLogic'
import { useGameTask } from '../useGameTask'

interface Props {
  game: Game
  sound: boolean
  onAction?: (action: string) => void
  onCarPassed: (count: number) => AnswerResult
  onComplete?: () => void
}

const VEHICLES = ['🚗', '🚕', '🚙', '🚌', '🚑', '🚒', '🚚', '🚎']

export function TrafficEngine({ game, sound, onAction, onCarPassed, onComplete }: Props) {
  const TRAFFIC_ROUNDS = Math.min(game.sessionLimit ?? MAX_ROUNDS, MAX_ROUNDS)
  const [lightState, setLightState] = useState<'red' | 'green'>('red')
  const [activeVehicle, setActiveVehicle] = useState('🚗')
  const [passedCount, setPassedCount] = useState(0)
  const [pending, setPending] = useState(false)
  // Counts red lights after a car has passed; each one sends a walker over the crossing.
  const [walkers, setWalkers] = useState(0)
  const task = useGameTask()

  useEffect(() => {
    if (sound) {
      speak('Bé chạm vào đèn giao thông: Đèn đỏ dừng lại, đèn xanh được đi nhé!')
    }
  }, [])

  async function toggleLight() {
    if (task.busy.current || passedCount >= TRAFFIC_ROUNDS) return
    playPop()
    const next = lightState === 'red' ? 'green' : 'red'
    setLightState(next)

    if (next === 'green') {
      task.busy.current = true
      setPending(true)
      const nextVehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
      setActiveVehicle(nextVehicle)

      const nextPassed = passedCount + 1
      onAction?.('Đèn xanh')
      const result = await onCarPassed(nextPassed)
      if (!task.alive.current) return
      if (result !== true) { setLightState('red'); setPending(false); task.busy.current = false; return }
      setPassedCount(nextPassed)

      if (nextPassed >= TRAFFIC_ROUNDS) {
        onComplete?.()
      }
      setPending(false)
      task.busy.current = false
    } else {
      if (passedCount > 0) setWalkers(n => n + 1)
      if (sound) speak('Đèn đỏ rồi, các bạn xe dừng lại ngay ngắn nhé!')
      onAction?.('Đèn đỏ')
    }
  }

  return (
    <div className="engine-container traffic-engine">
      <div className="qcard bouncy-card scene-card"><Host />
        <button className="iconbtn big speaker-btn" onClick={() => sound && speak('Đèn đỏ dừng lại. Đèn xanh được đi. Bé chạm đèn xanh để cho xe đi nhé!')} aria-label="Nghe hướng dẫn">
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">
          🔴 Dừng · 🟢 Đi
        </div>
      </div>

      <div className="traffic-stage-area">
        {/* Cột đèn tín hiệu */}
        <button className="traffic-light-post" onClick={toggleLight} disabled={pending} aria-label={lightState === 'red' ? 'Bật đèn xanh' : 'Bật đèn đỏ'}>
          <div className="post-head">
            <div className={`light-bulb red ${lightState === 'red' ? 'active-glow' : ''}`}>
              
            </div>
            <div className={`light-bulb green ${lightState === 'green' ? 'active-glow' : ''}`}>
              
            </div>
          </div>
          <div className="post-pole" />
          <span className="light-status-label">
            {lightState === 'red' ? 'DỪNG LẠI' : 'ĐƯỢC ĐI'}
          </span>
        </button>

        {/* Làn đường giao thông */}
        <div className="traffic-road">
          <div className="road-stripes" />
          <div className="crosswalk" />
          {lightState === 'red' && walkers > 0 && <span key={walkers} className="traffic-walker" aria-hidden="true"><Icon3D emoji="🚶" size={58} /></span>}
          <div key={`${activeVehicle}-${lightState}`} className={`traffic-vehicle ${lightState === 'green' ? 'driving' : 'stopped'}`}>
            <span className="vehicle-face"><Icon3D emoji={activeVehicle} size={110}/></span>
          </div>
        </div>
      </div>

      <div className="traffic-controls">
        <button
          type="button"
          className="btn juicy-btn"
          style={{ background: lightState === 'red' ? '#10B981' : '#EF4444' }}
          onClick={toggleLight}
          disabled={pending}
        >
          {lightState === 'red' ? '🟢 Đi nào!' : '🔴 Dừng lại!'}
        </button>

      </div>
    </div>
  )
}
