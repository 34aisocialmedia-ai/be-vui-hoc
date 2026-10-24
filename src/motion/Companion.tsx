import { useEffect, useRef } from 'react'
import { AnimatedPet, type PetMood } from '../AnimatedPet'
import type { Game } from '../types'
import { hop, tilt } from './motion'

export type CompanionMood = 'idle' | 'cheer' | 'encourage' | 'thinking'
export type CompanionKind = 'rabbit' | 'bear' | 'monkey' | 'turtle'

const NAMES: Record<CompanionKind, string> = { rabbit: 'Bạn Thỏ', bear: 'Gấu Bắp', monkey: 'Khỉ Con', turtle: 'Rùa Vàng' }

/**
 * Who plays alongside the child. Ages 2–3 always keep the rabbit they already know;
 * older children meet a friend that suits the game's world.
 */
export function companionFor(game: Game): CompanionKind {
  const avatar = game.character?.avatar
  if (avatar === 'bear' || avatar === 'monkey' || avatar === 'turtle') return avatar
  if (game.age === '24-36') return 'rabbit'
  switch (game.scene) {
    case 'farm': return 'bear'
    case 'hanoi': case 'pond': return 'turtle'
    case 'sky': case 'room': return 'monkey'
    default: return 'rabbit'
  }
}

const PET_MOOD: Record<CompanionMood, PetMood> = { idle: 'idle', cheer: 'happy', encourage: 'idle', thinking: 'hungry' }

export function Companion({ kind, mood, sleepy = false, paused = false, message = '', big = false }: {
  kind: CompanionKind; mood: CompanionMood; sleepy?: boolean; paused?: boolean; message?: string; big?: boolean
}) {
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (mood === 'cheer') void hop(body.current, big ? 28 : 20)
    else if (mood === 'encourage') void tilt(body.current)
  }, [mood, big])
  return <div className={`companion companion-${kind} mood-${mood} ${sleepy ? 'is-sleepy' : ''} ${big ? 'is-big' : ''}`} aria-hidden="true">
    <div className="companion-body" ref={body}>
      {kind === 'rabbit'
        ? <img src="/assets/images/mascot_rabbit.webp" alt="" width={120} height={120} />
        : <AnimatedPet type={kind} mood={PET_MOOD[mood]} name={NAMES[kind]} paused={paused || sleepy} />}
      {sleepy && <span className="companion-zzz"><i>z</i><i>z</i></span>}
    </div>
    {message && <span className="companion-say">{message}</span>}
  </div>
}
