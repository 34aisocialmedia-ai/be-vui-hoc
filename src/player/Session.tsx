import { useEffect, useMemo, useRef, useState } from 'react'
import { totalOf } from '../types'
import { nextSticker, sceneOf, stickerCheer } from '../stickers'
import { speak, speakSeq, stopSpeech, playPop, playCorrect, playWrong, playStarDing, playFanfare } from '../audio'
import { UiIcon } from '../components/UiIcon'
import { Icon3D } from '../components/Icon3D'
import { Confetti } from '../Confetti'
import { Companion, companionFor, type CompanionMood } from '../motion/Companion'
import { STAR_SRC, flyClone, flyTo, motionLevel, nudge, pop, press, sparkle, centerOf } from '../motion/motion'
import { SceneBackground } from '../SceneBackground'
import { createScoreTracker } from '../gameLogic'
import { useGameTask } from '../useGameTask'
import { CORRECT_FEEDBACK, RETRY_FEEDBACK, FINISH_FEEDBACK } from '../teacherVoice'
import type { SessionProps } from './types'
import { StageScaleContext, stageScale } from '../motion/stage'
import { startPlaytest, type PlaytestRecorder } from '../playtest'
import { modeOf } from '../modes'
import { HostContext } from './Host'

const FRIEND_NAMES = { rabbit: 'Thỏ', bear: 'Gấu Bắp', monkey: 'Khỉ Con', turtle: 'Rùa Vàng' } as const

/** Sunburst behind the island victory: soft rays from the middle of the screen. */
const Rays = () => <svg className="finale-rays" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g fill="currentColor">{Array.from({ length: 12 }, (_, i) => <path key={i} d="M200 200 L170 -260 L230 -260Z" transform={`rotate(${i * 30} 200 200)`} />)}</g>
</svg>

