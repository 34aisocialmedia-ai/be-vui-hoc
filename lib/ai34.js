// 34AI client for the server side (Cloudflare Pages Functions, Node 18+ for tests).
// The API key comes from the AI34_API_KEY environment variable and never reaches the browser.
// Spec: https://api.34ai.net — models, generations (image/video), audio (speech), chat, reference images.

export const BASE = 'https://api.34ai.net'
export const TERMINAL = new Set(['completed', 'failed', 'cancelled'])
const RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4']
const REFERENCE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
const MODEL_CACHE_MS = 5 * 60 * 1000

/** An error from 34AI (or from our own checks), carrying the public error code. */
export class Ai34Error extends Error {
  constructor(message, { status = 400, code = 'invalid_input', retryAfter = null, requestId = null } = {}) {
    super(message)
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
    this.requestId = requestId
  }
}

/** Friendly Vietnamese messages per public error code (never based on `detail`). */
export const FRIENDLY = {
  invalid_input: 'Yêu cầu chưa hợp lệ với model này. Hãy đổi mô tả hoặc tùy chọn rồi thử lại.',
  idempotency_required: 'Thiếu mã chống tạo trùng. Hãy tải lại trang và thử lại.',
  authentication_required: 'Khóa API 34AI chưa đúng hoặc đã bị thu hồi. Quản trị viên cần kiểm tra trong Cài đặt → API key.',
  insufficient_credits: 'Tài khoản 34AI không đủ credit. Hãy nạp thêm credit rồi tạo lại.',
  plan_inactive: 'Gói 34AI đã hết hạn. Hãy gia hạn gói rồi tạo lại.',
  plan_allowance_exhausted: 'Gói 34AI đã hết lượt. Hãy gia hạn hoặc nạp thêm rồi tạo lại.',
  account_locked: 'Tài khoản 34AI đang bị khóa. Hãy liên hệ hỗ trợ 34AI.',
  resource_missing: 'Không tìm thấy tác vụ hoặc model này.',
  idempotency_conflict: 'Lệnh tạo này trùng mã với một lệnh khác. Hãy bấm tạo lại.',
  price_changed: 'Đơn giá model vừa thay đổi. Hãy bấm tạo lại.',
  upload_too_large: 'Ảnh quá lớn. Hãy chọn ảnh nhỏ hơn.',
  media_type_unsupported: 'Chỉ nhận ảnh JPEG, PNG, GIF hoặc WebP.',
  upload_type_mismatch: 'Nội dung tệp không khớp định dạng ảnh. Hãy chọn ảnh khác.',
  model_unavailable: 'Model này đang tạm tắt. Hãy chọn model khác hoặc thử lại sau.',
  dependency_timeout: 'Model trả lời quá lâu. Hãy thử lại hoặc rút ngắn yêu cầu.',
  request_rate_limited: 'Đang có quá nhiều yêu cầu. App sẽ thử lại sau ít giây.',
  queue_limit_reached: 'Đã đủ số tác vụ đang chờ. Hãy đợi tác vụ trước xong rồi tạo tiếp.',
  dependency_unavailable: '34AI đang gặp lỗi tạm thời. Hãy thử lại sau ít phút.',
  generation_failed: 'Không tạo được nội dung này. Hãy đổi mô tả rồi tạo lại bằng lệnh mới.',
  timeout: 'Tác vụ chạy quá lâu. Kiểm tra lại sau hoặc tạo lại.',
}
export const friendly = code => FRIENDLY[code] ?? 'Không thực hiện được yêu cầu. Hãy thử lại sau.'

const sleepReal = ms => new Promise(resolve => setTimeout(resolve, ms))
const retryable = e => e.status === 429 || e.status >= 500
const retryDelay = (e, attempt) => {
  const header = Number(e.retryAfter)
  return Number.isFinite(header) && header >= 0 ? header * 1000 : 1000 * 2 ** attempt
}

