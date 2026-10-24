/*
 * Browser side of the 34AI studio. Everything goes through our own /api/ai34 functions
 * (the API key stays on the server). Jobs are followed by polling our endpoint on 34AI's schedule:
 * first look after 3 s, then ×1.5 up to 15 s, with a total timeout (pictures/voice 5 min, video 20 min).
 */

export interface Caps {
  ratios?: string[]; durations?: number[]; resolutions?: string[]; qualities?: string[]; input_modes?: string[]
  max_reference_images?: number; generation_modes?: string[]; max_output_tokens?: number; [k: string]: unknown
}
export interface Ai34Model { id: string; name: string; media_type: 'image' | 'video' | 'chat' | 'audio'; capabilities: Caps }
export interface Models { image: Ai34Model[]; video: Ai34Model[]; chat: Ai34Model[]; audioCount?: number; fetchedAt?: number }
export interface JobView {
  id: string; status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  label: string | null; state: string | null
  error: { code: string; message: string } | null
  output: { index: number; media_type: string; size_bytes?: number; width?: number; height?: number }[]
}
export type JobKind = 'image' | 'video' | 'audio'
export type Provider = 'ai34' | 'gemini'
export const PROVIDER_LABEL: Record<Provider, string> = { ai34: '34AI', gemini: 'Gemini' }
/** A job this device is waiting for, kept so the page can pick it up again after a reload. */
export interface PendingJob { id: string; kind: JobKind; title: string; prompt: string; created: number; label?: string; provider?: Provider }

export class StudioError extends Error {
  constructor(message: string, public code = 'error', public retryAfter: number | null = null) { super(message) }
}

/** A random id for this browser, so it can use its own key on the server (the key itself never comes here). */
export function deviceId(): string {
  try {
    let id = localStorage.getItem('be-vui-hoc-device')
    if (!id || !/^[A-Za-z0-9_-]{16,80}$/.test(id)) { id = newKey() + newKey().slice(0, 8); localStorage.setItem('be-vui-hoc-device', id) }
    return id
  } catch { return '' }
}

async function send(action: string, code: string, init: RequestInit): Promise<Response> {
  let response: Response
  try {
    // 'gemini/…' and 'keys/…' go to their own functions; plain names are 34AI actions.
    response = await fetch(action.includes('/') ? `/api/${action}` : `/api/ai34/${action}`, { ...init, method: 'POST', cache: 'no-store', headers: { ...(init.headers ?? {}), 'X-Device-Id': deviceId(), ...(code ? { 'X-Studio-Code': code } : {}) } })
  } catch { throw new StudioError('Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.', 'network') }
  if (!response.ok) {
    let data: { error?: string; code?: string; retryAfter?: string | number | null } = {}
    try { data = await response.json() } catch { /* not JSON */ }
    const retry = Number(data.retryAfter ?? response.headers.get('Retry-After'))
    throw new StudioError(data.error || 'Không thực hiện được yêu cầu. Hãy thử lại sau.', data.code || String(response.status), Number.isFinite(retry) ? retry : null)
  }
  return response
}
export async function call<T>(action: string, code: string, body: unknown = {}, signal?: AbortSignal): Promise<T> {
  return (await send(action, code, { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal })).json()
}
/** A call whose answer is a file (Gemini pictures and voice come back straight away). */
export async function callBlob(action: string, code: string, body: unknown = {}, signal?: AbortSignal): Promise<Blob> {
  return (await send(action, code, { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal })).blob()
}
/** Is there a key store on the server, which AI sources have a key (never the keys themselves). */
export interface KeysState { store: boolean; providers: Record<Provider, boolean> }
export async function status(): Promise<KeysState> {
  const r = await fetch('/api/keys/status', { cache: 'no-store', headers: { 'X-Device-Id': deviceId() } })
  if (!r.ok || !r.headers.get('Content-Type')?.includes('application/json')) throw new StudioError('Chưa kết nối được máy chủ AI.')
  return r.json()
}
/** Only the last characters of each key, never the key itself. */
export interface KeysView {
  hints: Record<Provider, string | null>; source: Record<Provider, 'device' | 'default' | null>; providers: Record<Provider, boolean>; defaults: Record<Provider, boolean>; broken?: { ai34: boolean }
  models: Record<'text' | 'image' | 'tts' | 'video', string>; choices: Record<'text' | 'image' | 'tts' | 'video', [string, string][]>; store: boolean; notes?: string[]
}

/** A picture as base64 (Gemini takes reference pictures inside the request). */
export async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

