import type { AgeId, CurriculumCategory, Game, MatchPair, MatchSide, Option, Question } from '../types'
import { LIFE_ROWS, PICTURES, RELATIONS, RIDDLES, STORIES } from './learningContent'

export const CATEGORY_INFO: Record<CurriculumCategory, { label: string; emoji: string }> = {
  recognition: { label: 'Nhận biết', emoji: '🍎' }, discovery: { label: 'Khám phá', emoji: '🔍' },
  language: { label: 'Ngôn ngữ', emoji: '💬' }, music: { label: 'Âm nhạc', emoji: '🎵' },
  life: { label: 'Kỹ năng sống', emoji: '🤝' }, math: { label: 'Toán', emoji: '🔢' },
  geometry: { label: 'Hình học', emoji: '🔷' }, literature: { label: 'Truyện & thơ', emoji: '📚' },
  letters: { label: 'Chữ cái', emoji: '🔤' },
}

type Kind = 'reveal' | 'collect' | 'path' | 'find' | 'memory' | 'match' | 'sort' | 'count' | 'compare' | 'pattern' | 'sequence' | 'combine' | 'split' | 'order' | 'next' | 'before' | 'riddle' | 'life' | 'size' | 'spatial' | 'rhythm' | 'letter' | 'letter-match'
interface Lesson { title: string; kind: Kind; pool: string; motif?: number[]; limit?: number; direction?: 'ascending' | 'descending'; offset?: number }
type Entry = string | Lesson
interface Group { age: AgeId; category: CurriculumCategory; entries: Entry[] }
const L = (title: string, kind: Kind, pool: string, extra: Partial<Lesson> = {}): Lesson => ({ title, kind, pool, ...extra })
const R = (title: string, motif: number[], pool = 'colors'): Lesson => L(title, 'rhythm', pool, { motif })

