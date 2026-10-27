import { useEffect, useState, type ReactNode } from 'react'
import { useAssigned } from '../studio/media'
import { FamilyShelf } from './FamilyShelf'
import type { AgeId, DomainId, Game, CurriculumCategory } from '../types'
import { AGES } from '../types'
import { gamesFor } from '../data/games'
import { playPop, speak, stopSpeech } from '../audio'
import { GameArtwork } from './GameArtwork'
import { CoverStage, PlayAction } from './CoverStage'
import { HomeBanner } from './HomeArt'
import { MODES, modeOf } from '../modes'
import { GAME_TILE_NAMES } from '../gameCovers'
import { TEACHER_INTRO } from '../teacherVoice'
import { CATEGORY_INFO, CURRICULUM } from '../data/curriculum'
import { UiIcon } from './UiIcon'
import { PLAY_STYLES, type PlayStyle } from '../agePolicy'
import { playStyleFor } from '../agePolicy'

interface Props {
  onPlayGame: (game: Game) => void
  onOpenCollection: () => void
  onOpenAdult: () => void
  /** Opens the studio straight on "make a game with my child". */
  onCreateGame?: () => void
  totalCollected: number
  sound: boolean
  onToggleSound: () => void
  age: AgeId
  onAgeChange: (age: AgeId) => void
  plays: Record<string, number>
  /** The three ways in (island, friend's house, episodes), shown at the top of the home page. */
  doors?: ReactNode
}
type Selection = { category: CurriculumCategory | 'all'; style: PlayStyle | 'all'; page: number }
const librarySelections = new Map<AgeId, Selection>()
const initialSelection: Selection = { category: 'all', style: 'all', page: 0 }
export function AgeSwitch({ age, onAgeChange }: { age: AgeId; onAgeChange: (age: AgeId) => void }) {
  return <div className="age-switch" aria-label="Lứa tuổi của bé">
    {AGES.map(a => <button key={a.id} className={`age-chip ${age === a.id ? 'selected' : ''}`} aria-pressed={age === a.id} aria-label={a.label} onClick={() => onAgeChange(a.id)}>
      <strong>{a.id === '24-36' ? '2–3' : a.id.replace('-', '–')}</strong><span>tuổi</span>
    </button>)}
  </div>
}
export function GameLibrary({ age, domain = 'all', plays, onAgeChange, onPlayGame, onCreateGame, showAges = true, heading = 'Chọn một trò' }: {
  age: AgeId; domain?: DomainId | 'all'; plays: Record<string, number>; onCreateGame?: () => void
  onAgeChange: (age: AgeId) => void; onPlayGame: (game: Game) => void; showAges?: boolean; heading?: string
}) {
  const [selection, setSelection] = useState(() => librarySelections.get(age) ?? initialSelection)
  useEffect(() => setSelection(librarySelections.get(age) ?? initialSelection), [age])
  const categories = CURRICULUM.filter(group => group.age === age).map(group => group.category)
  const category = categories.includes(selection.category as CurriculumCategory) ? selection.category : 'all'
  const list = gamesFor(age).filter(g => (domain === 'all' || g.domain === domain) && (category === 'all' || g.category === category) && (selection.style === 'all' || playStyleFor(g) === selection.style))
  const pageSize = 8, pages = Math.ceil(list.length / pageSize), page = Math.min(selection.page, Math.max(0, pages - 1))
  function select(next: Partial<Selection>) {
    const value = { ...selection, ...next }; setSelection(value); librarySelections.set(age, value)
  }
  return <section className="play-library" id="playground" aria-label="Chọn trò chơi">
    {showAges && <AgeSwitch age={age} onAgeChange={onAgeChange} />}
    <div className="world-tabs" aria-label="Chủ đề">
      {(['all', ...categories] as const).map(id => <button key={id} className={`world-tab ${category === id ? 'selected' : ''}`} aria-pressed={category === id} onClick={() => { select({category:id, page:0}); speak(id === 'all' ? 'Con chọn một trò nhé!' : CATEGORY_INFO[id].label) }}>
        {id === 'all' ? 'Tất cả' : CATEGORY_INFO[id].label}
      </button>)}
    </div>
    {(selection.style !== 'adventure' || onCreateGame) && <div className="library-actions">
      {selection.style !== 'adventure' && <button className="new-play-link" onClick={() => select({category:'all',style:'adventure',page:0})}>Thử cách chơi mới</button>}
      {onCreateGame && <button className="create-game-link" onClick={onCreateGame}><span aria-hidden="true">✨</span>Tự tạo trò chơi mới</button>}
    </div>}
    <div className="library-heading"><h2>{heading}</h2><select aria-label="Lọc theo cách chơi" value={selection.style} onChange={e => select({style:e.target.value as PlayStyle | 'all', page:0})}>
      <option value="all">Mọi cách chơi</option>{Object.entries(PLAY_STYLES).map(([id,label]) => <option key={id} value={id}>{label}</option>)}
    </select></div>
    <div className="play-tiles">
      {list.slice(page * pageSize, (page + 1) * pageSize).map((game,index) => { const world = modeOf(game); return <button key={game.id} className={`play-tile tile-tone-${index % 6} tile-world-${world}`} style={{ '--i': index } as React.CSSProperties} aria-label={`Chơi ${game.title}`} onClick={() => onPlayGame(game)}>
        <div className="play-tile-art" aria-hidden="true"><CoverStage game={game}/><GameArtwork game={game}/><span className="tile-world">{MODES[world].short}</span></div>
        <span className="tile-footer"><span className="tile-words"><PlayAction game={game}/><span className="play-tile-name">{GAME_TILE_NAMES[game.id] || game.title}</span></span><span className="tile-play"><UiIcon name={plays[game.id] > 0 ? "check" : "play"} size={20}/></span></span>

      </button> })}
    </div>
    {pages > 1 && <nav className="library-pages" aria-label="Trang trò chơi">
      <button aria-label="Trang trò chơi trước" disabled={page === 0} onClick={() => select({page:page-1})}><UiIcon name="back"/></button>
      <span aria-live="polite">{page+1} / {pages}</span>
      <button aria-label="Trang trò chơi tiếp" disabled={page+1 >= pages} onClick={() => select({page:page+1})}><UiIcon name="next"/></button>
    </nav>}
    {!list.length && <div className="empty-world"><p>Chọn chủ đề khác nhé!</p><button className="btn" onClick={() => select(initialSelection)}>Tất cả trò chơi</button></div>}
  </section>
}
export function HomeWebsite({ onPlayGame, onOpenCollection, onOpenAdult, onCreateGame, totalCollected, sound, onToggleSound, age, onAgeChange, plays, doors }: Props) {
  const banner = useAssigned('banner')
  const hello = useAssigned('hello')
  // The banner's speaker plays the family's own greeting when a parent made one, else Cô Thủy's.
  const greet = () => {
    if (!sound) return
    if (hello?.kind === 'audio') { stopSpeech(); void new Audio(hello.url).play().catch(() => speak(TEACHER_INTRO)) }
    else void speak(TEACHER_INTRO)
  }
  return <main className="kid-home">
    <header className="kid-navbar">
      <div className="kid-brand"><img className="brand-logo" src="/assets/brand/logo-duong-thuy-160.webp" alt="Logo Dương Thủy" width="160" height="160"/><span>Bé Vui Học</span></div>
      <div className="kid-tools">
        <button className="kid-tool" aria-label={sound ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={sound} onClick={onToggleSound}><UiIcon name={sound?'sound':'mute'}/></button>
        <button className="kid-tool treasure-tool" aria-label={`Kho báu, ${totalCollected} nhãn dán`} onClick={onOpenCollection}><UiIcon name="gift"/><span>{totalCollected}</span></button>
        <button className="parent-tool" aria-label="Khu phụ huynh" onClick={onOpenAdult}><UiIcon name="parent" size={20}/><span>Ba mẹ</span></button>
      </div>
    </header>
    {/* The greeting banner, or the family banner a parent made in the creative studio. */}
    {banner?.kind === 'image' || banner?.kind === 'video'
      ? <section className="home-banner home-banner-photo" aria-label="Banner gia đình">
          {banner.kind === 'video' ? <video src={banner.url} autoPlay muted loop playsInline aria-label="Video banner gia đình" /> : <img src={banner.url} alt="Banner gia đình đã chọn" />}
          <button className="home-banner-hello on-photo" aria-label="Nghe lời chào" onClick={greet}><UiIcon name="sound" size={26} /></button>
        </section>
      : <HomeBanner onHello={greet} />}
    <AgeSwitch age={age} onAgeChange={onAgeChange} />
    {doors}
    <FamilyShelf onPlayGame={onPlayGame} onCreateGame={onCreateGame} />
    <GameLibrary age={age} plays={plays} onAgeChange={onAgeChange} onPlayGame={onPlayGame} onCreateGame={onCreateGame} showAges={false} heading="Tất cả trò chơi"/>
    <footer className="kid-footer">Bé chơi vui · Bé lớn khôn</footer>
  </main>
}
