import type { AgeId, DomainId, Game, MatchPair, Option, Question, SortBasket, SortItem, SceneTheme } from '../types'
import { expandCurriculum } from './curriculum'

/* ------------------------------------------------------------------ *
 *  Bộ sinh câu hỏi từ "kho đồ vật" – giúp có đủ ≥10 câu/game mà không
 *  phải viết tay. Khi có giáo viên biên tập, thay bằng JSON thủ công.
 * ------------------------------------------------------------------ */

interface Item {
  label: string
  emoji: string
  sound?: string
  use?: string
  desc?: string
  tool?: string
  toolLabel?: string
  group?: string
  photo?: string
}

let uid = 0
const nid = () => 'o' + uid++
const O = (label: string, emoji: string, correct = false, extra: Partial<Option> = {}): Option => ({
  id: nid(), label, emoji, correct, ...extra,
})

/** Lấy k phần tử khác `self`, xoay vòng theo seed để mỗi vòng có đáp án nhiễu khác nhau */
function others<T>(arr: T[], self: T, k: number, seed: number): T[] {
  const res: T[] = []
  let i = arr.indexOf(self) + 1 + seed * 2
  let guard = 0
  while (res.length < k && guard++ < arr.length * 3) {
    const c = arr[i++ % arr.length]
    if (c !== self && !res.includes(c)) res.push(c)
  }
  return res
}

const MAXQ = 12

/** Câu hỏi nhận biết: "Đâu là X?" lặp nhiều vòng với cách hỏi khác nhau */
function naming(
  gid: string, pool: Item[], optCount: number, phrasings: ((it: Item) => string)[],
  correctOf: (it: Item) => Option = (it) => O(it.label, it.emoji, true, { photo: it.photo }),
  wrongOf: (it: Item) => Option = (it) => O(it.label, it.emoji, false, { photo: it.photo }),
): Question[] {
  const qs: Question[] = []
  phrasings.forEach((ph, r) => {
    pool.forEach((it) => {
      const wrong = others(pool, it, optCount - 1, r).map(wrongOf)
      qs.push({ id: `${gid}-${qs.length}`, text: ph(it), options: [correctOf(it), ...wrong] })
    })
  })
  return qs.slice(0, MAXQ)
}

/** Câu hỏi tình huống viết tay */
function situations(gid: string, rows: [string, [string, string, boolean][]][]): Question[] {
  return rows.map(([text, opts], i) => ({
    id: `${gid}-${i}`, text, options: opts.map(([l, e, c]) => O(l, e, c)),
  }))
}

const NUM = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười']
const numOpt = (n: number, correct: boolean) => O(NUM[n], String(n), correct)

function counting(gid: string, nums: number[], objs: string[], optCount: number): Question[] {
  return nums.slice(0, MAXQ).map((n, i) => {
    const e = objs[i % objs.length]
    const pool = [...new Set([n, n + 1, n - 1, n + 2, n - 2].filter((x) => x >= 1 && x <= 10))].filter((x) => x !== n)
    const wrong = pool.slice(0, optCount - 1).map((x) => numOpt(x, false))
    return { id: `${gid}-${i}`, text: `Có bao nhiêu ${emojiName[e] ?? 'hình'}?`, show: e.repeat(n), options: [numOpt(n, true), ...wrong] }
  })
}

const emojiName: Record<string, string> = {
  '🍎': 'quả táo', '🐥': 'chú gà con', '⭐': 'ngôi sao', '🎈': 'quả bóng bay', '🌸': 'bông hoa', '🐟': 'con cá', '🚗': 'chiếc xe', '🍓': 'quả dâu',
}

function comparing(gid: string, pairs: [number, number][], objs: string[]): Question[] {
  return pairs.slice(0, MAXQ).map(([a, b], i) => {
    const e = objs[i % objs.length]
    const more = i % 3 !== 2
    const [x, y] = [a, b]
    const want = more ? Math.max(x, y) : Math.min(x, y)
    return {
      id: `${gid}-${i}`,
      text: more ? 'Nhóm nào nhiều hơn?' : 'Nhóm nào ít hơn?',
      options: [x, y].map((n) => O('', e.repeat(n), n === want, { say: '' })),
    }
  })
}

function patterns(gid: string, rows: [string[], string, string[]][]): Question[] {
  return rows.map(([seq, ans, wrong], i) => ({
    id: `${gid}-${i}`,
    text: 'Hình nào đi tiếp?',
    show: seq.join(' ') + ' ❓',
    options: [O('', ans, true, { say: '' }), ...wrong.map((w) => O('', w, false, { say: '' }))],
  }))
}