/** 24 authored groups, nine lessons each. Strings preserve existing games and saved progress. */
export const CURRICULUM: Group[] = [
  { age: '24-36', category: 'recognition', entries: [
    'a1-thu', 'a1-mau', 'a1-to', 'a1-cothe', 'a1-ghepdoi', 'a1-phanloai-mau', 'a1-memory',
    L('Giỏ quả của bé', 'find', 'fruit'), L('Tủ áo nhỏ xinh', 'find', 'clothes'),
  ] },
  { age: '24-36', category: 'discovery', entries: [
    L('Vuốt mở nông trại', 'reveal', 'farm'), L('Bạn nào sau màn lá?', 'reveal', 'forest'),
    L('Vuốt khám phá đại dương', 'reveal', 'sea'), L('Hôm nay trời thế nào?', 'find', 'weather'),
    L('Khu vườn tí hon', 'find', 'garden'), L('Bạn thú thích món gì?', 'match', 'food'),
    L('Nắng mưa mặc gì?', 'match', 'weather'), L('Hai giỏ rau và quả', 'sort', 'fruit-vegetables'),
    L('Xe nào trốn sau thẻ?', 'memory', 'transport'),
  ] },
  { age: '24-36', category: 'language', entries: [
    'a1-kemvat', 'a1-dovat', L('Chiếc túi đi học', 'find', 'school'), L('Bé gọi tên đồ bếp', 'find', 'kitchen'),
    L('Đố bé con gì?', 'riddle', 'animals'), L('Mắt nhìn tai nghe', 'match', 'senses'),
    L('Hoa rồi đến quả', 'order', 'garden'), L('Bé nghe và chỉ đồ vật', 'riddle', 'objects'),
    L('Đôi bạn đồ chơi', 'memory', 'toys'),
  ] },
  { age: '24-36', category: 'music', entries: [
    R('Giọt mưa tí tách', [0, 1], 'natureSounds'), R('Trống nhỏ của bé', [0, 0], 'instruments'),
    R('Chuông đỏ chuông vàng', [0, 1]), R('Bạn chim gọi nhau', [2, 0], 'natureSounds'),
    R('Gõ cùng gấu bông', [1, 2], 'toys'), R('Bóng nảy theo nhạc', [1, 1, 0], 'toys'),
    R('Lá reo trong gió', [1, 0, 1], 'garden'), L('Bé tìm nhạc cụ', 'find', 'instruments'),
    L('Lật thẻ ban nhạc', 'memory', 'instruments'),
  ] },
  { age: '24-36', category: 'life', entries: [
    'a1-camxuc', 'a1-chao', 'a1-antoan', L('Bé sạch thơm', 'life', 'hygiene'),
    L('Cất áo cất đồ chơi', 'sort', 'clothes-toys'), L('Một ngày của bé', 'order', 'daily'),
    L('Bé chăm cây xanh', 'life', 'environment'), L('Hai khuôn mặt giống nhau', 'memory', 'emotion'),
    L('Bé tìm đồ dùng vệ sinh', 'find', 'safety'),
  ] },
  { age: '3-4', category: 'math', entries: [
    'b1-dem5', 'b1-sosanh', 'b1-ghepdoi-so', 'b1-tau-so', 'b1-can-thangbang',
    L('Tự hái dâu vào giỏ', 'collect', '🍓', { limit: 5 }), L('Hai giỏ táo gộp lại', 'combine', '🍎', { limit: 5 }),
    L('Chuỗi quả xen kẽ', 'pattern', 'fruit'), L('Chia dâu cho hai bạn', 'split', '🍓', { limit: 5 }),
  ] },
  { age: '3-4', category: 'geometry', entries: [
    'b1-hinh', L('Hình nào thành đồ vật?', 'match', 'shapes'), L('Lật tìm hình giống nhau', 'memory', 'shapes'),
    L('Nhà của hình tròn vuông', 'sort', 'shapes'), L('Miếng ghép tiếp theo', 'pattern', 'shapes'),
    L('Táo to táo nhỏ', 'size', 'fruit'), L('Xe to xe nhỏ', 'size', 'transport'),
    L('Bóng ở trên hay dưới?', 'spatial', 'toys'), L('Bông hoa bên nào?', 'spatial', 'garden'),
  ] },
  { age: '3-4', category: 'discovery', entries: [
    'b1-nghe', 'b1-hanoi', 'b1-khaiquat', L('Mở cửa đại dương', 'reveal', 'sea'),
    L('Thỏ tìm bạn trong vườn', 'path', 'insects'), L('Chọn xe cứu hộ', 'find', 'rescue'),
    L('Nhà của bạn thú', 'match', 'homes'), L('Rau và quả vào giỏ', 'sort', 'fruit-vegetables'),
    L('Vòng đời gà và bướm', 'order', 'garden'),
  ] },
  { age: '3-4', category: 'literature', entries: [
    L('Tìm tranh mở đầu chuyến đi', 'before', 'journey'), L('Đố vui bạn thú', 'riddle', 'animals'), L('Chiếc hộp câu đố', 'riddle', 'objects'),
    L('Đố vui ngoài vườn', 'riddle', 'nature'), L('Bé xếp chuyện buổi sáng', 'order', 'daily'),
    L('Chuyến đi bằng tranh', 'order', 'journey'), L('Sau đó chuyện gì?', 'next', 'garden'),
    L('Trước đó là gì?', 'before', 'daily'), L('Nhân vật trong rừng', 'memory', 'forest'),
  ] },
  { age: '3-4', category: 'music', entries: [
    'b1-nhaccu', R('Tiếng bước bạn thỏ', [0, 1, 0], 'pets'), R('Hạt mưa nhảy múa', [0, 0, 1], 'natureSounds'),
    R('Ban nhạc sắc màu', [0, 1, 2]), R('Trống và đàn trò chuyện', [0, 2, 0], 'instruments'),
    R('Đoàn xe theo nhịp', [0, 0, 2], 'transport'), R('Hoa nở theo nhạc', [0, 1, 1], 'garden'),
    L('Bạn nhạc cụ trốn đâu?', 'memory', 'instruments'), L('Nhạc cụ nào cô gọi?', 'find', 'instruments'),
  ] },
  { age: '3-4', category: 'life', entries: [
    'b1-nguyhiem', 'b1-camxuc', 'b1-loihay', 'b1-traffic', 'b1-phanloai-rac',
    L('Bé tự chăm bản thân', 'life', 'hygiene'), L('Tủ đồ ngăn nắp', 'sort', 'clothes-school'),
    L('Mặc đồ hợp thời tiết', 'match', 'weather'), L('Chăm sóc vườn lớp', 'life', 'environment'),
  ] },
  { age: '4-5', category: 'math', entries: [
    'c1-dem10', 'c1-sosanh', 'c1-quyluat', 'c1-thu', 'c1-can-thangbang', 'c1-dots',
    L('Thu hoạch táo', 'collect', '🍎', { limit: 5 }), L('Tách giỏ dâu', 'split', '🍓', { limit: 5 }),
    L('Bậc thang số', 'sequence', '🍎', { limit: 5 }),
  ] },
  { age: '4-5', category: 'geometry', entries: [
    'c1-khopbong', L('Đồ vật giống hình nào?', 'match', 'shapes'), L('Hộp hình bí mật', 'memory', 'shapes'),
    L('Xếp hình vào ngăn', 'sort', 'shapes'), L('Quy luật miếng ghép', 'pattern', 'shapes'),
    L('Gấu bông trái phải', 'spatial', 'toys'), L('Xe quanh ngôi nhà', 'spatial', 'transport'),
    L('Hoa to hoa nhỏ', 'size', 'garden'), L('Vị trí quả trên bàn', 'spatial', 'fruit'),
  ] },
  { age: '4-5', category: 'discovery', entries: [
    'c1-nghe', 'c1-hanoi', 'c1-ghepdoi-nghe', 'c1-phanloai-dongvat',
    L('Nhà của muông thú', 'match', 'homes'), L('Thời tiết và đồ dùng', 'match', 'weather'),
    L('Bé làm nhà thực vật', 'order', 'garden'), L('Mê cung vườn bướm', 'path', 'insects'),
    L('Phương tiện bay hay chạy?', 'sort', 'land-air'),
  ] },
  { age: '4-5', category: 'literature', entries: [
    'c1-khaiquat', L('Trí nhớ bạn thú', 'memory', 'forest'), L('Người kể chuyện nhí', 'order', 'daily'),
    L('Chuyến phiêu lưu bằng tranh', 'order', 'journey'), L('Đoán đoạn kết', 'next', 'journey'),
    L('Điều xảy ra trước', 'before', 'garden'), L('Bạn thú trong câu đố', 'riddle', 'animals'),
    L('Đồ vật trong câu đố', 'riddle', 'objects'), L('Thiên nhiên biết nói', 'riddle', 'nature'),
  ] },
  { age: '4-5', category: 'music', entries: [
    R('Dàn trống tí hon', [0, 1, 0, 2], 'instruments'), R('Mưa rơi bốn nhịp', [0, 0, 1, 2], 'natureSounds'),
    R('Nhạc trưởng sắc màu', [0, 1, 2, 1]), R('Giai điệu khu rừng', [0, 2, 1, 0], 'forest'),
    R('Đoàn tàu nhịp nhàng', [0, 0, 2, 2], 'transport'), R('Vườn hoa hòa tấu', [0, 1, 1, 2], 'garden'),
    R('Quả ngọt ngân vang', [0, 2, 2, 1], 'fruit'), L('Ghi nhớ dàn nhạc', 'memory', 'instruments'),
    L('Khám phá nhạc cụ', 'find', 'instruments'),
  ] },
  { age: '4-5', category: 'life', entries: [
    'c1-nhomchat', 'c1-khancap', 'c1-ungxu', 'c1-moitruong', L('Nếp sống sạch sẽ', 'life', 'hygiene'),
    L('Chuẩn bị đến trường', 'order', 'hygiene'), L('Cất sách và quần áo', 'sort', 'school-clothes'),
    L('Chọn đồ dùng an toàn', 'find', 'safety'), L('Gọi tên cảm xúc', 'find', 'emotion'),
  ] },
  { age: '5-6', category: 'math', entries: [
    'd1-ghepdoi-so', 'd1-memory-so', 'd1-so-thutu', 'd1-quyluat-qua',
    L('Gom dâu đủ đơn hàng', 'collect', '🍓', { limit: 10 }), L('So sánh hai vườn táo', 'compare', '🍎', { limit: 10 }),
    L('Gộp quả ở cửa hàng', 'combine', '🍓', { limit: 10 }), L('Tách táo chia phần', 'split', '🍎', { limit: 10 }),
    L('Đếm ngược về nhà', 'sequence', '🍓', { limit: 10, direction: 'descending' }),
  ] },
  { age: '5-6', category: 'letters', entries: [
    'd1-chucai-e', 'd1-chucai-u', 'c1-chucai-a', 'b1-chucai-o',
    L('Vườn chữ B C D Đ', 'letter', 'BCDĐ'), L('Vườn chữ L M N T', 'letter', 'LMNT'),
    L('Vườn chữ G H I K', 'letter', 'GHIK'), L('Vườn chữ P Q R S V X Y', 'letter', 'PQRSVXY'),
    L('Ghép chữ hoa chữ thường', 'letter-match', 'AĂÂOÔƠEÊUƯ'),
  ] },
  { age: '5-6', category: 'geometry', entries: [
    L('Khối cầu, trụ, vuông, hộp', 'find', 'solids'), L('Trí nhớ khối hình', 'memory', 'solids'),
    L('Sắp xếp khối vào ngăn', 'sort', 'solids'), L('Quy luật ba khối', 'pattern', 'solids'),
    L('Bản đồ khu đồ chơi', 'spatial', 'toys'), L('Bản đồ vườn quả', 'spatial', 'fruit'),
    L('Bản đồ thành phố', 'spatial', 'transport'), L('So kích thước muông thú', 'size', 'forest'),
    L('Bông hoa quanh tâm vườn', 'spatial', 'garden'),
  ] },
  { age: '5-6', category: 'discovery', entries: [
    L('Nhà khoa học trong vườn', 'order', 'garden'), L('Thám hiểm vườn côn trùng', 'path', 'insects'),
    L('Ai làm nghề này?', 'match', 'jobs'), L('Nhà ở của muông thú', 'match', 'homes'),
    L('Bầu trời và đường phố', 'sort', 'land-air'), L('Thực phẩm rau hay quả?', 'sort', 'fruit-vegetables'),
    L('Du lịch Hà Nội bằng ảnh', 'find', 'hanoi'), L('Người bạn và món ăn', 'match', 'food'),
    L('Quan sát thời tiết', 'match', 'weather'),
  ] },
  { age: '5-6', category: 'literature', entries: [
    L('Xếp chuyện sinh hoạt', 'order', 'daily'), L('Xếp chuyện chuyến đi', 'order', 'journey'),
    L('Dự đoán đoạn kết', 'next', 'journey'), L('Tìm tranh mở đầu', 'before', 'journey'),
    L('Chuyện cây lớn lên', 'next', 'garden'), L('Chuyện trước bữa sáng', 'before', 'daily'),
    L('Câu đố người bạn thú', 'riddle', 'animals'), L('Câu đố đồ vật quen', 'riddle', 'objects'),
    L('Câu đố thiên nhiên', 'riddle', 'nature'),
  ] },
  { age: '5-6', category: 'music', entries: [
    R('Nhạc trưởng năm nhịp', [0, 1, 2, 1, 0]), R('Dàn nhạc vui của bé', [0, 2, 1, 2, 0], 'instruments'),
    R('Khúc nhạc mưa và gió', [0, 0, 1, 2, 1], 'natureSounds'), R('Nhịp rừng xanh', [0, 1, 1, 2, 0], 'forest'),
    R('Giai điệu đoàn xe', [0, 2, 2, 1, 0], 'transport'), R('Bản hòa tấu vườn hoa', [0, 1, 2, 2, 1], 'garden'),
    R('Nhịp điệu trái cây', [0, 2, 1, 1, 2], 'fruit'), L('Trí nhớ ban nhạc', 'memory', 'instruments'),
    L('Nhạc cụ trong phòng hát', 'find', 'instruments'),
  ] },
  { age: '5-6', category: 'life', entries: [
    L('Tự chăm mình mỗi ngày', 'life', 'hygiene'), L('Bé biết nhờ giúp đỡ', 'life', 'safety'),
    L('Lớp học biết sẻ chia', 'life', 'friends'), L('Đội bảo vệ môi trường', 'life', 'environment'),
    L('Tủ đồ chuẩn bị đi học', 'sort', 'school-clothes'), L('Ghi nhớ gương mặt cảm xúc', 'memory', 'emotion'),
    L('Thói quen tốt theo tranh', 'order', 'hygiene'), L('Giác quan và công việc', 'match', 'senses'),
    L('Trang phục cho chuyến đi', 'life', 'seasonal'),
  ] },
]

