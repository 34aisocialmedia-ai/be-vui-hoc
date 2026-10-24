import fs from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GAMES } from '../src/data/games.ts'
import { totalOf } from '../src/types.ts'
import { LearningPicture } from '../src/components/LearningPicture.tsx'
const missing = new Map()
for (const game of GAMES) {
  const cards = [...game.questions.flatMap(q => [...q.options, ...(q.steps || []), ...(q.pattern || []).map(emoji => ({ emoji, label: '' })), ...(q.reference ? [q.reference] : [])]),
    ...(game.pads || []), ...(game.items || []), ...(game.baskets || []), ...(game.rounds || []).flatMap(r => r.flatMap(p => [p.left, p.right]))]
  for (const card of cards) {
    const html = renderToStaticMarkup(React.createElement(LearningPicture, card))
    for (const [, src] of html.matchAll(/src="([^"]+)"/g)) if (!fs.existsSync('public' + src)) missing.set(src, { emoji: card.emoji, label: card.label, src })
  }
}
fs.writeFileSync('review/missing-pictures.json', JSON.stringify([...missing.values()], null, 2))
const report = GAMES.map(g => ({ id: g.id, title: g.title, age: g.age, category: g.category, engine: g.engine, tasks: totalOf(g), mt: g.mt }))
fs.writeFileSync('review/curriculum-216.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify({ games: report.length, missingPictures: [...missing.values()] }, null, 2))
