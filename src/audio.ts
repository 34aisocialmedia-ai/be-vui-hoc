/** Recorded Cô Thủy narration and lightweight game sound effects. */
let soundEnabled = true

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled
  if (!enabled) {
    stopSpeech()
    if (audioCtx?.state === 'running') void audioCtx.suspend().catch(() => {})
  }
}

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!soundEnabled) throw new Error('Sound is muted')
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/* ========================================================================== *
 * 1. HIỆU ỨNG ÂM THANH (SFX) BẰNG WEB AUDIO API
 * ========================================================================== */

/** Warm original toy-piano tones; no network or voice-generation service needed. */
export function playLearningNote(note: number) {
  try {
    const ctx = getAudioCtx(), now = ctx.currentTime
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime([523.25, 659.25, 783.99, 1046.5][note % 4], now)
    gain.gain.setValueAtTime(.22, now)
    gain.gain.exponentialRampToValueAtTime(.001, now + .4)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + .42)
  } catch { /* The visible motif remains playable when audio is unavailable. */ }
}

/** Âm thanh chạm nút "Pop" vui nhộn */
export function playPop() {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const now = ctx.currentTime
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh khi trả lời đúng: Hợp âm chuông ngân vang (C5 - E5 - G5 - C6) */
export function playCorrect() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      const start = now + idx * 0.08
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.28, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.46)
    })
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh khi trả lời sai: Nốt hoạt hình "Boing" nhẹ nhàng */
export function playWrong() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(260, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.29)
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh ngôi sao bay vào thanh điểm */
export function playStarDing() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const freqs = [1318.51, 1567.98, 2093.0]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const start = now + idx * 0.06
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.25, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.36)
    })
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh chạm hộp quà (Lắc lách cách) */
export function playBoxRattle() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      const start = now + i * 0.05
      osc.frequency.setValueAtTime(400 + Math.random() * 300, start)
      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.05)
    }
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh mở rương kho báu (Fanfare) */
export function playFanfare() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51]
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      const start = now + idx * 0.09
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.3, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.72)
    })
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh nổ bong bóng "Bụp / Plop" chân thực */
export function playBubblePop() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08)
    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh thú cưng ăn "Nhóp nhép / Crunch" */
export function playChew() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(280 + Math.random() * 80, t)
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.06)
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.07)
    }
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh gắn khớp mảnh ghép gỗ (Snap Puzzle) */
export function playSnapPuzzle() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05)
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.13)
  } catch {
    /* Bỏ qua */
  }
}

/** Âm thanh gợn sóng nước (Water splash) */
export function playWaterSplash() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const t = now + i * 0.04
      osc.frequency.setValueAtTime(700 + Math.random() * 500, t)
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.06)
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.07)
    }
  } catch {
    /* Bỏ qua */
  }
}

/* Cô Thủy: one consistent local recording for each line. */

let currentAudio: HTMLAudioElement | null = null
let currentSpeechToken = 0
let manifestCache: Record<string, string> | null = null
let manifestLoadingPromise: Promise<Record<string, string>> | null = null
let cancelPlayback: (() => void) | null = null

function loadManifest(): Promise<Record<string, string>> {
  if (manifestCache) return Promise.resolve(manifestCache)
  if (!manifestLoadingPromise) {
    manifestLoadingPromise = fetch('/audio/manifest.json', { signal: AbortSignal.timeout(4000) })
      .then((r) => { if (!r.ok) throw new Error('Audio manifest unavailable'); return r.json() })
      .then((data) => {
        manifestCache = data
        return data
      })
      .catch(() => {
        // A transient offline request can succeed on the next interaction.
        manifestLoadingPromise = null
        return {}
      })
  }
  return manifestLoadingPromise
}

/** Play a recorded line from the single Cô Thủy voice bank. */
export async function speak(text: string): Promise<void> {
  stopSpeech()
  await speakText(text, currentSpeechToken)
}

const normalizeLine = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ')

const prefetchedLines = new Set<string>()

/**
 * Download the recordings a game is about to use, so the first tap speaks without waiting
 * for the network. The service worker keeps them for offline play. Lines without a recording
 * are skipped; at most `limit` new files are fetched, two at a time.
 */
