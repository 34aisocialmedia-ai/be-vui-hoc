import { useEffect } from 'react'
import type { AgeId, Game } from '../types'
import { GAMES } from '../data/games'
import { MODES, episodesFor, poolFor, wishesFor, type Journey, type ModeId } from '../modes'
import { Companion, companionFor, type CompanionKind } from '../motion/Companion'
import { nudge } from '../motion/motion'
import { ALL_STICKERS } from '../stickers'
import { hasRecording, playPop, playTune, speak, type TuneName } from '../audio'
import { Icon3D } from './Icon3D'
import { FINISH_FEEDBACK, TEACHER_INTRO } from '../teacherVoice'
import { UiIcon } from './UiIcon'
import { DoorScene } from './HomeArt'

const byId = (id: string) => GAMES.find(game => game.id === id)
export const FRIEND_NAMES: Record<CompanionKind, string> = { rabbit: 'Thỏ', bear: 'Gấu Bắp', monkey: 'Khỉ Con', turtle: 'Rùa Vàng' }
const FRIENDS: CompanionKind[] = ['rabbit', 'bear', 'monkey', 'turtle']
export const defaultFriend = (age: AgeId): CompanionKind => age === '24-36' ? 'rabbit' : 'bear'

/** A finished game, shown as a short celebration when the child comes back to its mode. */
export interface Win { mode: ModeId; gameId: string }

function TopBar({ title, onBack, children }: { title: string; onBack: () => void; children?: React.ReactNode }) {
  return <header className="mode-top">
    <button className="mode-round" aria-label="Về trang chính" onClick={() => { playPop(); onBack() }}><UiIcon name="home" size={26} /></button>
    <h1 className="mode-title">{title}</h1>
    {children}
  </header>
}

/**
 * A short tune, then (when given) a line Cô Thủy has already recorded that fits the moment.
 * The new screens' own words ("Trạm 1 xong!"…) have no recordings, so the music speaks for them.
 */
/** Recorded lines the three mode screens reuse (a test checks each has a recording). */
export const MODE_LINES = {
  island: 'Bé ơi cố lên nhé! Cùng chơi thật vui nào!',
  friend: 'Con chọn một trò nhé!',
  movies: TEACHER_INTRO,
  praise: 'Cô khen con nhé!',
  friendHappy: 'Đúng rồi, con giỏi quá!',
  journeyDone: FINISH_FEEDBACK,
}

function cue(name: TuneName, line?: string) {
  playTune(name)
  if (!line) return () => {}
  const timer = setTimeout(() => void speak(line), 950)
  return () => clearTimeout(timer)
}
function useTune(name: TuneName, skip = false, line?: string) {
  useEffect(() => skip ? undefined : cue(name, line), [])
}

/** A game's picture: its icon in the app's 3D style. */
const GameIcon = ({ game, size }: { game: Game; size: number }) => <Icon3D emoji={game.icon} size={size} />

/**
 * Coming back after a finished game. The victory screen has already celebrated, so the mode
 * screen only plays a short tune and lets what just opened pop up (a station, an episode);
 * a small label says it for adults and screen readers, then fades.
 */
function Welcome({ title, tune, onDone }: { title: string; tune: TuneName; onDone: () => void }) {
  useEffect(() => { playTune(tune); const t = setTimeout(onDone, 2600); return () => clearTimeout(t) }, [])
  return <div className="mode-welcome" role="status">{title}</div>
}

/* ============================== A · Đảo phiêu lưu ============================== */

