import { readFileSync, writeFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.ts'
const manifest = JSON.parse(readFileSync('public/audio/manifest.json', 'utf8'))
const texts = new Set(['5 – 6 tuổi'])
for (const game of GAMES) {
  if (game.prompt) texts.add(game.prompt)
  for (const q of game.questions) {
    texts.add(q.text)
    if (q.steps) {
      texts.add(`Con xếp chuyện nhé. ${q.steps.map((s, i) => `${i === 0 ? 'Đầu tiên' : i === q.steps.length - 1 ? 'Cuối cùng' : 'Tiếp theo'}, ${s.label}`).join('. ')}.`)
      for (const step of q.steps) texts.add(step.label)
    }
    for (const o of q.options) if (o.say !== '') texts.add(o.say || o.label)
  }
  for (const item of game.items || []) texts.add(item.label)
  for (const basket of game.baskets || []) texts.add(basket.label)
  for (const round of game.rounds || []) for (const p of round) {
    texts.add(p.left.label)
    texts.add(p.right.label)
  }
}
const pending = [...texts].filter(t => !manifest[t.trim().toLowerCase().replace(/\s+/g, ' ')])
writeFileSync('review/curriculum-audio-pending.json', JSON.stringify(pending.filter(Boolean), null, 2))
console.log(`${pending.length} new phrases need recordings`)
