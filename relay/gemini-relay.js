// Trạm chuyển tiếp Gemini cho Bé Vui Học.
// Google chặn Gemini API từ một số nơi (ví dụ Hồng Kông — nơi Cloudflare hay phục vụ người dùng ở Việt Nam),
// nên app gửi lệnh Gemini qua Worker nhỏ này, được đặt cố định ở một vùng Google Cloud tại Mỹ (wrangler.toml).
// Worker không có địa chỉ công khai (workers_dev = false): chỉ app (qua service binding) gọi được.
// Chỉ chuyển tiếp tới generativelanguage.googleapis.com/v1beta/…, không lưu, không ghi nhật ký khóa.
const ALLOWED_HEADERS = ['x-goog-api-key', 'content-type', 'accept']

export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/v1beta/')) return new Response('Not found', { status: 404 })
    const target = new URL(url.pathname + url.search, 'https://generativelanguage.googleapis.com')
    const headers = new Headers()
    for (const name of ALLOWED_HEADERS) { const v = request.headers.get(name); if (v) headers.set(name, v) }
    const hasBody = !['GET', 'HEAD'].includes(request.method)
    const response = await fetch(target, { method: request.method, headers, body: hasBody ? request.body : undefined })
    const out = new Response(response.body, response)
    out.headers.set('x-relay-colo', String(request.cf?.colo ?? ''))
    return out
  },
}