export async function prefetchSpeech(texts: Iterable<string>, limit = 40): Promise<number> {
  if (!soundEnabled || typeof fetch === 'undefined') return 0
  const connection = (globalThis.navigator as Navigator & { connection?: { saveData?: boolean } } | undefined)?.connection
  if (connection?.saveData) return 0
  const map = await loadManifest()
  const urls: string[] = []
  for (const text of texts) {
    if (urls.length >= limit) break
    const hash = typeof text === 'string' ? map[normalizeLine(text)] : undefined
    if (!hash) continue
    const url = `/audio/co-thuy/${hash}.mp3`
    if (prefetchedLines.has(url)) continue
    prefetchedLines.add(url)
    urls.push(url)
  }
  let next = 0
  const worker = async () => {
    while (next < urls.length) {
      const url = urls[next++]
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(String(response.status))
        await response.arrayBuffer()
      } catch {
        prefetchedLines.delete(url) // try again next time the game opens
      }
    }
  }
  await Promise.all([worker(), worker()])
  return urls.length
}

/** Whether Cô Thủy's voice is playing right now, so the friend on screen can "talk" along. */
const talkListeners = new Set<(talking: boolean) => void>()
let talking = false
function setTalking(on: boolean) {
  if (on === talking) return
  talking = on
  talkListeners.forEach(fn => fn(on))
}
export function onTalk(fn: (talking: boolean) => void) {
  talkListeners.add(fn)
  return () => { talkListeners.delete(fn) }
}

/** Voice clips a family made in the studio (line → file), read before Cô Thủy's recordings. */
let customSpeech = new Map<string, string>()
export function setCustomSpeech(lines: { text: string; url: string }[]) {
  customSpeech = new Map(lines.map(l => [normalizeLine(l.text), l.url]))
}

async function speakText(text: string, token: number): Promise<void> {
  if (!soundEnabled || token !== currentSpeechToken || !text.trim()) return

  const norm = normalizeLine(text)

  try {
    const custom = customSpeech.get(norm)
    const map = custom ? {} : await loadManifest()
    const hash = map[norm]
    if (custom || hash) {
      const audioUrl = custom ?? `/audio/co-thuy/${hash}.mp3`
      if (token !== currentSpeechToken) return

      const audio = new Audio(audioUrl)
      currentAudio = audio
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { audio.pause(); finish(new Error('Audio timeout')) }, 20000)
        const cancel = () => finish()
        const finish = (error?: unknown) => {
          clearTimeout(timer)
          setTalking(false)
          audio.onplaying = null
          audio.onended = null
          audio.onerror = null
          if (cancelPlayback === cancel) cancelPlayback = null
          if (currentAudio === audio) currentAudio = null
          error ? reject(error) : resolve()
        }
        cancelPlayback = cancel
        audio.onplaying = () => setTalking(true)
        audio.onended = () => finish()
        audio.onerror = () => finish(new Error('Audio unavailable'))
        audio.play().catch(finish)
      })
      return
    }
  } catch { /* The recording could not play (offline, missing file): fall through to the stand-in. */ }
  // No recording of this line (yet): a short, cheerful chime answers instead of silence.
  if (token !== currentSpeechToken) return
  playTune('chime')
  await new Promise(resolve => setTimeout(resolve, 450))
}

/** Dừng mọi âm thanh / giọng đọc đang phát */
export function stopSpeech() {
  currentSpeechToken++
  const audio = currentAudio
  currentAudio = null
  const finish = cancelPlayback
  cancelPlayback = null
  finish?.()
  if (audio) {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch {
      /* Bỏ qua */
    }
  }
}

/** Đọc lần lượt chuỗi câu */
export function speakSeq(texts: string[]): () => void {
  stopSpeech()
  const t = currentSpeechToken
  ;(async () => {
    for (const x of texts) {
      if (t !== currentSpeechToken) return
      await speakText(x, t)
      await new Promise((r) => setTimeout(r, 220))
    }
  })()
  return () => {
    if (t === currentSpeechToken) stopSpeech()
  }
}

/* ========================================================================== *
 * 3. NHẠC NGẮN THAY CHO LỜI ĐỌC CHƯA THU ÂM
 * Each place in the island, friend's house and episodes that has no recording of
 * Cô Thủy yet gets its own short tune, synthesised here, so no file is downloaded.
 * ========================================================================== */

export type TuneName = 'island' | 'friend' | 'movies' | 'unlock' | 'journeyDone' | 'locked' | 'friendHappy' | 'switchFriend' | 'story' | 'tada' | 'chime'

const NOTE: Record<string, number> = {
  G4: 392.0, A4: 440.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.0, C7: 2093.0,
}
type Step = [note: string | string[], beats: number]

