import { DOT_LEVELS, SCALE_QUESTIONS, TRAFFIC_ROUNDS, TRAIN_ROUNDS } from './gameLogic'

export type AgeId = '24-36' | '3-4' | '4-5' | '5-6'
export type DomainId = 'the_chat' | 'nhan_thuc' | 'ngon_ngu' | 'xa_hoi' | 'tham_my' | 'ha_noi'

export interface Option {
  id: string
  label: string
  emoji: string
  correct: boolean
  /** Phóng to/thu nhỏ biểu tượng (dùng cho trò "to - nhỏ") */
  scale?: number
  /** Nội dung đọc; để '' nếu không đọc (ví dụ so sánh hai nhóm) */
  say?: string
  /** Đường dẫn ảnh thật chất lượng cao */
  photo?: string
  x?: number
  y?: number
}

export interface Question {
  id: string
  text: string
  /** Hình lớn hiển thị phía trên câu hỏi (nhóm đồ vật, quy luật...) */
  show?: string
  /** Dãy số có ô trống, và quy luật bằng hình để bé không cần đọc. */
  sequence?: (number | null)[]
  pattern?: string[]
  patternBlank?: 'start' | 'end'
  /** Picture story in chronological order; displayed cards are shuffled. */
  steps?: MatchSide[]
  /** Original musical motif, indexes into the game's pads. */
  notes?: number[]
  /** Central reference object for an illustrated spatial task. */
  reference?: MatchSide
  position?: 'above' | 'below' | 'left' | 'right'
  /** Concrete objects, including split/combined groups, shown before choices. */
  groups?: string[][]
  options: Option[]
}

export interface MatchSide { emoji: string; label: string; photo?: string }
/** G02 – một cặp cần ghép; mỗi cặp tính là một câu/nhiệm vụ */
export interface MatchPair { id: string; left: MatchSide; right: MatchSide }

export interface SortBasket { id: string; label: string; emoji: string; photo?: string }
/** G03 – một đồ vật cần kéo vào đúng giỏ; mỗi đồ vật tính là một câu/nhiệm vụ */
export interface SortItem { id: string; label: string; emoji: string; to: string; photo?: string }

export type EngineId =
  | 'G01'
  | 'G02'
  | 'G03'
  | 'BUBBLE'
  | 'FEED'
  | 'PUZZLE'
  | 'MUSIC'
  | 'MEMORY'
  | 'TRAFFIC'
  | 'DOTS'
  | 'ALPHABET'
  | 'NUMBER_TRAIN'
  | 'SCALE'
  | 'ORDER'
  | 'RHYTHM'
  | 'SPATIAL'
  | 'REVEAL'
  | 'COLLECT'
  | 'PATH'
export type SceneTheme = 'farm' | 'hanoi' | 'pond' | 'sky' | 'room'

export interface Game {
  sessionLimit?: number
  sessionVisit?: number
  id: string
  title: string
  icon: string
  age: AgeId
  domain: DomainId
  /** Mã mục tiêu trong giáo án, ví dụ MT22 */
  mt: string[]
  category?: CurriculumCategory
  objective?: string
  pads?: MatchSide[]
  /** Cơ chế chơi tương tác */
  engine: EngineId
  /** Bối cảnh hoạt hình nền cho game */
  scene?: SceneTheme
  /** G01 & BUBBLE dạng câu hỏi */
  questions: Question[]
  /** G02, PUZZLE, MEMORY: các vòng ghép đôi/lật thẻ */
  rounds?: MatchPair[][]
  /** Lời dẫn đọc to */
  prompt?: string
  /** G03 & FEED dạng đồ vật */
  baskets?: SortBasket[]
  items?: SortItem[]
  /** Dành cho FEED: Nhân vật được cho ăn */
  character?: {
    name: string
    avatar: string
    favoriteSaying?: string
  }
}

export type CurriculumCategory = 'recognition' | 'discovery' | 'language' | 'music' | 'life' | 'math' | 'geometry' | 'literature' | 'letters'

export const totalOf = (g: Game): number =>
  g.engine === 'G02' || g.engine === 'MEMORY' || g.engine === 'PUZZLE'
    ? (g.rounds ?? []).reduce((n, r) => n + r.length, 0)
    : (g.engine === 'G03' || g.engine === 'FEED') && g.items?.length
    ? g.items.length
    : g.engine === 'MUSIC'
    ? 1
    : g.engine === 'TRAFFIC' ? Math.min(g.sessionLimit ?? TRAFFIC_ROUNDS, TRAFFIC_ROUNDS)
    : g.engine === 'DOTS' ? Math.min(g.sessionLimit ?? DOT_LEVELS.length, DOT_LEVELS.length)
    : g.engine === 'NUMBER_TRAIN' ? Math.min(g.sessionLimit ?? TRAIN_ROUNDS.length, TRAIN_ROUNDS.length)
    : g.engine === 'SCALE' ? Math.min(g.sessionLimit ?? SCALE_QUESTIONS.length, SCALE_QUESTIONS.length)
    : g.questions.length

export const AGES: { id: AgeId; label: string; emoji: string; color: string }[] = [
  { id: '24-36', label: '24 – 36 tháng', emoji: '🐣', color: '#FFB84D' },
  { id: '3-4', label: '3 – 4 tuổi', emoji: '🐰', color: '#F6A2BC' },
  { id: '4-5', label: '4 – 5 tuổi', emoji: '🦊', color: '#74CBF4' },
  { id: '5-6', label: '5 – 6 tuổi', emoji: '🦁', color: '#AD99E7' },
]

export const DOMAINS: { id: DomainId; label: string; emoji: string; color: string }[] = [
  { id: 'nhan_thuc', label: 'Khám phá & Toán', emoji: '🔍', color: '#74CBF4' },
  { id: 'ngon_ngu', label: 'Ngôn ngữ', emoji: '💬', color: '#91D8A1' },
  { id: 'the_chat', label: 'Sức khỏe & An toàn', emoji: '🍎', color: '#FFB84D' },
  { id: 'xa_hoi', label: 'Tình cảm & Xã hội', emoji: '🤝', color: '#F6A2BC' },
  { id: 'tham_my', label: 'Thẩm mỹ', emoji: '🎨', color: '#AD99E7' },
  { id: 'ha_noi', label: 'Bé yêu Hà Nội', emoji: '🐢', color: '#E8735A' },
]
