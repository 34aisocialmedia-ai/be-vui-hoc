import type { Game } from './types'
import { CORRECT_FEEDBACK, FINISH_FEEDBACK, RETRY_FEEDBACK } from './teacherVoice'

/**
 * Every sentence a session may say, in the order the child is likely to hear it:
 * the opening prompt and questions first, then feedback, then labels and other text.
 * Strings without a recording (ids, emoji, engine names) are filtered out by prefetchSpeech.
 */
export function spokenLines(game: Game): string[] {
  const lines = new Set<string>()
  const add = (text: unknown) => { if (typeof text === 'string' && text.trim()) lines.add(text) }
  const walk = (value: unknown): void => {
    if (typeof value === 'string') add(value)
    else if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }

  add(game.prompt)
  game.questions.slice(0, 2).forEach(q => add(q.text))
  CORRECT_FEEDBACK.forEach(add)
  RETRY_FEEDBACK.forEach(add)
  game.questions.forEach(q => add(q.text))
  // Sentences engines build from the game data.
  for (const item of game.items ?? []) {
    add(`${game.prompt || 'Bé hãy cho bạn ăn nhé!'}: ${item.label}`)
    add(item.label)
  }
  add(game.prompt ?? 'Con hãy ghép đôi nhé!')
  add('Con hãy bỏ vào đúng giỏ nhé!')
  add(FINISH_FEEDBACK)
  walk(game)
  return [...lines]
}