/** Shared session rules for every engine: scoring, feedback, pause, rewards and the exit prompt. */
export function Session({
  game,
  settings,
  onExit,
  onReplay,
  onReward,
  onFinish,
  collection,
  exitLabel = 'Chọn trò khác',
  onToggleSound,
  paused = false,
  mode,
  companion: chosenCompanion,
  finale,
  children,
}: SessionProps) {
  const total = totalOf(game)
  const world = mode ?? modeOf(game)
  const sessionId = useMemo(() => `${game.id}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`, [game.id])

  const [points, setPoints] = useState(0)
  const [fb, setFb] = useState<'ok' | 'no' | null>(null)
  const [mascotMood, setMascotMood] = useState<CompanionMood>('idle')
  const [sleepy, setSleepy] = useState(false)
  const companion = useMemo(() => chosenCompanion ?? companionFor(game), [game, chosenCompanion])
  // The element the child last touched inside the play area, to animate feedback on it.
  const lastTouch = useRef<{ el: HTMLElement; at: number } | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = stage.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setStageSize(old => Math.abs(old.width - width) < 8 && Math.abs(old.height - height) < 8 ? old : { width: Math.round(width), height: Math.round(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const [confettiActive, setConfettiActive] = useState(false)
  const [reward, setReward] = useState(false)
  // The album as it was when this session started; the sticker to win is known from the start.
  const [album] = useState(() => collection ?? {})
  const scene = sceneOf(game)
  const prize = useMemo(() => nextSticker(album, scene), [album, scene])
  const [placed, setPlaced] = useState(false)
  const bigSticker = useRef<HTMLDivElement>(null)
  const prizeSlot = useRef<HTMLSpanElement>(null)
  const [done, setDone] = useState(false)
  const [finalGiftAvailable, setFinalGiftAvailable] = useState(false)
  const [pending, setPending] = useState(false)
  const [exitPrompt, setExitPrompt] = useState(false)
  const [victorySkipped, setVictorySkipped] = useState(false)
  const retryCount = useRef(0)

  const score = useRef(createScoreTracker(total))
  const task = useGameTask()
  const busy = task.busy
  const pausedRef = useRef(paused)
  pausedRef.current = paused || exitPrompt
  const rewarded = useRef(false)

  // Đợt D playtest log (only when an adult turned it on in the parent area).
  const playtest = useRef<PlaytestRecorder | null>(null)
  useEffect(() => {
    playtest.current = startPlaytest(game, motionLevel())
    return () => { playtest.current?.end(); playtest.current = null }
  }, [])
  useEffect(() => { if (sleepy) playtest.current?.idle() }, [sleepy])

  useEffect(() => () => {
    stopSpeech()
  }, [])

  // After 10 s without a touch the companion dozes off, a gentle cue to keep playing.
  useEffect(() => {
    if (done || paused || exitPrompt || reward) { setSleepy(false); return }
    let timer = setTimeout(() => setSleepy(true), 10000)
    const wake = () => { setSleepy(false); clearTimeout(timer); timer = setTimeout(() => setSleepy(true), 10000) }
    window.addEventListener('pointerdown', wake, true)
    window.addEventListener('keydown', wake, true)
    return () => { clearTimeout(timer); window.removeEventListener('pointerdown', wake, true); window.removeEventListener('keydown', wake, true) }
  }, [done, paused, exitPrompt, reward])

  function rememberTouch(target: EventTarget | null) {
    const el = target instanceof Element ? target.closest<HTMLElement>('button, [role="button"], .dragitem, .soap-bubble, .mcard') : null
    if (el && stage.current?.contains(el)) { lastTouch.current = { el, at: Date.now() }; void press(el) }
  }
  /** The touched element, if the answer came from a touch in the last moment (not from a timer). */
  function touched() {
    const t = lastTouch.current
    return t && t.el.isConnected && Date.now() - t.at < 2500 ? t.el : null
  }

  async function resume() {
    while (pausedRef.current && task.alive.current) await task.delay(100)
    return task.alive.current
  }

  function triggerConfetti() {
    setConfettiActive(true)
    task.delay(1800).then(active => { if (active) setConfettiActive(false) })
  }

  async function answer(qid: string, ok: boolean): Promise<boolean | null> {
    if (busy.current || score.current.complete || reward || pausedRef.current || score.current.has(qid)) return null
    busy.current = true
    setPending(true)
    stopSpeech()

    try {
      if (ok) {
        setFb('ok')
        setMascotMood('cheer')
        playCorrect()
        playStarDing()
        score.current.add(qid)
        setPoints(score.current.points)
        playtest.current?.answer(true, score.current.points)
        {
          const el = touched()
          if (el) { void pop(el); sparkle(centerOf(el)) }
          const slot = track.current?.children[score.current.points - 1]
          if (slot) void flyTo(STAR_SRC, el ?? (stage.current ? centerOf(stage.current) : { x: innerWidth / 2, y: innerHeight / 2 }), slot, 44, 90)
        }

        if (settings.sound) {
          await Promise.race([speak(CORRECT_FEEDBACK[(score.current.points - 1) % CORRECT_FEEDBACK.length]), task.delay(2800)])
          stopSpeech()
        }
        else await task.delay(650)
        if (!await resume()) return null

        setFb(null)
        setMascotMood('idle')

        // Finish the last task immediately; opening a gift is optional after completion.
        if (score.current.complete) {
          playtest.current?.finish()
          setDone(true)
          setMascotMood('cheer')
          playFanfare()
          triggerConfetti()
          onFinish()
          if (!rewarded.current && settings.rewards) {
            rewarded.current = true
            setFinalGiftAvailable(true)
          }
          if (settings.sound) void speak(FINISH_FEEDBACK)
          return true
        }

        return true
      }

      // Trả lời sai
      playtest.current?.answer(false, score.current.points)
      setFb('no')
      setMascotMood('encourage')
      playWrong()
      void nudge(touched())

      if (settings.sound) {
        await Promise.race([speak(RETRY_FEEDBACK[retryCount.current++ % RETRY_FEEDBACK.length]), task.delay(2800)])
        stopSpeech()
      }
      else await task.delay(650)
      if (!await resume()) return null

      setFb(null)
      setMascotMood('idle')
      return false
    } finally {
      busy.current = false
      if (task.alive.current) setPending(false)
    }
  }

  function openAlbum() {
    setFinalGiftAvailable(false)
    setPlaced(false)
    setReward(true)
    onReward(prize.sticker.emoji, sessionId)
    playFanfare()
    if (settings.sound) speakSeq(stickerCheer(prize.sticker))
    // Show the new sticker big for a moment, then press it into its slot on the album page.
    void task.delay(motionLevel() === 'full' ? 800 : 0).then(async active => {
      if (!active) return
      await flyClone(bigSticker.current, prizeSlot.current, { scale: .4, lift: 70, duration: 650 })
      if (!task.alive.current) return
      setPlaced(true)
      void pop(prizeSlot.current)
      if (prizeSlot.current) sparkle(centerOf(prizeSlot.current))
    })
  }

  function closeReward() {
    playPop()
    stopSpeech()
    setReward(false)
  }

  // Album page: the new sticker is shown big, then pressed into its slot. Tap anywhere to skip.
  // It sits on the victory screen; showing it over the game would mount the game again and
  // replay its first question ("Có bao nhiêu quả táo?") over the sticker.
  const albumOverlay = reward && (
        <div className="overlay reward-overlay album-overlay" role="dialog" aria-modal="true" aria-label={`Nhãn dán mới: ${prize.sticker.name}`} onPointerDown={() => setPlaced(true)}>
          <h1 className="rainbow-title">Nhãn dán mới!</h1>
          <div className="sticker-new-stage">
            {!placed && <div className="sticker-new" ref={bigSticker}><Icon3D emoji={prize.sticker.emoji} size={150} /></div>}
          </div>
          <div className="album-page" aria-label={`Trang ${prize.page.title}`}>
            <h2>{prize.page.title}</h2>
            <div className="album-slots">
              {prize.page.stickers.map(st => {
                const isNew = st === prize.sticker
                const owned = isNew ? placed : (album[st.emoji] ?? 0) > 0
                return <span key={st.emoji} ref={isNew ? prizeSlot : undefined} className={`album-slot ${owned ? 'owned' : ''} ${isNew ? 'is-new' : ''}`}>
                  <Icon3D emoji={st.emoji} size={56} className={owned ? '' : 'sticker-shadow'} />
                  <small>{owned ? st.name : ''}</small>
                </span>
              })}
            </div>
          </div>
          <p className="album-name">{prize.sticker.name}</p>
          <button autoFocus className="btn juicy-btn" onClick={closeReward}>✨ Chơi tiếp</button>
        </div>
  )

  const host = useMemo(() => ({ kind: companion, mood: mascotMood, sleepy: sleepy && !fb, paused }), [companion, mascotMood, sleepy, fb, paused])

  if (done) {
    const friendName = FRIEND_NAMES[companion]
    const title = finale?.title ?? (world === 'friend' ? `${friendName} vui quá!` : 'Giỏi quá!')
    const line = finale?.line ?? (world === 'friend' ? 'Cảm ơn bé đã chơi cùng!' : game.title)
    const claim = finalGiftAvailable && (world === 'friend'
      ? <div className="finale-gift">
          <span className="finale-gift-pic"><Icon3D emoji={prize.sticker.emoji} size={72} /></span>
          <span className="finale-gift-text"><small>Quà mới cho phòng</small><strong>{prize.sticker.name}</strong></span>
        </div>
      : <button className="finale-sticker sticker-claim" aria-label={`Nhận nhãn dán ${prize.sticker.name}`} onClick={openAlbum}>
          <Icon3D emoji={prize.sticker.emoji} size={world === 'movies' ? 52 : 80} />
          <span>Nhận nhãn dán<b>{prize.sticker.name}</b></span>
        </button>)
    const exit = <button className="finale-link" onClick={() => { playPop(); onExit(); }}><UiIcon name="home" size={22}/> {exitLabel}</button>
    const replay = <button className="finale-link" onClick={() => { playPop(); onReplay(); }}><UiIcon name="replay" size={22}/> {finale?.replayLabel ?? 'Chơi lại'}</button>
    return (
      <>
      <div className={`screen victory-screen finale finale-${world} ${victorySkipped ? 'is-skipped' : ''}`} onPointerDown={() => setVictorySkipped(true)}>
        {world === 'island' && <Rays />}
        {world !== 'movies' && <Confetti active={!victorySkipped} />}
        {world === 'movies' && <div className={`finale-film scene-tint-${game.scene ?? 'farm'}`} aria-hidden="true">
          <span className="film-water" /><span className="film-bank left" /><span className="film-bank right" />
          <span className="finale-film-hero"><Companion kind={companion} mood="cheer" big /></span>
          <span className="finale-film-thing"><Icon3D emoji={game.icon} size={70} /></span>
          <span className="film-spark s1" /><span className="film-spark s2" /><span className="film-spark s3" />
        </div>}
        <h1 className="finale-title">{title}</h1>
        {line && <p className="finale-line">{line}</p>}
        <div className="finale-stars" role="img" aria-label={`Hoàn thành ${points} nhiệm vụ, ${points} ngôi sao`}>
          {[0, 1, 2].map(i => <img key={i} src={STAR_SRC} alt="" width={i === 1 ? 70 : 54} height={i === 1 ? 70 : 54} style={{ '--i': i } as React.CSSProperties} />)}
        </div>
        {world !== 'movies' && <div className="finale-hero">
          <span className="finale-buddy"><Companion kind={companion} mood="cheer" big /></span>
          {claim}
        </div>}
        {world === 'movies' && claim}
        {world === 'friend' && <div className="finale-shelf" role="img" aria-label={`Trang ${prize.page.title} trong album`}>
          {prize.page.stickers.slice(0, 6).map(st => {
            const owned = (album[st.emoji] ?? 0) > 0 || (st === prize.sticker && !finalGiftAvailable && rewarded.current)
            return <span key={st.emoji} className={owned ? 'owned' : st === prize.sticker ? 'is-new' : ''}>{owned || st === prize.sticker ? <Icon3D emoji={st.emoji} size={36} className={owned ? '' : 'sticker-shadow'} /> : null}</span>
          })}
        </div>}
        {world === 'island' && finale?.map && <div className="finale-map" role="img" aria-label={`Hành trình: ${finale.map.filter(s => s === 'done').length} trên ${finale.map.length} trạm đã xong`}>
          <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><path d="M40 82 C 90 26, 130 26, 150 34 C 190 46, 220 88, 262 88" /></svg>
          {finale.map.map((state, i) => <span key={i} className={`map-stop stop-${i} is-${state}`}>
            {state === 'done' ? <UiIcon name="check" size={22} /> : state === 'new' ? <Icon3D emoji="⭐" size={30} /> : <Icon3D emoji="🔒" size={20} />}
          </span>)}
          {finale.map.includes('new') && <b className="map-new">Trạm mới mở!</b>}
        </div>}
        <div className="finale-actions">
          {world === 'friend' && finalGiftAvailable
            ? <button className="finale-cta sticker-claim" aria-label={`Nhận nhãn dán ${prize.sticker.name}`} onClick={openAlbum}><Icon3D emoji="🎁" size={40} /> Đặt vào phòng</button>
            : finale?.next
              ? <button className={`finale-next ${world === 'island' ? 'finale-cta' : 'is-card'}`} onClick={() => { playPop(); finale.next!.onGo() }}>
                  {world !== 'island' && <span className="finale-next-pic"><Icon3D emoji={finale.next.icon} size={70} /></span>}
                  <span className="finale-next-text"><small>{finale.next.kicker}</small><strong>{world === 'island' ? 'Trạm tiếp theo' : finale.next.title}</strong></span>
                  <UiIcon name="play" size={30} />
                </button>
              : <button className="finale-cta" onClick={() => { playPop(); onExit(); }}><UiIcon name="home" size={28} /> {exitLabel}</button>}
          <div className="finale-links">
            {replay}
            {(finale?.next || (world === 'friend' && finalGiftAvailable)) && exit}
          </div>
        </div>
      </div>
      {albumOverlay}
      </>
    )
  }

  return (
    <div className={`screen player world-${world} host-${companion}`} onPointerDownCapture={e => playtest.current?.tap(e.target, pending)}>
      <Confetti active={confettiActive} />

      <div className="topbar" {...(reward || exitPrompt ? { inert: '' } : {})}>
        <button className="iconbtn back-btn" onClick={() => { playPop(); setExitPrompt(true); }} aria-label="Chọn trò khác"><UiIcon name="back"/></button>
        <div className="player-title"><span>{game.title}</span><div className="session-progress"><div className={`star-track n${total}`} ref={track} role="progressbar" aria-label="Tiến độ trò chơi" aria-valuemin={0} aria-valuemax={total} aria-valuenow={points}>{Array.from({ length: total }, (_, i) => <span key={i} className={i < points ? 'on' : ''}><img src={STAR_SRC} alt="" width={22} height={22}/></span>)}</div><small>{points}/{total}</small></div></div>
        <button className="iconbtn sound-toggle" aria-label={settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={settings.sound} onClick={onToggleSound}><UiIcon name={settings.sound?'sound':'mute'}/></button>
      </div>

      <StageScaleContext.Provider value={stageScale(stageSize)}>
      <div className="engine-inputs" ref={stage} style={{ '--k': stageScale(stageSize) } as React.CSSProperties} onPointerDownCapture={e => rememberTouch(e.target)} onKeyDownCapture={e => { if (e.key === 'Enter' || e.key === ' ') rememberTouch(e.target) }} {...(pending || paused || exitPrompt || done ? { inert: '' } : {})} aria-busy={pending}>
      <HostContext.Provider value={host}>
      <SceneBackground theme={scene}>
        {children({ answer, sound: settings.sound, finished: done, paused, stage: stageSize })}
      </SceneBackground>
      </HostContext.Provider>
      </div>
      </StageScaleContext.Provider>

      <div className={`player-companion ${fb || ''}`}>
        <Companion kind={companion} mood={mascotMood} sleepy={sleepy && !fb} paused={paused} />
        <span role="status" className="companion-status">{fb === 'ok' ? 'Đúng rồi!' : fb === 'no' ? 'Thử lại nhé!' : ''}</span>
      </div>

      {exitPrompt && <div className="overlay exit-overlay" role="dialog" aria-modal="true" aria-label="Rời trò chơi">
        <img src="/assets/images/mascot_rabbit.webp" width={100} height={120} alt="Bạn Thỏ"/>
        <h1>Chơi tiếp nhé?</h1>
        <div className="row">
          <button autoFocus className="btn juicy-btn" onClick={() => setExitPrompt(false)}><UiIcon name="play"/> Chơi tiếp</button>
          <button className="btn alt juicy-btn" onClick={onExit}><UiIcon name="home"/> Trò khác</button>
        </div>
      </div>}
    </div>
  )
}
