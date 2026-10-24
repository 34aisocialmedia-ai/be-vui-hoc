import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { onTalk } from '../audio'
import { Companion, type CompanionKind, type CompanionMood } from '../motion/Companion'

/**
 * The friend who asks each question. Every game's question card shows the companion beside it,
 * so the question comes from the friend in a speech bubble instead of from a plain box.
 * The friend reacts to the child's answers (hops when right, tilts its head when wrong)
 * and dozes off when nobody has touched the screen for a while.
 */
export interface HostState { kind: CompanionKind; mood: CompanionMood; sleepy: boolean; paused: boolean }

export const HostContext = createContext<HostState | null>(null)

export function Host() {
  const host = useContext(HostContext)
  const el = useRef<HTMLSpanElement>(null)
  // The friend moves along while Cô Thủy reads the question, as if it were asking.
  const [talking, setTalking] = useState(false)
  useEffect(() => onTalk(setTalking), [])
  // Mark the card as a speech bubble and tell the screen the friend sits here (so it is not drawn twice).
  useLayoutEffect(() => {
    const bubble = el.current?.parentElement
    const screen = el.current?.closest('.screen')
    bubble?.classList.add('has-host')
    screen?.classList.add('has-host')
    return () => { bubble?.classList.remove('has-host'); screen?.classList.remove('has-host') }
  }, [!!host])
  if (!host) return null
  return <span className={`ask-host ${talking ? 'is-talking' : ''}`} ref={el} aria-hidden="true">
    <Companion kind={host.kind} mood={host.mood} sleepy={host.sleepy} paused={host.paused} />
  </span>
}
