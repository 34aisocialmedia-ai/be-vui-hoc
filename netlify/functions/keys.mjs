// Netlify Function: /api/keys/* — khóa 34AI mặc định của app và khóa riêng của từng thiết bị.
import { handle } from '../../functions/api/keys/[[path]].js'
import { errorResponse } from '../../lib/http.js'
import { netlifyEnv } from '../../lib/netlify-env.js'

export default async request => {
  try { return await handle(request, netlifyEnv()) } catch (error) { return errorResponse(error, 'keys') }
}
export const config = { path: ['/api/keys', '/api/keys/*'] }