/* ------------------------------ Kho đồ vật ------------------------------ */
const ANIMALS: Item[] = [
  { label: 'con mèo', emoji: '🐱', sound: 'meo meo', photo: '/assets/photos/cat_real.webp' },
  { label: 'con chó', emoji: '🐶', sound: 'gâu gâu', photo: '/assets/photos/dog_real.webp' },
  { label: 'con gà', emoji: '🐔', sound: 'ò ó o', photo: '/assets/photos/chicken_real.webp' },
  { label: 'con vịt', emoji: '🦆', sound: 'cạp cạp', photo: '/assets/photos/duck_verified_real.webp' },
  { label: 'con bò', emoji: '🐮', sound: 'ùm bò', photo: '/assets/photos/cow_real.webp' },
  { label: 'con lợn', emoji: '🐷', sound: 'ụt ịt' },
  { label: 'con thỏ', emoji: '🐰', photo: '/assets/photos/rabbit_real.webp' },
  { label: 'con voi', emoji: '🐘', photo: '/assets/photos/elephant_real.webp' },
  { label: 'con cá', emoji: '🐟' },
  { label: 'con chim', emoji: '🐦', sound: 'chíp chíp' },
  { label: 'con ếch', emoji: '🐸', sound: 'ộp ộp' },
  { label: 'con ngựa', emoji: '🐴', sound: 'hí hí' },
  { label: 'con cừu', emoji: '🐑', sound: 'be be' },
]
const FRUITS: Item[] = [
  { label: 'quả táo', emoji: '🍎', photo: '/assets/photos/apple_real.webp' },
  { label: 'quả chuối', emoji: '🍌', photo: '/assets/photos/banana_real.webp' },
  { label: 'quả cam', emoji: '🍊' },
  { label: 'quả nho', emoji: '🍇' },
  { label: 'quả dưa hấu', emoji: '🍉', photo: '/assets/photos/watermelon_real.webp' },
  { label: 'quả dâu', emoji: '🍓', photo: '/assets/photos/strawberry_real.webp' },
  { label: 'quả xoài', emoji: '🥭' },
  { label: 'quả lê', emoji: '🍐' },
  { label: 'quả đào', emoji: '🍑' },
  { label: 'quả dứa', emoji: '🍍' },
]
const OBJECTS: Item[] = [
  { label: 'gấu bông', emoji: '🧸' }, { label: 'quả bóng', emoji: '⚽' }, { label: 'cái thìa', emoji: '🥄' },
  { label: 'bàn chải đánh răng', emoji: '🪥' }, { label: 'đôi giày', emoji: '👟' }, { label: 'cái mũ', emoji: '🧢' },
  { label: 'cái ghế', emoji: '🪑' }, { label: 'cái cốc', emoji: '🥛' }, { label: 'quyển sách', emoji: '📚' },
  { label: 'cái đồng hồ', emoji: '⏰' }, { label: 'cái ô', emoji: '☂️' },
]
const COLORS: Item[] = [
  { label: 'màu đỏ', emoji: '🔴' }, { label: 'màu vàng', emoji: '🟡' }, { label: 'màu xanh', emoji: '🔵' },
]
const BODY: Item[] = [
  { label: 'đôi mắt', emoji: '👁️', use: 'Bé dùng gì để nhìn?' }, { label: 'cái tai', emoji: '👂', use: 'Bé dùng gì để nghe?' },
  { label: 'cái mũi', emoji: '👃', use: 'Bé dùng gì để ngửi?' }, { label: 'cái miệng', emoji: '👄', use: 'Bé dùng gì để ăn?' },
  { label: 'bàn tay', emoji: '✋', use: 'Bé dùng gì để cầm?' }, { label: 'bàn chân', emoji: '🦶', use: 'Bé dùng gì để đi?' },
]
const EMO: Item[] = [
  { label: 'vui', emoji: '😀' }, { label: 'buồn', emoji: '😢' }, { label: 'sợ hãi', emoji: '😨' },
  { label: 'tức giận', emoji: '😠' }, { label: 'ngạc nhiên', emoji: '😮' },
]
const SHAPES: Item[] = [
  { label: 'hình tròn', emoji: '⚫' }, { label: 'hình vuông', emoji: '⬛' },
  { label: 'hình tam giác', emoji: '▲' }, { label: 'hình chữ nhật', emoji: '▬' },
]
const FOODS: Item[] = [
  { label: 'thịt', emoji: '🥩' }, { label: 'cá', emoji: '🐟' }, { label: 'trứng', emoji: '🥚' }, { label: 'sữa', emoji: '🥛' },
  { label: 'rau xanh', emoji: '🥬' }, { label: 'cà rốt', emoji: '🥕' }, { label: 'quả cam', emoji: '🍊' },
]
const JOBS: Item[] = [
  { label: 'bác sĩ', emoji: '🧑‍⚕️', tool: '🩺', toolLabel: 'ống nghe', use: 'chữa bệnh cho bé' },
  { label: 'cô giáo', emoji: '👩‍🏫', tool: '📚', toolLabel: 'quyển sách', use: 'dạy bé học' },
  { label: 'nông dân', emoji: '🧑‍🌾', tool: '🌾', toolLabel: 'bông lúa', use: 'trồng lúa' },
  { label: 'đầu bếp', emoji: '🧑‍🍳', tool: '🍳', toolLabel: 'cái chảo', use: 'nấu ăn' },
  { label: 'chú lính cứu hỏa', emoji: '🧑‍🚒', tool: '🚒', toolLabel: 'xe cứu hỏa', use: 'dập lửa' },
  { label: 'phi công', emoji: '🧑‍✈️', tool: '✈️', toolLabel: 'máy bay', use: 'lái máy bay' },
  { label: 'họa sĩ', emoji: '🧑‍🎨', tool: '🎨', toolLabel: 'bảng màu', use: 'vẽ tranh' },
  { label: 'chú thợ xây', emoji: '👷', tool: '🧱', toolLabel: 'viên gạch', use: 'xây nhà' },
  { label: 'ca sĩ', emoji: '🧑‍🎤', tool: '🎤', toolLabel: 'cái micro', use: 'hát' },
  { label: 'chú bộ đội', emoji: '💂', tool: '⭐', toolLabel: 'ngôi sao', use: 'bảo vệ tổ quốc' },
  { label: 'thợ làm tóc', emoji: '💇', tool: '✂️', toolLabel: 'chiếc kéo', use: 'cắt tóc cho bé' },
  { label: 'bác lao công', emoji: '🧹', tool: '🧹', toolLabel: 'cái chổi', use: 'quét dọn đường phố' },
]
const INSTR: Item[] = [
  { label: 'cái trống', emoji: '🥁' }, { label: 'đàn pi-a-nô', emoji: '🎹' }, { label: 'đàn ghi-ta', emoji: '🎸' },
  { label: 'cái kèn', emoji: '🎺' }, { label: 'đàn vi-ô-lông', emoji: '🎻' },
]
const VEHICLES: Item[] = [
  { label: 'xe ô tô', emoji: '🚗', group: 'phương tiện giao thông', photo: '/assets/photos/car_real.webp' },
  { label: 'xe buýt', emoji: '🚌', group: 'phương tiện giao thông', photo: '/assets/photos/bus_real.webp' },
  { label: 'xe đạp', emoji: '🚲', group: 'phương tiện giao thông' },
  { label: 'máy bay', emoji: '✈️', group: 'phương tiện giao thông' },
]
const CLOTHES: Item[] = [
  { label: 'cái áo', emoji: '👕', group: 'quần áo' }, { label: 'cái quần', emoji: '👖', group: 'quần áo' },
  { label: 'cái váy', emoji: '👗', group: 'quần áo' }, { label: 'đôi tất', emoji: '🧦', group: 'quần áo' },
]
const HANOI: Item[] = [
  { label: 'Hồ Gươm', emoji: '🐢', desc: 'Hồ có Tháp Rùa', photo: '/assets/photos/hanoi_hoguom.webp' },
  { label: 'Chùa Một Cột', emoji: '🛕', desc: 'Ngôi chùa hình bông sen', photo: '/assets/photos/hanoi_chuamotcot.webp' },
  { label: 'Văn Miếu', emoji: '🏛️', desc: 'Trường đại học đầu tiên của nước ta', photo: '/assets/photos/hanoi_vanmieu.webp' },
  { label: 'Lăng Bác', emoji: '🇻🇳', desc: 'Nơi Bác Hồ nằm nghỉ', photo: '/assets/photos/hanoi_langbac.webp' },
  { label: 'cầu Long Biên', emoji: '🌉', desc: 'Cây cầu sắt bắc qua sông Hồng' },
  { label: 'cốm', emoji: '🌾', desc: 'Món quà từ lúa nếp non' },
  { label: 'hoa đào', emoji: '🌸', desc: 'Loài hoa nở dịp Tết' },
  { label: 'hoa sữa', emoji: '🌼', desc: 'Loài hoa thơm mùa thu Hà Nội' },
  { label: 'phở', emoji: '🍜', desc: 'Món ăn nóng hổi buổi sáng' },
  { label: 'múa rối nước', emoji: '🎭', desc: 'Rối biểu diễn trên mặt nước' },
  { label: 'đèn ông sao', emoji: '⭐', desc: 'Đồ chơi đêm Trung thu' },
  { label: 'áo dài', emoji: '👗', desc: 'Trang phục truyền thống' },
]

const askWhere = (it: Item) => `Đâu là ${it.label}?`
const askFind = (it: Item) => `Bé hãy tìm ${it.label}.`
const askTouch = (it: Item) => `Chạm vào ${it.label} nào!`

/* ------------------------------- Hàm khởi tạo game ------------------------------- */
function g(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], questions: Question[],
): Game {
  return { id, title, icon, age, domain, mt, engine: 'G01', questions }
}

function gMatch(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], prompt: string, rounds: MatchPair[][],
): Game {
  return { id, title, icon, age, domain, mt, engine: 'G02', prompt, rounds, questions: [] }
}

function gSort(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], prompt: string, baskets: SortBasket[], items: SortItem[],
): Game {
  return { id, title, icon, age, domain, mt, engine: 'G03', prompt, baskets, items, questions: [] }
}

function gBubble(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], questions: Question[], scene?: SceneTheme,
): Game {
  return { id, title, icon, age, domain, mt, engine: 'BUBBLE', scene, questions }
}

function gFeed(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], prompt: string, petType: 'monkey' | 'bear' | 'dog' | 'turtle', petName: string, items: SortItem[], scene?: SceneTheme,
): Game {
  return {
    id, title, icon, age, domain, mt, engine: 'FEED', scene, prompt,
    character: { name: petName, avatar: petType },
    items,
    questions: [],
  }
}

