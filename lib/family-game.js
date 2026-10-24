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

/* ===================== Trò chơi có bé: kịch bản + các cảnh để AI vẽ ===================== */

const SCENE_LIMIT = { '24-36': 4, '3-4': 5, '4-5': 6, '5-6': 6 }
const PERSON_ID = /^(be|p[1-3])$/

/** Validate a "game with my child" request: the people come as ids + names (photos stay on the device). */
export function validatePlanRequest(body) {
  const base = validateIdea({ ...body, photos: [] })
  const people = Array.isArray(body.people) ? body.people : []
  if (!people.length || people.length > 4) throw bad('Cần ảnh của bé (và tối đa 3 người thân).')
  const clean = people.map(p => ({ id: String(p?.id ?? ''), label: typeof p?.label === 'string' ? p.label.replace(/\s+/g, ' ').trim().slice(0, 30) : '' }))
  if (clean.some(p => !PERSON_ID.test(p.id) || !p.label) || !clean.some(p => p.id === 'be') || new Set(clean.map(p => p.id)).size !== clean.length) throw bad('Thông tin người trong ảnh chưa đúng.')
  const theme = typeof body.theme === 'string' ? body.theme.replace(/\s+/g, ' ').trim().slice(0, 80) : ''
  return { ...base, people: clean, theme }
}

/** Chat messages asking for a personal game: questions + scenes (featuring the child / family) to illustrate. */
export function planMessages({ idea, age, childName, people, theme }) {
  const a = AGES[age]
  const max = SCENE_LIMIT[age]
  const pictures = Object.entries(PICTURES).map(([e, n]) => `${e} ${n}`).join('; ')
  const who = people.map(p => `${p.id} = ${p.label}${p.id === 'be' ? ' (em bé, nhân vật chính)' : ''}`).join('; ')
  return [
    { role: 'system', content: [
      'Bạn là giáo viên mầm non Việt Nam kiêm biên kịch, soạn trò chơi "chọn hình đúng" CÁ NHÂN HÓA cho app Bé Vui Học.',
      'Trò chơi có chính em bé (và người thân) xuất hiện trong tranh: app sẽ vẽ các CẢNH bằng AI dựa trên ảnh thật của từng người.',
      `Người có ảnh: ${who}. Gọi em bé bằng tên "${childName || people.find(p => p.id === 'be').label}".`,
      'Nội dung an toàn, ấm áp, đúng giáo án mầm non (nhận biết, kỹ năng sống, vệ sinh, an toàn, cảm xúc, gia đình, nghề nghiệp, con vật, màu sắc, đếm...). Không bạo lực, không đáng sợ, không quảng cáo.',
      `Tạo tối đa ${max} CẢNH. Mỗi cảnh: id ("c1", "c2"...), mô tả ngắn cụ thể bằng tiếng Việt cho họa sĩ (ai, đang làm gì, ở đâu, cầm vật gì), danh sách người xuất hiện (id ở trên; có thể rỗng nếu chỉ là đồ vật), và một biểu tượng dự phòng trong danh sách hình.`,
      'Mô tả cảnh CHỈ nói hành động, nơi chốn, đồ vật, cảm xúc. TUYỆT ĐỐI KHÔNG tả ngoại hình người có ảnh (khuôn mặt, màu da, kiểu tóc, màu tóc, tuổi, vóc dáng): ngoại hình lấy từ ảnh thật. Mỗi cảnh tối đa 2 người để mặt đủ lớn và rõ.',
      'Đáp án đúng của phần lớn câu hỏi nên là một CẢNH có em bé. Đáp án sai có thể là cảnh khác hoặc biểu tượng có sẵn. Câu hỏi có thể kèm một cảnh làm "hình câu hỏi" (show) rồi hỏi về cảnh đó. Mỗi cảnh phải được dùng ít nhất một lần.',
      `Biểu tượng có sẵn (ghi đúng biểu tượng): ${pictures}.`,
      'Câu hỏi ngắn, dễ nghe, đọc to được, gọi tên bé. Mỗi câu đúng MỘT đáp án đúng; các đáp án khác nhau rõ ràng.',
      'Trả lời DUY NHẤT một đối tượng JSON, không giải thích, theo mẫu:',
      '{"title":"tên trò (≤ 32 ký tự)","intro":"lời mời chơi (≤ 90 ký tự)","icon":"biểu tượng","cover":{"scene":"cảnh bìa vui có bé","people":["be"]},"scenes":[{"id":"c1","scene":"Bé Na đang đánh răng trước gương","people":["be"],"fallback":"🪥"}],"questions":[{"text":"câu hỏi (≤ 100 ký tự)","show":"c1 hoặc bỏ trống","options":[{"label":"tên đáp án","picture":"c1 hoặc biểu tượng","correct":true}]}]}',
    ].join('\n') },
    { role: 'user', content: `Lứa tuổi: ${a.label}. Số câu: ${a.questions}. Mỗi câu ${a.choices} lựa chọn.${theme ? `\nChủ đề: ${theme}.` : ''}\nÝ tưởng của phụ huynh: ${idea}` },
  ]
}

