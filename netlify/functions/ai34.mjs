// Netlify Function: /api/ai34/* — Xưởng sáng tạo gọi 34AI (khóa chỉ nằm trên máy chủ).
import { handle } from '../../functions/api/ai34/[[path]].js'
import { errorResponse } from '../../lib/http.js'
import { netlifyEnv } from '../../lib/netlify-env.js'

export default async request => {
  try { return await handle(request, netlifyEnv()) } catch (error) { return errorResponse(error, '34ai') }
}
export const config = { path: ['/api/ai34', '/api/ai34/*'] }
