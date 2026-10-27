import { UiIcon } from './components/UiIcon'
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
const Studio = lazy(() => import('./studio/Studio'))
// The game screens and all play engines load separately from the home page.
const loadPlayer = () => import('./Player')
const Player = lazy(() => loadPlayer().then(m => ({ default: m.Player })))
import { AGES, totalOf, type AgeId, type Game } from './types'
import { GAMES } from './data/games'
import { useSave } from './store'
import { speak, stopSpeech, playPop, setSoundEnabled, setCustomSpeech } from './audio'
import { useStudioMedia } from './studio/media'
import { Mascot } from './Mascot'
import { TEACHER_INTRO } from './teacherVoice'
import { HomeWebsite, GameLibrary } from './components/HomeWebsite'
import { ToyShelf } from './components/ToyShelf'
import { AdultPage } from './components/AdultPage'
import { EpisodeIntro, FRIEND_NAMES, FriendHouse, IslandMap, MovieList, defaultFriend, type Win } from './components/Modes'
import { MODES, episodesFor, journeyFor, modeOf, nextJourney, wishesFor, type ModeId } from './modes'
import type { Finale } from './player/types'
import { applyMotionLevel, type MotionLevel } from './motion/motion'
import { ArtDefs } from './art/index'
import { RestBreak } from './components/RestBreak'
import { afterRest, readPlayTime, resume, tick, writePlayTime, type PlayTime } from './playTime'

type Route =
  | { n: 'home' }
  | { n: 'games'; age: AgeId }
  | { n: 'play'; game: Game; run: number; from?: ModeId }
  | { n: 'island' }
  | { n: 'friend' }
  | { n: 'movies' }
  | { n: 'episode'; game: Game; index: number }
  | { n: 'collection' }
  | { n: 'adult' }
  | { n: 'studio'; from?: 'home' }

function AdultGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [a] = useState(() => 3 + Math.floor(Math.random() * 6))
  const [b] = useState(() => 4 + Math.floor(Math.random() * 5))
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)
  return (
    <form className="overlay adult-gate" role="dialog" aria-modal="true" aria-labelledby="adult-gate-title" onSubmit={e => { e.preventDefault(); Number(v) === a + b ? onPass() : setErr(true) }}>
      <h1 id="adult-gate-title" className="rainbow-title">Khu Vực Người Lớn</h1>
      <p className="sub">Phép tính xác nhận: <b>{a} + {b} = ?</b></p>
      <input
        className="gateinput"
        inputMode="numeric"
        aria-label="Kết quả phép tính"
        aria-invalid={err}
        autoFocus
        value={v}
        onChange={(e) => {
          setV(e.target.value)
          setErr(false)
        }}
      />
      {err && <p className="sub" style={{ color: '#E8735A' }}>Chưa đúng rồi, thử lại nhé!</p>}
      <div className="row" style={{ marginTop: '12px' }}>
        <button
          type="submit"
          className="btn juicy-btn"
        >
          Xác nhận
        </button>
        <button
          type="button"
          className="btn alt juicy-btn"
          onClick={() => {
            playPop()
            onCancel()
          }}
        >
          Quay lại
        </button>
      </div>
    </form>
  )
}

