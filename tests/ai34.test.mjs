// 34AI integration tests with a fake HTTP layer: no request reaches the real 34AI.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Ai34Error, buildGeneration, buildSpeech, createAi34, publicJob, sniffImage, waitForGeneration } from '../lib/ai34.js'
import { parseGame, validateIdea, gameMessages } from '../lib/family-game.js'
import { handle } from '../functions/api/ai34/[[path]].js'

const KEY = '34ai_live_test_key'
const MODELS = { data: [
  { id: 'img-1', media_type: 'image', capabilities: { ratios: ['1:1', '16:9'], qualities: ['low', 'high'], max_reference_images: 4 } },
  { id: 'seedance-2.0', media_type: 'video', capabilities: { ratios: ['16:9', '9:16'], durations: [10, 15], resolutions: ['720p', '1080p'], input_modes: ['auto', 'first_frame'] } },
  { id: 'gpt-5.6-luna', media_type: 'chat', capabilities: { max_output_tokens: 4000 } },
] }
const reply = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

/** A fake fetch: routes by "METHOD path", records every call (headers included). */
function fakeFetch(routes) {
  const calls = []
  const fn = async (url, init = {}) => {
    const u = new URL(url)
    const key = `${init.method ?? 'GET'} ${u.hostname === 'api.34ai.net' ? u.pathname : u.href}`
    calls.push({ key, headers: init.headers ?? {}, body: init.body })
    const route = routes[key]
    if (!route) return reply(404, { detail: 'no route', error: { code: 'resource_missing' } })
    return typeof route === 'function' ? route(calls.filter(c => c.key === key).length, init) : route.clone()
  }
  return { fn, calls }
}
const client = (routes, extra = {}) => { const f = fakeFetch(routes); return { ai: createAi34({ apiKey: KEY, fetch: f.fn, sleep: async () => {}, ...extra }), calls: f.calls } }

test('creating a job sends the key, the Idempotency-Key and only supported parameters', async () => {
  const { ai, calls } = client({ 'GET /v1/models': reply(200, MODELS), 'POST /v1/generations': reply(202, { id: 'gen_1', status: 'queued', public_state: { code: 'sending', label: 'Đang gửi' } }) })
  const job = await ai.createGeneration({ model: 'seedance-2.0', prompt: 'Bé vẫy tay', images: ['ref/1'], ratio: '16:9', duration: 15, resolution: '720p', inputMode: 'first_frame' }, 'key-123456')
  assert.equal(job.status, 'queued')
  const post = calls.find(c => c.key === 'POST /v1/generations')
  assert.equal(post.headers.Authorization, 'Bearer ' + KEY)
  assert.equal(post.headers['Idempotency-Key'], 'key-123456')
  assert.deepEqual(JSON.parse(post.body), { model: 'seedance-2.0', input: { prompt: 'Bé vẫy tay', images: ['ref/1'] }, parameters: { ratio: '16:9', duration: 15, resolution: '720p', input_mode: 'first_frame' } })
  assert.deepEqual(publicJob(job), { id: 'gen_1', status: 'queued', label: 'Đang gửi', state: 'sending', error: null, output: [] })
})

test('the model list is cached between calls', async () => {
  const { ai, calls } = client({ 'GET /v1/models': reply(200, MODELS) })
  await ai.listModels(); await ai.listModels(); await ai.model('img-1')
  assert.equal(calls.filter(c => c.key === 'GET /v1/models').length, 1)
})

test('a retried command reuses the same Idempotency-Key (no duplicate job, no double charge)', async () => {
  const { ai, calls } = client({
    'GET /v1/models': reply(200, MODELS),
    'POST /v1/generations': n => n === 1 ? reply(503, { detail: 'busy', error: { code: 'dependency_unavailable' } }) : reply(202, { id: 'gen_2', status: 'queued' }),
  })
  const job = await ai.createGeneration({ model: 'img-1', prompt: 'Bé hái táo', ratio: '1:1' }, 'same-key-1')
  assert.equal(job.id, 'gen_2')
  const posts = calls.filter(c => c.key === 'POST /v1/generations')
  assert.equal(posts.length, 2)
  assert.deepEqual(posts.map(p => p.headers['Idempotency-Key']), ['same-key-1', 'same-key-1'])
  assert.equal(posts[0].body, posts[1].body)
})

