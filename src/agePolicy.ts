import type { AgeId, Game } from './types'
/** hintAfter: wrong tries before the right answer glows softly. */
export const AGE_PLAY_POLICY: Record<AgeId, { rounds: number; choices: number; pairs: number; hintAfter: number; label: string }> = {
  '24-36': { rounds: 5, choices: 2, pairs: 2, hintAfter: 1, label: 'Chạm & khám phá' },
  '3-4': { rounds: 6, choices: 3, pairs: 3, hintAfter: 2, label: 'Quan sát & ghép đôi' },
  '4-5': { rounds: 8, choices: 3, pairs: 3, hintAfter: 2, label: 'Sắp xếp & suy luận' },
  '5-6': { rounds: 10, choices: 4, pairs: 4, hintAfter: 3, label: 'Tư duy & sáng tạo' },
}
export type PlayStyle = 'explore' | 'arrange' | 'listen' | 'create' | 'adventure'
export const PLAY_STYLES: Record<PlayStyle, string> = { explore: 'Chạm & chọn', arrange: 'Ghép & sắp xếp', listen: 'Nghe & ghi nhớ', create: 'Vẽ & tạo hình', adventure: 'Vuốt & khám phá' }
export function playStyleFor(game: Game): PlayStyle {
  if (['REVEAL', 'PATH', 'COLLECT'].includes(game.engine)) return 'adventure'
  if (['MEMORY', 'RHYTHM', 'MUSIC'].includes(game.engine)) return 'listen'
  if (['G02', 'G03', 'ORDER', 'NUMBER_TRAIN'].includes(game.engine)) return 'arrange'
  if (['DOTS', 'PUZZLE'].includes(game.engine)) return 'create'
  return 'explore'
}
export function sessionEntries<T>(game: Game, items: readonly T[]): T[] {
  if (!items.length) return []
  const count = Math.min(game.sessionLimit ?? items.length, items.length)
  const offset = ((game.sessionVisit ?? 0) * count) % items.length
  return Array.from({length:count}, (_,i) => items[(offset+i)%items.length])
}
/** Select a short session without changing the authored task library. */
export function prepareSessionGame(game: Game, visit = 0): Game {
  const policy = AGE_PLAY_POLICY[game.age]
  const take = <T,>(items: T[], count: number): T[] => {
    if (!items.length) return []
    const offset = (visit * count) % items.length
    return Array.from({ length: Math.min(count, items.length) }, (_, i) => items[(offset + i) % items.length])
  }
  const questions = take(game.questions, policy.rounds).map(q => {
    if (['ALPHABET', 'SPATIAL'].includes(game.engine) || q.options.length <= policy.choices) return q
    const correct = q.options.filter(o => o.correct)
    return { ...q, options: [...correct, ...q.options.filter(o => !o.correct).slice(0, policy.choices - correct.length)] }
  })
  let rounds = game.rounds
  if (rounds) {
    const pairs = take(rounds.flat(), policy.rounds)
    rounds = []
    for (const pair of pairs) {
      const row = rounds[rounds.length - 1]
      if (!row || row.length >= policy.pairs || row.some(p => JSON.stringify(p.left) === JSON.stringify(pair.left) || JSON.stringify(p.right) === JSON.stringify(pair.right))) rounds.push([pair])
      else row.push(pair)
    }
  }
  return { ...game, sessionLimit: policy.rounds, sessionVisit:visit, questions, rounds, items: game.items ? take(game.items, policy.rounds) : undefined }
}
