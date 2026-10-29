// "Game with my child": the plan the AI writes (scenes featuring the family + questions using them).
import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePlan, planMessages, validatePlanRequest } from '../lib/family-game.js'
import { handle } from '../functions/api/ai34/[[path]].js'

const people = [{ id: 'be', label: 'Bé Na' }, { id: 'p1', label: 'Mẹ' }]
const request = (extra = {}) => validatePlanRequest({ idea: 'Bé Na tự đánh răng, rửa tay và cất đồ chơi', age: '3-4', childName: 'Na', people, theme: 'Bé tự chăm sóc', ...extra })

const answer = {
  title: 'Na tự làm lấy', intro: 'Cùng Na chơi nhé!', icon: '🪥',
  cover: { scene: 'Bé Na và mẹ cười vui trong phòng tắm', people: ['be', 'p1', 'nguoi-la'] },
  scenes: [
    { id: 'c1', scene: 'Bé Na đánh răng trước gương', people: ['be'], fallback: '🪥' },
    { id: 'c2', scene: 'Bé Na rửa tay bằng xà phòng', people: ['be'], fallback: '🧼' },
    { id: 'c3', scene: 'Mẹ đọc truyện cho Na', people: ['p1', 'be'], fallback: '📖' },
    { id: 'c9', scene: 'Cảnh không ai dùng', people: ['be'], fallback: '⭐' },
    { id: 'xx', scene: 'id sai', people: ['be'] },
  ],
  questions: [
    { text: 'Na đang làm gì sạch răng?', options: [{ label: 'đánh răng', picture: 'c1', correct: true }, { label: 'quả táo', picture: '🍎', correct: false }, { label: 'thừa', picture: '🍌', correct: false }, { label: 'thừa 2', picture: '🐶', correct: false }] },
    { text: 'Trước khi ăn, Na làm gì?', show: 'c2', options: [{ label: 'rửa tay', picture: 'c2', correct: true }, { label: 'đánh răng', picture: 'c1', correct: false }] },
    { text: 'Ai đọc truyện cho Na?', show: 'c1', options: [{ label: 'Mẹ', picture: 'c3', correct: true }, { label: 'con mèo', picture: '🐱', correct: false }] },
    { text: 'Hai đáp án đúng', options: [{ label: 'a', picture: 'c1', correct: true }, { label: 'b', picture: 'c2', correct: true }] },
    { text: 'Hình lạ', options: [{ label: 'a', picture: 'không-có', correct: true }, { label: 'b', picture: '🍎', correct: false }] },
  ],
}

test('the plan request needs the child and at most three relatives with valid ids', () => {
  const req = request()
  assert.deepEqual(req.people, people)
  assert.equal(req.theme, 'Bé tự chăm sóc')
  assert.throws(() => request({ people: [{ id: 'p1', label: 'Mẹ' }] }), /chưa đúng/)
  assert.throws(() => request({ people: [] }), /Cần ảnh/)
  assert.throws(() => request({ people: [{ id: 'be', label: 'Na' }, { id: 'p9', label: 'X' }] }), /chưa đúng/)
  assert.throws(() => request({ people: [{ id: 'be', label: 'Na' }, { id: 'p1', label: '' }] }), /chưa đúng/)
  const messages = planMessages(req)
  assert.match(messages[0].content, /be = Bé Na \(em bé, nhân vật chính\); p1 = Mẹ/)
  assert.match(messages[0].content, /tối đa 5 CẢNH/)
  assert.match(messages[1].content, /Chủ đề: Bé tự chăm sóc/)
})

test('a plan keeps only drawable scenes, one right answer and the scenes it uses', () => {
  const plan = parsePlan('```json\n' + JSON.stringify(answer) + '\n```', request())
  assert.equal(plan.title, 'Na tự làm lấy')
  assert.deepEqual(plan.scenes.map(s => s.id), ['c1', 'c2', 'c3'])
  assert.deepEqual(plan.cover, { scene: 'Bé Na và mẹ cười vui trong phòng tắm', people: ['be', 'p1'] })
  assert.equal(plan.questions.length, 3)
  // 3–4 years: three choices, the right one first in storage (the player shuffles).
  assert.deepEqual(plan.questions[0].options, [{ scene: 'c1', label: 'đánh răng', correct: true }, { emoji: '🍎', label: 'quả táo', correct: false }, { emoji: '🍌', label: 'thừa', correct: false }])
  // A question picture is dropped when it is also one of the answers.
  assert.equal(plan.questions[1].show, undefined)
  assert.equal(plan.questions[2].show, 'c1')
  assert.deepEqual(plan.scenes[2].people, ['p1', 'be'])
})

test('a plan without scenes of the child or enough questions is refused', () => {
  assert.throws(() => parsePlan('xin chào', request()), /đúng dạng/)
  const noScenes = { ...answer, scenes: [], questions: answer.questions.map(q => ({ ...q, options: [{ label: 'táo', picture: '🍎', correct: true }, { label: 'chuối', picture: '🍌', correct: false }] })) }
  assert.throws(() => parsePlan(JSON.stringify(noScenes), request()), /chưa đưa bé/)
  assert.throws(() => parsePlan(JSON.stringify({ ...answer, questions: answer.questions.slice(0, 1) }), request()), /đủ câu hỏi/)
})

