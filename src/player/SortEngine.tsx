import { useEffect, useMemo, useRef, useState } from 'react'
import { Host } from './Host'
import type { Game, SortItem } from '../types'
import { speak, speakSeq, stopSpeech, playPop } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { shuffle } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { useDragOffset } from './useDragOffset'
import type { Api } from './types'
import { flyClone, pop } from '../motion/motion'
import { useStageScale } from '../motion/stage'

/* ============================ G03 – Kéo thả / phân loại ============================ */
export function SortEngine({ game, api }: { game: Game; api: Api }) {
  const task = useGameTask()
  const items = useMemo(() => shuffle(game.items!), [game.id])
  const baskets = game.baskets!
  const [idx, setIdx] = useState(0)
  const drag = useDragOffset<HTMLDivElement>()
  const [dragging, setDragging] = useState(false)
  const [armed, setArmed] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [bad, setBad] = useState<string | null>(null)
  const start = useRef({ x: 0, y: 0, moved: false })
  const item: SortItem = items[idx]
  const k = useStageScale()
  // What each basket already holds, so the child sees it filling up.
  const [sorted, setSorted] = useState<Record<string, SortItem[]>>({})
  const [flying, setFlying] = useState(false)
  const itemEl = useRef<HTMLDivElement | null>(null)
  useEffect(() => setFlying(false), [idx])

  useEffect(() => {
    if (api.sound) speakSeq([game.prompt ?? 'Con hãy bỏ vào đúng giỏ nhé!', item.label])
    return () => stopSpeech()
  }, [idx])

  const basketAt = (x: number, y: number) => {
    const el = document.elementsFromPoint(x, y).find((e) => (e as HTMLElement).dataset?.basket) as HTMLElement | undefined
    return el?.dataset.basket ?? null
  }

  async function drop(basketId: string) {
    if (task.busy.current) return
    task.busy.current = true
    const ok = basketId === item.to
    const basketEl = document.querySelector(`[data-basket="${basketId}"]`)
    if (ok) {
      // The item flies along a curve into the basket and stays there.
      const landing = flyClone(itemEl.current?.firstElementChild, basketEl, { scale: .4, lift: 110 })
      setFlying(true)
      void landing.then(() => pop(basketEl))
    }
    const res = await api.answer(item.id, ok)
    if (!task.alive.current) return
    drag.reset()
    setArmed(false)
    if (res === null) { setFlying(false); task.busy.current = false; return }
    if (res) {
      setSorted(s => ({ ...s, [basketId]: [...(s[basketId] ?? []), item] }))
      if (idx + 1 < items.length) setIdx(idx + 1)
    } else {
      setBad(basketId)
      task.delay(500).then(active => { if (active) setBad(null) })
    }
    task.busy.current = false
  }

  function down(e: React.PointerEvent) {
    if (task.busy.current) return
    playPop()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY, moved: false }
    setDragging(true)
  }
  function move(e: React.PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (Math.abs(dx) + Math.abs(dy) > 8) start.current.moved = true
    const { clientX, clientY } = e
    // Basket hit-testing runs with the frame, not on every pointer event.
    drag.move(dx, dy, () => setHover(basketAt(clientX, clientY)))
  }
  function up(e: React.PointerEvent) {
    drag.settle()
    setDragging(false)
    setHover(null)
    if (start.current.moved) {
      const b = basketAt(e.clientX, e.clientY)
      if (b) drop(b)
      else drag.reset()
    } else {
      drag.reset()
      setArmed((a) => !a)
      if (api.sound) speak(item.label)
    }
  }

  return (
    <>
      <div className="qcard bouncy-card"><Host />
        <button
          className="iconbtn big speaker-btn"
          onClick={() => { playPop(); api.sound && speakSeq([game.prompt ?? '', item.label]); }}
          aria-label="Nghe lại"
        >
          <UiIcon name="sound"/>
        </button>
        <div className="qtext">Bỏ vào đúng giỏ</div>
      </div>

      <div className="baskets">
        {baskets.map((b) => (
          <button
            key={b.id}
            data-basket={b.id}
            className={'basket basket-3d' + (hover === b.id ? ' hover' : '') + (armed ? ' armed' : '') + (bad === b.id ? ' wrong' : '')}
            aria-label={`Bỏ ${item.label} vào ${b.label}`}
            onClick={() => { playPop(); drop(b.id); }}
          >
            {/* A colour dot as the basket picture becomes a real basket in that colour. */}
            <LearningPicture emoji={['🔴', '🟡', '🔵', '🟢'].includes(b.emoji) ? '🧺' : b.emoji} label={b.label} photo={b.photo} size={124 * k} />
            <span className="olabel">{b.label}</span>
            {!!sorted[b.id]?.length && <span className="basket-fill" aria-label={`${sorted[b.id].length} món trong giỏ`}>
              {sorted[b.id].slice(-4).map(s => <LearningPicture key={s.id} emoji={s.emoji} photo={s.photo} label="" size={30 * k} />)}
              <b>{sorted[b.id].length}</b>
            </span>}
          </button>
        ))}
      </div>

      <div className="tray round-in" key={item.id}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`Chọn ${item.label}`}
          aria-pressed={armed}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && !task.busy.current) {
              e.preventDefault(); setArmed(a => !a); if (api.sound) speak(item.label)
            }
          }}
          className={'dragitem dragitem-3d' + (dragging ? ' dragging' : '') + (armed ? ' armed' : '') + (flying ? ' is-flying' : '')}
          ref={el => { itemEl.current = el; drag.ref(el) }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => { setDragging(false); setHover(null); drag.reset(); }}
        >
          <LearningPicture emoji={item.emoji} label={item.label} photo={item.photo} size={120 * k} />
          <span className="olabel">{item.label}</span>
        </div>

      </div>
    </>
  )
}