/** Read the model's plan and keep only what can be drawn and played correctly. */
export function parsePlan(content, { age, people }) {
  const a = AGES[age]
  const max = SCENE_LIMIT[age]
  let raw
  try {
    const text = String(content ?? '').replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
    raw = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
  } catch { throw bad('AI chưa trả về kịch bản đúng dạng. Hãy bấm tạo lại.') }
  const clean = (v, n) => typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : ''
  const ids = new Set(people.map(p => p.id))
  const whoOf = list => (Array.isArray(list) ? list : []).map(String).filter((p, i, all) => ids.has(p) && all.indexOf(p) === i)
  const emojiOf = p => { const key = typeof p === 'string' ? p.replace(/️/g, '').trim() : ''; return PICTURES[key] ? key : null }

  const scenes = new Map()
  for (const s of Array.isArray(raw.scenes) ? raw.scenes : []) {
    const id = clean(s?.id, 8), scene = clean(s?.scene, 220)
    if (!/^c\d{1,2}$/.test(id) || !scene || scenes.has(id) || scenes.size >= max) continue
    scenes.set(id, { id, scene, people: whoOf(s.people), fallback: emojiOf(s.fallback) ?? '⭐' })
  }
  const picture = p => {
    const key = clean(p, 8)
    if (scenes.has(key)) return { scene: key }
    const e = emojiOf(p)
    return e ? { emoji: e } : null
  }
  const questions = []
  for (const q of Array.isArray(raw.questions) ? raw.questions : []) {
    const text = clean(q?.text, 120)
    if (!text) continue
    const seen = new Set(), options = []
    for (const o of Array.isArray(q.options) ? q.options : []) {
      const pic = picture(o?.picture), label = clean(o?.label, 40)
      const key = pic ? (pic.scene ?? pic.emoji) : ''
      if (!pic || !label || seen.has(key)) continue
      seen.add(key)
      options.push({ ...pic, label, correct: o.correct === true })
    }
    const right = options.filter(o => o.correct)
    if (right.length !== 1) continue
    const kept = [right[0], ...options.filter(o => !o.correct).slice(0, a.choices - 1)]
    if (kept.length < 2) continue
    const show = scenes.has(clean(q.show, 8)) && !kept.some(o => o.scene === clean(q.show, 8)) ? clean(q.show, 8) : undefined
    questions.push({ text, ...(show ? { show } : {}), options: kept })
    if (questions.length >= a.questions) break
  }
  if (questions.length < Math.min(3, a.questions)) throw bad('AI chưa tạo đủ câu hỏi phù hợp. Hãy viết ý tưởng rõ hơn rồi tạo lại.')
  const used = new Set(questions.flatMap(q => [q.show, ...q.options.map(o => o.scene)]).filter(Boolean))
  const keptScenes = [...scenes.values()].filter(s => used.has(s.id))
  if (!keptScenes.length) throw bad('AI chưa đưa bé vào trò chơi. Hãy bấm tạo lại.')
  const coverScene = clean(raw.cover?.scene, 220) || `${people.find(p => p.id === 'be').label} vui vẻ chơi trò "${clean(raw.title, 32)}"`
  const cover = { scene: coverScene, people: whoOf(raw.cover?.people).length ? whoOf(raw.cover?.people) : ['be'] }
  const icon = emojiOf(raw.icon) ?? keptScenes[0].fallback
  return { title: clean(raw.title, 32) || 'Trò chơi của bé', intro: clean(raw.intro, 90) || 'Cùng chơi nhé!', icon, age, cover, scenes: keptScenes, questions }
}
