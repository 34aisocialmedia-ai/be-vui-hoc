// Google Gemini client for the server side (Interactions API, v1beta).
// Pictures: Nano Banana; voice: Gemini TTS; video: Gemini Omni Flash (runs in the background, polled);
// text (writing games): Gemini Flash. The API key never reaches the browser.
import { Ai34Error } from './ai34.js'

export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'
export const GEMINI_DEFAULTS = { text: 'gemini-3.8-flash', image: 'gemini-nano-banana-2.1', tts: 'gemini-3.8-flash-tts', video: 'gemini-omni-1.1-flash' }
export const GEMINI_CHOICES = {
  text: [['gemini-3.8-flash', 'Gemini 3.8 Flash'], ['gemini-3.5-flash-lite', 'Gemini 3.5 Flash-Lite (rẻ)'], ['gemini-4-argon', 'Gemini 4 Argon']],
  image: [['gemini-nano-banana-2.1', 'Nano Banana 2.1'], ['gemini-3.1-flash-image', 'Gemini 3.1 Flash Image'], ['gemini-3.1-flash-lite-image', 'Gemini 3.1 Flash-Lite Image (rẻ)'], ['gemini-3-pro-image', 'Nano Banana Pro']],
  tts: [['gemini-3.8-flash-tts', 'Gemini 3.8 Flash TTS'], ['gemini-3.8-flash-lite-tts', 'Gemini 3.8 Flash-Lite TTS (rẻ)']],
  video: [['gemini-omni-1.1-flash', 'Gemini Omni Flash']],
}
export const GEMINI_VOICES = ['Kore', 'Aoede', 'Leda', 'Callirrhoe', 'Autonoe', 'Despina', 'Erinome', 'Laomedeia', 'Achernar', 'Gacrux', 'Pulcherrima', 'Vindemiatrix', 'Sulafat', 'Zephyr', 'Puck', 'Charon', 'Fenrir', 'Orus', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Algenib', 'Rasalgethi', 'Alnilam', 'Schedar', 'Achird', 'Zubenelgenubi', 'Sadachbia', 'Sadaltager']
const MODEL = /^[a-z0-9][a-z0-9._-]{2,80}$/
const ID = /^[A-Za-z0-9_.\/-]{4,300}$/

export const GEMINI_FRIENDLY = {
  gemini_auth: 'Khóa Gemini chưa đúng, đã bị thu hồi hoặc chưa bật quyền cho model này. Kiểm tra lại khóa trong Google AI Studio.',
  invalid_input: 'Gemini chưa nhận yêu cầu này. Hãy đổi mô tả hoặc tùy chọn rồi thử lại.',
  model_unavailable: 'Model Gemini này chưa dùng được với khóa của bạn. Chọn model khác trong phần Khóa API.',
  request_rate_limited: 'Gemini đang giới hạn lượt hoặc đã hết hạn mức. App sẽ thử lại sau ít giây.',
  dependency_unavailable: 'Gemini đang gặp lỗi tạm thời. Hãy thử lại sau ít phút.',
  blocked: 'Gemini không tạo nội dung này (bộ lọc an toàn). Hãy đổi mô tả hoặc ảnh tham chiếu.',
  generation_failed: 'Gemini không tạo được nội dung này. Hãy đổi mô tả rồi tạo lại.',
  billing: 'Tài khoản Google của khóa Gemini này đã hết tiền trả trước (prepaid credit). Vào aistudio.google.com → Billing (Thanh toán) để nạp thêm hoặc bật tự động nạp, rồi thử lại.',
  region: 'Google chưa cho dùng Gemini API từ khu vực máy chủ đang chạy app (hoặc khóa thuộc dự án bị giới hạn khu vực).',
}
/** Google's own reason, shortened and with anything key-like removed, so a parent can see what went wrong. */
export const cleanReason = text => String(text ?? '').replace(/AIza[0-9A-Za-z_-]{10,}/g, 'AIza…').replace(/key=[^&\s]+/g, 'key=…').replace(/\s+/g, ' ').trim().slice(0, 220)
const err = (code, status, extra = {}, reason = '') => new Ai34Error(`${GEMINI_FRIENDLY[code] ?? GEMINI_FRIENDLY.generation_failed}${reason ? ` (Google báo: ${reason})` : ''}`, { status, code, ...extra })

/**
 * Google refuses Gemini API calls from some places (for example Hong Kong, where Cloudflare often serves
 * visitors from Vietnam). When the small relay Worker "be-vui-hoc-gemini" is bound as GEMINI_RELAY, calls go
 * through it: that Worker is pinned to a Google Cloud region in the US (see relay/wrangler.toml).
 */
export function googleFetch(env, fallback = globalThis.fetch) {
  const relay = env?.GEMINI_RELAY
  if (!relay || typeof relay.fetch !== 'function') return fallback
  return (url, init) => relay.fetch(new Request(url, init))
}

export const modelOr = (value, kind) => typeof value === 'string' && MODEL.test(value) ? value : GEMINI_DEFAULTS[kind]

/** Every content block in an interaction (steps → content, plus older/convenience shapes). */
export function blocksOf(interaction) {
  const out = []
  for (const step of interaction?.steps ?? []) if (step?.type !== 'user_input' && step?.type !== 'thought') out.push(...(Array.isArray(step?.content) ? step.content : []))
  for (const o of interaction?.outputs ?? []) out.push(o)
  for (const k of ['output_image', 'output_audio', 'output_video']) if (interaction?.[k]) out.push({ type: k.slice(7), ...interaction[k] })
  return out.filter(b => b && typeof b === 'object')
}
export function textOf(interaction) {
  if (typeof interaction?.output_text === 'string') return interaction.output_text
  return blocksOf(interaction).filter(b => b.type === 'text' && typeof b.text === 'string').map(b => b.text).join('')
}
const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
const toB64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s) }