test('402 insufficient credits is not retried and gives a friendly message', async () => {
  const { ai, calls } = client({ 'GET /v1/models': reply(200, MODELS), 'POST /v1/generations': reply(402, { detail: 'Not enough credits for this task', error: { code: 'insufficient_credits' }, request_id: 'req_9' }) })
  await assert.rejects(ai.createGeneration({ model: 'img-1', prompt: 'Bé hái táo' }, 'key-402-aa'), e => e instanceof Ai34Error && e.status === 402 && e.code === 'insufficient_credits' && /credit/.test(e.message) && e.requestId === 'req_9')
  assert.equal(calls.filter(c => c.key === 'POST /v1/generations').length, 1)
})

test('429 waits for Retry-After, then succeeds with the same key; a long Retry-After is passed back', async () => {
  const waits = []
  const f = fakeFetch({
    'GET /v1/models': reply(200, MODELS),
    'POST /v1/generations': n => n === 1 ? reply(429, { error: { code: 'request_rate_limited' } }, { 'Retry-After': '2' }) : reply(202, { id: 'gen_3', status: 'queued' }),
  })
  const ai = createAi34({ apiKey: KEY, fetch: f.fn, sleep: async ms => { waits.push(ms) } })
  assert.equal((await ai.createGeneration({ model: 'img-1', prompt: 'x' }, 'key-429-aaa')).id, 'gen_3')
  assert.deepEqual(waits, [2000])
  const slow = client({ 'GET /v1/models': reply(200, MODELS), 'POST /v1/generations': reply(429, { error: { code: 'queue_limit_reached' } }, { 'Retry-After': '120' }) })
  await assert.rejects(slow.ai.createGeneration({ model: 'img-1', prompt: 'x' }, 'key-429-bbb'), e => e.status === 429 && e.code === 'queue_limit_reached' && e.retryAfter === '120')
})

test('a failed job ends polling with its public error code', async () => {
  const { ai } = client({ 'GET /v1/generations/gen_4': n => reply(200, n < 2 ? { id: 'gen_4', status: 'processing', public_state: { code: 'generating', label: 'Đang tạo' } } : { id: 'gen_4', status: 'failed', error: 'content_rejected', public_state: { code: 'failed', label: 'Thất bại' } }) })
  const job = await waitForGeneration(ai, 'gen_4', { sleep: async () => {} })
  assert.equal(job.status, 'failed')
  assert.deepEqual(publicJob(job).error, { code: 'content_rejected', message: 'Không tạo được nội dung này. Hãy đổi mô tả rồi tạo lại bằng lệnh mới.' })
})

test('polling follows 3 s × 1.5 up to 15 s and stops at the total timeout', async () => {
  let clock = 0
  const delays = []
  const { ai } = client({ 'GET /v1/generations/gen_5': reply(200, { id: 'gen_5', status: 'processing' }) })
  await assert.rejects(waitForGeneration(ai, 'gen_5', { timeoutMs: 60_000, now: () => clock, sleep: async ms => { delays.push(ms); clock += ms } }), e => e.code === 'timeout')
  assert.deepEqual(delays.slice(0, 6), [3000, 4500, 6750, 10125, 15000, 15000])
  assert.ok(delays.every(d => d >= 3000 && d <= 15000))
})

test('a completed job exposes no signed link to the browser', async () => {
  const done = { id: 'g', status: 'completed', public_state: { code: 'completed', label: 'Hoàn thành' }, output: [{ key: 'generated/u/g/result.mp4', url: 'https://cdn.example/signed?x=1', media_type: 'video', size_bytes: 10, width: 1080, height: 1920 }] }
  const view = publicJob(done)
  assert.equal(JSON.stringify(view).includes('signed'), false)
  assert.deepEqual(view.output, [{ index: 0, media_type: 'video', size_bytes: 10, width: 1080, height: 1920 }])
})

