// Netlify: biến môi trường của trang + kho Netlify Blobs đóng vai trò "STUDIO_KV" (giống Cloudflare KV)
// để lưu khóa 34AI riêng của từng thiết bị. Khóa mặc định là biến môi trường AI34_API_KEY trên Netlify.
import { getStore } from '@netlify/blobs'

let store = null
const blobs = () => (store ??= getStore({ name: 'be-vui-hoc-khoa-api', consistency: 'strong' }))

export function netlifyEnv(source = process.env) {
  return {
    ...source,
    STUDIO_KV: {
      get: (name, type) => blobs().get(name, { type: type === 'json' ? 'json' : 'text' }),
      put: (name, value) => blobs().set(name, value),
      delete: name => blobs().delete(name),
    },
  }
}
