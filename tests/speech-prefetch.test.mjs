import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GAMES } from '../src/data/games.ts'
import { prepareSessionGame } from '../src/agePolicy.ts'
import { spokenLines } from '../src/speechPrefetch.ts'

const manifest = JSON.parse(readFileSync(new URL('../public/audio/manifest.json', import.meta.url), 'utf8'))
const recorded = text => manifest[text.trim().toLowerCase().replace(/\s+/g, ' ')]

test('every game session finds Cô Thủy recordings to fetch before the child taps', () => {
  for (const game of GAMES) {
    const lines = spokenLines(prepareSessionGame(game, 0)).filter(recorded)
    assert.ok(lines.length > 0, game.id)
    if (game.questions[0]) assert.equal(lines[0] === game.prompt || lines.includes(game.questions[0].text), true, game.id)
  }
})
