// Small helpers shared by the studio's Pages Functions.
import { Ai34Error, friendly } from './ai34.js'

export const json = (value, status = 200, extra = {}) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } })
export const fail = (message, status = 400, code = 'invalid_input') => new Ai34Error(message, { status, code })

export function sameOrigin(request) {
  const url = new URL(request.url)
  if (request.headers.get('Origin') !== url.origin) throw fail('Yêu cầu phải xuất phát từ ứng dụng.', 403, 'origin')
}

export async function readBody(request, max) {
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

export async function readJson(request, max = 64 * 1024) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw fail('Định dạng yêu cầu không hợp lệ.', 415)
  try { return JSON.parse(new TextDecoder().decode(await readBody(request, max))) } catch (e) { if (e instanceof Ai34Error) throw e; throw fail('Nội dung không hợp lệ.') }
}

/** Turn any thrown error into a JSON answer without leaking provider details. */
export function errorResponse(error, tag) {
  if (error instanceof Ai34Error) {
    const headers = error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {}
    return json({ error: error.message, code: error.code, retryAfter: error.retryAfter, requestId: error.requestId }, error.status, headers)
  }
  console.log(`${tag} unexpected`, error?.message)
  return json({ error: 'Không xử lý được yêu cầu. Hãy thử lại sau.', code: 'server_error' }, 500)
}
