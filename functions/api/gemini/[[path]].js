// Xưởng sáng tạo — nguồn AI Google Gemini (ảnh, video, giọng nói, soạn trò chơi).
// Khóa Gemini do phụ huynh nhập trong xưởng (mã hóa trong Cloudflare KV) hoặc biến bí mật GEMINI_API_KEY.
import { sniffImage } from '../../../lib/ai34.js'
import { access, deviceOf } from '../../../lib/keystore.js'
import { GEMINI_CHOICES, GEMINI_VOICES, createGemini, geminiJob, googleFetch, modelOr } from '../../../lib/gemini.js'
import { gameMessages, parseGame, validateIdea } from '../../../lib/family-game.js'
import { safePrompt } from '../../../lib/safe-prompt.js'
import { errorResponse, fail, json, readJson, sameOrigin } from '../../../lib/http.js'

const MAX_JSON = 14 * 1024 * 1024
const IMAGE_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9']
const IMAGE_SIZES = ['1K', '2K', '4K']

const named = (list, chosen) => {
  const known = new Map(list)
  return [chosen, ...list.map(([id]) => id)].filter((id, i, all) => all.indexOf(id) === i).map(id => ({ id, name: known.get(id) ?? id }))
}

/** The same model list shape the browser uses for 34AI, built from the parent's Gemini settings. */
export function geminiModels(models = {}) {
  const m = k => modelOr(models[k], k)
  return {
    image: named(GEMINI_CHOICES.image, m('image')).map(x => ({ ...x, media_type: 'image', capabilities: { ratios: ['1:1', '16:9', '9:16', '4:3', '3:4'], resolutions: IMAGE_SIZES, max_reference_images: 6 } })),
    video: named(GEMINI_CHOICES.video, m('video')).map(x => ({ ...x, media_type: 'video', capabilities: { ratios: ['16:9', '9:16'], resolutions: ['720p', '1080p'], max_reference_images: 3 } })),
    chat: named(GEMINI_CHOICES.text, m('text')).map(x => ({ ...x, media_type: 'chat', capabilities: {} })),
    audio: { models: named(GEMINI_CHOICES.tts, m('tts')), voices: GEMINI_VOICES.map(v => ({ id: v, name: v })) },
  }
}

/** Reference pictures arrive as base64 in the request; check the real file type of each. */
function pictures(list, max) {
  if (list === undefined) return []
  if (!Array.isArray(list) || list.length > max) throw fail(`Gemini nhận tối đa ${max} ảnh tham chiếu cho mục này.`)
  return list.map(p => {
    if (!p || typeof p.data !== 'string' || !p.data || p.data.length > 4_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(p.data)) throw fail('Ảnh tham chiếu bị lỗi hoặc quá lớn.')
    const head = Uint8Array.from(atob(p.data.slice(0, 64)), c => c.charCodeAt(0))
    const type = sniffImage(head)
    if (!type || !['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw fail('Gemini chỉ nhận ảnh JPEG, PNG hoặc WebP.')
    return { mimeType: type, data: p.data }
  })
}
const prompt = (body, kind) => {
  const text = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (text.length < 10 || text.length > 3000) throw fail('Mô tả cần từ 10 đến 3.000 ký tự.')
  return safePrompt(text, kind)
}
const consented = (body, refs) => {
  if (body.costAccepted !== true || (refs && body.consent !== true)) throw fail('Người lớn cần xác nhận quyền dùng ảnh và đồng ý chi phí Gemini trước khi tạo.', 400, 'consent_required')
}
const pick = (value, list, fallback) => list.includes(value) ? value : fallback
const binary = (bytes, type) => new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })

export async function handle(request, env, makeClient = createGemini) {
  const url = new URL(request.url), action = url.pathname.replace(/^.*\/api\/gemini\/?/, '')
  if (request.method !== 'POST') return json({ error: 'Phương thức không hỗ trợ.' }, 405)
  sameOrigin(request)
  if (env.AI34_ENABLED === 'false') throw fail('Quản trị viên đang tạm tắt tạo nội dung AI.', 403, 'disabled')
  const ctx = await access(env, deviceOf(request))
  if (!ctx.keys.gemini) throw fail('Chưa có khóa Gemini. Mở “Khóa API” trong Xưởng sáng tạo và dán khóa Gemini.', 503, 'not_configured')
  const ai = makeClient({ apiKey: ctx.keys.gemini, fetch: googleFetch(env), log: info => console.log('gemini', JSON.stringify(info)) })
  const models = ctx.models ?? {}
  const body = await readJson(request, MAX_JSON)
  const model = (kind, list) => { const chosen = typeof body.model === 'string' ? body.model : ''; return list.some(m => m.id === chosen) ? chosen : list[0].id }
  const all = geminiModels(models)

  switch (action) {
    case 'models': return json(all)
    case 'image': {
      const refs = pictures(body.images, 6)
      consented(body, refs.length > 0)
      const out = await ai.image({ model: model('image', all.image), prompt: prompt(body, 'image'), images: refs, ratio: pick(body.ratio, IMAGE_RATIOS, '1:1'), size: pick(body.resolution, IMAGE_SIZES, '1K') })
      return binary(out.bytes, out.mimeType)
    }
    case 'audio': {
      if (body.costAccepted !== true) throw fail('Người lớn cần đồng ý chi phí Gemini trước khi tạo giọng nói.', 400, 'consent_required')
      const text = typeof body.text === 'string' ? body.text.trim() : ''
      if (!text || text.length > 5000) throw fail('Lời đọc cần từ 1 đến 5.000 ký tự.')
      const style = typeof body.instruction === 'string' ? body.instruction.trim().slice(0, 500) : ''
      const wav = await ai.speech({ model: model('tts', all.audio.models), text, voice: pick(body.voiceId, GEMINI_VOICES, 'Kore'), style })
      return binary(wav, 'audio/wav')
    }
    case 'video': {
      const refs = pictures(body.images, 3)
      consented(body, refs.length > 0)
      const started = await ai.startVideo({ model: model('video', all.video), prompt: prompt(body, 'video'), images: refs, ratio: body.ratio, resolution: body.resolution })
      return json({ ...geminiJob(started), status: 'queued', label: 'Đã gửi cho Gemini' }, 202)
    }
    case 'job': return json(geminiJob(await ai.getInteraction(String(body.id ?? ''))))
    case 'file': {
      const interaction = await ai.getInteraction(String(body.id ?? ''))
      if (geminiJob(interaction).status !== 'completed') throw fail('Video chưa xong.', 409, 'not_ready')
      return binary(await ai.videoBytes(interaction), 'video/mp4')
    }
    case 'game': {
      if (body.costAccepted !== true) throw fail('Người lớn cần đồng ý chi phí Gemini trước khi tạo trò chơi.', 400, 'consent_required')
      const idea = validateIdea(body)
      const [system, user] = gameMessages(idea)
      const chosen = model('text', all.chat)
      const reply = await ai.text({ model: chosen, system: system.content, user: user.content, maxTokens: 8000 })
      return json({ game: parseGame(reply, idea), credits: null, model: chosen })
    }
  }
  return json({ error: 'Không tìm thấy chức năng.' }, 404)
}

export async function onRequest({ request, env }) {
  try { return await handle(request, env) } catch (error) { return errorResponse(error, 'gemini') }
}