export function IslandMap({ age, journey, plays, win, onPlay, onNewJourney, onBack, onWinSeen }: {
  age: AgeId; journey: Journey; plays: Record<string, number>; win: Win | null
  onPlay: (game: Game) => void; onNewJourney: () => void; onBack: () => void; onWinSeen: () => void
}) {
  const stations = journey.stations.map(byId).filter((g): g is Game => !!g)
  const current = stations.findIndex(g => !journey.done.includes(g.id))
  const allDone = current < 0
  const guide: CompanionKind = defaultFriend(age)
  const justDone = win?.mode === 'island' ? stations.findIndex(g => g.id === win.gameId) : -1
  // Islands from the bottom of the map to the top, zig-zagging.
  useTune('island', justDone >= 0, MODE_LINES.island)
  const spots = [{ x: 70, y: 80 }, { x: 30, y: 50 }, { x: 68, y: 20 }]
  const path = `M${spots[0].x} ${spots[0].y} C ${spots[0].x - 8} ${spots[0].y - 18}, ${spots[1].x + 6} ${spots[1].y + 16}, ${spots[1].x} ${spots[1].y} S ${spots[2].x - 4} ${spots[2].y + 16}, ${spots[2].x} ${spots[2].y}`
  return <main className="mode-screen island-screen">
    <TopBar title={MODES.island.title} onBack={onBack}>
      <div className="journey-dots" role="img" aria-label={`Đã đi ${journey.done.length} trên ${stations.length} trạm`}>
        {stations.map((g, i) => <span key={g.id} className={journey.done.includes(g.id) ? 'done' : i === current ? 'now' : ''} />)}
      </div>
    </TopBar>
    <div className="island-map">
      <svg className="island-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={path} />
      </svg>
      {stations.map((game, i) => {
        const done = journey.done.includes(game.id), now = i === current
        return <div key={game.id} className={`island ${done ? 'is-done' : now ? 'is-now' : 'is-locked'} ${now && justDone >= 0 ? 'just-opened' : ''} ${spots[i].x > 50 ? 'guide-left' : 'guide-right'}`} style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%` }}>
          <span className="island-land" aria-hidden="true" />
          <button className="station" aria-label={done ? `${game.title}, đã xong, chơi lại` : now ? `Chơi ${game.title}` : `${game.title}, chưa mở`}
            onClick={e => { if (done || now) { playPop(); onPlay(game) } else { playTune('locked'); void nudge(e.currentTarget) } }}>
            {done ? <UiIcon name="check" size={34} /> : now ? <GameIcon game={game} size={58} /> : <Icon3D emoji="🔒" size={34} />}
          </button>
          {done && <span className="station-stars" aria-hidden="true">{[0, 1, 2].map(s => <Icon3D key={s} emoji="⭐" size={20} />)}</span>}
          <span className="station-name">{game.title}</span>
          {now && <div className="island-guide"><Companion kind={guide} mood={justDone >= 0 ? 'cheer' : 'idle'} /></div>}
        </div>
      })}
    </div>
    <div className="mode-actions">
      {allDone
        ? <><p className="mode-note">Hôm nay bé đi hết {stations.length} trạm rồi!</p>
          <button className="mode-cta cta-green" onClick={() => { playTune('island'); onNewJourney() }}><UiIcon name="replay" size={28} /> Đi thêm 3 trạm</button></>
        : <button className="mode-cta" onClick={() => { playPop(); onPlay(stations[current]) }}><UiIcon name="play" size={28} /> Chơi tiếp</button>}
    </div>
    {justDone >= 0 && <Welcome title={allDone ? 'Đi hết hành trình!' : `Trạm ${justDone + 1} xong! Trạm mới vừa mở`} tune={allDone ? 'journeyDone' : 'unlock'} onDone={onWinSeen} />}
  </main>
}

/* ============================== B · Nhà của bạn thân ============================== */

export function FriendHouse({ age, plays, friend, collection, win, onPlay, onChooseFriend, onOpenShelf, onBack, onWinSeen }: {
  age: AgeId; plays: Record<string, number>; friend: CompanionKind; collection: Record<string, number>; win: Win | null
  onPlay: (game: Game) => void; onChooseFriend: (kind: CompanionKind) => void; onOpenShelf: () => void; onBack: () => void; onWinSeen: () => void
}) {
  const wishes = wishesFor(age, plays)
  const [main, ...others] = wishes
  const name = FRIEND_NAMES[friend]
  const happy = win?.mode === 'friend'
  // The friend's shelf shows the newest stickers the child has won.
  const owned = ALL_STICKERS.filter(s => collection[s.emoji]).slice(-3)
  useTune('friend', happy, MODE_LINES.friend)
  return <main className={`mode-screen friend-screen friend-${friend}`}>
    <TopBar title={`Nhà của ${name}`} onBack={onBack} />
    <div className="friend-room">
      <div className="friend-window" aria-hidden="true"><i /></div>
      <div className="friend-shelf" role="img" aria-label={`Kệ của ${name}: ${owned.length ? owned.map(s => s.name).join(', ') : 'còn trống'}`}>
        {[0, 1, 2].map(i => owned[i] ? <Icon3D key={i} emoji={owned[i].emoji} size={46} /> : <span key={i} className="shelf-empty" />)}
      </div>
      {main && <button className="wish-main" onClick={() => { playPop(); onPlay(main) }} aria-label={`${name} muốn chơi ${main.title}`}>
        <GameIcon game={main} size={56} />
        <span><small>{name} muốn chơi</small>{main.title}</span>
      </button>}
      <div className={`friend-hero ${happy ? 'is-happy' : ''}`}><Companion kind={friend} mood={happy ? 'cheer' : 'idle'} big /></div>
      <span className="friend-rug" aria-hidden="true" />
      {others.map((game, i) => <button key={game.id} className={`wish-bubble wish-${i}`} aria-label={`Chơi ${game.title} cùng ${name}`} onClick={() => { playPop(); onPlay(game) }}>
        <GameIcon game={game} size={44} />
      </button>)}
    </div>
    <div className="friend-dock">
      <button className="dock-btn dock-purple" onClick={() => { playTune('switchFriend'); onChooseFriend(FRIENDS[(FRIENDS.indexOf(friend) + 1) % FRIENDS.length]) }}>
        <span className="dock-face"><Companion kind={FRIENDS[(FRIENDS.indexOf(friend) + 1) % FRIENDS.length]} mood="idle" /></span>Đổi bạn
      </button>
      <button className="dock-btn dock-pink" onClick={() => { playPop(); onOpenShelf() }}><Icon3D emoji="🎁" size={40} />Kệ đồ chơi</button>
    </div>
    {happy && <Welcome title={`${name} vui quá!`} tune="friendHappy" onDone={onWinSeen} />}
  </main>
}

/* ============================== C · Phim của bé ============================== */

export function MovieList({ age, plays, win, onOpen, onBack, onWinSeen }: {
  age: AgeId; plays: Record<string, number>; win: Win | null
  onOpen: (game: Game, index: number) => void; onBack: () => void; onWinSeen: () => void
}) {
  const { list, next } = episodesFor(age, plays)
  const heroIndex = next < list.length ? next : 0
  const hero = list[heroIndex]
  const finishedIndex = win?.mode === 'movies' ? list.findIndex(g => g.id === win.gameId) : -1
  useTune('movies', finishedIndex >= 0, MODE_LINES.movies)
  return <main className="mode-screen movies-screen">
    <TopBar title={MODES.movies.title} onBack={onBack} />
    {hero && <article className="episode-hero">
      <div className={`episode-art scene-tint-${hero.scene ?? 'farm'}`}>
        <span className="episode-tag">Tập {heroIndex + 1}</span>
        <div className="episode-narrator"><Companion kind={companionFor(hero)} mood="idle" /></div>
        <div className="episode-thing"><GameIcon game={hero} size={84} /></div>
      </div>
      <h2>{hero.title}</h2>
      <button className="mode-cta" onClick={() => { playPop(); onOpen(hero, heroIndex) }}><UiIcon name="play" size={28} /> {next < list.length ? 'Xem và chơi' : 'Xem lại từ đầu'}</button>
    </article>}
    <nav className="episode-strip" aria-label="Các tập phim">
      {list.map((game, i) => {
        const done = !!plays[game.id], open = done || i === next
        return <button key={game.id} className={`${done ? 'is-done' : i === next ? 'is-now' : 'is-locked'} ${i === next && finishedIndex >= 0 ? 'just-opened' : ''}`} aria-label={open ? `Tập ${i + 1}: ${game.title}${done ? ', đã xem' : ''}` : `Tập ${i + 1}, chưa mở`}
          onClick={e => { if (open) { playPop(); onOpen(game, i) } else { playTune('locked'); void nudge(e.currentTarget) } }}>
          {open ? i + 1 : <Icon3D emoji="🔒" size={22} />}
        </button>
      })}
    </nav>
    {finishedIndex >= 0 && <Welcome title={finishedIndex + 1 < list.length ? `Hết tập ${finishedIndex + 1}! Tập ${finishedIndex + 2} vừa mở` : 'Bé xem hết các tập rồi!'} tune="tada" onDone={onWinSeen} />}
  </main>
}

/** The opening panel of an episode: the narrator sets the scene, then the game starts. */
export function EpisodeIntro({ game, index, sound, onStart, onBack }: { game: Game; index: number; sound: boolean; onStart: () => void; onBack: () => void }) {
  const line = game.prompt || game.questions[0]?.text || game.title
  // Cô Thủy reads the opening line when she has recorded it; otherwise a harp run opens the story.
  const tell = () => { if (sound) void hasRecording(line).then(yes => yes ? speak(line) : playTune('story')) }
  useEffect(tell, [game.id])
  return <main className="mode-screen episode-intro">
    <TopBar title={`Tập ${index + 1}`} onBack={onBack} />
    <div className={`comic-panel scene-tint-${game.scene ?? 'farm'}`}>
      <div className="comic-bubble">
        <button className="mode-round small" aria-label="Nghe lại" onClick={tell}><UiIcon name="sound" size={22} /></button>
        <span>{line}</span>
      </div>
      <div className="comic-narrator"><Companion kind={companionFor(game)} mood="cheer" big /></div>
      <div className="comic-thing"><GameIcon game={game} size={96} /></div>
    </div>
    <h2 className="comic-title">{game.title}</h2>
    <div className="mode-actions"><button className="mode-cta" onClick={() => { playPop(); onStart() }}><UiIcon name="play" size={28} /> Bắt đầu</button></div>
  </main>
}

/* ============================== Trang chủ: ba cửa ============================== */

export function ModeDoors({ age, journey, plays, friend, onOpen }: {
  age: AgeId; journey: Journey; plays: Record<string, number>; friend: CompanionKind; onOpen: (mode: ModeId) => void
}) {
  const { list, next } = episodesFor(age, plays)
  return <section className="mode-doors" aria-label="Chọn nơi chơi">
    <button className="door door-island" onClick={() => { playPop(); onOpen('island') }}>
      <span className="door-art" aria-hidden="true"><DoorScene world="island" /><Companion kind={defaultFriend(age)} mood="idle" /></span>
      <span className="door-text"><strong>{MODES.island.title}</strong><small>Hôm nay {journey.done.length}/{journey.stations.length} trạm</small></span>
    </button>
    <button className="door door-friend" onClick={() => { playPop(); onOpen('friend') }}>
      <span className="door-art" aria-hidden="true"><DoorScene world="friend" /><Companion kind={friend} mood="idle" /></span>
      <span className="door-text"><strong>Nhà của {FRIEND_NAMES[friend]}</strong><small>{poolFor('friend', age).length} trò chơi cùng bạn</small></span>
    </button>
    <button className="door door-movies" onClick={() => { playPop(); onOpen('movies') }}>
      <span className="door-art" aria-hidden="true"><DoorScene world="movies" /><Companion kind="turtle" mood="idle" /></span>
      <span className="door-text"><strong>{MODES.movies.title}</strong><small>{next < list.length ? `Tập ${next + 1}` : `${list.length} tập`}</small></span>
    </button>
  </section>
}
