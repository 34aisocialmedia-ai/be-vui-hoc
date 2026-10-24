// Hỏi khóa 34AI MẶC ĐỊNH của app và đặt lên máy chủ (Netlify hoặc Cloudflare Pages).
// Đọc khóa bằng một dòng nhập thường (Ctrl+V hoặc chuột phải đều dán được), bỏ ký tự lạ, kiểm tra dạng
// 34ai_live_…, rồi mới gửi đi. Không ghi khóa vào tệp nào.
//   node scripts/dat-khoa-34ai.mjs            → Netlify (mặc định)
//   node scripts/dat-khoa-34ai.mjs cloudflare → Cloudflare Pages
import { createInterface } from 'node:readline'
import { spawnSync } from 'node:child_process'

export const SHAPE = /^34ai_live_[A-Za-z0-9_-]{16,200}$/
export const NETLIFY = ['--yes', 'netlify-cli@27']

/** Ask for a key on one ordinary line; returns the cleaned key, or '' (skipped / gave up). */
export async function askKey({ optional = false } = {}) {
  const ask = () => process.stdout.write(`Dan khoa 34AI (bat dau bang 34ai_live_) roi bam Enter${optional ? ' (bo trong roi Enter de bo qua)' : ''}:\n> `)
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity })
  let attempt = 0
  try {
    ask()
    for await (const raw of rl) {
      const key = raw.replace(/[\s\x00-\x1f\x7f]/g, '')
      if (!key && optional) return ''
      if (SHAPE.test(key)) return key
      if (++attempt >= 3) return ''
      console.log('Khoa chua dung dang 34ai_live_... . Neu Ctrl+V khong dan duoc, bam chuot phai vao cua so de dan.')
      ask()
    }
    return ''
  } finally { rl.close() }
}

const run = (args, options = {}) => spawnSync('npx', args, { shell: process.platform === 'win32', ...options })

export function setOnNetlify(key) {
  const r = run([...NETLIFY, 'env:set', 'AI34_API_KEY', key, '--secret', '--context', 'production', '--force'], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
  if (r.status !== 0) console.log(`Chua dat duoc khoa len Netlify: ${(r.stderr || r.stdout || '').split('\n').find(l => l.trim()) ?? 'loi khong ro'}`)
  return r.status === 0
}
export function setOnCloudflare(key) {
  const r = run(['--yes', 'wrangler@4', 'pages', 'secret', 'put', 'AI34_API_KEY', '--project-name', 'be-vui-hoc-test'], { input: key, stdio: ['pipe', 'inherit', 'inherit'] })
  return r.status === 0
}

export async function askAndSetDefaultKey({ optional = false, target = 'netlify' } = {}) {
  const key = await askKey({ optional })
  if (!key) return false
  const ok = target === 'cloudflare' ? setOnCloudflare(key) : setOnNetlify(key)
  if (ok) console.log(`Da dat khoa 34AI mac dinh: 34ai_live_...${key.slice(-4)}`)
  return ok
}

if (process.argv[1]?.endsWith('dat-khoa-34ai.mjs')) {
  process.exitCode = (await askAndSetDefaultKey({ target: process.argv[2] === 'cloudflare' ? 'cloudflare' : 'netlify' })) ? 0 : 1
}