/**
 * Create a 34AI client.
 * @param {{ apiKey: string, fetch?: typeof fetch, sleep?: (ms: number) => Promise<void>, now?: () => number,
 *           maxInlineWaitMs?: number, log?: (info: object) => void }} options
 */
export function createAi34({ apiKey, fetch: doFetch = globalThis.fetch, sleep = sleepReal, now = Date.now, maxInlineWaitMs = 8000, log = () => {} }) {
  if (!apiKey || !apiKey.startsWith('34ai_live_')) throw new Ai34Error('Chưa cấu hình AI34_API_KEY trên máy chủ.', { status: 503, code: 'authentication_required' })
  let models = null, modelsAt = 0

  async function call(path, { method = 'GET', body, idempotencyKey, timeoutMs = 130000 } = {}) {
    const headers = { Authorization: 'Bearer ' + apiKey }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
    let response
    try {
      response = await doFetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs) })
    } catch {
      throw new Ai34Error(friendly('dependency_unavailable'), { status: 503, code: 'dependency_unavailable' })
    }
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const code = data?.error?.code || (response.status === 429 ? 'request_rate_limited' : response.status >= 500 ? 'dependency_unavailable' : 'invalid_input')
      const error = new Ai34Error(friendly(code), { status: response.status, code, retryAfter: response.headers.get('retry-after'), requestId: data?.request_id ?? null })
      // Never log the key: only the request id, path and code, for support.
      log({ path, status: response.status, code, request_id: error.requestId })
      throw error
    }
    return data
  }

  /** Retry 429/5xx a couple of times inside this request, reusing the same Idempotency-Key. */
  async function withRetry(run) {
    for (let attempt = 0; ; attempt++) {
      try { return await run() } catch (e) {
        if (!(e instanceof Ai34Error) || !retryable(e) || attempt >= 2) throw e
        const wait = retryDelay(e, attempt)
        if (wait > maxInlineWaitMs) throw e
        await sleep(wait)
      }
    }
  }

  /** Models currently enabled on 34AI (cached 5 minutes; `force` asks 34AI again right now). */
  async function listModels(force = false) {
    if (!force && models && now() - modelsAt < MODEL_CACHE_MS) return models
    const data = await withRetry(() => call('/v1/models'))
    models = Array.isArray(data.data) ? data.data : []
    modelsAt = now()
    return models
  }
  const modelsFetchedAt = () => modelsAt
  async function model(id, mediaTypes) {
    const found = (await listModels()).find(m => m.id === id)
    if (!found || (mediaTypes && !mediaTypes.includes(found.media_type))) throw new Ai34Error(friendly('model_unavailable'), { status: 422, code: 'model_unavailable' })
    return found
  }

  return {
    call,
    listModels,
    modelsFetchedAt,
    model,
    /** Image or video job. `request` is our validated input, turned into the 34AI body by buildGeneration. */
    async createGeneration(request, idempotencyKey) {
      if (!idempotencyKey) throw new Ai34Error(friendly('idempotency_required'), { code: 'idempotency_required' })
      const m = await model(request.model, ['image', 'video'])
      const body = buildGeneration(m, request)
      try {
        return await withRetry(() => call('/v1/generations', { method: 'POST', body, idempotencyKey }))
      } catch (e) {
        // The price changed while sending: send once more as a new command.
        if (e.code === 'price_changed') return withRetry(() => call('/v1/generations', { method: 'POST', body, idempotencyKey: idempotencyKey.slice(0, 120) + '-price' }))
        throw e
      }
    },
    getGeneration: id => withRetry(() => call('/v1/generations/' + encodeURIComponent(id))),
    audioCatalog: () => withRetry(() => call('/v1/audio/catalog')),
    async quoteSpeech(request) { return withRetry(() => call('/v1/audio/quote', { method: 'POST', body: buildSpeech(request) })) },
    async createSpeech(request, idempotencyKey) {
      if (!idempotencyKey) throw new Ai34Error(friendly('idempotency_required'), { code: 'idempotency_required' })
      return withRetry(() => call('/v1/audio/generations', { method: 'POST', body: buildSpeech(request), idempotencyKey }))
    },
    async chat(request) {
      return withRetry(() => call('/v1/chat/completions', { method: 'POST', body: request, timeoutMs: 130000 }))
    },
    /** Upload one reference picture: presign → PUT with the returned headers → complete. Returns its key. */
    async uploadReference(bytes, contentType, filename = 'reference') {
      const type = sniffImage(bytes)
      if (!type) throw new Ai34Error(friendly('media_type_unsupported'), { status: 415, code: 'media_type_unsupported' })
      if (contentType && contentType !== type) throw new Ai34Error(friendly('upload_type_mismatch'), { status: 415, code: 'upload_type_mismatch' })
      if (bytes.byteLength > 10 * 1024 * 1024) throw new Ai34Error(friendly('upload_too_large'), { status: 413, code: 'upload_too_large' })
      const stem = String(filename).replace(/\.[^.]*$/, '').replace(/[^\w-]+/g, '-').slice(0, 60) || 'reference'
      const name = `${stem}.${REFERENCE_TYPES[type]}`
      const presign = await withRetry(() => call('/reference-images/presign', { method: 'POST', body: { filename: name, content_type: type, size_bytes: bytes.byteLength } }))
      const put = await doFetch(presign.upload_url, { method: 'PUT', headers: presign.headers ?? { 'Content-Type': type }, body: bytes })
      if (!put.ok) throw new Ai34Error(friendly('dependency_unavailable'), { status: 502, code: 'dependency_unavailable' })
      await withRetry(() => call('/reference-images/complete', { method: 'POST', body: { key: presign.key } }))
      return presign.key
    },
  }
}

