// Xưởng sáng tạo 34AI — the only place the app talks to 34AI. Runs on Cloudflare Pages Functions.
// The 34AI key is typed by a parent in the studio (stored in Cloudflare KV, see lib/keystore.js)
// or set as the old secret AI34_API_KEY. It is never sent to the browser.
//   AI34_CHAT_MODEL     optional: chat model id used to write games (default: the first chat model)
import { Ai34Error, createAi34, friendly, publicJob } from '../../../lib/ai34.js'
import { gameMessages, parseGame, parsePlan, planMessages, validateIdea, validatePlanRequest } from '../../../lib/family-game.js'
import { access, deviceOf, publicState } from '../../../lib/keystore.js'
import { safePrompt } from '../../../lib/safe-prompt.js'

export { safePrompt }
const MAX_JSON = 64 * 1024
const MAX_REFERENCE = 10 * 1024 * 1024
const MAX_FILE = 60 * 1024 * 1024
const KEY = /^[A-Za-z0-9_-]{8,128}$/
// Shared across requests served by the same worker instance; 34AI asks for a 5–10 minute model cache.
let client = null, clientKey = ''

const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
const fail = (message, status = 400, code = 'invalid_input') => new Ai34Error(message, { status, code })

export async function configuration(env, device = '') {
  const state = await publicState(env, device)
  return { configured: state.providers.ai34, enabled: env.AI34_ENABLED !== 'false' }
}

async function readBody(request, max) {
  const reader = request.body?.getReader()
  if (!reader) throw fail('Thiếu nội dung.')
  const chunks = []
  let length = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.length
    if (length > max) { await reader.cancel(); throw fail(friendly('upload_too_large'), 413, 'upload_too_large') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const c of chunks) { bytes.set(c, offset); offset += c.length }
  return bytes
}
async function readJson(request) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw fail('Định dạng yêu cầu không hợp lệ.', 415)
  try { return JSON.parse(new TextDecoder().decode(await readBody(request, MAX_JSON))) } catch (e) { if (e instanceof Ai34Error) throw e; throw fail('Nội dung không hợp lệ.') }
}
const idempotencyKey = body => {
  if (typeof body.idempotencyKey !== 'string' || !KEY.test(body.idempotencyKey)) throw fail(friendly('idempotency_required'), 400, 'idempotency_required')
  return body.idempotencyKey
}
const consented = body => {
  if (body.consent !== true || body.costAccepted !== true) throw fail('Người lớn cần xác nhận quyền dùng ảnh và đồng ý trừ credit trước khi tạo.', 400, 'consent_required')
}

const modelView = m => ({ id: m.id, name: m.name ?? m.display_name ?? m.id, media_type: m.media_type, capabilities: m.capabilities ?? {} })