const AGE_LEVEL: Record<AgeId, number> = { '24-36': 1, '3-4': 2, '4-5': 3, '5-6': 4 }
const NUM = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười']
const safePool = (name: string) => {
  const pool = PICTURES[name]
  if (!pool) throw new Error('Thiếu kho hình: ' + name)
  return pool
}
function mtFor(age: AgeId, category: CurriculumCategory, kind: Kind): string[] {
  if (age === '24-36') return category === 'music' ? ['MT44'] : category === 'language' ? (kind === 'order' ? ['MT24', 'MT26'] : ['MT25']) : category === 'life' ? ['MT41', 'MT43'] : ['MT21', 'MT22']
  if (category === 'letters') return ['MT79']
  if (category === 'math') return [kind === 'combine' ? ({ '3-4': 'MT32', '4-5': 'MT36', '5-6': 'MT38' })[age]
    : kind === 'split' ? ({ '3-4': 'MT33', '4-5': 'MT37', '5-6': 'MT39' })[age]
    : ({ '3-4': 'MT30', '4-5': 'MT34', '5-6': 'MT36' })[age]]
  if (category === 'music') return [({ '3-4': 'MT86', '4-5': 'MT102', '5-6': 'MT112' })[age]]
  if (category === 'geometry') return [kind === 'spatial' ? ({ '3-4': 'MT37', '4-5': 'MT44', '5-6': 'MT48' })[age] : kind === 'size' ? ({ '3-4': 'MT35', '4-5': 'MT41', '5-6': 'MT46' })[age] : ({ '3-4': 'MT36', '4-5': 'MT42', '5-6': 'MT47' })[age]]
  if (category === 'literature') return [({ '3-4': 'MT61', '4-5': 'MT71', '5-6': 'MT75' })[age]]
  // These are curricular anchors, not a claim that screen play assesses the whole goal.
  return []
}