/** Detect JPEG, PNG, GIF or WebP from the first bytes. */
export function sniffImage(bytes) {
  const b = new Uint8Array(bytes.slice ? bytes.slice(0, 12) : bytes)
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
  return null
}

const invalid = message => new Ai34Error(message, { status: 422, code: 'invalid_input' })

/**
 * Build the POST /v1/generations body from a model and our request, sending only the parameters
 * the model declares in its capabilities.
 */
export function buildGeneration(model, { prompt, images = [], ratio, duration, resolution, quality, inputMode, pro = false }) {
  const caps = model.capabilities ?? {}
  const video = model.media_type === 'video'
  if (typeof prompt !== 'string' || !prompt.trim()) throw invalid('Hãy nhập mô tả.')
  if (prompt.length > 4000) throw invalid('Mô tả quá dài (tối đa 4.000 ký tự).')
  const maxRefs = Math.min(10, Number.isInteger(caps.max_reference_images) ? caps.max_reference_images : 10)
  if (!Array.isArray(images) || images.some(k => typeof k !== 'string' || !k || k.length > 512)) throw invalid('Ảnh tham chiếu chưa hợp lệ.')
  if (images.length > maxRefs) throw invalid(maxRefs ? `Model này nhận tối đa ${maxRefs} ảnh tham chiếu.` : 'Model này không nhận ảnh tham chiếu.')
  const body = { model: model.id, input: { prompt: prompt.trim(), images }, parameters: {} }
  const ratios = Array.isArray(caps.ratios) ? caps.ratios : RATIOS
  if (ratio !== undefined) {
    if (!ratios.includes(ratio)) throw invalid('Model này không hỗ trợ khung hình đã chọn.')
    body.parameters.ratio = ratio
  }
  if (video && Array.isArray(caps.durations) && caps.durations.length) {
    const d = duration ?? caps.durations[0]
    if (!caps.durations.includes(d)) throw invalid('Model này không hỗ trợ độ dài video đã chọn.')
    body.parameters.duration = d
  }
  if (resolution !== undefined && resolution !== '') {
    if (!Array.isArray(caps.resolutions) || !caps.resolutions.includes(resolution)) throw invalid('Model này không hỗ trợ độ phân giải đã chọn.')
    body.parameters.resolution = resolution
  }
  if (quality !== undefined && quality !== '') {
    if (video || !Array.isArray(caps.qualities) || !caps.qualities.includes(quality)) throw invalid('Model này không hỗ trợ mức chất lượng đã chọn.')
    body.parameters.quality = quality
  }
  if (inputMode !== undefined && inputMode !== '') {
    if (!Array.isArray(caps.input_modes) || !caps.input_modes.includes(inputMode)) throw invalid('Model này không hỗ trợ cách dùng ảnh đã chọn.')
    body.parameters.input_mode = inputMode
  }
  if (pro) {
    const declared = Array.isArray(caps.generation_modes) ? caps.generation_modes.includes('pro_skill') : ['seedance-2.0', 'seedance-2.5'].includes(model.id)
    if (!video || !declared) throw invalid('Chỉ một số model video có chế độ Pro.')
    body.parameters.generation_mode = 'pro_skill'
  }
  return body
}