test('the game-plan endpoint needs cost consent and returns the parsed plan', async () => {
  const env = { AI34_API_KEY: '34ai_live_planTestKey_123' }
  const seen = []
  const fake = () => ({
    listModels: async () => [{ id: 'gpt-x', media_type: 'chat', capabilities: {} }, { id: 'gemini-3-flash', media_type: 'chat', capabilities: { max_output_tokens: 8000 } }],
    chat: async req => { seen.push(req); return { choices: [{ message: { content: JSON.stringify(answer) } }], credits_charged: 2 } },
  })
  const post = body => new Request('https://app.test/api/ai34/game-plan', { method: 'POST', headers: { Origin: 'https://app.test', 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const body = { idea: 'Bé Na tự đánh răng, rửa tay và cất đồ chơi', age: '3-4', childName: 'Na', people }
  await assert.rejects(handle(post(body), env, fake), e => e.code === 'consent_required')
  const res = await handle(post({ ...body, costAccepted: true }), env, fake)
  const out = await res.json()
  assert.equal(out.model, 'gemini-3-flash')
  assert.equal(out.credits, 2)
  assert.equal(out.plan.scenes.length, 3)
  assert.equal(seen[0].max_tokens, 4000)
})

test('only a cover may carry text, and only the game title', async () => {
  const { safePrompt, cleanTitle } = await import('../lib/safe-prompt.js')
  assert.match(safePrompt('Cảnh', 'image'), /không có chữ, logo hay hình mờ/)
  const cover = safePrompt('Bìa', 'image', { title: 'Na "tự" làm lấy' })
  assert.match(cover, /không có chữ nào khác ngoài dòng tiêu đề "Na tự làm lấy"/)
  assert.doesNotMatch(safePrompt('Clip', 'video', { title: 'Na' }), /tiêu đề/)
  assert.equal(cleanTitle('x'.repeat(60)).length, 40)
  const env = { AI34_API_KEY: '34ai_live_coverTitleKey_1' }
  const seen = []
  const fake = () => ({ model: async id => ({ id, media_type: 'image' }), createGeneration: async req => { seen.push(req); return { id: 'gen_1', status: 'queued' } } })
  const post = body => new Request('https://app.test/api/ai34/generate', { method: 'POST', headers: { Origin: 'https://app.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'img', consent: true, costAccepted: true, idempotencyKey: 'abcdefgh9', ...body }) })
  await handle(post({ prompt: 'Bìa trò chơi', title: 'Na tự làm lấy' }), env, fake)
  await handle(post({ prompt: 'Cảnh thường' }), env, fake)
  assert.match(seen[0].prompt, /ngoài dòng tiêu đề "Na tự làm lấy"/)
  assert.match(seen[1].prompt, /không có chữ, logo hay hình mờ/)
})

test('every picture gets each person\'s 3D character first, then their real photos, within the model limit', async () => {
  const { allot, scenePrompt, characterPrompt } = await import('../src/studio/GameWizard.tsx')
  const photos = { be: ['b1', 'b2', 'b3'], p1: ['m1', 'm2'], p2: ['o1', 'o2'], p3: ['x1', 'x2'] }
  const designs = { be: 'B', p1: 'M', p2: 'O', p3: undefined }
  const labels = { be: 'Bé Na', p1: 'Mẹ', p2: 'Bà', p3: 'Bố' }
  const one = allot(['be'], photos, designs, labels, 7)
  assert.deepEqual(one.images, ['b1', 'b2', 'b3', 'B'])
  assert.deepEqual(one.cast, [{ label: 'Bé Na', photos: [1, 2, 3], design: 4 }])
  const all = allot(['p1', 'p2', 'be', 'p3'], photos, designs, labels, 7)
  assert.equal(all.images.length, 7)
  // The child comes first; every person keeps a design or at least one photo.
  assert.equal(all.cast[0].label, 'Bé Na')
  assert.ok(all.cast.every(c => c.design || c.photos.length))
  assert.ok(all.images.includes('B') && all.images.includes('M') && all.images.includes('O') && all.images.includes('x1'))
  const prompt = scenePrompt('Bé Na đánh răng', one.cast)
  assert.match(prompt, /^CHARACTERS/)
  assert.match(prompt, /"Bé Na": real photos = reference images 1, 2, 3; approved 3D character design = reference image 4/)
  assert.match(characterPrompt('Bé Na', [1, 2], true), /LIKENESS IS THE TOP PRIORITY/)
})

test('when 34AI lists no chat model, game-plan tries the known chat models in turn', async () => {
  const { Ai34Error } = await import('../lib/ai34.js')
  const env = { AI34_API_KEY: '34ai_live_noChatListed_123' }
  const tried = []
  const fake = () => ({
    listModels: async () => [{ id: 'nano-banana-2.1', media_type: 'image', capabilities: {} }],
    chat: async req => { tried.push(req.model); if (req.model === 'gemini-3.8-flash-high') throw new Ai34Error('tắt', { status: 422, code: 'model_unavailable' }); return { choices: [{ message: { content: JSON.stringify(answer) } }] } },
  })
  const res = await handle(new Request('https://app.test/api/ai34/game-plan', { method: 'POST', headers: { Origin: 'https://app.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: 'Bé Na tự đánh răng, rửa tay và cất đồ chơi', age: '3-4', childName: 'Na', people, costAccepted: true }) }), env, fake)
  assert.equal((await res.json()).model, 'gpt-6-astra')
  assert.deepEqual(tried, ['gemini-3.8-flash-high', 'gpt-6-astra'])
})
