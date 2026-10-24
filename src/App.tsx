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
import { PlaytestPanel } from './components/PlaytestPanel'
import { EpisodeIntro, FRIEND_NAMES, FriendHouse, IslandMap, MovieList, defaultFriend, type Win } from './components/Modes'
import { MODES, episodesFor, journeyFor, modeOf, nextJourney, wishesFor, type ModeId } from './modes'
import type { Finale } from './player/types'
import { applyMotionLevel, type MotionLevel } from './motion/motion'
import { ArtDefs } from './art/index'

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
  | { n: 'studio' }

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
  const [rest, setRest] = useState(false)
  const [selectedAge, setSelectedAge] = useState<AgeId>(save.preferredAge)
  const playClock = useRef({ elapsed: 0, lastTick: performance.now() })
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

  // Count only foreground play, keeping the allowance across game changes.
  useEffect(() => {
    playClock.current.lastTick = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const delta = Math.min(now - playClock.current.lastTick, 2500)
      playClock.current.lastTick = now
      if (route.n !== 'play' || rest || gate || document.hidden) return
      playClock.current.elapsed += delta
      if (save.settings.limit > 0 && playClock.current.elapsed >= save.settings.limit * 60000) {
        setRest(true)
        stopSpeech()
        if (save.settings.sound) speak('Đã đến giờ nghỉ ngơi rồi! Con hãy đứng dậy vươn vai và uống nước nhé!')
      }
    }, 1000)
    const visibility = () => { playClock.current.lastTick = performance.now() }
    document.addEventListener('visibilitychange', visibility)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', visibility) }
  }, [save.settings.limit, save.settings.sound, rest, gate, route.n])

  const go = (r: Route) => {
    stopSpeech()
    playPop()
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (r.n === 'home') playClock.current.elapsed = 0
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
          onOpenAdult={() => needAdult(() => go({ n: 'adult' }))}
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
      screen = <Suspense fallback={<p className="studio-suspense">Đang mở xưởng sáng tạo…</p>}><Studio onBack={() => go({ n: 'adult' })} onPlayGame={game => go({ n: 'play', game, run: 0 })}/></Suspense>
      break

    case 'adult':
      screen = (
        <div className="screen scroll">
          <Back onClick={() => go({ n: 'home' })} />
          <img className="adult-logo" src="/assets/brand/logo-duong-thuy.webp" alt="Logo Dương Thủy" width="512" height="512" />
          <h1 className="h rainbow-title">Cài Đặt Dành Cho Người Lớn</h1>
          <button className="studio-entry" onClick={() => go({ n: 'studio' })}><img src="/assets/images/mascot_rabbit.webp" alt=""/><div><strong>Xưởng sáng tạo AI · 34AI</strong><span>Ảnh có bé · Video · Giọng nói · Tạo trò chơi từ ý tưởng</span></div><UiIcon name="next"/></button>
          <div className="panel panel-3d">
            <label>
              <input
                type="checkbox"
                checked={save.settings.sound}
                onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, sound: e.target.checked } }))}
              />
              <b>Bật âm thanh và hướng dẫn tiếng Việt</b>
            </label>

            <div className="voice-setting-box">
              <div className="voice-setting-title">🎙️ Giọng cô giáo</div>
              <div className="voice-card selected">
                <div className="voice-card-name">👩 Cô Thủy</div>
                <p className="voice-card-desc">Giọng nữ rõ ràng, ấm áp và vui tươi. Cô Thủy đồng hành cùng con khi học và chơi.</p>
                <button className="btn-test-voice" onClick={() => save.settings.sound && speak(TEACHER_INTRO)}>🔊 Nghe cô Thủy</button>
              </div>
            </div>

            <label style={{ marginTop: '14px' }}>
              <input
                type="checkbox"
                checked={save.settings.rewards}
                onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, rewards: e.target.checked } }))}
              />
              <b>Phần thưởng sau khi hoàn thành lượt chơi</b>
            </label>
            <label>
              <b>Hẹn giờ nhắc nghỉ mắt sau:</b>&nbsp;
              <select
                value={save.settings.limit}
                onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, limit: Number(e.target.value) } }))}
              >
                <option value={0}>Tắt hẹn giờ</option>
                <option value={5}>5 phút</option>
                <option value={10}>10 phút</option>
                <option value={15}>15 phút</option>
                <option value={20}>20 phút</option>
              </select>
            </label>
            <label>
              <b>Hiệu ứng chuyển động:</b>&nbsp;
              <select
                value={save.settings.motion}
                onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, motion: e.target.value as MotionLevel } }))}
              >
                <option value="full">Đầy đủ</option>
                <option value="light">Nhẹ (chỉ mờ dần, đổi màu)</option>
                <option value="off">Tắt</option>
              </select>
            </label>
          </div>

          <PlaytestPanel />

          <h2 className="dom" style={{ background: '#74CBF4', marginTop: '24px' }}>
            Danh Mục {GAMES.length} Trò Chơi (Bám Sát Giáo Án)
          </h2>
          <div className="adult-table-scroll"><table className="tbl">
            <thead>
              <tr>
                <th>Trò chơi</th>
                <th>Dạng</th>
                <th>Tuổi</th>
                <th>Mục tiêu MT</th>
                <th>Số câu</th>
                <th>Đã chơi</th>
              </tr>
            </thead>
            <tbody>
              {GAMES.map((g) => (
                <tr key={g.id}>
                  <td>{g.icon} {g.title}</td>
                  <td><span className="engine-pill">{g.engine}</span></td>
                  <td>{g.age}</td>
                  <td><b>{g.mt.join(', ')}</b></td>
                  <td>{totalOf(g)}</td>
                  <td>{save.plays[g.id] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <p className="note" style={{ marginTop: '16px' }}>
            Tiến độ chơi và thư viện gia đình được lưu trên thiết bị. Khi người lớn dùng tạo nội dung AI, mô tả và ảnh đã chọn sẽ được gửi đến Google theo xác nhận trong xưởng.
          </p>
        </div>
      )
      break
  }

  return (
    <>
      <ArtDefs />
      <div {...(gate || rest ? { inert: '' } : {})}>{screen}</div>

      {rest && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Nghỉ ngơi" {...(gate ? { inert: '' } : {})}>
          <div className="bigemoji pop-bounce">⏰</div>
          <h1 className="rainbow-title">Nghỉ một chút nhé!</h1>
          <div className="rest-pictures" aria-label="Uống nước, vươn vai, nghỉ mắt">💧 🧘 🌳</div>
          <Mascot mood="encourage" />
          <button className="btn alt" onClick={() => { setRest(false); go({ n: 'home' }) }}>🏠 Về nhà</button>
          <button
            className="btn juicy-btn"
            style={{ marginTop: '20px' }}
            onClick={() =>
              needAdult(() => {
                playClock.current.elapsed = 0
                playClock.current.lastTick = performance.now()
                setRest(false)
              })
            }
          >
            🔒 Người lớn cho chơi tiếp
          </button>
        </div>
      )}
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