/** Upload one prepared reference picture; returns the 34AI key to put in `images`. */
export async function uploadReference(code: string, blob: Blob, filename: string): Promise<string> {
  const r = await send('reference', code, { body: blob, headers: { 'Content-Type': blob.type, 'X-Filename': encodeURIComponent(filename).slice(0, 80) } })
  return (await r.json()).key
}

export const newKey = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, '')
const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const t = setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(new StudioError('Đã dừng theo dõi.', 'aborted')) }, { once: true })
})

/**
 * Send a create command, retrying 429 and temporary errors with the SAME idempotency key so 34AI
 * never makes a duplicate job or charges twice. 402 (credit) and input errors are not retried.
 */
export async function submit<T>(action: string, code: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const idempotencyKey = (body.idempotencyKey as string) || newKey()
  for (let attempt = 0; ; attempt++) {
    try { return await call<T>(action, code, { ...body, idempotencyKey }, signal) } catch (e) {
      const err = e as StudioError
      const temporary = ['request_rate_limited', 'queue_limit_reached', 'dependency_unavailable', 'network', '502', '503', '504'].includes(err.code)
      if (!temporary || attempt >= 3 || signal?.aborted) throw err
      await wait(Math.min(60, err.retryAfter ?? 2 * 2 ** attempt) * 1000, signal)
    }
  }
}

const TIMEOUT: Record<JobKind, number> = { image: 5 * 60_000, audio: 5 * 60_000, video: 20 * 60_000 }
const FINAL = new Set(['completed', 'failed', 'cancelled'])

/** Follow a job until it ends. `onUpdate` receives each view (for the progress label). */
export async function follow(code: string, id: string, kind: JobKind, onUpdate: (job: JobView) => void, signal?: AbortSignal, startedAt = Date.now(), provider: Provider = 'ai34'): Promise<JobView> {
  for (let delay = 3000; ; delay = Math.min(delay * 1.5, 15000)) {
    await wait(delay, signal)
    let job: JobView
    try { job = await call<JobView>(provider === 'gemini' ? 'gemini/job' : 'job', code, { id }, signal) } catch (e) {
      const err = e as StudioError
      if (['request_rate_limited', 'dependency_unavailable', 'network', '502', '503'].includes(err.code)) continue
      throw err
    }
    onUpdate(job)
    if (FINAL.has(job.status)) return job
    if (Date.now() - startedAt > TIMEOUT[kind]) throw new StudioError('Tác vụ chạy lâu hơn dự kiến. Có thể kiểm tra lại sau trong mục “Đang tạo”.', 'timeout')
  }
}

/** Download a finished job's file through our server (34AI links are signed and expire). */
export async function download(code: string, id: string, index = 0, provider: Provider = 'ai34'): Promise<Blob> {
  return (await send(provider === 'gemini' ? 'gemini/file' : 'file', code, { body: JSON.stringify({ id, index }), headers: { 'Content-Type': 'application/json' } })).blob()
}

const PENDING = 'be-vui-hoc-ai34-pending'
export function readPending(): PendingJob[] { try { return JSON.parse(localStorage.getItem(PENDING) || '[]') } catch { return [] } }
export function writePending(list: PendingJob[]) { try { localStorage.setItem(PENDING, JSON.stringify(list.slice(-12))) } catch { /* private mode */ } }

/** Shrink a photo on the device (max 1600 px) and drop its metadata before it is uploaded. */
export async function preparePicture(file: File): Promise<{ blob: Blob; url: string; name: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 15 * 1024 * 1024) throw new StudioError('Chọn ảnh JPG, PNG, WebP hoặc GIF dưới 15 MB. Ảnh HEIC cần đổi sang JPG trước.')
  const source = URL.createObjectURL(file)
  try {
    const img = new Image(); img.src = source; await img.decode()
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d'); if (!ctx) throw new StudioError('Không xử lý được ảnh trên thiết bị này.')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new StudioError('Không xử lý được ảnh.')), 'image/jpeg', .9))
    return { blob, url: URL.createObjectURL(blob), name: file.name.replace(/\.[^.]+$/, '') || 'anh' }
  } finally { URL.revokeObjectURL(source) }
}

/* ---------- Games made from an idea ---------- */
export interface FamilyOption { label: string; correct: boolean; emoji?: string; family?: number }
export interface FamilyGame { title: string; intro: string; icon: string; age: '24-36' | '3-4' | '4-5' | '5-6'; questions: { text: string; options: FamilyOption[] }[]; photos?: string[] }
