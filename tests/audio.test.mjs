import test from 'node:test'
import assert from 'node:assert/strict'

const played = []
let hold = false
let systemCalls = 0
let pauseCalls = 0
globalThis.window = {
  speechSynthesis: { getVoices: () => [], cancel() {}, speak(u) { systemCalls++; queueMicrotask(() => u.onend?.()) } },
}
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
globalThis.fetch = async () => ({ ok: true, json: async () => ({ alpha: 'a', beta: 'b', gamma: 'c' }) })
globalThis.Audio = class {
  constructor(url) { this.url = url }
  play() { played.push(this.url); if (!hold) queueMicrotask(() => this.onended?.()); return Promise.resolve() }
  pause() { pauseCalls++ }
}
const audio = await import('../src/audio.ts')
const settle = () => new Promise(resolve => setImmediate(resolve))

test('speech sequence reads every option, in order', async () => {
  played.length = 0
  audio.speakSeq(['alpha', 'beta', 'gamma'])
  await new Promise(resolve => setTimeout(resolve, 700))
  assert.deepEqual(played, ['/audio/co-thuy/a.mp3', '/audio/co-thuy/b.mp3', '/audio/co-thuy/c.mp3'])
})

test('stopping playback resolves an awaited answer instead of hanging the game', async () => {
  hold = true
  pauseCalls = 0
  const speech = audio.speak('alpha')
  await settle()
  audio.stopSpeech()
  assert.equal(pauseCalls, 1, 'the current recording must stop audibly')
  await Promise.race([speech, new Promise((_, reject) => setTimeout(() => reject(new Error('Speech remained pending')), 100))])
  hold = false
})

test('cancelling a sequence stops subsequent options', async () => {
  hold = true; played.length = 0
  const cancel = audio.speakSeq(['alpha', 'beta'])
  await settle(); cancel()
  await new Promise(resolve => setTimeout(resolve, 250))
  assert.deepEqual(played, ['/audio/co-thuy/a.mp3'])
  hold = false
})

test('muted speech does not play recordings or start system speech', async () => {
  audio.setSoundEnabled(false); played.length = 0; systemCalls = 0
  await audio.speak('alpha'); await audio.speak('missing sentence')
  assert.equal(played.length, 0); assert.equal(systemCalls, 0)
  audio.setSoundEnabled(true)
})

test('an unrecorded line never falls back to a robotic system voice', async () => {
  played.length = 0; systemCalls = 0
  await audio.speak('missing sentence')
  assert.equal(played.length, 0)
  assert.equal(systemCalls, 0)
})

test('prefetch downloads each recorded line once and skips lines without a recording', async () => {
  const fetched = []
  const original = globalThis.fetch
  globalThis.fetch = async url => {
    fetched.push(String(url))
    return { ok: true, json: async () => ({ alpha: 'a', beta: 'b', gamma: 'c' }), arrayBuffer: async () => new ArrayBuffer(1) }
  }
  try {
    assert.equal(await audio.prefetchSpeech(['Alpha', 'alpha ', 'missing sentence', 'beta']), 2)
    assert.deepEqual(fetched.filter(u => u.endsWith('.mp3')), ['/audio/co-thuy/a.mp3', '/audio/co-thuy/b.mp3'])
    assert.equal(await audio.prefetchSpeech(['alpha', 'beta']), 0, 'lines already fetched are not downloaded again')
    assert.equal(await audio.prefetchSpeech(['gamma'], 0), 0, 'the download limit is respected')
    audio.setSoundEnabled(false)
    assert.equal(await audio.prefetchSpeech(['gamma']), 0, 'nothing is downloaded while sound is off')
  } finally {
    audio.setSoundEnabled(true)
    globalThis.fetch = original
  }
})