/** Plays a little melody: each step is a note (or a chord) and its length in beats. */
function melody(steps: Step[], { tempo = 220, wave = 'triangle' as OscillatorType, volume = .16, ring = 1.6 } = {}) {
  const ctx = getAudioCtx()
  const beat = 60 / tempo
  let t = ctx.currentTime + .02
  for (const [note, beats] of steps) {
    for (const name of Array.isArray(note) ? note : [note]) {
      const freq = NOTE[name]
      if (!freq) continue
      const osc = ctx.createOscillator(), gain = ctx.createGain()
      osc.type = wave
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(volume, t + .015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + beat * beats * ring + .05)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t); osc.stop(t + beat * beats * ring + .08)
    }
    t += beat * beats
  }
}

/** A soft swish of filtered noise (changing friends, a curtain opening). */
function swish(duration = .35, from = 600, to = 3200, volume = .12) {
  const ctx = getAudioCtx(), now = ctx.currentTime
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(from, now)
  filter.frequency.exponentialRampToValueAtTime(to, now + duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + duration * .3)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  source.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
  source.start(now); source.stop(now + duration)
}

/** Quick upward chirps, like a happy giggle. */
function chirps(count = 3) {
  const ctx = getAudioCtx()
  for (let i = 0; i < count; i++) {
    const t = ctx.currentTime + i * .11, osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(900 + i * 120, t)
    osc.frequency.exponentialRampToValueAtTime(1700 + i * 160, t + .08)
    gain.gain.setValueAtTime(.14, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + .1)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + .11)
  }
}

const TUNES: Record<TuneName, () => void> = {
  // Setting off over the sea: a rising call and an answer.
  island: () => melody([['G4', .5], ['C5', .5], ['E5', .5], ['G5', 1], ['E5', .5], ['G5', .5], [['C6', 'E5'], 2]], { tempo: 240 }),
  // A music box in the friend's room.
  friend: () => melody([['C6', .5], ['E6', .5], ['G6', .5], ['E6', .5], ['C6', .5], ['G5', .5], [['C6', 'E6'], 2]], { tempo: 260, wave: 'sine', volume: .12, ring: 2.4 }),
  // Curtain up: a swish, then a small fanfare.
  movies: () => { swish(.45, 400, 2400, .1); melody([['G4', .25], ['G4', .25], ['C5', .5], ['E5', .5], [['G5', 'C5', 'E5'], 2]], { tempo: 200, wave: 'square', volume: .06 }) },
  // A new station or episode opens: a sparkle going up.
  unlock: () => melody([['C6', .25], ['D6', .25], ['E6', .25], ['G6', .25], ['C7', 1]], { tempo: 300, wave: 'sine', volume: .12, ring: 2 }),
  // Whole journey done: a longer fanfare.
  journeyDone: () => melody([['C5', .5], ['E5', .5], ['G5', .5], ['C6', 1], ['A5', .5], ['C6', .5], [['E6', 'C6', 'G5'], 3]], { tempo: 220 }),
  // Not open yet: two soft low notes, never a buzzer.
  locked: () => melody([['E5', .5], ['C5', 1]], { tempo: 260, wave: 'sine', volume: .12 }),
  friendHappy: () => { chirps(3); melody([['G5', .5], ['C6', .5], ['E6', 1.5]], { tempo: 240, wave: 'sine', volume: .1, ring: 2 }) },
  switchFriend: () => { swish(.3, 800, 3600, .1); melody([['C6', .25], ['G6', .75]], { tempo: 280, wave: 'sine', volume: .1 }) },
  // The story begins: a harp run.
  story: () => melody([['C5', .2], ['D5', .2], ['E5', .2], ['G5', .2], ['A5', .2], ['C6', .2], ['D6', .2], ['E6', .2], ['G6', .2], [['C7', 'G6'], 1.5]], { tempo: 260, wave: 'sine', volume: .1, ring: 2.6 }),
  // Stand-in for any line Cô Thủy has not recorded: a bright two-note "ting-ting".
  chime: () => melody([['E6', .3], ['C7', 1]], { tempo: 300, wave: 'sine', volume: .1, ring: 1.8 }),
  // An episode ends: ta-da.
  tada: () => melody([['G5', .25], [['C6', 'E6', 'G5'], 2]], { tempo: 160, volume: .16, ring: 1.2 }),
}

export function playTune(name: TuneName) {
  try { TUNES[name]() } catch { /* muted or no audio: the screen still shows everything */ }
}

/** Whether Cô Thủy has recorded this exact line (so a tune can stand in when she has not). */
export async function hasRecording(text: string) {
  if (customSpeech.has(normalizeLine(text))) return true
  try { return !!(await loadManifest())[normalizeLine(text)] } catch { return false }
}

// Load the recording index before the first tap.
if (typeof window !== 'undefined') {
  loadManifest()
}
