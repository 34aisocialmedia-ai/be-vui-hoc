// "Make a game from an idea": a parent types an idea; a 34AI chat model writes a small
// choose-the-right-picture game that the app can play with its own 3D pictures (and the family's photos).
import { PICTURES } from './pictures.js'
import { Ai34Error } from './ai34.js'

const AGES = { '24-36': { label: '2–3 tuổi', questions: 5, choices: 2 }, '3-4': { label: '3–4 tuổi', questions: 6, choices: 3 }, '4-5': { label: '4–5 tuổi', questions: 8, choices: 3 }, '5-6': { label: '5–6 tuổi', questions: 10, choices: 4 } }

/** Validate the parent's request. Photos are labels only ("Bé Na", "Mẹ"); the pictures stay on the device. */
export function validateIdea(body) {
  if (!body || typeof body !== 'object') throw bad('Thiếu nội dung yêu cầu.')
  const idea = typeof body.idea === 'string' ? body.idea.trim() : ''
  if (idea.length < 8 || idea.length > 1500) throw bad('Ý tưởng cần từ 8 đến 1.500 ký tự.')
  if (!AGES[body.age]) throw bad('Chọn lứa tuổi.')
  const childName = typeof body.childName === 'string' ? body.childName.trim().slice(0, 30) : ''
  const photos = Array.isArray(body.photos) ? body.photos : []
  if (photos.length > 6 || photos.some(p => typeof p !== 'string' || !p.trim() || p.length > 40)) throw bad('Tối đa 6 ảnh gia đình, mỗi ảnh một tên ngắn.')
  return { idea, age: body.age, childName, photos: photos.map(p => p.trim()) }
}

/** Chat messages asking for the game as strict JSON. */
export function gameMessages({ idea, age, childName, photos }) {
  const a = AGES[age]
  const pictures = Object.entries(PICTURES).map(([e, n]) => `${e} ${n}`).join('; ')
  const family = photos.length ? `Ảnh gia đình có thể dùng làm hình đáp án (ghi "anh:N"): ${photos.map((p, i) => `anh:${i + 1} = ${p}`).join('; ')}.` : 'Không có ảnh gia đình.'
  return [
    { role: 'system', content: [
      'Bạn là giáo viên mầm non Việt Nam, soạn trò chơi "chọn hình đúng" cho app Bé Vui Học.',
      'Nội dung an toàn, ấm áp, phù hợp trẻ nhỏ; không bạo lực, không đáng sợ, không quảng cáo, không hỏi thông tin cá nhân.',
      'Câu hỏi ngắn, dễ nghe, đọc to được; mỗi câu đúng MỘT đáp án đúng. Bám theo giáo án mầm non: nhận biết, đếm, màu sắc, con vật, đồ dùng, cảm xúc, an toàn, kỹ năng sống.',
      `Chỉ dùng hình trong danh sách này (ghi đúng biểu tượng): ${pictures}.`,
      family,
      'Trả lời DUY NHẤT một đối tượng JSON, không giải thích, theo mẫu:',
      '{"title":"tên trò (≤ 32 ký tự)","intro":"lời mời chơi (≤ 80 ký tự)","icon":"một biểu tượng trong danh sách","questions":[{"text":"câu hỏi (≤ 100 ký tự)","options":[{"label":"tên hình","picture":"🍎","correct":true},{"label":"tên hình","picture":"🍌","correct":false}]}]}',
    ].join('\n') },
    { role: 'user', content: `Lứa tuổi: ${a.label}. Số câu: ${a.questions}. Mỗi câu ${a.choices} lựa chọn.${childName ? ` Tên bé: ${childName}.` : ''}\nÝ tưởng của phụ huynh: ${idea}` },
  ]
}

/** Read the model's answer and keep only what the app can play correctly. */
export function parseGame(content, { age, photos = [] }) {
  const a = AGES[age]
  let raw
  try {
    const text = String(content ?? '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
    raw = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
  } catch { throw bad('AI chưa trả về trò chơi đúng dạng. Hãy bấm tạo lại.') }
  const clean = (v, max) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
  const picture = p => {
    const key = typeof p === 'string' ? p.replace(/️/g, '').trim() : ''
    if (PICTURES[key]) return { emoji: key }
    const m = /^anh:(\d)$/.exec(key)
    if (m && Number(m[1]) >= 1 && Number(m[1]) <= photos.length) return { family: Number(m[1]) - 1 }
    return null
  }
  const questions = []
  for (const q of Array.isArray(raw.questions) ? raw.questions : []) {
    const text = clean(q?.text, 120)
    if (!text) continue
    const seen = new Set(), options = []
    for (const o of Array.isArray(q.options) ? q.options : []) {
      const pic = picture(o?.picture)
      const label = clean(o?.label, 40)
      const id = pic ? (pic.emoji ?? `anh:${pic.family}`) : ''
      if (!pic || !label || seen.has(id)) continue
      seen.add(id)
      options.push({ ...pic, label, correct: o.correct === true })
    }
    const right = options.filter(o => o.correct)
    if (right.length !== 1) continue
    const kept = [right[0], ...options.filter(o => !o.correct).slice(0, a.choices - 1)]
    if (kept.length < 2) continue
    questions.push({ text, options: kept })
    if (questions.length >= a.questions) break
  }
  if (questions.length < Math.min(3, a.questions)) throw bad('AI chưa tạo đủ câu hỏi phù hợp. Hãy viết ý tưởng rõ hơn rồi tạo lại.')
  const icon = picture(raw.icon)?.emoji ?? questions[0].options[0].emoji ?? '⭐'
  return { title: clean(raw.title, 32) || 'Trò chơi của nhà mình', intro: clean(raw.intro, 80) || 'Cùng chơi nhé!', icon, age, questions }
}

function bad(message) { return new Ai34Error(message, { status: 422, code: 'invalid_input' }) }