export function buildLesson(age: AgeId, category: CurriculumCategory, spec: Lesson, id: string): Game {
  const level = AGE_LEVEL[age]
  const choices = level === 1 ? 2 : 3
  const base: Game = { id, title: spec.title, age, category, domain: category === 'music' ? 'tham_my' : category === 'life' ? 'xa_hoi'
    : ['language', 'literature', 'letters'].includes(category) ? 'ngon_ngu' : 'nhan_thuc', icon: CATEGORY_INFO[category].emoji,
    mt: mtFor(age, category, spec.kind), engine: 'G01', scene: category === 'music' ? 'room' : 'farm', questions: [],
    objective: `${CATEGORY_INFO[category].label}: ${spec.title}` }
  const opt = (card: MatchSide, correct: boolean, i: number, extra: Partial<Option> = {}): Option => ({ ...card, id: `${id}-o${i}`, correct, ...extra })
  const question = (i: number, text: string, answer: MatchSide, distractors: MatchSide[], extra: Partial<Question> = {}): Question => ({
    id: `${id}-q${i}`, text, options: [opt(answer, true, i * 10), ...distractors.slice(0, choices - 1).map((card, j) => opt(card, false, i * 10 + j + 1))], ...extra,
  })
  const number = (n: number): MatchSide => ({ emoji: String(n), label: NUM[n] })
  const numberQ = (i: number, n: number, text: string, extra: Partial<Question>, limit: number) => question(i, text, number(n),
    Array.from({ length: limit }, (_, k) => k + 1).filter(k => k !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n)).map(number), extra)
  const poolQs = (pool: MatchSide[], text: (card: MatchSide, i: number) => string) => Array.from({ length: 10 }, (_, i) => {
    const card = pool[(i + (spec.offset ?? 0)) % pool.length]
    return question(i, text(card, i), card, pool.filter(c => c !== card).slice().sort((a, b) => (pool.indexOf(a) + i) % pool.length - (pool.indexOf(b) + i) % pool.length))
  })

  if (['find', 'memory', 'size', 'reveal', 'path'].includes(spec.kind)) {
    const pool = safePool(spec.pool)
    if (spec.kind === 'reveal') base.engine = 'REVEAL'
    if (spec.kind === 'path') base.engine = 'PATH'
    if (['find', 'reveal', 'path'].includes(spec.kind)) base.questions = poolQs(pool, (card, i) => `${['Con tìm', 'Đâu là', 'Con chạm vào'][i % 3]} ${card.label} nhé!`)
    if (spec.kind === 'size') base.questions = Array.from({ length: 10 }, (_, i) => {
      const card = pool[i % pool.length], big = i % 2 === 0
      return { id: `${id}-q${i}`, text: `Con chọn ${card.label} ${big ? 'to' : 'nhỏ'} nhé!`, options: [
        opt({ ...card, label: `${card.label} to` }, big, i * 2, { scale: 1.25 }),
        opt({ ...card, label: `${card.label} nhỏ` }, !big, i * 2 + 1, { scale: .65 }),
      ] }
    })
    if (spec.kind === 'memory') {
      base.engine = 'MEMORY'; base.prompt = 'Con lật tìm hai hình giống nhau nhé!'
      base.rounds = groupPairs(Array.from({ length: 10 }, (_, i) => ({ id: `${id}-p${i}`, left: pool[i % pool.length], right: pool[i % pool.length] })), level + 1)
    }
  } else if (spec.kind === 'letter') {
    base.engine = 'ALPHABET'
    const letters = Array.from(spec.pool)
    base.questions = Array.from({ length: 10 }, (_, i) => ({ id: `${id}-q${i}`, text: `Con hái chữ ${letters[(i * 2 + Math.floor(i / letters.length)) % letters.length]} nhé!`,
      options: letters.map((letter, j) => opt({ label: letter, emoji: '🍎' }, letter === letters[(i * 2 + Math.floor(i / letters.length)) % letters.length], i * 10 + j)),
    }))
  } else if (spec.kind === 'match' || spec.kind === 'letter-match') {
    base.engine = 'G02'; base.prompt = spec.kind === 'letter-match' ? 'Con ghép chữ hoa với chữ thường nhé!' : 'Con ghép hai hình có liên quan nhé!'
    const relations: [MatchSide, MatchSide][] = spec.kind === 'letter-match' ? Array.from(spec.pool).map(letter => [{ emoji: letter, label: letter }, { emoji: letter.toLowerCase(), label: letter.toLowerCase() }]) : RELATIONS[spec.pool]
    if (!relations) throw new Error('Thiếu quan hệ: ' + spec.pool)
    base.rounds = groupPairs(Array.from({ length: 10 }, (_, i) => {
      const [left, right] = relations[(i + (spec.offset ?? 0)) % relations.length]
      return { id: `${id}-p${i}`, left, right }
    }), level === 1 ? 2 : 3)
  } else if (spec.kind === 'sort') {
    base.engine = 'G03'; base.prompt = 'Con đưa hình vào đúng giỏ nhé!'
    const pools = ['shapes', 'solids'].includes(spec.pool) ? [spec.pool] : spec.pool === 'land-air' ? ['transport'] : spec.pool.split('-')
    if (['shapes', 'solids'].includes(spec.pool)) {
      base.baskets = safePool(spec.pool).slice(0, level === 1 ? 2 : level === 4 ? 4 : 3).map((c, i) => ({ ...c, id: `${id}-b${i}` }))
      base.items = Array.from({ length: 10 }, (_, i) => ({ ...base.baskets![i % base.baskets!.length], id: `${id}-i${i}`, to: base.baskets![i % base.baskets!.length].id }))
    } else if (spec.pool === 'land-air') {
      base.baskets = [{ id: 'land', emoji: '🛣️', label: 'Trên đường' }, { id: 'air', emoji: '☁️', label: 'Trên trời' }]
      const vehicles = [...safePool('transport').filter(card => !['🚢', '✈️'].includes(card.emoji)), { emoji: '✈️', label: 'máy bay' }, { emoji: '🚁', label: 'trực thăng' }]
      base.items = Array.from({ length: 10 }, (_, i) => ({ ...vehicles[i % vehicles.length], id: `${id}-i${i}`, to: ['✈️', '🚁'].includes(vehicles[i % vehicles.length].emoji) ? 'air' : 'land' }))
    } else {
      base.baskets = pools.map((name, i) => ({ id: `${id}-b${i}`, emoji: safePool(name)[0].emoji, label: ({ fruit: 'Quả', vegetables: 'Rau củ', toys: 'Đồ chơi', clothes: 'Quần áo', school: 'Đồ đi học' } as Record<string, string>)[name] }))
      base.items = Array.from({ length: 10 }, (_, i) => {
        const basket = i % pools.length, pool = safePool(pools[basket])
        return { ...pool[Math.floor(i / pools.length) % pool.length], id: `${id}-i${i}`, to: base.baskets![basket].id }
      })
    }
  } else if (['count', 'collect', 'compare', 'combine', 'split', 'sequence'].includes(spec.kind)) {
    if (spec.kind === 'collect') base.engine = 'COLLECT'
    const limit = spec.limit ?? (level < 3 ? 5 : 10), e = spec.pool
    base.questions = Array.from({ length: 10 }, (_, i) => {
      const n = i % limit + 1
      if ((spec.kind === 'count' || spec.kind === 'collect')) return numberQ(i, n, 'Có mấy quả? Con cùng đếm nhé!', { groups: [Array(n).fill(e)] }, limit)
      if (spec.kind === 'sequence') {
        const start = Math.min(Math.max(1, n - 1), limit - 2), values = [start, start + 1, start + 2]
        if (spec.direction === 'descending') values.reverse()
        return numberQ(i, n, 'Con tìm số còn thiếu nhé!', { sequence: values.map(v => v === n ? null : v) }, limit)
      }
      if (spec.kind === 'compare') {
        const a = n, b = n === limit ? limit - 1 : n + (i % (limit - n) + 1), more = i % 2 === 0
        return { id: `${id}-q${i}`, text: `Giỏ nào ${more ? 'nhiều' : 'ít'} hơn?`, options: [a, b].map((amount, j) => opt({ label: `${NUM[amount]} quả`, emoji: e.repeat(amount) }, amount === (more ? Math.max(a, b) : Math.min(a, b)), i * 2 + j, { say: '' })) }
      }
      const total = 2 + i % (limit - 1), a = 1 + i % (total - 1), b = total - a
      return spec.kind === 'combine'
        ? numberQ(i, total, 'Hai giỏ gộp lại có mấy quả?', { groups: [Array(a).fill(e), Array(b).fill(e)] }, limit)
        : numberQ(i, b, `Có ${NUM[total]} quả. Một bạn có ${NUM[a]} quả. Bạn còn lại có mấy quả?`, { groups: [Array(total).fill(e), Array(a).fill(e)] }, limit)
    })
  } else if (spec.kind === 'pattern') {
    const pool = safePool(spec.pool).slice(0, 3)
    base.questions = Array.from({ length: 10 }, (_, i) => {
      const a = pool[i % pool.length], b = pool[(i + 1) % pool.length], c = pool[(i + 2) % pool.length]
      const unit = level < 3 ? [a, b] : level === 3 ? (i % 2 ? [a, a, b] : [a, b, b]) : (i % 2 ? [a, b, c] : [a, a, b])
      const run = [...unit, ...unit], answer = run.pop()!
      return question(i, 'Hình nào tiếp theo?', answer, pool.filter(card => card !== answer), { pattern: run.map(card => card.emoji) })
    })
  } else if (['order', 'next', 'before'].includes(spec.kind)) {
    const stories = STORIES[spec.pool]
    if (!stories) throw new Error('Thiếu chuyện tranh: ' + spec.pool)
    if (spec.kind === 'order') base.engine = 'ORDER'
    base.questions = Array.from({ length: 10 }, (_, i) => {
      const source = stories[(i + (spec.offset ?? 0)) % stories.length]
      const steps = level === 1 ? source.slice(0, 2) : source
      const asked = spec.kind === 'before' ? 0 : steps.length - 1, answer = steps[asked]
      if (spec.kind === 'order') return { id: `${id}-q${i}`, text: 'Con xếp tranh từ trước đến sau nhé!', steps, options: [] }
      const distractors = stories.flat().filter(card => card.emoji !== answer.emoji && !steps.some(step => step.emoji === card.emoji))
        .filter((card, j, all) => all.findIndex(c => c.emoji === card.emoji) === j)
      return question(i, spec.kind === 'next' ? 'Tiếp theo là tranh nào?' : 'Trước đó là tranh nào?', answer, distractors.slice(i % 3),
        { pattern: steps.filter((_, j) => j !== asked).map(card => card.emoji), patternBlank: spec.kind === 'before' ? 'start' : 'end' })
    })
  } else if (spec.kind === 'riddle') {
    const riddles = RIDDLES[spec.pool]
    const extraPictures = [{ emoji: '🐢', label: 'rùa' }, { emoji: '⏰', label: 'đồng hồ' }, { emoji: '☂️', label: 'ô' }, { emoji: '💧', label: 'nước' }, { emoji: '🌙', label: 'mặt trăng' }]
    const all = [...Object.values(PICTURES).flat(), ...extraPictures, ...Object.values(STORIES).flat(2)]
    const riddleCard = (emoji: string) => {
      const card = all.find(c => c.emoji === emoji)
      if (!card) throw new Error('Câu đố thiếu hình được biên tập: ' + emoji)
      return card
    }
    base.questions = riddles.map(([text, emoji], i) => {
      return question(i, text, riddleCard(emoji), riddles.filter(row => row[1] !== emoji).slice(i % 4, i % 4 + choices).map(row => riddleCard(row[1])))
    })
  } else if (spec.kind === 'life') {
    base.questions = LIFE_ROWS[spec.pool].map(([text, answer, wrong], i) => question(i, text, answer, [wrong]))
  } else if (spec.kind === 'spatial') {
    base.engine = 'SPATIAL'
    const pool = safePool(spec.pool), positions = level === 2 ? ['above', 'below'] as const : ['above', 'below', 'left', 'right'] as const
    const coords = { above: [50, 18], below: [50, 82], left: [18, 50], right: [82, 50] }
    const words = { above: 'phía trên', below: 'phía dưới', left: 'bên trái', right: 'bên phải' }
    base.questions = Array.from({ length: 10 }, (_, i) => {
      const position = positions[i % positions.length], card = pool[i % pool.length]
      return { id: `${id}-q${i}`, text: `Con tìm ${card.label} ${words[position]} ngôi nhà nhé!`, position,
        reference: { emoji: '🏠', label: 'ngôi nhà' }, options: positions.map((p, j) => opt({ ...card, label: `${card.label} ${words[p]}` }, p === position, i * 10 + j, { x: coords[p][0], y: coords[p][1], say: '' })),
      }
    })
  } else if (spec.kind === 'rhythm') {
    base.engine = 'RHYTHM'; base.scene = 'room'; base.pads = safePool(spec.pool).slice(0, level === 1 ? 3 : 4)
    const motif = spec.motif ?? [0, 1, 0]
    base.questions = Array.from({ length: 10 }, (_, i) => ({ id: `${id}-q${i}`, text: 'Con nghe rồi gõ theo nhé!', options: [],
      notes: motif.slice(0, level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 4 : 5).map((n, j) => (n + (i < 3 ? 0 : Math.floor(i / 3)) + (i % 3 === 2 && level > 2 ? j % 2 : 0)) % base.pads!.length),
    }))
  }
  return base
}

