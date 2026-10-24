// Khóa API của Xưởng sáng tạo: xem (chỉ vài ký tự cuối) và lưu.
// Khóa được kiểm tra với 34AI / Gemini trước khi lưu, rồi cất trong Cloudflare KV (lib/keystore.js).
import { access, deviceOf, hint, publicState, store } from '../../../lib/keystore.js'
import { GEMINI_BASE, GEMINI_CHOICES, GEMINI_DEFAULTS, cleanReason, createGemini, googleFetch, modelOr } from '../../../lib/gemini.js'
import { BASE as AI34_BASE } from '../../../lib/ai34.js'
import { errorResponse, fail, json, readJson, sameOrigin } from '../../../lib/http.js'

const AI34_KEY = /^34ai_live_[A-Za-z0-9_-]{16,200}$/
// Google keys are usually "AIza…" but newer formats exist: accept any single word of 20+ characters.
const GEMINI_KEY = /^[^\s'"<>]{20,300}$/

/**
 * Ask the provider whether the key works: { result: 'ok' | 'bad' | 'unknown', reason }.
 * Only a clear "this key is invalid" answer counts as bad; anything else still lets the key be saved.
 */
export async function checkKey(kind, key, doFetch = globalThis.fetch) {
  let response
  try {
    response = kind === 'ai34'
      ? await doFetch(`${AI34_BASE}/v1/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) })
      : await doFetch(`${GEMINI_BASE}/models?pageSize=1`, { headers: { 'x-goog-api-key': key }, signal: AbortSignal.timeout(15000) })
  } catch (e) { return { result: 'unknown', reason: e?.name === 'TimeoutError' ? 'quá thời gian chờ' : 'lỗi kết nối' } }
  if (response.ok) { await response.body?.cancel?.(); return { result: 'ok', reason: '' } }
  let reason = ''
  try { const data = await response.json(); reason = cleanReason(`${data?.error?.status ?? data?.error?.code ?? ''} ${data?.error?.message ?? ''}`) } catch { /* not JSON */ }
  reason = reason || `HTTP ${response.status}`
  if (response.status === 402) reason = `hết tiền trả trước trong tài khoản Google (${reason})`
  const invalid = kind === 'ai34' ? response.status === 401 : response.status === 401 || /API_KEY_INVALID|API key not valid|API key expired/i.test(reason)
  return { result: invalid ? 'bad' : 'unknown', reason }
}

function view(ctx, env) {
  const source = kind => ctx.saved[kind] ? 'device' : ctx.defaults[kind] ? 'default' : null
  const models = Object.fromEntries(Object.keys(GEMINI_DEFAULTS).map(k => [k, modelOr(ctx.models?.[k], k)]))
  return {
    hints: { ai34: hint(ctx.keys.ai34), gemini: hint(ctx.keys.gemini) },
    defaults: { ai34: !!ctx.defaults.ai34, gemini: !!ctx.defaults.gemini },
    broken: ctx.broken,
    source: { ai34: source('ai34'), gemini: source('gemini') },
    providers: { ai34: !!ctx.keys.ai34, gemini: !!ctx.keys.gemini },
    models, choices: GEMINI_CHOICES, store: !!env.STUDIO_KV,
  }
}

export async function handle(request, env, { fetch: given } = {}) {
  const fetchFor = kind => given ?? (kind === 'gemini' ? googleFetch(env) : globalThis.fetch)
  const url = new URL(request.url), action = url.pathname.replace(/^.*\/api\/keys\/?/, '')
  const device = deviceOf(request)
  if (action === 'status' && request.method === 'GET') return json(await publicState(env, device))
  if (request.method !== 'POST') return json({ error: 'Phương thức không hỗ trợ.' }, 405)
  sameOrigin(request)
  const body = await readJson(request, 16 * 1024)
  const ctx = await access(env, device)
  switch (action) {
    case 'view': return json(view(ctx, env))
    case 'test': {
      // A real, tiny request with the saved key, so a parent sees Google's own answer.
      const kind = body.provider === 'ai34' ? 'ai34' : 'gemini'
      if (!ctx.keys[kind]) throw fail(`Chưa có khóa ${kind === 'ai34' ? '34AI' : 'Gemini'}.`, 400, 'not_configured')
      if (kind === 'ai34') {
        let response
        try { response = await fetchFor('ai34')(`${AI34_BASE}/v1/models`, { headers: { Authorization: `Bearer ${ctx.keys.ai34}` }, signal: AbortSignal.timeout(15000) }) }
        catch { return json({ ok: false, message: '34AI chưa phản hồi (lỗi kết nối). Thử lại sau ít phút.' }) }
        const data = await response.json().catch(() => ({}))
        if (response.status >= 500) return json({ ok: false, message: `Máy chủ 34AI đang tạm thời không phản hồi (lỗi ${response.status} từ phía 34AI), không phải do khóa. Hãy thử lại sau ít phút.` })
        if (response.status === 401) return json({ ok: false, message: '34AI từ chối khóa này (khóa sai hoặc đã bị thu hồi). Kiểm tra lại khóa trong 34AI → Cài đặt → API key.' })
        if (!response.ok) return json({ ok: false, message: `34AI báo: ${cleanReason(`${data?.error?.code ?? ''} ${data?.error?.message ?? ''}`) || `HTTP ${response.status}`}` })
        const list = Array.isArray(data.data) ? data.data : []
        const count = t => list.filter(m => m.media_type === t).length
        const names = t => list.filter(m => m.media_type === t).slice(0, 6).map(m => m.name ?? m.display_name ?? m.id).join(', ')
        return json({ ok: true, message: `Khóa 34AI dùng được. 34AI đang bật ${list.length} model: ảnh ${count('image')}${count('image') ? ` (${names('image')})` : ''}; video ${count('video')}${count('video') ? ` (${names('video')})` : ''}; chat ${count('chat')}; giọng ${count('audio')}.` })
      }
      const model = modelOr(ctx.models?.text, 'text')
      try {
        const reply = await createGemini({ apiKey: ctx.keys.gemini, fetch: fetchFor('gemini') }).text({ model, system: 'Trả lời đúng một từ.', user: 'Nói "Xin chào".', maxTokens: 256 })
        return json({ ok: true, message: `Khóa Gemini dùng được (${model} trả lời: “${cleanReason(reply).slice(0, 40)}”${env.GEMINI_RELAY ? ', qua trạm Mỹ' : ''}).` })
      } catch (e) { return json({ ok: false, message: `${e.message}${env.GEMINI_RELAY ? '' : ' [gọi trực tiếp, chưa có trạm chuyển tiếp]'}` }) }
    }
    case 'save': {
      const saved = { ...ctx.saved }, notes = []
      for (const kind of ['ai34', 'gemini']) {
        const value = body[kind]
        if (value === undefined || value === null) continue
        if (typeof value !== 'string') throw fail('Khóa không hợp lệ.')
        const key = value.trim()
        if (!key) { delete saved[kind]; continue }
        if (!(kind === 'ai34' ? AI34_KEY : GEMINI_KEY).test(key)) throw fail(kind === 'ai34' ? 'Khóa 34AI phải bắt đầu bằng 34ai_live_ và không có dấu cách.' : 'Khóa Gemini chưa đúng dạng (thường bắt đầu bằng AIza…, không có dấu cách).')
        const name = kind === 'ai34' ? '34AI' : 'Gemini'
        const { result, reason } = await checkKey(kind, key, fetchFor(kind))
        if (result === 'bad') throw fail(`${kind === 'ai34' ? '34AI' : 'Google'} báo khóa ${name} này không hợp lệ (${reason}). Kiểm tra lại khóa.`, 400, 'key_rejected')
        notes.push(result === 'ok' ? `Đã kiểm tra: khóa ${name} dùng được.` : `Lần kiểm tra chưa thành công (${reason}). Bấm “Thử kết nối” để xem chi tiết.`)
        saved[kind] = key
      }
      const models = { ...ctx.ownModels }
      if (body.models && typeof body.models === 'object') for (const k of Object.keys(GEMINI_DEFAULTS)) if (typeof body.models[k] === 'string') models[k] = modelOr(body.models[k].trim(), k)
      await store(env, device, saved, models)
      return json({ ...view(await access(env, device), env), notes })
    }
  }
  return json({ error: 'Không tìm thấy chức năng.' }, 404)
}

export async function onRequest({ request, env }) {
  try { return await handle(request, env) } catch (error) { return errorResponse(error, 'keys') }
}