test('parameters are checked against the model capabilities', () => {
  const img = MODELS.data[0], vid = MODELS.data[1]
  assert.throws(() => buildGeneration(img, { prompt: 'x', ratio: '9:16' }), /khung hình/)
  assert.throws(() => buildGeneration(img, { prompt: 'x', images: ['a', 'b', 'c', 'd', 'e'] }), /tối đa 4/)
  assert.throws(() => buildGeneration(vid, { prompt: 'x', duration: 30 }), /độ dài/)
  assert.throws(() => buildGeneration(img, { prompt: 'x', resolution: '4K' }), /độ phân giải/)
  assert.throws(() => buildGeneration(img, { prompt: 'x', pro: true }), /Pro/)
  assert.deepEqual(buildGeneration(vid, { prompt: 'x', pro: true }).parameters, { duration: 10, generation_mode: 'pro_skill' })
  assert.deepEqual(buildGeneration(img, { prompt: ' Bé ', quality: 'high' }), { model: 'img-1', input: { prompt: 'Bé', images: [] }, parameters: { quality: 'high' } })
  assert.throws(() => buildGeneration(img, { prompt: '   ' }), /mô tả/)
})

test('speech bodies follow the audio spec', () => {
  assert.deepEqual(buildSpeech({ model: 'gemini-2.5-flash-preview-tts', text: ' Chào bé Na! ', voiceId: 'Kore', instruction: 'Giọng cô giáo' }), { model: 'gemini-2.5-flash-preview-tts', text: 'Chào bé Na!', language_code: 'vi-VN', voice_id: 'Kore', system_instruction: 'Giọng cô giáo' })
  assert.throws(() => buildSpeech({ model: 'm', text: 'a'.repeat(12001) }), /12\.000/)
  assert.throws(() => buildSpeech({ model: 'm', text: 'x', speakers: [{ name: 'A', voice_id: 'v' }, { name: 'A', voice_id: 'w' }] }), /2 người/)
})

test('reference pictures go presign → PUT with the returned headers → complete', async () => {
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])
  const { ai, calls } = client({
    'POST /reference-images/presign': reply(200, { upload_url: 'https://upload.example/put?sig=1', key: 'ref/abc', headers: { 'Content-Type': 'image/jpeg', 'x-amz-meta': '1' } }),
    'PUT https://upload.example/put?sig=1': new Response(null, { status: 200 }),
    'POST /reference-images/complete': reply(200, { key: 'ref/abc', status: 'ready' }),
  })
  assert.equal(await ai.uploadReference(jpeg, 'image/jpeg', 'Bé Na.jpg'), 'ref/abc')
  assert.deepEqual(JSON.parse(calls[0].body), { filename: 'B-Na.jpg', content_type: 'image/jpeg', size_bytes: 12 })
  assert.deepEqual(calls[1].headers, { 'Content-Type': 'image/jpeg', 'x-amz-meta': '1' })
  assert.equal(calls[1].headers.Authorization, undefined)
  assert.deepEqual(JSON.parse(calls[2].body), { key: 'ref/abc' })
  await assert.rejects(ai.uploadReference(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), 'image/jpeg'), e => e.code === 'media_type_unsupported')
  assert.equal(sniffImage(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), 'image/webp')
})