/** Gemini TTS returns WAV; raw 24 kHz 16-bit mono PCM is wrapped in a WAV header just in case. */
export function asWav(bytes, rate = 24000) {
  if (bytes.length > 12 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF') return bytes
  const out = new Uint8Array(44 + bytes.length), v = new DataView(out.buffer)
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF'); v.setUint32(4, 36 + bytes.length, true); w(8, 'WAVE'); w(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true)
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, bytes.length, true)
  out.set(bytes, 44)
  return out
}

export function createGemini({ apiKey, fetch: doFetch = globalThis.fetch, log = () => {} }) {
  if (!apiKey) throw new Ai34Error('Chưa có khóa Gemini. Nhập khóa trong Xưởng sáng tạo → Khóa API.', { status: 503, code: 'not_configured' })
  async function request(path, { method = 'GET', body, timeout = 110000 } = {}) {
    let response
    try {
      response = await doFetch(`${GEMINI_BASE}/${path}`, { method, headers: { 'x-goog-api-key': apiKey, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(timeout) })
    } catch (e) { throw err('dependency_unavailable', 504, {}, e?.name === 'TimeoutError' ? 'quá thời gian chờ' : 'lỗi kết nối') }
    if (response.ok) return response.json()
    let reason = ''
    try { const data = await response.json(); const e = data?.error ?? data ?? {}; reason = cleanReason(`${e.status ?? e.type ?? e.code ?? ''} ${e.message ?? ''}`) } catch { /* not JSON */ }
    log({ status: response.status, reason: reason.slice(0, 160) })
    const retryAfter = Number(response.headers.get('Retry-After')) || null
    if (response.status === 402 || /payment_required|prepaid/i.test(reason)) throw err('billing', 402, {}, reason || 'HTTP 402')
    if (response.status === 429) throw err('request_rate_limited', 429, { retryAfter }, reason)
    if (/location is not supported|FAILED_PRECONDITION/i.test(reason)) throw err('region', 502, {}, reason)
    if (response.status === 401 || response.status === 403 || /API_KEY_INVALID|PERMISSION_DENIED/.test(reason)) throw err('gemini_auth', 502, {}, reason)
    if (response.status === 404) throw err('model_unavailable', 404, {}, `${reason} [${path.split('?')[0]}]`.trim())
    if (response.status === 400) throw err(/safety|block|prohibit/i.test(reason) ? 'blocked' : 'invalid_input', 400, {}, reason)
    throw err('dependency_unavailable', 502, {}, reason || `HTTP ${response.status}`)
  }
  const interact = (body, timeout) => request('interactions', { method: 'POST', body, timeout })
  const imageParts = images => images.map(i => ({ type: 'image', mime_type: i.mimeType, data: i.data }))

  return {
    /** A cheap call to check that the key works. */
    async check() { await request('models?pageSize=1', { timeout: 15000 }) },

    async image({ model, prompt, images = [], ratio, size }) {
      const result = await interact({ model, store: false, input: [{ type: 'text', text: prompt }, ...imageParts(images)], response_format: { type: 'image', ...(ratio ? { aspect_ratio: ratio } : {}), ...(size ? { image_size: size } : {}) } })
      const block = blocksOf(result).filter(b => b.type === 'image' && typeof b.data === 'string').pop()
      if (!block) throw err('blocked', 422)
      return { mimeType: ['image/png', 'image/jpeg', 'image/webp'].includes(block.mime_type) ? block.mime_type : 'image/png', bytes: fromB64(block.data) }
    },

    async speech({ model, text, voice, style }) {
      const ask = withStyle => interact({ model, store: false, input: [{ type: 'text', text, ...(withStyle && style ? { annotations: [{ type: 'speech_metadata', style }] } : {}) }], response_format: { type: 'audio' }, generation_config: { speech_config: [{ voice }] } })
      let result
      try { result = await ask(true) } catch (e) { if (!(style && e.code === 'invalid_input')) throw e; result = await ask(false) }
      const block = blocksOf(result).find(b => b.type === 'audio' && typeof b.data === 'string')
      if (!block) throw err('generation_failed', 422)
      return asWav(fromB64(block.data), Number(block.sample_rate) || 24000)
    },

    /** Video runs in the background: returns the interaction id to poll. */
    async startVideo({ model, prompt, images = [], ratio, resolution }) {
      const task = images.length > 1 ? 'reference_to_video' : images.length ? 'image_to_video' : 'text_to_video'
      const result = await interact({ model, background: true, input: [{ type: 'text', text: prompt }, ...imageParts(images)], response_format: { type: 'video', aspect_ratio: ratio === '9:16' ? '9:16' : '16:9', resolution: ['360p', '720p', '1080p'].includes(resolution) ? resolution : '720p' }, generation_config: { video_config: { task } } }, 60000)
      if (!result?.id) throw err('generation_failed', 502)
      return result
    },
    async getInteraction(id) {
      if (typeof id !== 'string' || !ID.test(id) || id.includes('..')) throw new Ai34Error('Mã tác vụ không hợp lệ.', { status: 400, code: 'invalid_input' })
      return request(`interactions/${id.split('/').map(encodeURIComponent).join('/')}`, { timeout: 60000 })
    },
    /** The finished video as bytes (inline data, or the hosted Gemini file). */
    async videoBytes(interaction) {
      const block = blocksOf(interaction).find(b => b.type === 'video' && (b.data || b.uri))
      if (!block) throw err('generation_failed', 422)
      if (block.data) return fromB64(block.data)
      const file = /files\/([A-Za-z0-9_-]+)/.exec(block.uri ?? '')
      if (!file) throw err('generation_failed', 502)
      let response
      try { response = await doFetch(`${GEMINI_BASE}/files/${file[1]}:download?alt=media`, { headers: { 'x-goog-api-key': apiKey }, signal: AbortSignal.timeout(120000) }) } catch { throw err('dependency_unavailable', 504) }
      if (!response.ok) { await response.body?.cancel(); throw err('dependency_unavailable', 502) }
      return new Uint8Array(await response.arrayBuffer())
    },

    async text({ model, system, user, maxTokens = 3000 }) {
      const result = await interact({ model, store: false, system_instruction: system, input: user, generation_config: { max_output_tokens: maxTokens } })
      return textOf(result)
    },
  }
}

/** Interaction → the same job view the browser already uses for 34AI. */
export function geminiJob(interaction) {
  const s = interaction?.status
  const status = s === 'completed' ? 'completed' : ['failed', 'cancelled', 'incomplete', 'requires_action'].includes(s) ? 'failed' : 'processing'
  const done = status === 'completed' && blocksOf(interaction).some(b => b.type === 'video' && (b.data || b.uri))
  return {
    id: interaction?.id ?? '', status: status === 'completed' && !done ? 'failed' : status,
    label: status === 'processing' ? 'Gemini đang tạo video' : null, state: s ?? null,
    error: status === 'failed' || (status === 'completed' && !done) ? { code: 'generation_failed', message: GEMINI_FRIENDLY.generation_failed } : null,
    output: done ? [{ index: 0, media_type: 'video' }] : [],
  }
}

export { toB64 }