export async function handle(request, env, makeClient = createAi34) {
  const url = new URL(request.url), action = url.pathname.replace(/^.*\/api\/ai34\/?/, '')
  if (action === 'status' && request.method === 'GET') return json(await configuration(env, deviceOf(request)))
  if (request.method !== 'POST') return json({ error: 'Phương thức không hỗ trợ.' }, 405)
  if (request.headers.get('Origin') !== url.origin) throw fail('Yêu cầu phải xuất phát từ ứng dụng.', 403, 'origin')
  if (env.AI34_ENABLED === 'false') throw fail('Quản trị viên đang tạm tắt tạo nội dung AI.', 403, 'disabled')
  const ctx = await access(env, deviceOf(request))
  const apiKey = ctx.keys.ai34
  if (!apiKey) throw fail('Chưa có khóa 34AI. Mở “Khóa API” trong Xưởng sáng tạo và dán khóa 34AI.', 503, 'not_configured')
  if (!client || clientKey !== apiKey) { client = makeClient({ apiKey, log: info => console.log('34ai', JSON.stringify(info)) }); clientKey = apiKey }
  const ai = client

  switch (action) {
    case 'unlock': return json({ ok: true })
    case 'models': {
      // Always the live list from 34AI (cached 5 minutes); { refresh: true } asks 34AI again now.
      const body = await readJson(request).catch(() => ({}))
      const list = await ai.listModels(body?.refresh === true)
      const pick = t => list.filter(m => m.media_type === t).map(modelView)
      return json({ image: pick('image'), video: pick('video'), chat: pick('chat'), audioCount: pick('audio').length, fetchedAt: ai.modelsFetchedAt?.() || Date.now() })
    }
    case 'reference': {
      const type = request.headers.get('Content-Type')?.split(';')[0].trim()
      const bytes = await readBody(request, MAX_REFERENCE)
      const key = await ai.uploadReference(bytes, type, request.headers.get('X-Filename') ?? 'anh-tham-chieu')
      return json({ key })
    }
    case 'generate': {
      const body = await readJson(request)
      consented(body)
      const m = await ai.model(String(body.model ?? ''), ['image', 'video'])
      const job = await ai.createGeneration({
        model: m.id, prompt: safePrompt(String(body.prompt ?? ''), m.media_type), images: body.images ?? [],
        ratio: body.ratio, duration: body.duration === undefined ? undefined : Number(body.duration),
        resolution: body.resolution, quality: body.quality, inputMode: body.inputMode, pro: body.pro === true,
      }, idempotencyKey(body))
      return json(publicJob(job), 202)
    }
    case 'job': {
      const body = await readJson(request)
      if (typeof body.id !== 'string' || !body.id || body.id.length > 200) throw fail('Thiếu mã tác vụ.')
      return json(publicJob(await ai.getGeneration(body.id)))
    }
    case 'file': {
      // Signed links expire: read the job again for a fresh link, then pass the file through.
      const body = await readJson(request)
      const job = await ai.getGeneration(String(body.id ?? ''))
      const out = job.status === 'completed' ? job.output?.[Number(body.index ?? 0)] : null
      if (!out?.url) throw fail('Tác vụ chưa có tệp kết quả.', 409, 'not_ready')
      const link = new URL(out.url)
      if (link.protocol !== 'https:' || link.username || link.password) throw fail('Địa chỉ tệp không hợp lệ.', 502, 'bad_output')
      const response = await fetch(link, { signal: AbortSignal.timeout(120000) })
      if (!response.ok) { await response.body?.cancel(); throw fail('Chưa tải được tệp kết quả. Hãy thử lại.', 502, 'dependency_unavailable') }
      if (Number(response.headers.get('Content-Length') ?? out.size_bytes ?? 0) > MAX_FILE) { await response.body?.cancel(); throw fail('Tệp quá lớn để lưu trên thiết bị.', 413, 'upload_too_large') }
      const type = out.media_type === 'video' ? 'video/mp4' : out.media_type === 'audio' ? 'audio/wav' : (response.headers.get('Content-Type')?.startsWith('image/') ? response.headers.get('Content-Type') : 'image/png')
      return new Response(response.body, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
    }
    case 'audio-catalog': return json(await ai.audioCatalog())
    case 'audio-quote': {
      const body = await readJson(request)
      return json(await ai.quoteSpeech({ model: body.model, text: body.text, voiceId: body.voiceId, instruction: body.instruction ?? '', languageCode: body.languageCode ?? 'vi-VN' }))
    }
    case 'audio-generate': {
      const body = await readJson(request)
      if (body.costAccepted !== true) throw fail('Người lớn cần đồng ý trừ credit trước khi tạo giọng nói.', 400, 'consent_required')
      const job = await ai.createSpeech({ model: body.model, text: body.text, voiceId: body.voiceId, instruction: body.instruction ?? '', languageCode: body.languageCode ?? 'vi-VN' }, idempotencyKey(body))
      return json(publicJob(job), 202)
    }
    case 'game': {
      const body = await readJson(request)
      if (body.costAccepted !== true) throw fail('Người lớn cần đồng ý trừ credit trước khi tạo trò chơi.', 400, 'consent_required')
      const idea = validateIdea(body)
      const chats = (await ai.listModels()).filter(m => m.media_type === 'chat')
      const chosen = chats.find(m => m.id === (body.model || env.AI34_CHAT_MODEL)) ?? chats[0]
      if (!chosen) throw fail(friendly('model_unavailable'), 503, 'model_unavailable')
      const reply = await ai.chat({ model: chosen.id, messages: gameMessages(idea), max_tokens: Math.min(3000, chosen.capabilities?.max_output_tokens ?? 3000), temperature: 0.7 })
      const game = parseGame(reply.choices?.[0]?.message?.content, idea)
      return json({ game, credits: reply.credits_charged ?? null, model: chosen.id })
    }
    case 'game-plan': {
      // "Game with my child": the script plus the scenes (featuring the child/family) the browser will have drawn.
      const body = await readJson(request)
      if (body.costAccepted !== true) throw fail('Người lớn cần đồng ý trừ credit trước khi tạo trò chơi.', 400, 'consent_required')
      const req = validatePlanRequest(body)
      const chats = (await ai.listModels()).filter(m => m.media_type === 'chat')
      const chosen = chats.find(m => m.id === (body.model || env.AI34_CHAT_MODEL)) ?? chats.find(m => /flash/i.test(m.id)) ?? chats[0]
      if (!chosen) throw fail(friendly('model_unavailable'), 503, 'model_unavailable')
      const reply = await ai.chat({ model: chosen.id, messages: planMessages(req), max_tokens: Math.min(4000, chosen.capabilities?.max_output_tokens ?? 4000), temperature: 0.7 })
      const plan = parsePlan(reply.choices?.[0]?.message?.content, req)
      return json({ plan, credits: reply.credits_charged ?? null, model: chosen.id })
    }
  }
  return json({ error: 'Không tìm thấy chức năng.' }, 404)
}

export async function onRequest({ request, env }) {
  try { return await handle(request, env) } catch (error) {
    if (error instanceof Ai34Error) {
      const headers = error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {}
      return new Response(JSON.stringify({ error: error.message, code: error.code, retryAfter: error.retryAfter, requestId: error.requestId }), { status: error.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } })
    }
    console.log('34ai unexpected', error?.message)
    return json({ error: 'Không xử lý được yêu cầu. Hãy thử lại sau.', code: 'server_error' }, 500)
  }
}