function gPuzzle(
  id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], prompt: string, rounds: MatchPair[][], scene?: SceneTheme,
): Game {
  return { id, title, icon, age, domain, mt, engine: 'PUZZLE', scene, prompt, rounds, questions: [] }
}

function gMusic(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], scene: SceneTheme = 'room'): Game {
  return { id, title, icon, age, domain, mt, engine: 'MUSIC', scene, questions: [] }
}

function gMemory(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], prompt: string, rounds: MatchPair[][], scene: SceneTheme = 'farm'): Game {
  return { id, title, icon, age, domain, mt, engine: 'MEMORY', scene, prompt, rounds, questions: [] }
}

function gTraffic(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], scene: SceneTheme = 'sky'): Game {
  return { id, title, icon, age, domain, mt, engine: 'TRAFFIC', scene, questions: [] }
}

function gDots(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], scene: SceneTheme = 'sky'): Game {
  return { id, title, icon, age, domain, mt, engine: 'DOTS', scene, questions: [] }
}

function gAlphabet(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], questions: Question[], scene: SceneTheme = 'farm'): Game {
  return { id, title, icon, age, domain, mt, engine: 'ALPHABET', scene, questions }
}

function gTrain(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], scene: SceneTheme = 'sky'): Game {
  return { id, title, icon, age, domain, mt, engine: 'NUMBER_TRAIN', scene, questions: [] }
}

function gScale(id: string, title: string, icon: string, age: AgeId, domain: DomainId, mt: string[], scene: SceneTheme = 'room'): Game {
  return { id, title, icon, age, domain, mt, engine: 'SCALE', scene, questions: [] }
}

const sizeQs = (gid: string): Question[] =>
  [...FRUITS.slice(0, 6), ...ANIMALS.slice(0, 4)].map((it, i) => {
    const big = i % 2 === 0
    return {
      id: `${gid}-${i}`,
      text: `Chọn ${it.label} ${big ? 'to' : 'nhỏ'}.`,
      options: [
        O(big ? 'to' : 'nhỏ', it.emoji, true, { scale: big ? 1.7 : 0.7, say: big ? 'to' : 'nhỏ' }),
        O(big ? 'nhỏ' : 'to', it.emoji, false, { scale: big ? 0.7 : 1.7, say: big ? 'nhỏ' : 'to' }),
      ],
    }
  })

const WEEK = ['hai', 'ba', 'tư', 'năm', 'sáu', 'bảy']
const weekQs = (gid: string): Question[] => {
  const qs: Question[] = []
  // 5 câu "Sau thứ X"
  for (let i = 0; i < 5; i++) {
    const cur = WEEK[i]
    const next = WEEK[i + 1]
    const wrong1 = WEEK[(i + 3) % 6]
    const wrong2 = WEEK[(i + 4) % 6]
    qs.push({
      id: `${gid}-after-${i}`,
      text: `Sau thứ ${cur} là thứ mấy?`,
      options: [
        O(`thứ ${next}`, String(WEEK.indexOf(next) + 2), true),
        O(`thứ ${wrong1}`, String(WEEK.indexOf(wrong1) + 2), false),
        O(`thứ ${wrong2}`, String(WEEK.indexOf(wrong2) + 2), false),
      ],
    })
  }
  // 5 câu "Trước thứ X"
  for (let i = 1; i <= 5; i++) {
    const cur = WEEK[i]
    const prev = WEEK[i - 1]
    const wrong1 = WEEK[(i + 2) % 6]
    const wrong2 = WEEK[(i + 4) % 6]
    qs.push({
      id: `${gid}-before-${i}`,
      text: `Trước thứ ${cur} là thứ mấy?`,
      options: [
        O(`thứ ${prev}`, String(WEEK.indexOf(prev) + 2), true),
        O(`thứ ${wrong1}`, String(WEEK.indexOf(wrong1) + 2), false),
        O(`thứ ${wrong2}`, String(WEEK.indexOf(wrong2) + 2), false),
      ],
    })
  }
  return qs
}

const generalQs = (gid: string): Question[] => {
  const cats: { name: string; items: Item[] }[] = [
    { name: 'con vật', items: ANIMALS }, { name: 'hoa quả', items: FRUITS },
    { name: 'phương tiện giao thông', items: VEHICLES }, { name: 'quần áo', items: CLOTHES },
  ]
  const qs: Question[] = []
  for (let r = 0; r < 3; r++) {
    cats.forEach((c, ci) => {
      const right = c.items[(r * 2 + ci) % c.items.length]
      const wrong = [1, 2].map((k) => { const oc = cats[(ci + k) % cats.length]; return oc.items[(r + k) % oc.items.length] })
      qs.push({
        id: `${gid}-${qs.length}`, text: `Đâu là ${c.name}?`,
        options: [O(right.label, right.emoji, true), ...wrong.map((w) => O(w.label, w.emoji))],
      })
    })
  }
  return qs
}

