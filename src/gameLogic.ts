/** Shared rules so engines and the progress display count the same tasks. */
export const TRAFFIC_ROUNDS = 10
export const TRAIN_ROUNDS = [
  { targetNumber: 3, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { targetNumber: 2, itemEmoji: '🐥', itemLabel: 'chú gà con' },
  { targetNumber: 4, itemEmoji: '🍓', itemLabel: 'quả dâu tây' },
  { targetNumber: 1, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { targetNumber: 5, itemEmoji: '🍓', itemLabel: 'quả dâu tây' },
  { targetNumber: 2, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { targetNumber: 3, itemEmoji: '🍓', itemLabel: 'quả dâu tây' },
  { targetNumber: 4, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { targetNumber: 5, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { targetNumber: 1, itemEmoji: '🍓', itemLabel: 'quả dâu tây' },
]
export const DOT_LEVELS = [
  { name: 'Hình Ngôi Sao', emoji: '⭐', dots: [
    { x: 50, y: 15 }, { x: 62, y: 40 }, { x: 90, y: 40 }, { x: 68, y: 60 }, { x: 78, y: 85 },
    { x: 50, y: 70 }, { x: 22, y: 85 }, { x: 32, y: 60 }, { x: 10, y: 40 }, { x: 38, y: 40 },
  ] },
  { name: 'Ngôi Nhà Thân Yêu', emoji: '🏠', dots: [
    { x: 50, y: 15 }, { x: 80, y: 42 }, { x: 80, y: 85 }, { x: 20, y: 85 }, { x: 20, y: 42 },
  ] },
  { name: 'Trái Tim Yêu Thương', emoji: '💖', dots: [
    { x: 50, y: 35 }, { x: 75, y: 15 }, { x: 90, y: 40 }, { x: 50, y: 85 }, { x: 10, y: 40 }, { x: 25, y: 15 },
  ] },
  { name: 'Hình Tam Giác', emoji: '▲', dots: [{ x: 50, y: 15 }, { x: 85, y: 80 }, { x: 15, y: 80 }] },
  { name: 'Hình Vuông', emoji: '■', dots: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 80 }, { x: 20, y: 80 }] },
  { name: 'Chiếc Thuyền', emoji: '⛵', dots: [{ x: 50, y: 15 }, { x: 50, y: 60 }, { x: 90, y: 60 }, { x: 75, y: 85 }, { x: 25, y: 85 }, { x: 10, y: 60 }] },
  { name: 'Viên Kim Cương', emoji: '💎', dots: [{ x: 50, y: 12 }, { x: 85, y: 50 }, { x: 50, y: 88 }, { x: 15, y: 50 }] },
  { name: 'Ngọn Núi', emoji: '⛰️', dots: [{ x: 10, y: 80 }, { x: 35, y: 20 }, { x: 50, y: 45 }, { x: 68, y: 30 }, { x: 90, y: 80 }] },
  { name: 'Chiếc Phong Bì', emoji: '✉️', dots: [{ x: 15, y: 30 }, { x: 50, y: 55 }, { x: 85, y: 30 }, { x: 85, y: 75 }, { x: 15, y: 75 }] },
  { name: 'Cây Thông', emoji: '🌲', dots: [{ x: 50, y: 10 }, { x: 85, y: 65 }, { x: 60, y: 65 }, { x: 60, y: 90 }, { x: 40, y: 90 }, { x: 40, y: 65 }, { x: 15, y: 65 }] },
]
// Begin drawing with simple shapes, then progress to more numbered points.
DOT_LEVELS.sort((a,b) => a.dots.length-b.dots.length)

export const SCALE_QUESTIONS = [
  { id: 'sc1', askMore: true, leftCount: 4, rightCount: 2, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { id: 'sc2', askMore: false, leftCount: 1, rightCount: 3, itemEmoji: '🥕', itemLabel: 'củ cà rốt' },
  { id: 'sc3', askMore: true, leftCount: 3, rightCount: 5, itemEmoji: '⭐', itemLabel: 'ngôi sao' },
  { id: 'sc4', askMore: false, leftCount: 4, rightCount: 2, itemEmoji: '🍓', itemLabel: 'quả dâu tây' },
  { id: 'sc5', askMore: true, leftCount: 5, rightCount: 2, itemEmoji: '🐟', itemLabel: 'chú cá' },
  { id: 'sc6', askMore: false, leftCount: 3, rightCount: 1, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { id: 'sc7', askMore: true, leftCount: 2, rightCount: 5, itemEmoji: '🍓', itemLabel: 'quả dâu' },
  { id: 'sc8', askMore: false, leftCount: 2, rightCount: 4, itemEmoji: '🍎', itemLabel: 'quả táo' },
  { id: 'sc9', askMore: true, leftCount: 5, rightCount: 3, itemEmoji: '🍓', itemLabel: 'quả dâu' },
  { id: 'sc10', askMore: false, leftCount: 4, rightCount: 1, itemEmoji: '🍎', itemLabel: 'quả táo' },
]

export type AnswerResult = Promise<boolean | null>

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function nextDotCount(count: number, target: number, total: number): number {
  return target === count && count < total ? count + 1 : count
}

/** A task can award one point only, including when tapped repeatedly. */
export function createScoreTracker(total: number) {
  const tasks = new Set<string>()
  return {
    has: (id: string) => tasks.has(id),
    add(id: string) {
      if (tasks.has(id) || tasks.size >= total) return false
      tasks.add(id)
      return true
    },
    get points() { return tasks.size },
    get complete() { return tasks.size >= total },
  }
}