/** Body for /v1/audio/quote and /v1/audio/generations. */
export function buildSpeech({ model, text, voiceId, languageCode = 'vi-VN', instruction = '', speakers }) {
  // No model: 34AI uses its own default voice model (its catalog may not list the models).
  if (model !== undefined && model !== null && (typeof model !== 'string' || model.length > 200)) throw invalid('Model giọng nói chưa đúng.')
  if (typeof text !== 'string' || !text.trim() || text.length > 12000) throw invalid('Lời đọc cần từ 1 đến 12.000 ký tự.')
  if (typeof instruction !== 'string' || instruction.length > 4000) throw invalid('Hướng dẫn giọng đọc tối đa 4.000 ký tự.')
  if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(languageCode)) throw invalid('Mã ngôn ngữ chưa đúng.')
  const body = { ...(model ? { model } : {}), text: text.trim(), language_code: languageCode }
  if (voiceId) body.voice_id = String(voiceId)
  if (instruction.trim()) body.system_instruction = instruction.trim()
  if (speakers !== undefined) {
    if (!Array.isArray(speakers) || speakers.length !== 2 || speakers[0]?.name === speakers[1]?.name || speakers.some(s => !s?.name || !s?.voice_id)) throw invalid('Hội thoại cần đúng 2 người nói, tên khác nhau.')
    body.speakers = speakers.map(s => ({ name: String(s.name), voice_id: String(s.voice_id) }))
  }
  return body
}

/**
 * Wait for a job to reach a final state: first look after 3 s, then ×1.5 up to 15 s, with a total timeout.
 * Used by tests and by any server worker; the browser app polls through our own endpoint with the same schedule.
 */
export async function waitForGeneration(client, id, { timeoutMs = 15 * 60_000, sleep = sleepReal, now = Date.now } = {}) {
  const started = now()
  for (let delay = 3000; ; delay = Math.min(delay * 1.5, 15_000)) {
    await sleep(delay)
    const job = await client.getGeneration(id)
    if (TERMINAL.has(job.status)) return job
    if (now() - started > timeoutMs) throw new Ai34Error(friendly('timeout'), { status: 504, code: 'timeout' })
  }
}

/** The part of a job the browser may see (no signed URLs: files are fetched through our server). */
export function publicJob(job) {
  return {
    id: job.id,
    status: job.status,
    label: job.public_state?.label ?? null,
    state: job.public_state?.code ?? null,
    error: job.status === 'failed' ? { code: job.error ?? job.public_state?.reason_code ?? 'generation_failed', message: friendly('generation_failed') } : null,
    output: (job.output ?? []).map((o, index) => ({ index, media_type: o.media_type, size_bytes: o.size_bytes, width: o.width, height: o.height })),
  }
}
