import { useEffect, useRef, useState } from 'react'
import { useStudioMedia } from '../studio/media'
import { useFamilyGames, type FamilyEntry } from '../studio/familyGames'
import { AGES, type Game } from '../types'
import { playPop } from '../audio'
import { LearningPicture } from './LearningPicture'

const ageOf = (e: FamilyEntry) => AGES.find(a => a.id === e.spec.age)?.label

/**
 * "Trò chơi của nhà mình": every game made in the studio lives in the family's store (kho).
 * Each game has an add-on switch; the games switched on appear on the home page in a row that scrolls sideways.
 */
export function FamilyShelf({ onPlayGame }: { onPlayGame: (game: Game) => void }) {
  const shown = useFamilyGames().filter(f => f.asset.target === 'home')
  const row = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })
  const measure = () => { const el = row.current; if (el) setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 }) }
  useEffect(() => { measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure) }, [shown.length])
  const slide = (dir: 1 | -1) => { const el = row.current; if (el) el.scrollBy({ left: dir * Math.max(200, el.clientWidth * .8), behavior: 'smooth' }) }
  // Only games switched on in the store appear; with none, the home page stays as it was.
  if (!shown.length) return null

  return <section className="family-games" aria-label="Trò chơi của nhà mình">
    <h2>Trò chơi của nhà mình</h2>
    <div className="family-row-wrap">
      {!edges.start && <button className="family-arrow prev" aria-label="Xem các trò trước" onClick={() => slide(-1)}>‹</button>}
      <div className="family-game-row" ref={row} onScroll={measure}>{shown.map(({ asset, spec, game, cover }) =>
        <button key={asset.id} className="family-game" aria-label={`Chơi ${spec.title}`} onClick={() => { playPop(); onPlayGame(game) }}>
          <span className={`family-game-art${cover ? ' has-cover' : ''}`}>{cover ? <img src={cover} alt="" /> : <LearningPicture emoji={spec.icon} size={84} />}</span>
          <b>{spec.title}</b><small>{spec.questions.length} câu · {AGES.find(a => a.id === spec.age)?.label}</small>
        </button>)}
      </div>
      {!edges.end && <button className="family-arrow next" aria-label="Xem các trò tiếp theo" onClick={() => slide(1)}>›</button>}
    </div>
  </section>
}

/** The "Kho trò chơi" button (next to "Tự tạo trò chơi mới"), always there; the badge counts the games. */
export function FamilyStoreButton({ onPlayGame, onCreateGame }: { onPlayGame: (game: Game) => void; onCreateGame?: () => void }) {
  const all = useFamilyGames()
  const [open, setOpen] = useState(false)
  return <>
    <button className="family-store-btn" onClick={() => { playPop(); setOpen(true) }}><span aria-hidden="true">📦</span>Kho trò chơi{all.length > 0 && <b>{all.length}</b>}</button>
    {open && <FamilyStore list={all} onClose={() => setOpen(false)} onPlay={game => { setOpen(false); onPlayGame(game) }} onCreate={onCreateGame && (() => { setOpen(false); onCreateGame() })} />}
  </>
}

function FamilyStore({ list, onClose, onPlay, onCreate }: { list: FamilyEntry[]; onClose: () => void; onPlay: (game: Game) => void; onCreate?: () => void }) {
  const media = useStudioMedia()
  const [deleting, setDeleting] = useState(''), [busy, setBusy] = useState(''), [error, setError] = useState('')
  const on = list.filter(e => e.asset.target === 'home').length
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', key); document.body.classList.add('no-scroll')
    return () => { window.removeEventListener('keydown', key); document.body.classList.remove('no-scroll') }
  }, [])
  async function act(id: string, fn: () => Promise<void>) {
    setBusy(id); setError('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'Chưa làm được, hãy thử lại.') } finally { setBusy('') }
  }
  return <div className="overlay family-store" role="dialog" aria-modal="true" aria-labelledby="store-title" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="store-sheet">
      <header className="store-head">
        <div><h2 id="store-title">📦 Kho trò chơi của nhà mình</h2><p>{list.length ? `${list.length} trò · đang hiện ${on} trò trên trang chủ. Bật nút bên cạnh để đưa trò ra trang chủ.` : 'Kho trên thiết bị này chưa có trò nào.'}</p></div>
        <button className="store-close" aria-label="Đóng kho" onClick={onClose}>✕</button>
      </header>
      {!list.length && <div className="store-empty"><span aria-hidden="true">📦</span><b>Kho đang trống</b><p>Bấm “Tự tạo trò chơi mới”, tải ảnh của bé rồi chờ AI tạo xong: trò chơi sẽ vào kho này. Trò chơi được lưu trên từng thiết bị, nên trò tạo ở máy khác không hiện ở đây.</p></div>}
      <ul className="store-list">{list.map(e => {
        const visible = e.asset.target === 'home'
        return <li key={e.asset.id} className={visible ? 'on' : ''}>
          <span className={`store-art${e.cover ? ' has-cover' : ''}`}>{e.cover ? <img src={e.cover} alt="" /> : <LearningPicture emoji={e.spec.icon} size={48} />}</span>
          <div className="store-info"><b>{e.spec.title}</b><small>{e.spec.questions.length} câu · {ageOf(e)} · {new Date(e.asset.created).toLocaleDateString('vi-VN')}</small>
            <div className="store-actions">
              <button className="store-play" onClick={() => { playPop(); onPlay(e.game) }}>▶ Chơi</button>
              {deleting === e.asset.id
                ? <span className="store-confirm">Xóa hẳn trò này?<button disabled={!!busy} onClick={() => void act(e.asset.id, async () => { await media.remove(e.asset.id); setDeleting('') })}>Xóa</button><button onClick={() => setDeleting('')}>Giữ lại</button></span>
                : <button className="store-delete" onClick={() => setDeleting(e.asset.id)}>Xóa</button>}
            </div>
          </div>
          <label className="store-addon" title={visible ? 'Đang hiện trên trang chủ' : 'Chỉ nằm trong kho'}>
            <input type="checkbox" role="switch" checked={visible} disabled={busy === e.asset.id}
              onChange={() => void act(e.asset.id, () => visible ? media.unassign(e.asset.id) : media.assign(e.asset.id, 'home'))} />
            <i aria-hidden="true" /><span>{visible ? 'Đang hiện' : 'Hiện ra'}</span>
          </label>
        </li>
      })}</ul>
      {error && <p className="store-error" role="alert">{error}</p>}
      {onCreate && <button className="create-game-link store-create" onClick={onCreate}><span aria-hidden="true">✨</span>Tự tạo trò chơi mới</button>}
    </div>
  </div>
}