const LEGACY_GAMES: Game[] = [
  /* ========================= 24 – 36 THÁNG ========================= */
  gBubble('a1-thu', 'Bong bóng con vật', '🐱', '24-36', 'nhan_thuc', ['MT21'], naming('a1-thu', ANIMALS.slice(0, 8), 2, [askWhere, askFind]), 'farm'),
  gBubble('a1-mau', 'Bong bóng sắc màu', '🌈', '24-36', 'nhan_thuc', ['MT22'], naming('a1-mau', COLORS, 2, [(i) => `Chọn ${i.label}.`, askFind, askTouch, (i) => `${i.label} đâu nhỉ?`]), 'sky'),
  g('a1-to', 'To hay nhỏ', '🐘', '24-36', 'nhan_thuc', ['MT23'], sizeQs('a1-to')),
  g('a1-cothe', 'Cơ thể của bé', '🧒', '24-36', 'the_chat', ['MT20'], naming('a1-cothe', BODY, 3, [askWhere, (i) => i.use ?? askFind(i)])),
  gBubble('a1-kemvat', 'Bong bóng tiếng kêu con gì?', '🔊', '24-36', 'ngon_ngu', ['MT25'],
    naming('a1-kemvat', ANIMALS.filter((a) => a.sound), 3, [(i) => `Con nào kêu “${i.sound}”?`, (i) => `Bé nghe “${i.sound}”, đó là con gì?`]), 'farm'),
  g('a1-dovat', 'Đồ vật quen thuộc', '🧸', '24-36', 'ngon_ngu', ['MT21'], naming('a1-dovat', OBJECTS, 3, [askWhere])),
  g('a1-camxuc', 'Khuôn mặt cảm xúc', '😀', '24-36', 'xa_hoi', ['MT37'], naming('a1-camxuc', EMO.slice(0, 3), 3,
    [(i) => `Bạn nào đang ${i.label}?`, (i) => `Chạm khuôn mặt ${i.label}.`, (i) => `Em bé ${i.label} đâu nhỉ?`, askFind])),
  g('a1-chao', 'Bé biết chào cảm ơn', '🙏', '24-36', 'xa_hoi', ['MT40'], situations('a1-chao', [
    ['Bé gặp cô giáo buổi sáng, bé nói gì?', [['Con chào cô ạ', '👋', true], ['Không nói gì', '🤐', false]]],
    ['Cô cho bé quà, bé nói gì?', [['Con cảm ơn cô', '🎁', true], ['Giành lấy', '😠', false]]],
    ['Bố mẹ gọi, bé nói gì?', [['Dạ, vâng ạ', '🙋', true], ['Quay đi', '🙈', false]]],
    ['Bé chào tạm biệt bạn như thế nào?', [['Vẫy tay tạm biệt', '👋', true], ['Đẩy bạn', '✋', false]]],
    ['Bạn cho bé mượn đồ chơi, bé nói gì?', [['Cảm ơn bạn', '🧸', true], ['Không nói gì', '🤐', false]]],
    ['Bé gặp ông bà, bé nói gì?', [['Con chào ông bà ạ', '👵', true], ['Chạy đi', '🏃', false]]],
    ['Bé muốn xin phép ra ngoài, bé nói gì?', [['Con xin phép cô ạ', '🙋', true], ['Tự ý chạy ra', '🏃', false]]],
    ['Bé lỡ làm ngã bạn, bé nói gì?', [['Mình xin lỗi bạn', '🙇', true], ['Cười bạn', '😆', false]]],
    ['Bác hàng xóm sang chơi, bé nói gì?', [['Con chào bác ạ', '👋', true], ['Chạy trốn', '🙈', false]]],
    ['Trước khi đi ngủ, bé chào bố mẹ thế nào?', [['Con chúc bố mẹ ngủ ngon', '🌙', true], ['Không nói gì', '🤐', false]]],
  ])),
  g('a1-antoan', 'Bé tránh nơi nguy hiểm', '⚠️', '24-36', 'the_chat', ['MT15', 'MT16'], situations('a1-antoan', [
    ['Đâu là bếp đang đun, bé không đến gần?', [['Bếp lửa', '🔥', true], ['Quả bóng', '⚽', false]]],
    ['Vật nào nóng, bé không sờ vào?', [['Phích nước nóng', '♨️', true], ['Gấu bông', '🧸', false]]],
    ['Vật nào sắc nhọn, bé không nghịch?', [['Con dao', '🔪', true], ['Quyển sách', '📚', false]]],
    ['Bé không leo trèo ở đâu?', [['Lan can', '🪜', true], ['Thảm chơi', '🟩', false]]],
    ['Chỗ nào nguy hiểm, bé không lại gần?', [['Xô nước đầy', '🪣', true], ['Cái gối', '🛏️', false]]],
    ['Bé nên làm gì khi thấy ổ điện?', [['Không chạm vào', '🚫', true], ['Cho tay vào', '🖐️', false]]],
    ['Bé có cho hạt nhỏ vào tai mũi không?', [['Không, rất nguy hiểm', '🚫', true], ['Có, cho vào chơi', '👂', false]]],
    ['Bé có uống nước trong chai lạ không?', [['Không, hỏi người lớn', '🥛', true], ['Tự tiện uống', '🥤', false]]],
    ['Bé có chạy ra ngoài đường một mình không?', [['Không, ở trong nhà', '🏠', true], ['Chạy ra đường', '🏃', false]]],
    ['Khi tắm, bé có nghịch vòi nước nóng không?', [['Không chạm vòi nóng', '🚿', true], ['Nghịch vòi nóng', '♨️', false]]],
  ])),
  // G02: Ghép mẹ con (10 cặp)
  gMatch('a1-ghepdoi', 'Bé ghép mẹ con', '🐣', '24-36', 'nhan_thuc', ['MT21'], 'Bé hãy ghép con vật mẹ với con vật con nhé!', [
    [
      { id: 'm1', left: { emoji: '🐱', label: 'Mèo mẹ' }, right: { emoji: '🐈', label: 'Mèo con' } },
      { id: 'm2', left: { emoji: '🐕', label: 'Chó mẹ' }, right: { emoji: '🐶', label: 'Cún con' } },
      { id: 'm3', left: { emoji: '🦆', label: 'Vịt mẹ' }, right: { emoji: '🐥', label: 'Vịt con' } },
    ],
    [
      { id: 'm4', left: { emoji: '🐄', label: 'Bò mẹ' }, right: { emoji: '🐮', label: 'Bê con' } },
      { id: 'm5', left: { emoji: '🐔', label: 'Gà mẹ' }, right: { emoji: '🐥', label: 'Gà con' } },
      { id: 'm6', left: { emoji: '🐖', label: 'Lợn mẹ' }, right: { emoji: '🐷', label: 'Heo con' } },
    ],
    [
      { id: 'm7', left: { emoji: '🐇', label: 'Thỏ mẹ' }, right: { emoji: '🐰', label: 'Thỏ con' } },
      { id: 'm8', left: { emoji: '🐎', label: 'Ngựa mẹ' }, right: { emoji: '🐴', label: 'Ngựa con' } },
      { id: 'm9', left: { emoji: '🐑', label: 'Cừu mẹ' }, right: { emoji: '🐑', label: 'Cừu con' } },
      { id: 'm10', left: { emoji: '🐘', label: 'Voi mẹ' }, right: { emoji: '🐘', label: 'Voi con' } },
    ],
  ]),
  // G03: Phân loại màu sắc (10 đồ vật)
  gSort('a1-phanloai-mau', 'Bé phân loại màu sắc', '🧺', '24-36', 'nhan_thuc', ['MT22'], 'Bé hãy bỏ đồ màu đỏ vào rổ đỏ, đồ màu xanh vào rổ xanh nhé!', [
    { id: 'red', label: 'Rổ Đỏ', emoji: '🔴' },
    { id: 'blue', label: 'Rổ Xanh', emoji: '🔵' },
  ], [
    { id: 's1', label: 'Quả táo đỏ', emoji: '🍎', to: 'red' },
    { id: 's2', label: 'Quả dâu tây', emoji: '🍓', to: 'red' },
    { id: 's3', label: 'Bông hoa đỏ', emoji: '🌹', to: 'red' },
    { id: 's4', label: 'Quả cà chua', emoji: '🍅', to: 'red' },
    { id: 's5', label: 'Quả bóng đỏ', emoji: '🎈', to: 'red' },
    { id: 's6', label: 'Chiếc xe xanh', emoji: '🚙', to: 'blue' },
    { id: 's7', label: 'Quả việt quất', emoji: '🫐', to: 'blue' },
    { id: 's8', label: 'Chiếc ô xanh', emoji: '☂️', to: 'blue' },
    { id: 's9', label: 'Viên kim cương', emoji: '💎', to: 'blue' },
    { id: 's10', label: 'Chú cá xanh', emoji: '🐟', to: 'blue' },
  ]),
  // MEMORY: Match identical animal photographs (3 pairs).
  gMemory('a1-memory', 'Lật thẻ bạn thú', '🧠', '24-36', 'nhan_thuc', ['MT21'], 'Bé hãy lật tìm hai bạn thú giống nhau nhé!', [
    [
      { id: 'cat', left: { emoji: '🐱', label: 'Mèo' }, right: { emoji: '🐱', label: 'Mèo' } },
      { id: 'dog', left: { emoji: '🐶', label: 'Chó' }, right: { emoji: '🐶', label: 'Chó' } },
      { id: 'duck', left: { emoji: '🦆', label: 'Vịt' }, right: { emoji: '🦆', label: 'Vịt' } },
    ],
  ], 'farm'),

  /* ============================ 3 – 4 TUỔI ============================ */
  gBubble('b1-dem5', 'Bong bóng đếm sao', '5️⃣', '3-4', 'nhan_thuc', ['MT30'],
    counting('b1-dem5', [1, 2, 3, 4, 5, 3, 2, 5, 4, 1], ['🍎', '🐥', '⭐', '🎈', '🌸'], 3), 'sky'),
  g('b1-sosanh', 'Nhiều hơn, ít hơn', '⚖️', '3-4', 'nhan_thuc', ['MT31'],
    comparing('b1-sosanh', [[2, 4], [5, 3], [1, 3], [4, 2], [5, 2], [3, 1], [2, 5], [4, 1], [3, 5], [1, 4]], ['🍎', '🐥', '⭐', '🎈'])),
  g('b1-hinh', 'Nhận biết hình', '🔷', '3-4', 'nhan_thuc', ['MT36'],
    naming('b1-hinh', SHAPES, 3, [askWhere, askFind, askTouch])),
  g('b1-nguyhiem', 'Bé biết nguy hiểm', '🚸', '3-4', 'the_chat', ['MT17', 'MT18', 'MT19'], situations('b1-nguyhiem', [
    ['Bàn là đang nóng, bé làm gì?', [['Không đến gần', '🙅', true], ['Sờ vào', '🖐️', false]]],
    ['Bé thấy ao hồ, bé làm gì?', [['Không chơi gần', '🚫', true], ['Chạy lại gần nghịch nước', '🏃', false]]],
    ['Bé có nên tự lấy thuốc uống không?', [['Không, hỏi người lớn', '👩‍🏫', true], ['Có, tự uống', '💊', false]]],
    ['Người lạ rủ bé đi chơi, bé làm gì?', [['Không đi, chạy về với cô', '🏫', true], ['Đi theo người lạ', '🚶', false]]],
    ['Khi ăn quả có hạt, bé cần?', [['Ngồi ăn nhẹ nhàng', '🍒', true], ['Vừa ăn vừa chạy nhảy', '🏃', false]]],
    ['Bé bị chảy máu, bé làm gì?', [['Nói với cô giáo', '🙋', true], ['Giấu không nói', '🤫', false]]],
    ['Vật nào sắc nhọn, bé không nghịch?', [['Cái kéo', '✂️', true], ['Quả bóng', '⚽', false]]],
    ['Bé có leo trèo bàn ghế không?', [['Không leo trèo', '🪑', true], ['Có, leo cho vui', '🧗', false]]],
    ['Thấy bạn nghịch vật nhọn, bé làm gì?', [['Báo cho cô giáo', '👩‍🏫', true], ['Cùng nghịch với bạn', '✂️', false]]],
    ['Bé có tự ý bật bếp ga, bếp từ không?', [['Không, rất nguy hiểm', '🔥', true], ['Tự ý bật bếp', '🍳', false]]],
  ])),
  g('b1-nghe', 'Ai làm nghề gì?', '👩‍🏫', '3-4', 'nhan_thuc', ['MT43'], naming('b1-nghe', JOBS, 3,
    [(i) => `Ai ${i.use}?`])),
  g('b1-khaiquat', 'Nhóm đồ vật', '🧺', '3-4', 'ngon_ngu', ['MT48'], generalQs('b1-khaiquat')),
  g('b1-camxuc', 'Cảm xúc của bạn', '😢', '3-4', 'xa_hoi', ['MT70', 'MT71'], naming('b1-camxuc', EMO.slice(0, 4), 3,
    [(i) => `Bạn nào đang ${i.label}?`, (i) => `Chạm khuôn mặt ${i.label}.`, (i) => `Bé tìm bạn ${i.label}.`])),
  g('b1-loihay', 'Lời hay ý đẹp', '💬', '3-4', 'xa_hoi', ['MT75', 'MT76', 'MT77'], situations('b1-loihay', [
    ['Bé làm đổ nước của bạn, bé nói gì?', [['Xin lỗi bạn', '🙇', true], ['Bỏ chạy', '🏃', false]]],
    ['Bạn giúp bé nhặt đồ, bé nói gì?', [['Cảm ơn bạn', '😊', true], ['Không nói gì', '🤐', false]]],
    ['Cô đang kể chuyện, bé làm gì?', [['Chú ý lắng nghe', '👂', true], ['Nói chuyện riêng', '🗣️', false]]],
    ['Chơi xong, đồ chơi để ở đâu?', [['Cất vào đúng chỗ', '🧺', true], ['Vứt ra sàn', '🗑️', false]]],
    ['Muốn chơi đồ chơi của bạn, bé làm gì?', [['Xin phép bạn', '🙏', true], ['Giật lấy', '😠', false]]],
    ['Đến lượt bạn chơi, bé làm gì?', [['Chờ đến lượt', '⏳', true], ['Chen lên trước', '🏃', false]]],
    ['Bé ăn xong, bé làm gì?', [['Mời cô mời bạn', '🍚', true], ['Đứng dậy chạy chơi', '🏃', false]]],
    ['Bé nhìn thấy rác, bé làm gì?', [['Bỏ vào thùng rác', '🗑️', true], ['Vứt xuống đất', '🚮', false]]],
    ['Khi cô giáo hỏi, bé trả lời thế nào?', [['Thưa cô, con trả lời ạ', '🙋', true], ['Nói trống không', '🗣️', false]]],
    ['Khi bạn đang ngủ trưa, bé làm gì?', [['Giữ trật tự, đi nhẹ', '🤫', true], ['Hò hét đùa nghịch', '📢', false]]],
  ])),
  gMusic('b1-nhaccu', 'Đàn chuông sắc màu', '🎹', '3-4', 'tham_my', ['MT82'], 'room'),
  gTraffic('b1-traffic', 'Bé tham gia giao thông', '🚦', '3-4', 'the_chat', ['MT17', 'MT80'], 'sky'),
  gBubble('b1-hanoi', 'Bong bóng danh lam Hà Nội', '🐢', '3-4', 'ha_noi', ['MT45', 'MT86'], naming('b1-hanoi', HANOI, 3, [askWhere]), 'hanoi'),
  // G02: Ghép số với lượng (10 cặp)
  gMatch('b1-ghepdoi-so', 'Ghép số với lượng', '🔢', '3-4', 'nhan_thuc', ['MT30'], 'Bé hãy ghép chữ số với số lượng tương ứng nhé!', [
    [
      { id: 'num1', left: { emoji: '1️⃣', label: 'Số 1' }, right: { emoji: '🍎', label: '1 quả táo' } },
      { id: 'num2', left: { emoji: '2️⃣', label: 'Số 2' }, right: { emoji: '🐥🐥', label: '2 chú gà' } },
      { id: 'num3', left: { emoji: '3️⃣', label: 'Số 3' }, right: { emoji: '⭐⭐⭐', label: '3 ngôi sao' } },
    ],
    [
      { id: 'num4', left: { emoji: '4️⃣', label: 'Số 4' }, right: { emoji: '🎈🎈🎈🎈', label: '4 quả bóng' } },
      { id: 'num5', left: { emoji: '5️⃣', label: 'Số 5' }, right: { emoji: '🌸🌸🌸🌸🌸', label: '5 bông hoa' } },
      { id: 'num6', left: { emoji: '2️⃣', label: 'Số 2' }, right: { emoji: '🐟🐟', label: '2 con cá' } },
    ],
    [
      { id: 'num7', left: { emoji: '3️⃣', label: 'Số 3' }, right: { emoji: '🚗🚗🚗', label: '3 ô tô' } },
      { id: 'num8', left: { emoji: '1️⃣', label: 'Số 1' }, right: { emoji: '🐰', label: '1 chú thỏ' } },
      { id: 'num9', left: { emoji: '4️⃣', label: 'Số 4' }, right: { emoji: '🍓🍓🍓🍓', label: '4 quả dâu' } },
      { id: 'num10', left: { emoji: '5️⃣', label: 'Số 5' }, right: { emoji: '🍬🍬🍬🍬🍬', label: '5 viên kẹo' } },
    ],
  ]),
  // G03: Phân loại rác (10 đồ vật)
  gSort('b1-phanloai-rac', 'Bé phân loại rác', '♻️', '3-4', 'the_chat', ['MT80'], 'Bé hãy bỏ rác hữu cơ và rác tái chế vào đúng thùng rác nhé!', [
    { id: 'organic', label: 'Rác hữu cơ', emoji: '🍏' },
    { id: 'recycle', label: 'Rác tái chế', emoji: '📦' },
  ], [
    { id: 'r1', label: 'Vỏ chuối', emoji: '🍌', to: 'organic' },
    { id: 'r2', label: 'Lõi quả táo', emoji: '🍏', to: 'organic' },
    { id: 'r3', label: 'Lá cây khô', emoji: '🍂', to: 'organic' },
    { id: 'r4', label: 'Xương cá', emoji: '🐟', to: 'organic' },
    { id: 'r5', label: 'Rau củ thừa', emoji: '🥬', to: 'organic' },
    { id: 'r6', label: 'Chai nhựa', emoji: '🧴', to: 'recycle' },
    { id: 'r7', label: 'Vỏ lon nước', emoji: '🥫', to: 'recycle' },
    { id: 'r8', label: 'Hộp các-tông', emoji: '📦', to: 'recycle' },
    { id: 'r9', label: 'Tờ báo cũ', emoji: '📰', to: 'recycle' },
    { id: 'r10', label: 'Túi nilon', emoji: '🛍️', to: 'recycle' },
  ]),
  // ALPHABET: Vườn cây chữ cái O - Ô - Ơ (MT48)
  gAlphabet('b1-chucai-o', 'Vườn cây chữ cái O Ô Ơ', '🌳', '5-6', 'ngon_ngu', ['MT79'], [
    {
      id: 'o-1',
      text: 'O tròn như quả trứng gà! Bé hãy tìm chữ O nào!',
      options: [O('O', '🍎', true), O('Ô', '🍎', false), O('Ơ', '🍎', false)],
    },
    {
      id: 'o-2',
      text: 'Ô thì đội mũ! Đâu là chữ Ô?',
      options: [O('Ô', '🍎', true), O('O', '🍎', false), O('Ơ', '🍎', false)],
    },
    {
      id: 'o-3',
      text: 'Ơ thì thêm râu! Bé hãy tìm chữ Ơ nhé!',
      options: [O('Ơ', '🍎', true), O('O', '🍎', false), O('Ô', '🍎', false)],
    },
  ], 'farm'),
  // NUMBER_TRAIN: Đoàn tàu số học (MT30)
  gTrain('b1-tau-so', 'Đoàn tàu chở hoa quả', '🚂', '3-4', 'nhan_thuc', ['MT30'], 'sky'),
  // SCALE: Cân bập bênh so sánh nhiều hơn ít hơn (MT31)
  gScale('b1-can-thangbang', 'Cân bập bênh so sánh', '⚖️', '3-4', 'nhan_thuc', ['MT31'], 'room'),

  /* ============================ 4 – 5 TUỔI ============================ */
  g('c1-dem10', 'Đếm đến 10', '🔟', '4-5', 'nhan_thuc', ['MT34'],
    counting('c1-dem10', [6, 7, 8, 9, 10, 5, 8, 6, 10, 9], ['🍓', '🐟', '⭐', '🌸', '🚗'], 3)),
  g('c1-sosanh', 'So sánh số lượng', '⚖️', '4-5', 'nhan_thuc', ['MT35'],
    comparing('c1-sosanh', [[7, 9], [10, 6], [8, 5], [6, 9], [9, 7], [5, 8], [10, 7], [6, 8], [9, 10], [7, 5]], ['🍓', '🐟', '⭐', '🌸'])),
  g('c1-quyluat', 'Quy luật bí ẩn', '🔴', '4-5', 'nhan_thuc', ['MT40'], patterns('c1-quyluat', [
    [['🔴', '🔵', '🔴', '🔵', '🔴'], '🔵', ['🔴', '🟢']],
    [['⭐', '🌙', '⭐', '🌙', '⭐'], '🌙', ['⭐', '☀️']],
    [['🍎', '🍎', '🍌', '🍎', '🍎'], '🍌', ['🍎', '🍇']],
    [['🐱', '🐶', '🐱', '🐶', '🐱'], '🐶', ['🐱', '🐰']],
    [['🔺', '🔵', '🟩', '🔺', '🔵'], '🟩', ['🔺', '🔵']],
    [['🌸', '🌸', '🍀', '🌸', '🌸'], '🍀', ['🌸', '🌼']],
    [['🚗', '🚌', '🚗', '🚌', '🚗'], '🚌', ['🚗', '🚲']],
    [['🟡', '🟡', '🔴', '🟡', '🟡'], '🔴', ['🟡', '🔵']],
    [['🔴', '🟡', '🔴', '🟡', '🔴'], '🟡', ['🔴', '🔵']],
    [['🐶', '🐱', '🐭', '🐶', '🐱'], '🐭', ['🐶', '🐰']],
    [['🔺', '🔺', '🔵', '🔺', '🔺'], '🔵', ['🔺', '🟩']],
  ])),
  g('c1-thu', 'Thứ trong tuần', '📅', '4-5', 'nhan_thuc', ['MT49'], weekQs('c1-thu')),
  g('c1-nhomchat', 'Thực phẩm tốt cho bé', '🥦', '4-5', 'the_chat', ['MT10', 'MT11'], situations('c1-nhomchat', [
    ['Thực phẩm nào giàu chất đạm?', [['Thịt', '🥩', true], ['Kẹo', '🍬', false], ['Nước ngọt', '🥤', false]]],
    ['Thực phẩm nào giàu vitamin?', [['Cà rốt', '🥕', true], ['Bánh quy', '🍪', false], ['Kẹo', '🍬', false]]],
    ['Bé uống gì tốt cho sức khỏe?', [['Nước đun sôi', '🚰', true], ['Nước ngọt có ga', '🥤', false]]],
    ['Món nào giàu chất đạm?', [['Cá', '🐟', true], ['Kẹo mút', '🍭', false], ['Bánh ngọt', '🍰', false]]],
    ['Món nào giàu vitamin?', [['Quả cam', '🍊', true], ['Khoai chiên', '🍟', false], ['Kem', '🍦', false]]],
    ['Ăn nhiều đồ ngọt thì sao?', [['Dễ sâu răng, béo phì', '🦷', true], ['Rất tốt cho bé', '👍', false]]],
    ['Bữa ăn của bé cần có?', [['Nhiều loại thức ăn', '🍱', true], ['Chỉ ăn kẹo', '🍬', false]]],
    ['Món nào giàu chất đạm?', [['Trứng', '🥚', true], ['Kẹo dẻo', '🍬', false], ['Nước cam có ga', '🥤', false]]],
    ['Bé cần ăn rau củ để bổ sung gì?', [['Vitamin và chất xơ', '🥗', true], ['Không có ích gì', '🍬', false], ['Nước ngọt', '🥤', false]]],
    ['Thực phẩm nào giúp bé chắc răng và xương?', [['Sữa tươi', '🥛', true], ['Kẹo ngọt', '🍬', false], ['Nước ngọt', '🥤', false]]],
  ])),
  g('c1-khancap', 'Bé biết gọi giúp đỡ', '🆘', '4-5', 'the_chat', ['MT20', 'MT21', 'MT23'], situations('c1-khancap', [
    ['Bé bị lạc, bé làm gì?', [['Hỏi cô công an, người lớn', '👮', true], ['Đi theo người lạ', '🚶', false]]],
    ['Thấy cháy, bé làm gì?', [['Gọi người lớn ngay', '🔥', true], ['Tự dập lửa', '🧯', false]]],
    ['Bạn ngã chảy máu, bé làm gì?', [['Gọi cô giáo', '🙋', true], ['Bỏ đi chơi', '🏃', false]]],
    ['Người lạ cho kẹo, bé làm gì?', [['Từ chối, báo với cô', '🙅', true], ['Nhận và đi theo', '🍬', false]]],
    ['Bé có nên đến gần ao hồ không?', [['Không, rất nguy hiểm', '🌊', true], ['Có, ra nghịch nước', '🏊', false]]],
    ['Bé nên nhớ điều gì khi bị lạc?', [['Địa chỉ, số điện thoại bố mẹ', '📞', true], ['Không cần nhớ gì', '🤷', false]]],
    ['Bé có tự ý ra khỏi lớp không?', [['Không, xin phép cô', '🏫', true], ['Có, chạy ra cổng', '🚪', false]]],
    ['Qua đường cần?', [['Có người lớn dắt', '🚸', true], ['Tự chạy qua', '🏃', false]]],
    ['Bé có mở cửa cho người lạ khi ở nhà một mình không?', [['Không mở cửa', '🚪', true], ['Mở cửa ngay', '🚶', false]]],
    ['Khi ngồi xe máy cùng bố mẹ, bé cần?', [['Đội mũ bảo hiểm', '⛑️', true], ['Không đội mũ', '🧢', false]]],
  ])),
  g('c1-nghe', 'Nghề và dụng cụ', '👷', '4-5', 'nhan_thuc', ['MT52'], naming('c1-nghe', JOBS, 3,
    [(i) => `${i.label[0].toUpperCase() + i.label.slice(1)} dùng gì?`],
    (i) => O(i.toolLabel!, i.tool!, true), (i) => O(i.toolLabel!, i.tool!))),
  g('c1-ungxu', 'Bé cư xử đẹp', '🤝', '4-5', 'xa_hoi', ['MT88', 'MT90', 'MT102'], situations('c1-ungxu', [
    ['Bạn bị ngã, bé làm gì?', [['Đỡ bạn dậy, hỏi thăm', '🤗', true], ['Cười bạn', '😆', false]]],
    ['Hai bạn cùng muốn chơi một đồ chơi?', [['Thỏa thuận thay phiên', '🤝', true], ['Giành giật', '😠', false]]],
    ['Bạn đang buồn, bé làm gì?', [['An ủi bạn', '🫂', true], ['Bỏ mặc bạn', '🙈', false]]],
    ['Bé làm hỏng đồ của bạn?', [['Xin lỗi và giúp bạn', '🙇', true], ['Giả vờ không biết', '🤫', false]]],
    ['Bạn mới đến lớp, bé làm gì?', [['Làm quen, rủ bạn chơi', '👋', true], ['Không chơi cùng', '🚫', false]]],
    ['Khi nói chuyện với người lớn, bé?', [['Nói lễ phép, dạ thưa', '🙏', true], ['Nói trống không', '🗣️', false]]],
    ['Bé có việc được giao, bé làm gì?', [['Cố gắng làm xong', '💪', true], ['Bỏ dở', '😴', false]]],
    ['Bạn khác bé điểm gì đó, bé nên?', [['Tôn trọng và chơi cùng', '🌈', true], ['Chê bai bạn', '👎', false]]],
    ['Khi vào rạp phim hoặc nơi đông người, bé?', [['Đi nhẹ, nói khẽ', '🤫', true], ['Chạy nhảy la hét', '📢', false]]],
    ['Bé hứa giúp mẹ cất đồ chơi, bé sẽ?', [['Làm đúng lời hứa', '🤝', true], ['Bỏ đi chơi', '😴', false]]],
  ])),
  g('c1-moitruong', 'Bé bảo vệ môi trường', '🌳', '4-5', 'xa_hoi', ['MT94', 'MT95', 'MT96'], situations('c1-moitruong', [
    ['Rác bỏ ở đâu?', [['Thùng rác', '🗑️', true], ['Xuống sân', '🍬', false]]],
    ['Ra khỏi phòng, bé nhớ?', [['Tắt điện, tắt quạt', '💡', true], ['Để nguyên', '🔆', false]]],
    ['Rửa tay xong, vòi nước?', [['Khóa lại', '🚰', true], ['Để chảy mãi', '💦', false]]],
    ['Bé thấy bông hoa đẹp, bé làm gì?', [['Ngắm, không hái', '🌸', true], ['Bẻ cành hái hoa', '✂️', false]]],
    ['Bé giúp chăm sóc cây bằng cách?', [['Tưới nước cho cây', '🪴', true], ['Giẫm lên cây', '🦶', false]]],
    ['Ăn cơm xong, bé nên làm gì?', [['Ăn hết, không rơi vãi', '🍚', true], ['Bỏ thừa đồ ăn', '🗑️', false]]],
    ['Bé giúp tiết kiệm nước bằng cách?', [['Rửa tay vừa đủ nước', '🚿', true], ['Mở vòi cho chảy tràn', '💦', false]]],
    ['Khi thấy vòi nước đang chảy tràn, bé làm gì?', [['Khóa vòi nước lại', '🚰', true], ['Kệ nước chảy', '💦', false]]],
    ['Để giữ không khí trong lành, chúng ta nên?', [['Trồng và chăm sóc cây xanh', '🌱', true], ['Bẻ cành hái hoa', '✂️', false]]],
    ['Khi đi công viên, vỏ hộp sữa bé vứt ở đâu?', [['Thùng rác công cộng', '🗑️', true], ['Ném xuống bãi cỏ', '🌿', false]]],
  ])),
  gBubble('c1-hanoi', 'Bong bóng danh lam Hà Nội', '🐢', '4-5', 'ha_noi', ['MT56', 'HN10'], naming('c1-hanoi', HANOI, 3, [(i) => `Bé tìm: ${i.desc}.`]), 'hanoi'),
  g('c1-khaiquat', 'Đồ vật quanh bé', '🧺', '4-5', 'ngon_ngu', ['MT58', 'MT63'], generalQs('c1-khaiquat')),
  // G02: Ghép nghề và dụng cụ (10 cặp)
  gMatch('c1-ghepdoi-nghe', 'Ghép nghề và dụng cụ', '🛠️', '4-5', 'nhan_thuc', ['MT52'], 'Bé hãy ghép nghề nghiệp với dụng cụ làm việc nhé!', [
    [
      { id: 'job1', left: { emoji: '🧑‍⚕️', label: 'Bác sĩ' }, right: { emoji: '🩺', label: 'Ống nghe' } },
      { id: 'job2', left: { emoji: '👩‍🏫', label: 'Cô giáo' }, right: { emoji: '📚', label: 'Quyển sách' } },
      { id: 'job3', left: { emoji: '🧑‍🌾', label: 'Nông dân' }, right: { emoji: '🌾', label: 'Bông lúa' } },
    ],
    [
      { id: 'job4', left: { emoji: '🧑‍🍳', label: 'Đầu bếp' }, right: { emoji: '🍳', label: 'Chiếc chảo' } },
      { id: 'job5', left: { emoji: '🧑‍🚒', label: 'Cứu hỏa' }, right: { emoji: '🚒', label: 'Xe cứu hỏa' } },
      { id: 'job6', left: { emoji: '👷', label: 'Thợ xây' }, right: { emoji: '🧱', label: 'Viên gạch' } },
    ],
    [
      { id: 'job7', left: { emoji: '🧑‍🎨', label: 'Họa sĩ' }, right: { emoji: '🎨', label: 'Bảng màu' } },
      { id: 'job8', left: { emoji: '🧑‍🎤', label: 'Ca sĩ' }, right: { emoji: '🎤', label: 'Micro' } },
      { id: 'job9', left: { emoji: '🧑‍✈️', label: 'Phi công' }, right: { emoji: '✈️', label: 'Máy bay' } },
      { id: 'job10', left: { emoji: '💇', label: 'Thợ cắt tóc' }, right: { emoji: '✂️', label: 'Chiếc kéo' } },
    ],
  ]),
  // G03: Phân loại động vật (10 con vật)
  gSort('c1-phanloai-dongvat', 'Động vật sống ở đâu?', '🌊', '4-5', 'nhan_thuc', ['MT26'], 'Bé hãy đưa các con vật về nơi sống: Dưới nước hay Trên cạn nhé!', [
    { id: 'water', label: 'Dưới nước', emoji: '🌊' },
    { id: 'land', label: 'Trên cạn', emoji: '🌳' },
  ], [
    { id: 'a1', label: 'Cá heo', emoji: '🐬', to: 'water' },
    { id: 'a2', label: 'Bạch tuộc', emoji: '🐙', to: 'water' },
    { id: 'a3', label: 'Con tôm', emoji: '🦐', to: 'water' },
    { id: 'a4', label: 'Con cua', emoji: '🦀', to: 'water' },
    { id: 'a5', label: 'Cá voi', emoji: '🐳', to: 'water' },
    { id: 'a6', label: 'Con thỏ', emoji: '🐰', to: 'land' },
    { id: 'a7', label: 'Chú voi', emoji: '🐘', to: 'land' },
    { id: 'a8', label: 'Hươu cao cổ', emoji: '🦒', to: 'land' },
    { id: 'a9', label: 'Chú khỉ', emoji: '🐒', to: 'land' },
    { id: 'a10', label: 'Chú hổ', emoji: '🐯', to: 'land' },
  ]),
  // DOTS: Nối số vẽ hình (MT34)
  gDots('c1-dots', 'Bé nối số vẽ hình', '✏️', '4-5', 'nhan_thuc', ['MT34'], 'sky'),
  // PUZZLE: Khớp bóng muông thú
  gPuzzle('c1-khopbong', 'Khớp bóng muông thú', '🧩', '4-5', 'nhan_thuc', ['MT26'], 'Bé hãy tìm và ghép đúng bóng của các bạn thú nhé!', [
    [
      { id: 'ele', left: { emoji: '🐘', label: 'Chú voi' }, right: { emoji: '🐘', label: 'Chú voi' } },
      { id: 'lion', left: { emoji: '🦁', label: 'Sư tử' }, right: { emoji: '🦁', label: 'Sư tử' } },
      { id: 'gir', left: { emoji: '🦒', label: 'Hươu cao cổ' }, right: { emoji: '🦒', label: 'Hươu cao cổ' } },
    ],
  ], 'farm'),
  // ALPHABET: Vườn cây chữ cái A - Ă - Â (MT58)
  gAlphabet('c1-chucai-a', 'Vườn cây chữ cái A Ă Â', '🌳', '5-6', 'ngon_ngu', ['MT79'], [
    {
      id: 'a-1',
      text: 'Bé hãy tìm chữ A nở nụ cười to nhé!',
      options: [O('A', '🍎', true), O('Ă', '🍎', false), O('Â', '🍎', false)],
    },
    {
      id: 'a-2',
      text: 'Chữ Ă có vầng trăng khuyết ở trên đâu nhỉ?',
      options: [O('Ă', '🍎', true), O('A', '🍎', false), O('Â', '🍎', false)],
    },
    {
      id: 'a-3',
      text: 'Chữ Â đội chiếc mũ xinh xắn ở đâu nào?',
      options: [O('Â', '🍎', true), O('A', '🍎', false), O('Ă', '🍎', false)],
    },
  ], 'farm'),
  // SCALE: Cân thăng bằng toán học (MT35)
  gScale('c1-can-thangbang', 'Cân thăng bằng toán học', '⚖️', '4-5', 'nhan_thuc', ['MT35'], 'farm'),

  // Mẫu giáo lớn: phân biệt chữ có dấu, số trong phạm vi 10 và quy luật 3 phần tử.
  gAlphabet('d1-chucai-e', 'Vườn cây chữ cái E Ê', '🌳', '5-6', 'ngon_ngu', ['MT79'],
    ['E', 'Ê', 'Ê', 'E', 'Ê', 'E', 'E', 'Ê', 'E', 'Ê'].map((letter, i) => ({
      id: `d1-e-${i}`, text: `Bé hãy tìm chữ ${letter} nhé!`,
      options: ['E', 'Ê'].map(label => O(label, '🍎', label === letter)),
    }))),
  gAlphabet('d1-chucai-u', 'Vườn cây chữ cái U Ư', '🌳', '5-6', 'ngon_ngu', ['MT79'],
    ['U', 'Ư', 'U', 'Ư', 'Ư', 'U', 'U', 'Ư', 'U', 'Ư'].map((letter, i) => ({
      id: `d1-u-${i}`, text: `Bé hãy tìm chữ ${letter} nhé!`,
      options: ['U', 'Ư'].map(label => O(label, '🍎', label === letter)),
    }))),
  gMatch('d1-ghepdoi-so', 'Ghép số và lượng đến 10', '🔢', '5-6', 'nhan_thuc', ['MT36', 'MT40'],
    'Bé hãy ghép số với nhóm quả có số lượng tương ứng nhé!',
    [[1, 2, 3], [4, 5, 6], [7, 8], [9, 10]].map(numbers => numbers.map(n => ({
      id: `d1-pair-${n}`, left: { emoji: String(n), label: NUM[n] },
      right: { emoji: (n % 2 ? '🍎' : '🍓').repeat(n), label: `${NUM[n]} ${n % 2 ? 'quả táo' : 'quả dâu'}` },
    })))),
  gMemory('d1-memory-so', 'Lật thẻ số', '🃏', '5-6', 'nhan_thuc', ['MT40'],
    'Bé hãy lật tìm hai thẻ có số giống nhau nhé!',
    [[1, 3, 5], [2, 4, 6], [7, 8, 9, 10]].map(numbers => numbers.map(n => ({
      id: `d1-memory-${n}`, left: { emoji: String(n), label: NUM[n] }, right: { emoji: String(n), label: NUM[n] },
    })))),
  g('d1-so-thutu', 'Tìm số còn thiếu', '🔢', '5-6', 'nhan_thuc', ['MT40', 'MT42'],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => {
      const start = Math.max(1, Math.min(n - 1, 8))
      return {
        id: `d1-sequence-${i}`, text: 'Bé tìm số còn thiếu nhé!',
        sequence: [start, start + 1, start + 2].map(value => value === n ? null : value),
        options: [n, ...[1, 3, 5, 7, 9, 2, 4, 6, 8, 10].filter(value => value !== n).slice(i % 3, i % 3 + 2)].map(value => numOpt(value, value === n)),
      }
    })),
  g('d1-quyluat-qua', 'Quy luật ba loại quả', '🍓', '5-6', 'nhan_thuc', ['MT43'],
    [
      ['🍎', '🍓', '🍌'], ['🍓', '🍌', '🍎'], ['🍌', '🍎', '🍓'],
      ['🍎', '🍎', '🍓'], ['🍓', '🍌', '🍌'], ['🍌', '🍓', '🍓'],
      ['🍎', '🍓', '🍌'], ['🍓', '🍌', '🍎'], ['🍎', '🍎', '🍓'], ['🍌', '🍓', '🍓'],
    ].map((unit, i) => ({
      id: `d1-pattern-${i}`, text: 'Bé chọn quả tiếp theo nhé!', pattern: [...unit, ...unit.slice(0, 2)],
      options: [O('quả táo', '🍎', unit[2] === '🍎'), O('quả dâu', '🍓', unit[2] === '🍓'), O('quả chuối', '🍌', unit[2] === '🍌')],
    }))),
]

export const GAMES = expandCurriculum(LEGACY_GAMES)

export const gamesFor = (age: AgeId, domain?: DomainId) =>
  GAMES.filter((x) => x.age === age && (!domain || x.domain === domain))
