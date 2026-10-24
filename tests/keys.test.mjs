// Khóa API: khóa mặc định của app, khóa riêng từng thiết bị, không lộ khóa, Gemini/34AI dùng đúng khóa.
import test from 'node:test'
import assert from 'node:assert/strict'
import { access, publicState } from '../lib/keystore.js'
import { handle as keys } from '../functions/api/keys/[[path]].js'
import { handle as gemini, geminiModels } from '../functions/api/gemini/[[path]].js'
import { handle as ai34 } from '../functions/api/ai34/[[path]].js'
import { asWav, blocksOf, geminiJob } from '../lib/gemini.js'

const AI34 = '34ai_live_testkey_not_real_0123456789'
const GKEY = 'AIzaTestKeyNotReal_0123456789abcdef'
function memoryKV() {
  const map = new Map()
  return { map, async get(k, type) { const v = map.get(k); return v === undefined ? null : type === 'json' ? JSON.parse(v) : v }, async put(k, v) { map.set(k, v) }, async delete(k) { map.delete(k) } }
}
const DEV = 'device-aaaaaaaaaaaaaaaa'
const post = (path, body, origin = 'https://app.test', device = DEV) => new Request(`https://app.test/api/${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Device-Id': device }, body: JSON.stringify(body) })
const okFetch = async () => new Response('{}', { status: 200 })

test('keys are checked, stored on the server and only their last characters come back', async () => {
  const env = { STUDIO_KV: memoryKV() }
  assert.deepEqual(await publicState(env), { store: true, providers: { ai34: false, gemini: false } })
  const asked = []
  const fetchOk = async (url, init) => { asked.push([String(url), init.headers]); return new Response('{}', { status: 200 }) }
  await assert.rejects(keys(post('keys/save', { ai34: 'not-a-key' }), env, { fetch: fetchOk }), e => e.status === 400)
  const invalid = async () => Response.json({ error: { code: 400, status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' } }, { status: 400 })
  await assert.rejects(keys(post('keys/save', { gemini: GKEY }), env, { fetch: invalid }), e => e.code === 'key_rejected' && e.message.includes('API key not valid'))
  // Any other answer (region, quota, network) still saves the key and says what Google answered.
  const region = await (await keys(post('keys/save', { gemini: GKEY }), env, { fetch: async () => Response.json({ error: { status: 'FAILED_PRECONDITION', message: 'User location is not supported for the API use.' } }, { status: 400 }) })).json()
  assert.equal(region.providers.gemini, true); assert.match(region.notes[0], /location is not supported/)
  await keys(post('keys/save', { gemini: '' }), env, { fetch: fetchOk })
  await assert.rejects(keys(post('keys/save', { gemini: GKEY }, 'https://evil.test'), env, { fetch: fetchOk }), e => e.status === 403)
  const res = await keys(post('keys/save', { ai34: AI34, gemini: GKEY }), env, { fetch: fetchOk })
  const text = await res.text()
  assert.ok(!text.includes(AI34) && !text.includes(GKEY), 'no key in the answer')
  const view = JSON.parse(text)
  assert.deepEqual(view.providers, { ai34: true, gemini: true })
  assert.equal(view.hints.ai34, '34ai_live_…6789')
  assert.ok(asked.some(([u, h]) => u.includes('api.34ai.net') && h.Authorization === `Bearer ${AI34}`))
  assert.ok(asked.some(([u, h]) => u.includes('generativelanguage') && h['x-goog-api-key'] === GKEY))
  assert.equal((await access(env, DEV)).keys.gemini, GKEY)
  const status = await (await keys(new Request('https://app.test/api/keys/status'), env)).text()
  assert.ok(!status.includes(AI34) && !status.includes(GKEY) && !status.includes('…'))
  const again = await (await keys(post('keys/view', {}), env)).text()
  assert.ok(!again.includes(AI34) && !again.includes(GKEY))
  // Remove one key; models are kept.
  await keys(post('keys/save', { models: { image: 'gemini-3-pro-image' } }), env, { fetch: fetchOk })
  await keys(post('keys/save', { ai34: '' }), env, { fetch: fetchOk })
  const after = await access(env, DEV)
  assert.equal(after.keys.ai34, ''); assert.equal(after.models.image, 'gemini-3-pro-image')
  assert.equal((await publicState(env, DEV)).providers.ai34, false)
})

test('the old server secrets still work, and a key saved in the app takes over', async () => {
  const env = { STUDIO_KV: memoryKV(), AI34_API_KEY: AI34 }
  const view = await (await keys(post('keys/view', {}), env)).json()
  assert.equal(view.source.ai34, 'default')
  await keys(post('keys/save', { gemini: GKEY }), env, { fetch: okFetch })
  const after = await access(env, DEV)
  assert.equal(after.keys.ai34, AI34); assert.equal(after.keys.gemini, GKEY)
  assert.equal((await ai34(post('ai34/unlock', {}), env, () => ({}))).status, 200)
})

test('without a store the app explains what to run instead of failing silently', async () => {
  await assert.rejects(keys(post('keys/save', { gemini: GKEY }), {}, { fetch: okFetch }), e => e.code === 'no_store')
})

async function geminiEnv() {
  const env = { STUDIO_KV: memoryKV(), GEMINI_API_KEY: GKEY }
  return env
}
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

test('Gemini pictures, voice, games and videos go through the server with the stored key', async () => {
  const env = await geminiEnv(), calls = []
  const fake = () => ({
    async image(a) { calls.push(['image', a]); return { mimeType: 'image/png', bytes: Uint8Array.from(atob(PNG), c => c.charCodeAt(0)) } },
    async speech(a) { calls.push(['speech', a]); return asWav(new Uint8Array(480)) },
    async startVideo(a) { calls.push(['video', a]); return { id: 'v1', status: 'in_progress' } },
    async getInteraction(id) { return { id, status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'video', mime_type: 'video/mp4', data: 'AAAA' }] }] } },
    async videoBytes() { return new Uint8Array([0, 0, 0, 0]) },
    async text(a) { calls.push(['text', a]); return '```json\n{"title":"Bữa sáng","intro":"Cùng chơi","icon":"🍎","questions":[{"text":"Quả táo đâu?","options":[{"label":"Táo","picture":"🍎","correct":true},{"label":"Chuối","picture":"🍌","correct":false}]},{"text":"Quả chuối đâu?","options":[{"label":"Chuối","picture":"🍌","correct":true},{"label":"Táo","picture":"🍎","correct":false}]},{"text":"Con mèo đâu?","options":[{"label":"Mèo","picture":"🐱","correct":true},{"label":"Chó","picture":"🐶","correct":false}]}]}\n```' },
  })
  await assert.rejects(gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn', costAccepted: true }, 'https://evil.test'), env, fake), e => e.status === 403)
  await assert.rejects(gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn' }), env, fake), e => e.code === 'consent_required')
  await assert.rejects(gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn', costAccepted: true, images: [{ data: PNG }] }), env, fake), e => e.code === 'consent_required')
  await assert.rejects(gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn', costAccepted: true, consent: true, images: [{ data: btoa('<svg></svg>') }] }), env, fake), e => e.status === 400)
  const img = await gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn', ratio: '16:9', resolution: '2K', costAccepted: true, consent: true, images: [{ data: PNG }] }), env, fake)
  assert.equal(img.headers.get('Content-Type'), 'image/png')
  const sent = calls.find(c => c[0] === 'image')[1]
  assert.equal(sent.ratio, '16:9'); assert.equal(sent.size, '2K'); assert.equal(sent.images[0].mimeType, 'image/png')
  assert.match(sent.prompt, /trẻ mầm non/)
  const wav = await gemini(post('gemini/audio', { text: 'Chào bé Na!', voiceId: 'Aoede', instruction: 'ấm áp', costAccepted: true }), env, fake)
  assert.equal(wav.headers.get('Content-Type'), 'audio/wav')
  assert.equal(String.fromCharCode(...new Uint8Array(await wav.arrayBuffer()).slice(0, 4)), 'RIFF')
  const job = await (await gemini(post('gemini/video', { prompt: 'Bé vẫy tay chào trên đồi cỏ', ratio: '9:16', costAccepted: true }), env, fake)).json()
  assert.equal(job.id, 'v1'); assert.equal(job.status, 'queued')
  assert.equal((await (await gemini(post('gemini/job', { id: 'v1' }), env, fake)).json()).status, 'completed')
  assert.equal((await gemini(post('gemini/file', { id: 'v1' }), env, fake)).headers.get('Content-Type'), 'video/mp4')
  const game = await (await gemini(post('gemini/game', { idea: 'Bé thích hoa quả buổi sáng', age: '24-36', costAccepted: true }), env, fake)).json()
  assert.equal(game.game.questions.length, 3)
  assert.ok(calls.find(c => c[0] === 'text')[1].system.includes('giáo viên mầm non'))
  await assert.rejects(gemini(post('gemini/image', { prompt: 'Bé hái táo trong vườn', costAccepted: true }), {}, fake), e => e.code === 'not_configured')
})

test('Gemini helpers read every response shape and never call a finished-but-empty video a success', () => {
  assert.equal(blocksOf({ output_image: { data: 'x', mime_type: 'image/png' } })[0].type, 'image')
  assert.equal(geminiJob({ id: 'a', status: 'in_progress' }).status, 'processing')
  assert.equal(geminiJob({ id: 'a', status: 'completed', steps: [] }).status, 'failed')
  assert.equal(geminiJob({ id: 'a', status: 'failed' }).error.code, 'generation_failed')
  const wav = asWav(new Uint8Array(10))
  assert.equal(wav.length, 54)
  assert.equal(asWav(wav), wav)
  const m = geminiModels({ image: 'gemini-3-pro-image' })
  assert.equal(m.image[0].id, 'gemini-3-pro-image')
  assert.equal(m.audio.voices.length, 30)
  assert.equal(geminiModels({ image: 'bad model id!' }).image[0].id, 'gemini-nano-banana-2.1')
})

test('the real Gemini client builds Interactions requests with the key in a header', async () => {
  const { createGemini } = await import('../lib/gemini.js')
  const seen = []
  const fetch = async (url, init) => {
    seen.push({ url: String(url), headers: init.headers, body: init.body ? JSON.parse(init.body) : null })
    const body = seen.at(-1).body
    if (body?.response_format?.type === 'image') return Response.json({ steps: [{ type: 'model_output', content: [{ type: 'image', mime_type: 'image/png', data: PNG }] }] })
    if (body?.response_format?.type === 'audio') return body.input[0].annotations ? new Response(JSON.stringify({ error: { status: 'INVALID_ARGUMENT', message: 'unknown field' } }), { status: 400 }) : Response.json({ steps: [{ type: 'model_output', content: [{ type: 'audio', data: btoa('\0\0\0\0') }] }] })
    if (body?.background) return Response.json({ id: 'int-1', status: 'in_progress' })
    if (init.method === 'GET') return new Response(JSON.stringify({ error: { status: 'PERMISSION_DENIED', message: `key=${GKEY}` } }), { status: 403 })
    return Response.json({ steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"ok":1}' }] }] })
  }
  const g = createGemini({ apiKey: GKEY, fetch })
  const img = await g.image({ model: 'gemini-nano-banana-2.1', prompt: 'x', images: [{ mimeType: 'image/png', data: PNG }], ratio: '1:1', size: '1K' })
  assert.equal(img.mimeType, 'image/png')
  assert.equal(seen[0].url, 'https://generativelanguage.googleapis.com/v1beta/interactions')
  assert.equal(seen[0].headers['x-goog-api-key'], GKEY); assert.equal(seen[0].body.store, false)
  assert.deepEqual(seen[0].body.input[1], { type: 'image', mime_type: 'image/png', data: PNG })
  const wav = await g.speech({ model: 'gemini-3.8-flash-tts', text: 'Chào bé', voice: 'Kore', style: 'vui' })
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF', 'retried without the style note and wrapped PCM')
  assert.deepEqual(seen.at(-1).body.generation_config.speech_config, [{ voice: 'Kore' }])
  assert.equal((await g.startVideo({ model: 'gemini-omni-1.1-flash', prompt: 'x', images: [] })).id, 'int-1')
  assert.equal(seen.at(-1).body.generation_config.video_config.task, 'text_to_video')
  assert.equal(await g.text({ model: 'gemini-3.8-flash', system: 's', user: 'u' }), '{"ok":1}')
  await assert.rejects(g.getInteraction('int-1'), e => e.code === 'gemini_auth' && !e.message.includes(GKEY))
  await assert.rejects(g.getInteraction('../models'), e => e.status === 400)
})

test('the Gemini client works with Cloudflare fetch rules and the key test reports Google\'s answer', async () => {
  // Cloudflare Workers refuse redirect: 'error' (this broke every Gemini call before).
  const workersFetch = async (url, init = {}) => {
    if (init.redirect && !['follow', 'manual'].includes(init.redirect)) throw new TypeError('Invalid redirect value')
    if (String(url).includes('/interactions')) return Response.json({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Xin chào' }] }] })
    return new Response('{}', { status: 200 })
  }
  const env = { STUDIO_KV: memoryKV(), GEMINI_API_KEY: GKEY }
  const ok = await (await keys(post('keys/test', { provider: 'gemini' }), env, { fetch: workersFetch })).json()
  assert.equal(ok.ok, true); assert.match(ok.message, /Xin chào/)
  const bad = await (await keys(post('keys/test', { provider: 'gemini' }), env, { fetch: async () => Response.json({ error: { status: 'PERMISSION_DENIED', message: `Generative Language API has not been used in project 123 key=${GKEY}` } }, { status: 403 }) })).json()
  assert.equal(bad.ok, false); assert.match(bad.message, /Google báo: PERMISSION_DENIED/); assert.ok(!bad.message.includes(GKEY))
  const { createGemini } = await import('../lib/gemini.js')
  assert.equal(await createGemini({ apiKey: GKEY, fetch: workersFetch }).text({ model: 'gemini-3.8-flash', system: 's', user: 'u' }), 'Xin chào')
})

test('an empty prepaid balance (HTTP 402) gets a clear billing message', async () => {
  const { createGemini } = await import('../lib/gemini.js')
  const g = createGemini({ apiKey: GKEY, fetch: async () => new Response('', { status: 402 }) })
  await assert.rejects(g.text({ model: 'gemini-3.8-flash', system: 's', user: 'u' }), e => e.code === 'billing' && /nạp thêm/.test(e.message))
})

test('Gemini calls go through the US relay when it is bound, and the relay only forwards to Google', async () => {
  const { googleFetch } = await import('../lib/gemini.js')
  const seen = []
  const env = { GEMINI_RELAY: { fetch: async req => { seen.push([req.url, req.headers.get('x-goog-api-key'), req.method]); return Response.json({ steps: [{ type: 'model_output', content: [{ type: 'text', text: 'qua tram' }] }] }) } } }
  const res = await googleFetch(env)('https://generativelanguage.googleapis.com/v1beta/interactions', { method: 'POST', headers: { 'x-goog-api-key': GKEY, 'Content-Type': 'application/json' }, body: '{}' })
  assert.equal((await res.json()).steps[0].content[0].text, 'qua tram')
  assert.deepEqual(seen[0], ['https://generativelanguage.googleapis.com/v1beta/interactions', GKEY, 'POST'])
  assert.equal(googleFetch({}, 'direct'), 'direct')
  const test = await (await keys(post('keys/test', { provider: 'gemini' }), { ...env, GEMINI_API_KEY: GKEY })).json()
  assert.equal(test.ok, true); assert.match(test.message, /qua trạm Mỹ/)

  const relay = (await import('../relay/gemini-relay.js')).default
  const original = globalThis.fetch, out = []
  globalThis.fetch = async (url, init) => { out.push([String(url), Object.fromEntries(init.headers)]); return new Response('{}', { status: 200 }) }
  try {
    assert.equal((await relay.fetch(new Request('https://relay/evil', { headers: { 'x-goog-api-key': GKEY } }))).status, 404)
    await relay.fetch(new Request('https://relay.internal/v1beta/models?pageSize=1', { headers: { 'x-goog-api-key': GKEY, cookie: 'x', authorization: 'y' } }))
    assert.equal(out.length, 1)
    assert.equal(out[0][0], 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1')
    assert.deepEqual(out[0][1], { 'x-goog-api-key': GKEY })
  } finally { globalThis.fetch = original }
})

test('the app key is the default; a device can use its own key without changing anyone else', async () => {
  const env = { STUDIO_KV: memoryKV(), AI34_API_KEY: AI34 }
  const mine = '34ai_live_mykey_not_real_99998888'
  const a = await (await keys(post('keys/view', {}), env)).json()
  assert.equal(a.source.ai34, 'default'); assert.equal(a.defaults.ai34, true)
  await keys(post('keys/save', { ai34: mine }), env, { fetch: okFetch })
  assert.equal((await access(env, DEV)).keys.ai34, mine)
  const other = 'device-bbbbbbbbbbbbbbbb'
  assert.equal((await access(env, other)).keys.ai34, AI34, 'other devices keep the default key')
  assert.equal((await access(env)).keys.ai34, AI34)
  const b = await (await keys(post('keys/view', {}), env)).json()
  assert.equal(b.source.ai34, 'device'); assert.equal(b.hints.ai34, '34ai_live_…8888')
  assert.ok(![...env.STUDIO_KV.map.keys()].some(k => k.includes(DEV)), 'device id is hashed in the store')
  // Going back to the default removes the device record.
  await keys(post('keys/save', { ai34: '' }), env, { fetch: okFetch })
  assert.equal((await access(env, DEV)).keys.ai34, AI34)
  assert.equal(env.STUDIO_KV.map.size, 0)
  // Saving needs a device id.
  await assert.rejects(keys(post('keys/save', { ai34: mine }, 'https://app.test', 'short'), env, { fetch: okFetch }), e => e.code === 'no_device')
})

test('a default key spoiled by a terminal paste (Ctrl+V = \\x16) is reported, not used', async () => {
  const env = { STUDIO_KV: memoryKV(), AI34_API_KEY: '\u0016' }
  const view = await (await keys(post('keys/view', {}), env)).json()
  assert.equal(view.broken.ai34, true); assert.equal(view.providers.ai34, false); assert.equal(view.hints.ai34, null)
  const spaced = { STUDIO_KV: memoryKV(), AI34_API_KEY: ` ${AI34}\r\n` }
  assert.equal((await access(spaced, DEV)).keys.ai34, AI34)
  assert.equal((await access(spaced, DEV)).broken.ai34, false)
})

test('the model list comes live from 34AI: a model 34AI turns on shows up (cache 5 min, refresh at once)', async () => {
  const { createAi34 } = await import('../lib/ai34.js')
  let live = [{ id: 'img-a', name: 'Ảnh A', media_type: 'image', capabilities: {} }]
  let calls = 0
  const fake = async url => { calls++; return Response.json({ data: live }) }
  const env = { STUDIO_KV: memoryKV(), AI34_API_KEY: '34ai_live_modelsRefreshTest_0001' }
  const make = opts => createAi34({ ...opts, fetch: fake })
  const models = async body => (await ai34(post('ai34/models', body), env, make)).json()
  assert.deepEqual((await models({})).image.map(m => m.id), ['img-a'])
  live = [...live, { id: 'img-b', name: 'Ảnh B (mới)', media_type: 'image', capabilities: {} }, { id: 'vid-x', name: 'Video X', media_type: 'video', capabilities: {} }]
  assert.deepEqual((await models({})).image.map(m => m.id), ['img-a'], 'cached for a few minutes')
  const fresh = await models({ refresh: true })
  assert.deepEqual(fresh.image.map(m => m.id), ['img-a', 'img-b']); assert.equal(fresh.video[0].id, 'vid-x')
  assert.equal(typeof fresh.fetchedAt, 'number'); assert.equal(calls, 2)
  // The connection test lists what 34AI has switched on.
  const test = await (await keys(post('keys/test', { provider: 'ai34' }), env, { fetch: fake })).json()
  assert.equal(test.ok, true); assert.match(test.message, /3 model: ảnh 2 \(Ảnh A, Ảnh B \(mới\)\); video 1/)
})
