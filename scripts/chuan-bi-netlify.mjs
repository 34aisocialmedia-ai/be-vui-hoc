// Chuẩn bị Netlify (chạy tự động trong trien-khai-netlify.cmd):
// 1. Đăng nhập Netlify nếu chưa (mở trình duyệt).
// 2. Lần đầu: tạo trang Netlify mới và gắn thư mục này vào trang đó.
// 3. Nếu trang chưa có khóa 34AI mặc định (biến AI34_API_KEY): hỏi chủ app dán một lần.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { NETLIFY, SHAPE, askKey, setOnNetlify } from './dat-khoa-34ai.mjs'

const shell = process.platform === 'win32'
const quiet = args => { const r = spawnSync('npx', [...NETLIFY, ...args], { shell, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); return { ok: r.status === 0, out: r.stdout ?? '', err: r.stderr ?? '' } }
const loud = args => spawnSync('npx', [...NETLIFY, ...args], { shell, stdio: 'inherit' }).status === 0
const linked = () => { try { return !!JSON.parse(readFileSync('.netlify/state.json', 'utf8')).siteId } catch { return false } }

if (!quiet(['status', '--json']).ok) {
  console.log('[Netlify] Chua dang nhap. Trinh duyet se mo de dang nhap Netlify...')
  if (!loud(['login'])) { console.log('[Netlify] Chua dang nhap duoc.'); process.exit(1) }
}
if (!linked()) {
  console.log('[Netlify] Lan dau: tao trang Netlify moi cho app (chon nhom, dat ten trang, vi du be-vui-hoc).')
  if (!loud(['sites:create']) || !linked()) { console.log('[Netlify] Chua tao/gan duoc trang. Co the chay: npx netlify-cli link'); process.exit(1) }
}

const list = quiet(['env:list', '--json', '--context', 'production'])
let vars = null
try { vars = JSON.parse(list.out.slice(list.out.indexOf('{'), list.out.lastIndexOf('}') + 1)) } catch { vars = null }
const has = !!vars && Object.prototype.hasOwnProperty.call(vars, 'AI34_API_KEY')
const value = typeof vars?.AI34_API_KEY === 'string' ? vars.AI34_API_KEY.trim() : ''
// Secret values come back hidden (empty or ****): then only check that the variable exists.
const good = has && (!value || /^\*+$/.test(value) || SHAPE.test(value))
if (!list.ok) {
  console.log('[Khoa mac dinh] Chua doc duoc bien moi truong cua trang Netlify, bo qua buoc nay.')
} else if (good) {
  console.log('[Khoa mac dinh] Trang Netlify da co khoa 34AI mac dinh. (Doi khoa: chay cai-dat-34ai-netlify.cmd)')
} else {
  console.log(has ? '\n[Khoa mac dinh] Khoa 34AI mac dinh tren Netlify bi sai dang, can dat lai.' : '\n[Khoa mac dinh] Trang chua co khoa 34AI mac dinh.')
  const key = await askKey({ optional: true })
  if (key && setOnNetlify(key)) console.log(`[Khoa mac dinh] Da dat: 34ai_live_...${key.slice(-4)}`)
  else console.log('[Khoa mac dinh] Chua dat. Co the chay cai-dat-34ai-netlify.cmd sau, hoac them bien AI34_API_KEY trong trang Netlify.')
}
