import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.ts'
import { CATEGORY_INFO } from '../src/data/curriculum.ts'
import { DOT_LEVELS, SCALE_QUESTIONS, TRAIN_ROUNDS } from '../src/gameLogic.ts'
import { AGES } from '../src/types.ts'
import { REWARDS } from '../src/store.ts'
import { TEACHER_INTRO, CORRECT_FEEDBACK, RETRY_FEEDBACK, FINISH_FEEDBACK } from '../src/teacherVoice.ts'

// Use the same lookup normalization as src/audio.ts. Only dialogue that can be
// spoken by the current app belongs here; the old manifest has unused entries.
export const normalize = text => text.trim().toLowerCase().replace(/\s+/g, ' ')
const phrases = new Map()
function add(text, source) {
  if (typeof text !== 'string' || !text.trim()) return
  const key = normalize(text)
  if (!phrases.has(key)) phrases.set(key, { key, text: text.trim(), sources: [] })
  const entry = phrases.get(key)
  if (!entry.sources.includes(source)) entry.sources.push(source)
}

for (const text of [TEACHER_INTRO, ...CORRECT_FEEDBACK, ...RETRY_FEEDBACK, FINISH_FEEDBACK]) add(text, 'teacher')
for (const age of AGES) add(age.label, 'age')
for (const category of Object.values(CATEGORY_INFO)) add(category.label, 'category')
for (const text of [
  'Con chọn một trò nhé!', 'Chào bé! Chọn một hình bên dưới để cùng chơi nhé!',
  'Đã đến giờ nghỉ ngơi rồi! Con hãy đứng dậy vươn vai và uống nước nhé!',
  'Món quà này đang bị khóa, bé hãy chơi thắng để mở nhé!',
  'Chúc mừng con! Hãy chọn một phần quà nhé!', 'Gõ thêm 2 lần nữa để mở quà nào!',
  'Một lần nữa thôi!', 'Bé làm rất tốt! Thỏ vui quá!',
  'Bé ơi cố lên nhé! Cùng chơi thật vui nào!',
  'Con hãy ghép đôi nhé!', 'Con hãy bỏ vào đúng giỏ nhé!',
  'Bé hãy lật tìm hai thẻ giống nhau nhé!',
  'Bé hãy chọn mảnh ghép bên dưới trước nhé!',
  'Bóng này chưa khớp rồi, bé thử lại nhé!',
  'Bé hãy tìm và ghép đúng bóng của các hình nhé!',
  'Bé chạm vào đèn giao thông: Đèn đỏ dừng lại, đèn xanh được đi nhé!',
  'Đèn đỏ rồi, các bạn xe dừng lại ngay ngắn nhé!',
  'Đèn đỏ dừng lại. Đèn xanh được đi. Bé chạm đèn xanh để cho xe đi nhé!',
  'Mời bé cùng nghe giai điệu Kìa Con Bướm Vàng nhé!',
  'Bé hãy gõ thử các phím đàn xem nào!',
]) add(text, 'interface')
for (const prize of REWARDS) {
  add(`Oa! Chúc mừng con! Con nhận được ${prize.name}!`, 'reward')
  add(`Bé có ${prize.name}! Thật là tuyệt vời!`, 'collection')
}
for (let number = 1; number <= 10; number++) add(String(number), 'number')

for (const game of GAMES) {
  if (game.prompt) add(game.prompt, game.id)
  for (const q of game.questions) {
    add(q.text, game.id)
    for (const option of q.options) if (option.say !== '') add(option.say || option.label, game.id)
    if (q.steps?.length) {
      add(`Con xếp chuyện nhé. ${q.steps.map((step, i) => `${i === 0 ? 'Đầu tiên' : i === q.steps.length - 1 ? 'Cuối cùng' : 'Tiếp theo'}, ${step.label}`).join('. ')}.`, game.id)
      for (const step of q.steps) add(step.label, game.id)
    }
  }
  for (const item of game.items || []) {
    add(item.label, game.id)
    if (game.engine === 'FEED') {
      add(`${game.prompt || 'Bé hãy cho bạn ăn nhé!'}: ${item.label}`, game.id)
      add(game.domain === 'ha_noi' ? `Bé mang ${item.label} tặng Cụ Rùa nhé!` : `Bé mang ${item.label} vào miệng bạn nhé!`, game.id)
    }
  }
  for (const basket of game.baskets || []) add(basket.label, game.id)
  for (const round of game.rounds || []) for (const pair of round) {
    add(pair.left.label, game.id)
    add(pair.right.label, game.id)
  }
  if (game.engine === 'FEED') {
    const petName = game.character?.name || (game.character?.avatar === 'turtle' || game.domain === 'ha_noi' ? 'Rùa Vàng' : game.character?.avatar === 'monkey' ? 'Khỉ Con' : 'Gấu Bắp')
    add(`${petName} không thích món này rồi!`, game.id)
  }
}
for (const q of SCALE_QUESTIONS) add(`Bên nào có ${q.askMore ? 'NHIỀU' : 'ÍT'} ${q.itemLabel} hơn? Bé hãy chạm vào đĩa cân nhé!`, 'scale')
for (const q of TRAIN_ROUNDS) {
  add(`Toa xe cần chở ${q.targetNumber} ${q.itemLabel}! Bé hãy chạm để xếp lên toa nhé!`, 'train')
  add(`Nhiều quá rồi, chỉ cần ${q.targetNumber} thôi nhé!`, 'train')
}
for (const level of DOT_LEVELS) {
  add(`Bé hãy nối các số từ 1 đến ${level.dots.length} để vẽ ${level.name} nhé!`, 'dots')
  add(`Bé nối các số từ 1 đến ${level.dots.length} nhé!`, 'dots')
}

const spokenNumbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười']
const rows = [...phrases.values()].map(row => ({
  ...row,
  transcript: /^\d+$/.test(row.text) && Number(row.text) <= 10 ? spokenNumbers[Number(row.text)] : row.text,
  hash: createHash('sha256').update(row.key).digest('hex').slice(0, 16),
}))
const oldManifest = JSON.parse(readFileSync('public/audio/manifest.json', 'utf8'))
const missingFromOld = rows.filter(row => !oldManifest[row.key]).length
mkdirSync('review', { recursive: true })
writeFileSync('review/co-thuy-corpus.json', JSON.stringify({
  voice: 'Cô Thủy', model: 'gemini-3.8-flash-tts', createdAt: new Date().toISOString(),
  count: rows.length, missingFromOld, rows,
}, null, 2) + '\n')
console.log(`${rows.length} unique active phrases; ${missingFromOld} had no old recording`)