test('the server endpoint needs a same-origin request and a 34AI key', async () => {
  const env = { AI34_API_KEY: KEY }
  const status = await handle(new Request('https://app.test/api/ai34/status'), env)
  assert.deepEqual(await status.json(), { configured: true, enabled: true })
  assert.equal(JSON.stringify(await (await handle(new Request('https://app.test/api/ai34/status'), env)).json()).includes(KEY), false)
  const post = (origin = 'https://app.test') => new Request('https://app.test/api/ai34/unlock', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' })
  await assert.rejects(handle(post('https://evil.test'), env), e => e.status === 403)
  await assert.rejects(handle(post(), {}), e => e.status === 503)
  const ok = await handle(post(), env, () => ({}))
  assert.deepEqual(await ok.json(), { ok: true })
})

test('generate through the endpoint needs consent, cost and an idempotency key, and wraps the prompt safely', async () => {
  const env = { AI34_API_KEY: KEY + '2', STUDIO_ACCESS_CODE: 'a-long-studio-access-code-123' }
  const seen = []
  const fake = () => ({ model: async id => MODELS.data.find(m => m.id === id), createGeneration: async (req, key) => { seen.push({ req, key }); return { id: 'gen_9', status: 'queued', public_state: { code: 'sending', label: 'Đang gửi' } } } })
  const post = body => new Request('https://app.test/api/ai34/generate', { method: 'POST', headers: { Origin: 'https://app.test', 'X-Studio-Code': env.STUDIO_ACCESS_CODE, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  await assert.rejects(handle(post({ model: 'img-1', prompt: 'Bé hái táo đỏ', idempotencyKey: 'abcdefgh1' }), env, fake), e => e.code === 'consent_required')
  await assert.rejects(handle(post({ model: 'img-1', prompt: 'Bé hái táo đỏ', consent: true, costAccepted: true }), env, fake), e => e.code === 'idempotency_required')
  const res = await handle(post({ model: 'img-1', prompt: 'Bé hái táo đỏ', ratio: '1:1', consent: true, costAccepted: true, idempotencyKey: 'abcdefgh1' }), env, fake)
  assert.equal(res.status, 202)
  assert.equal((await res.json()).label, 'Đang gửi')
  assert.equal(seen[0].key, 'abcdefgh1')
  assert.match(seen[0].req.prompt, /^Bé hái táo đỏ\n\nYêu cầu chung: nội dung cho trẻ mầm non/)
})

test('a game made from an idea keeps only playable questions with the app\'s own pictures', () => {
  const idea = validateIdea({ idea: 'Bé Na thích con mèo và màu hồng', age: '3-4', childName: 'Na', photos: ['Mẹ'] })
  assert.match(gameMessages(idea)[0].content, /🍎 quả táo/)
  const answer = '```json\n' + JSON.stringify({ title: 'Bạn mèo của Na', intro: 'Cùng chơi nhé!', icon: '🐱', questions: [
    { text: 'Đâu là con mèo?', options: [{ label: 'con mèo', picture: '🐱', correct: true }, { label: 'con chó', picture: '🐶', correct: false }, { label: 'khủng long', picture: '🦖', correct: false }] },
    { text: 'Đâu là mẹ?', options: [{ label: 'Mẹ', picture: 'anh:1', correct: true }, { label: 'cô giáo', picture: '👩‍🏫', correct: false }] },
    { text: 'Câu hai đáp án đúng', options: [{ label: 'a', picture: '🍎', correct: true }, { label: 'b', picture: '🍌', correct: true }] },
    { text: 'Màu hồng là hoa nào?', options: [{ label: 'bông hoa', picture: '🌸', correct: true }, { label: 'lá', picture: '🍃', correct: false }, { label: 'cây', picture: '🌳', correct: false }, { label: 'thừa', picture: '🌻', correct: false }] },
  ] }) + '\n```'
  const game = parseGame(answer, idea)
  assert.equal(game.title, 'Bạn mèo của Na')
  assert.equal(game.questions.length, 3)
  assert.deepEqual(game.questions[0].options.map(o => o.emoji), ['🐱', '🐶'])
  assert.deepEqual(game.questions[1].options[0], { family: 0, label: 'Mẹ', correct: true })
  assert.equal(game.questions[2].options.length, 3)
  assert.throws(() => parseGame('không phải JSON', idea), /đúng dạng/)
  assert.throws(() => validateIdea({ idea: 'ngắn', age: '3-4' }), /8 đến 1\.500/)
})
