// Chuẩn bị máy chủ cho Xưởng sáng tạo (chạy tự động trong trien-khai-dev.cmd):
// 1. Tạo (một lần) kho Cloudflare KV "be-vui-hoc-khoa-api" để lưu khóa API phụ huynh nhập trong app.
// 2. Ghi wrangler.toml để gắn kho (STUDIO_KV) vào app. Mọi lệnh AI chạy qua 34AI.
// Không có khóa API nào đi qua tệp này. Lỗi ở đây không chặn việc đưa app lên.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { askAndSetDefaultKey } from './dat-khoa-34ai.mjs'

const PROJECT = 'be-vui-hoc-test'
const TITLE = 'be-vui-hoc-khoa-api'
const TOML = 'wrangler.toml'

function wrangler(args) {
  const r = spawnSync('npx', ['--yes', 'wrangler@4', ...args], { encoding: 'utf8', shell: process.platform === 'win32', stdio: ['inherit', 'pipe', 'pipe'] })
  return { ok: r.status === 0, out: r.stdout ?? '', err: r.stderr ?? '' }
}
const firstError = text => (text.split('\n').find(l => /error|✘/i.test(l)) ?? 'loi khong ro').replace(/\x1b\[[0-9;]*m/g, '').trim()
const listNamespaces = () => {
  const r = wrangler(['kv', 'namespace', 'list'])
  if (!r.ok) return null
  try { return JSON.parse(r.out.slice(r.out.indexOf('['), r.out.lastIndexOf(']') + 1)) } catch { return null }
}

// 1. Kho khóa
let id = existsSync(TOML) ? /binding\s*=\s*"STUDIO_KV"\s*\r?\n\s*id\s*=\s*"([0-9a-f]{32})"/.exec(readFileSync(TOML, 'utf8'))?.[1] : null
if (!id) {
  console.log('[Kho khoa] Tim hoac tao kho luu khoa tren Cloudflare...')
  const list = listNamespaces()
  let found = list?.find(n => n.title === TITLE)
  if (list && !found) {
    const made = wrangler(['kv', 'namespace', 'create', TITLE])
    if (!made.ok) console.log(`[Kho khoa] Chua tao duoc kho KV: ${firstError(made.err)}`)
    found = (listNamespaces() ?? []).find(n => n.title === TITLE)
  }
  id = found?.id ?? null
  if (!id) console.log('[Kho khoa] Chua co kho KV (kiem tra dang nhap: npx wrangler login). App van len, chi chua luu khoa trong app duoc.')
}

// Khóa 34AI mặc định của app (biến bí mật AI34_API_KEY). Chưa có thì hỏi chủ app dán một lần.
const secrets = wrangler(['pages', 'secret', 'list', '--project-name', PROJECT])
if (secrets.ok && !/\bAI34_API_KEY\b/.test(secrets.out)) {
  console.log('\n[Khoa mac dinh] App chua co khoa 34AI mac dinh.')
  const done = await askAndSetDefaultKey({ optional: true, target: 'cloudflare' })
  console.log(done ? '[Khoa mac dinh] Xong.' : '[Khoa mac dinh] Chua dat. Co the chay cai-dat-34ai.cmd sau.')
} else if (secrets.ok) console.log('[Khoa mac dinh] App da co khoa 34AI mac dinh.')

// 2. wrangler.toml cho app
writeFileSync(TOML, [
  '# Tao tu dong boi scripts/chuan-bi-kho-khoa.mjs moi lan trien khai. Khong sua tay.',
  '# Cac bien bi mat (AI34_API_KEY, GEMINI_API_KEY) van giu nguyen tren Cloudflare.',
  `name = "${PROJECT}"`,
  'pages_build_output_dir = "dist"',
  'compatibility_date = "2025-06-01"',
  ...(id ? ['', '[[kv_namespaces]]', 'binding = "STUDIO_KV"', `id = "${id}"`] : []),
  '',
].join('\n'))
if (existsSync('MA-CAI-DAT-XUONG.txt')) rmSync('MA-CAI-DAT-XUONG.txt')
console.log(`[Chuan bi] Da ghi ${TOML}: kho khoa ${id ? 'co' : 'CHUA CO'}.`)