export default function App() {
  const [save, update] = useSave()
  const [route, setRoute] = useState<Route>({ n: 'home' })
  const [gate, setGate] = useState<null | (() => void)>(null)
  // Play time since the last rest (kept on the device); the rest popup shows while `restUntil` is set.
  const [time, setTime] = useState<PlayTime>(() => readPlayTime())
  const rest = time.restUntil !== undefined
  const [selectedAge, setSelectedAge] = useState<AgeId>(save.preferredAge)
  const lastTick = useRef(performance.now())
  // A game just finished from one of the three modes, celebrated when the child returns there.
  const [win, setWin] = useState<Win | null>(null)
  const journey = useMemo(() => journeyFor(save.journey, selectedAge, save.plays), [save.journey, selectedAge, save.plays])
  useEffect(() => { if (journey !== save.journey) update(s => ({ ...s, journey })) }, [journey])
  const friend = save.friend ?? defaultFriend(selectedAge)
  const playFrom = (from: ModeId) => (game: Game) => go({ n: 'play', game, run: 0, from })
  useEffect(() => () => stopSpeech(), [])
  // Fetch the game screens once the home page has settled, so the first tap on a game opens at once.
  useEffect(() => {
    const timer = setTimeout(() => { void loadPlayer().catch(() => {}) }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useLayoutEffect(() => { setSoundEnabled(save.settings.sound) }, [save.settings.sound])
  // Voice clips made in the studio for family games are read instead of the chime.
  const { assets } = useStudioMedia()
  useEffect(() => { setCustomSpeech(assets.filter(a => a.kind === 'audio' && a.target?.startsWith('voice:')).map(a => ({ text: a.prompt, url: a.url }))) }, [assets])
  useLayoutEffect(() => { applyMotionLevel(save.settings.motion) }, [save.settings.motion])

  const changeAge = (age: AgeId) => {
    setSelectedAge(age)
    update(s => ({ ...s, preferredAge: age }))
    if (save.settings.sound) speak(AGES.find(a => a.id === age)!.label)
  }
  const toggleSound = () => update(s => ({ ...s, settings: { ...s.settings, sound: !s.settings.sound } }))

  // Count foreground time on the child's screens (from the first game on, across games, the home page
  // and reloads); the parents' area and the studio do not count.
  useEffect(() => {
    lastTick.current = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const delta = Math.min(now - lastTick.current, 2500)
      lastTick.current = now
      const counting = !document.hidden && !gate && route.n !== 'adult' && route.n !== 'studio'
      setTime(t => tick(t, { now: Date.now(), delta, counting, limitMinutes: save.settings.limit }))
    }, 1000)
    const visibility = () => { lastTick.current = performance.now() }
    document.addEventListener('visibilitychange', visibility)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', visibility) }
  }, [save.settings.limit, gate, route.n])
  useEffect(() => { writePlayTime(time) }, [time])
  // The moment the limit is reached: stop what is being read and say why the game pauses.
  useEffect(() => {
    if (!rest) return
    stopSpeech()
    if (save.settings.sound) speak(`Con đã chơi ${save.settings.limit} phút rồi! Mình nghỉ một chút nhé: uống nước, vươn vai và nhìn ra xa cho mắt thật khỏe.`)
  }, [rest])

  const go = (r: Route) => {
    stopSpeech()
    playPop()
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (r.n === 'play') setTime(t => t.started ? t : { ...resume(t, Date.now()), started: true })
    setRoute(r)
  }
  const needAdult = (fn: () => void) => {
    playPop()
    setGate(() => fn)
  }

  const totalCollected = Object.values(save.collection).reduce((a, b) => a + b, 0)

  /** What the victory screen says about where the game came from, and what opens next there. */
  function finaleFor(game: Game, from?: ModeId): Finale | undefined {
    if (from === 'island') {
      const i = journey.stations.indexOf(game.id)
      if (i < 0) return undefined
      const done = new Set([...journey.done, game.id])
      const nextIndex = journey.stations.findIndex(id => !done.has(id))
      const nextGame = nextIndex >= 0 ? GAMES.find(g => g.id === journey.stations[nextIndex]) : undefined
      return {
        title: nextIndex < 0 ? 'Đi hết hành trình!' : `Trạm ${i + 1} xong!`,
        line: nextIndex < 0 ? 'Hôm nay bé đi hết 3 trạm rồi!' : game.title,
        map: journey.stations.map((id, k) => done.has(id) ? 'done' : k === nextIndex ? 'new' : 'locked'),
        next: nextGame && { kicker: `Trạm ${nextIndex + 1}: ${nextGame.title}`, title: nextGame.title, icon: nextGame.icon, onGo: () => go({ n: 'play', game: nextGame, run: 0, from: 'island' }) },
      }
    }
    if (from === 'movies') {
      const { list } = episodesFor(game.age, save.plays)
      const i = list.findIndex(g => g.id === game.id)
      if (i < 0) return undefined
      const nextGame = list[i + 1]
      return {
        title: `Hết tập ${i + 1}!`,
        line: game.title,
        replayLabel: `Xem lại tập ${i + 1}`,
        next: nextGame && { kicker: `Tập ${i + 2} vừa mở`, title: nextGame.title, icon: nextGame.icon, onGo: () => go({ n: 'episode', game: nextGame, index: i + 1 }) },
      }
    }
    if (from === 'friend') {
      const nextGame = wishesFor(game.age, save.plays).find(g => g.id !== game.id)
      return { next: nextGame && { kicker: `${FRIEND_NAMES[friend]} muốn chơi`, title: nextGame.title, icon: nextGame.icon, onGo: () => go({ n: 'play', game: nextGame, run: 0, from: 'friend' }) } }
    }
    return undefined
  }

  let screen
  switch (route.n) {
    case 'home':
      screen = (
        <HomeWebsite
          onPlayGame={(game) => go({ n: 'play', game, run: 0 })}
          onOpenCollection={() => go({ n: 'collection' })}
          onOpenAdult={() => { playPop(); go({ n: 'adult' }) }}
          onCreateGame={() => { playPop(); go({ n: 'studio', from: 'home' }) }}
          totalCollected={totalCollected}
          sound={save.settings.sound}
          onToggleSound={toggleSound}
          age={selectedAge}
          onAgeChange={changeAge}
          plays={save.plays}
        />
      )
      break

    case 'island':
      screen = <IslandMap age={selectedAge} journey={journey} plays={save.plays} win={win} onWinSeen={() => setWin(null)}
        onPlay={playFrom('island')} onBack={() => go({ n: 'home' })}
        onNewJourney={() => update(s => ({ ...s, journey: nextJourney(journey, s.plays) }))} />
      break

    case 'friend':
      screen = <FriendHouse age={selectedAge} plays={save.plays} friend={friend} collection={save.collection} win={win} onWinSeen={() => setWin(null)}
        onPlay={playFrom('friend')} onBack={() => go({ n: 'home' })} onOpenShelf={() => go({ n: 'collection' })}
        onChooseFriend={kind => update(s => ({ ...s, friend: kind }))} />
      break

    case 'movies':
      screen = <MovieList age={selectedAge} plays={save.plays} win={win} onWinSeen={() => setWin(null)}
        onOpen={(game, index) => go({ n: 'episode', game, index })} onBack={() => go({ n: 'home' })} />
      break

    case 'episode':
      screen = <EpisodeIntro game={route.game} index={route.index} sound={save.settings.sound}
        onStart={() => go({ n: 'play', game: route.game, run: 0, from: 'movies' })} onBack={() => go({ n: 'movies' })} />
      break

    case 'games':
      screen = <main className="screen library-screen">
        <Back onClick={() => go({ n: 'home' })} />
        <h1 className="h">Cùng chơi nào!</h1>
        <GameLibrary age={route.age} plays={save.plays}
          onAgeChange={age => { changeAge(age); go({ n: 'games', age }) }}
          onPlayGame={game => go({ n: 'play', game, run: 0 })} />
      </main>
      break

    case 'play': {
      const world = route.from ?? modeOf(route.game)
      const finale = finaleFor(route.game, route.from)
      screen = (
        <Suspense fallback={<p className="studio-suspense">Đang mở trò chơi…</p>}>
        <Player
          key={`${route.game.id}-${route.run}`}
          game={route.game}
          visit={save.plays[route.game.id] ?? 0}
          settings={save.settings}
          paused={rest || !!gate}
          onToggleSound={toggleSound}
          exitLabel={route.from ? MODES[route.from].back : undefined}
          mode={world}
          companion={world === 'friend' ? friend : undefined}
          finale={finale}
          onExit={() => go(route.from ? { n: route.from } : route.game.id.startsWith('fam-') ? { n: 'home' } : { n: 'games', age: route.game.age })}
          onReplay={() => setRoute({ ...route, run: route.run + 1 })}
          onFinish={() => {
            const from = route.from, id = route.game.id
            if (from) setWin({ mode: from, gameId: id })
            update((s) => ({
              ...s,
              plays: { ...s.plays, [id]: (s.plays[id] ?? 0) + 1 },
              journey: from === 'island' && s.journey?.stations.includes(id) && !s.journey.done.includes(id)
                ? { ...s.journey, done: [...s.journey.done, id] } : s.journey,
            }))
          }}
          collection={save.collection}
          onReward={(emoji, sid) =>
            update((s) =>
              s.rewardedSessions.includes(sid)
                ? s
                : {
                    ...s,
                    rewardedSessions: [...s.rewardedSessions.slice(-199), sid],
                    collection: { ...s.collection, [emoji]: (s.collection[emoji] ?? 0) + 1 },
                  }
            )
          }
        />
        </Suspense>
      )
      break
    }

    case 'collection':
      screen = (
        <div className="screen scroll toy-shelf-screen">
          <Back onClick={() => go({ n: 'home' })} />
          <ToyShelf collection={save.collection} sound={save.settings.sound} />
        </div>
      )
      break

    case 'studio':
      screen = <Suspense fallback={<p className="studio-suspense">Đang mở xưởng sáng tạo…</p>}><Studio onBack={() => go({ n: route.from === 'home' ? 'home' : 'adult' })} onPlayGame={game => go({ n: 'play', game, run: 0 })}/></Suspense>
      break

    case 'adult':
      screen = <AdultPage settings={save.settings} plays={save.plays} onBack={() => go({ n: 'home' })} onStudio={() => go({ n: 'studio' })}
        onChange={patch => update(s => ({ ...s, settings: { ...s.settings, ...patch } }))} />
      break
  }

  return (
    <>
      <ArtDefs />
      <div {...(gate || rest ? { inert: '' } : {})}>{screen}</div>

      {rest && <RestBreak time={time} limit={save.settings.limit} sound={save.settings.sound} blocked={!!gate}
        onDone={() => setTime(afterRest(Date.now()))}
        onAdult={() => needAdult(() => setTime(afterRest(Date.now())))} />}
      {gate && <AdultGate onPass={() => { const f = gate; setGate(null); f(); }} onCancel={() => setGate(null)} />}
    </>
  )
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button className="iconbtn back back-btn" onClick={() => { playPop(); onClick(); }} aria-label="Quay lại">
      <UiIcon name="back"/>
    </button>
  )
}