/** Never put visually indistinguishable cards in one matching round. */
function groupPairs(pairs: MatchPair[], size: number): MatchPair[][] {
  const rounds: MatchPair[][] = []
  for (const pair of pairs) {
    const last = rounds[rounds.length - 1]
    if (!last || last.length >= size || last.some(p => JSON.stringify(p.left) === JSON.stringify(pair.left) || JSON.stringify(p.right) === JSON.stringify(pair.right))) rounds.push([pair])
    else last.push(pair)
  }
  return rounds
}

export function expandCurriculum(existing: Game[]): Game[] {
  const legacy = new Map(existing.map(g => [g.id, g]))
  const used = new Set<string>()
  const result = CURRICULUM.flatMap(group => group.entries.map((entry, i) => {
    if (typeof entry !== 'string') return buildLesson(group.age, group.category, entry, `plan-${group.age}-${group.category}-${i + 1}`)
    const game = legacy.get(entry)
    if (!game || game.age !== group.age || used.has(entry)) throw new Error('Danh mục cũ không hợp lệ: ' + entry)
    used.add(entry)
    if (game.engine === 'MUSIC') return { ...buildLesson(game.age, group.category, R(game.title, [0, 1, 2], 'instruments'), game.id), icon: game.icon }
    return normalizeLegacy({ ...game, category: group.category, objective: game.title })
  }))
  for (const game of existing) if (!used.has(game.id)) throw new Error('Trò chưa được phân nhóm: ' + game.id)
  return result
}

function normalizeLegacy(game: Game): Game {
  if (['G02', 'MEMORY', 'PUZZLE'].includes(game.engine)) {
    const pool = game.rounds!.flat()
    return { ...game, rounds: groupPairs(Array.from({ length: 10 }, (_, i) => ({ ...pool[i % pool.length], id: `${game.id}-pair${i}` })), game.age === '24-36' ? 2 : 3) }
  }
  if (!game.questions.length) return game // Specialist engines have ten authored rounds in gameLogic.
  return { ...game, questions: Array.from({ length: 10 }, (_, i) => {
    const q = game.questions[i % game.questions.length]
    return { ...q, id: `${game.id}-q${i}`, options: q.options.map((o, j) => ({ ...o, id: `${game.id}-q${i}-o${j}` })) }
  }) }
}
