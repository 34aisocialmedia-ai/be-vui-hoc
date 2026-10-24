// Khóa API của Xưởng sáng tạo — chỉ nằm trên máy chủ, không bao giờ gửi về trình duyệt.
// • Khóa MẶC ĐỊNH của app: biến bí mật AI34_API_KEY trên Cloudflare Pages (chủ app đặt một lần).
// • Khóa RIÊNG của từng thiết bị: phụ huynh dán trong Xưởng; lưu trong Cloudflare KV (STUDIO_KV) theo mã
//   thiết bị ngẫu nhiên (X-Device-Id), chỉ thiết bị đó dùng. Không dán thì dùng khóa mặc định.
// Trình duyệt chỉ nhận vài ký tự cuối của khóa để nhận biết.
import { Ai34Error } from './ai34.js'

export const RECORD = 'studio:keys' // bản cũ: khóa chung lưu trong app (vẫn đọc như khóa mặc định dự phòng)
const DEVICE = /^[A-Za-z0-9_-]{16,80}$/
const fail = (message, status = 400, code = 'invalid_input') => new Ai34Error(message, { status, code })

const kv = env => env.STUDIO_KV && typeof env.STUDIO_KV.get === 'function' ? env.STUDIO_KV : null
async function read(env, name) {
  const store = kv(env)
  if (!store) return null
  try { return await store.get(name, 'json') } catch { return null }
}
async function deviceRecord(id) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id)))
  return `device:${[...digest].map(b => b.toString(16).padStart(2, '0')).join('')}`
}
const text = v => typeof v === 'string' ? v : ''
// A key pasted into a terminal can pick up spaces or control characters (Ctrl+V shows up as \x16).
const cleanKey = v => text(v).replace(/[\s\x00-\x1f\x7f]/g, '')
const AI34_SHAPE = /^34ai_live_[A-Za-z0-9_-]{4,200}$/

/** The random id this browser sends so it can have its own key (not secret, never a key itself). */
export const deviceOf = request => { const id = request?.headers?.get?.('X-Device-Id') ?? ''; return DEVICE.test(id) ? id : '' }
export const hint = key => key ? `${key.startsWith('34ai_live_') ? '34ai_live_' : key.slice(0, 4)}…${key.slice(-4)}` : null

/** The keys used for this device: its own key if it saved one, otherwise the app's default key. */
export async function access(env, device = '') {
  const shared = await read(env, RECORD) ?? {}
  const mine = device ? await read(env, await deviceRecord(device)) ?? {} : {}
  const saved = { ai34: text(mine.ai34), gemini: text(mine.gemini) }
  const serverAi34 = cleanKey(env.AI34_API_KEY)
  const defaults = {
    ai34: AI34_SHAPE.test(serverAi34) ? serverAi34 : AI34_SHAPE.test(cleanKey(shared.ai34)) ? cleanKey(shared.ai34) : '',
    gemini: cleanKey(env.GEMINI_API_KEY) || cleanKey(shared.gemini),
  }
  return {
    device, saved, defaults,
    // The owner set AI34_API_KEY on Cloudflare but it is not a 34AI key (often a bad paste in the terminal).
    broken: { ai34: !!text(env.AI34_API_KEY) && !AI34_SHAPE.test(serverAi34) },
    keys: { ai34: saved.ai34 || defaults.ai34, gemini: saved.gemini || defaults.gemini },
    models: mine.models ?? shared.models ?? {}, ownModels: mine.models ?? {},
  }
}

/** What any visitor may know: is there a store, which AI sources have a key (never the keys). */
export async function publicState(env, device = '') {
  const { keys } = await access(env, device)
  return { store: !!kv(env), providers: { ai34: !!keys.ai34, gemini: !!keys.gemini } }
}

/** Save this device's own keys (an empty value means: use the app's default key again). */
export async function store(env, device, saved, models = {}) {
  const kvStore = kv(env)
  if (!kvStore) throw fail('Máy chủ chưa có kho lưu khóa. Hãy chạy trien-khai-netlify.cmd bản mới rồi thử lại.', 503, 'no_store')
  if (!device) throw fail('Thiếu mã thiết bị. Hãy tải lại trang rồi thử lại.', 400, 'no_device')
  const name = await deviceRecord(device)
  if (!saved.ai34 && !saved.gemini && !Object.keys(models).length) { await kvStore.delete(name); return }
  await kvStore.put(name, JSON.stringify({ v: 3, ai34: saved.ai34 || '', gemini: saved.gemini || '', models, updated: new Date().toISOString() }))
}
