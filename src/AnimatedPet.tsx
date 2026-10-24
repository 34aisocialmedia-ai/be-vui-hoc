import { useEffect, useState } from 'react'
import { LearningPicture } from './components/LearningPicture'
import { motionLevel } from './motion/motion'

export type PetMood = 'idle' | 'hungry' | 'chewing' | 'happy' | 'refuse'
interface Props {
  type?: 'monkey' | 'dog' | 'cat' | 'bear' | 'turtle'
  mood: PetMood
  name?: string
  paused?: boolean
}
const FRIENDS = { monkey: '🐒', dog: '🐶', cat: '🐱', bear: '🐻', turtle: '🐢' }

export function AnimatedPet({ type = 'bear', mood, name, paused = false }: Props) {
  const frames = mood === 'hungry' ? [2, 3] : mood === 'chewing' ? [4, 5] : mood === 'happy' ? [6, 7] : [0, 1]
  const [frame, setFrame] = useState(frames[0])
  useEffect(() => {
    const poses = mood === 'hungry' ? [2, 3] : mood === 'chewing' ? [4, 5] : mood === 'happy' ? [6, 7] : [0, 1]
    setFrame(poses[0])
    if (paused || motionLevel() !== 'full') return
    let index = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      index = 1 - index
      setFrame(poses[index])
      timer = setTimeout(tick, mood === 'idle' ? index === 1 ? 160 : 2800 : mood === 'chewing' ? 220 : 480)
    }
    timer = setTimeout(tick, mood === 'idle' ? 2800 : 400)
    return () => clearTimeout(timer)
  }, [mood, paused])
  const isBear = type === 'bear'
  const row = Math.floor(frame / 4) + (type === 'turtle' ? 2 : 0)
  const col = frame % 4
  const hasSprite = isBear || type === 'monkey' || type === 'turtle'
  return <div className={`animated-pet pet-${type} mood-${mood}`}>
    <div className="pet-3d-portrait">
      {hasSprite ? <div role="img" aria-label={name || 'Bạn thú'} className="character-sprite" data-frame={frame}
        style={{
          backgroundImage: `url(/assets/images/${isBear ? 'bear' : 'friends'}-animation-3d.webp)`,
          backgroundSize: isBear ? '400% 200%' : '400% 400%',
          backgroundPosition: `${col * 100 / 3}% ${row * 100 / (isBear ? 1 : 3)}%`,
          aspectRatio: isBear ? '1' : '1278 / 1230',
        }} /> : <LearningPicture emoji={FRIENDS[type]} label={name || 'Bạn thú'} size={200} />}
      {mood === 'happy' && <div className="character-hearts" aria-hidden="true"><i /> <i /> <i /></div>}
    </div>
  </div>
}
