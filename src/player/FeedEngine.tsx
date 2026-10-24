import { useEffect, useRef, useState } from 'react'
import type { Game } from '../types'
import { speak, stopSpeech, playPop, playChew } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { AnimatedPet, type PetMood } from '../AnimatedPet'
import { useGameTask } from '../useGameTask'
import { useDragOffset } from './useDragOffset'
import type { Api } from './types'

/* ===================== FEED – CHO BẠN NHỎ ĂN ===================== */
export function FeedEngine({ game, api }: { game: Game; api: Api }) {
  const [idx, setIdx] = useState(0)
  const [petMood, setPetMood] = useState<PetMood>('idle')
  const [armedItem, setArmedItem] = useState<string | null>(null)
  const [feedingItem, setFeedingItem] = useState<string | null>(null)
  const task = useGameTask()
  const foodDrag = useDragOffset<HTMLButtonElement>()
  const [foodDragging, setFoodDragging] = useState(false)
  const foodStart = useRef({ x: 0, y: 0, moved: false })
  const suppressClick = useRef(false)
  const foodButton = useRef<HTMLButtonElement | null>(null)
  const friendTarget = useRef<HTMLButtonElement>(null)
  const [flight, setFlight] = useState({ x: 0, y: -100 })

  const items = game.items || []
  const item = items[idx]
  const targetBasket = game.baskets?.[0]
  const avatar = game.character?.avatar
  const petType = avatar === 'bear' || avatar === 'dog' || avatar === 'cat' || avatar === 'turtle' || avatar === 'monkey'
    ? avatar : game.domain === 'ha_noi' ? 'turtle' : 'monkey'
  const petName = game.character?.name || (petType === 'turtle' ? 'Rùa Vàng' : petType === 'monkey' ? 'Khỉ Con' : 'Gấu Bắp')
  const isGiftGame = game.domain === 'ha_noi'

  const readPrompt = () => {
    if (api.sound && item) {
      speak(`${game.prompt || 'Bé hãy cho bạn ăn nhé!'}: ${item.label}`)
    }
  }

  useEffect(() => {
    readPrompt()
    setPetMood('idle')
    return () => stopSpeech()
  }, [idx])

  async function feedPet(targetTo: string) {
    if (!item || task.busy.current) return
    task.busy.current = true
    const foodRect = foodButton.current?.getBoundingClientRect()
    const friendRect = friendTarget.current?.getBoundingClientRect()
    // The food is already back at its tray position here, so the flight starts from the tray.
    if (foodRect && friendRect) setFlight({ x: friendRect.x + friendRect.width / 2 - (foodRect.x + foodRect.width / 2), y: friendRect.y + friendRect.height / 2 - (foodRect.y + foodRect.height / 2) })
    const isOk = !targetBasket || item.to === targetTo || targetTo === 'feed_target'
    setFeedingItem(item.id)

    if (isOk) {
      setPetMood(isGiftGame ? 'idle' : 'hungry')
      if (!isGiftGame) playChew()
      if (!await task.delay(450)) return
      setPetMood(isGiftGame ? 'happy' : 'chewing')
      const res = await api.answer(item.id, true)
      if (!task.alive.current) return
      if (res) {
        setPetMood('happy')
        if (!await task.delay(700)) return
        setArmedItem(null)
        setFeedingItem(null)
        setPetMood('idle')
        if (idx + 1 < items.length) setIdx(idx + 1)
      }
    } else {
      setPetMood('refuse')
      // api.answer already plays the "wrong" sound once.
      await api.answer(item.id, false)
      if (api.sound) speak(`${petName} không thích món này rồi!`)
      if (!await task.delay(450)) return
      setFeedingItem(null)
      setPetMood('idle')
    }
    setFeedingItem(null)
    task.busy.current = false
  }

  if (!item) return null

  return (
    <div className="engine-container feed-engine">
      <div className="qcard bouncy-card scene-card">
        <button
          className="iconbtn big speaker-btn"
          onClick={() => { playPop(); readPrompt(); }}
          aria-label="Nghe lại"
        >
          <UiIcon name="sound"/>
        </button>
        <div className="qtext feed-question">
          <LearningPicture emoji={item.emoji} label={item.label} photo={item.photo} size={42} food={game.id === 'b1-thucpham'} /> <span>→ {petName}</span>
        </div>
      </div>

      <button ref={friendTarget} className={`feed-interactive-area ${armedItem ? 'ready-to-feed' : ''}`} aria-label={isGiftGame ? `Tặng quà cho ${petName}` : `Cho ${petName} ăn`} disabled={!armedItem || !!feedingItem} onClick={() => armedItem && feedPet(targetBasket?.id || 'feed_target')}>
        <AnimatedPet type={petType} mood={petMood} name={petName} paused={api.paused} />
      </button>

      <div className="feed-tray">
        <button
          type="button"
          ref={el => { foodButton.current = el; foodDrag.ref(el) }}
          disabled={!!feedingItem}
          aria-label={`Chọn ${item.label}`}
          className={`feed-food-item juicy-btn ${armedItem === item.id ? 'armed' : ''} ${feedingItem === item.id ? 'being-fed' : ''} ${foodDragging ? 'food-dragging' : ''}`}
          style={{ '--food-flight-x': `${flight.x}px`, '--food-flight-y': `${flight.y}px` } as React.CSSProperties}
          onPointerDown={e => {
            if (task.busy.current) return
            e.currentTarget.setPointerCapture(e.pointerId)
            foodStart.current = { x: e.clientX, y: e.clientY, moved: false }
            suppressClick.current = false
          }}
          onPointerMove={e => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId) || task.busy.current) return
            const x = e.clientX - foodStart.current.x, y = e.clientY - foodStart.current.y
            if (!foodStart.current.moved && Math.abs(x) + Math.abs(y) > 8) {
              // Change the game state once, when the drag starts; afterwards only the food moves.
              foodStart.current.moved = true; setFoodDragging(true); setArmedItem(item.id); setPetMood(isGiftGame ? 'idle' : 'hungry')
            }
            if (foodStart.current.moved) foodDrag.move(x, y)
          }}
          onPointerUp={e => {
            if (!foodStart.current.moved) return
            suppressClick.current = true
            setFoodDragging(false); foodDrag.reset()
            const rect = friendTarget.current?.getBoundingClientRect()
            if (rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) feedPet(targetBasket?.id || 'feed_target')
          }}
          onPointerCancel={() => { suppressClick.current = true; setFoodDragging(false); foodDrag.reset() }}
          onClick={() => {
            if (suppressClick.current) { suppressClick.current = false; return }
            playPop()
            if (armedItem === item.id) {
              feedPet(targetBasket?.id || 'feed_target')
            } else {
              setArmedItem(item.id)
              setPetMood(isGiftGame ? 'idle' : 'hungry')
              if (api.sound) speak(isGiftGame ? `Bé mang ${item.label} tặng Cụ Rùa nhé!` : `Bé mang ${item.label} vào miệng bạn nhé!`)
            }
          }}
        >
          <LearningPicture emoji={item.emoji} label={item.label} photo={item.photo} size={96} food={game.id === 'b1-thucpham'} />
          <span className="feed-label">{item.label}</span>
        </button>
        <p className="sub feed-instructions">
          {armedItem ? '👆 🐾' : `👆 ${item.emoji}`}
        </p>
      </div>
    </div>
  )
}
