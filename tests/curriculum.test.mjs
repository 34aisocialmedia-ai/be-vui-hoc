import { prepareSessionGame } from '../src/agePolicy.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GAMES } from '../src/data/games.ts'
import { CURRICULUM } from '../src/data/curriculum.ts'
import { totalOf } from '../src/types.ts'
import { LearningPicture } from '../src/components/LearningPicture.tsx'
import { GameLibrary } from '../src/components/HomeWebsite.tsx'
import { Player } from '../src/Player.tsx'
import { coverFor } from '../src/gameCovers.ts'

test('the plan has exactly 216 games, 24 groups and nine activities per group', () => {
  assert.equal(GAMES.length, 216)
  assert.equal(CURRICULUM.length, 24)
  for (const [age, target] of Object.entries({ '24-36': 45, '3-4': 54, '4-5': 54, '5-6': 63 })) {
    const games = GAMES.filter(g => g.age === age)
    assert.equal(games.length, target, age)
    assert.equal(new Set(games.map(g => g.title)).size, games.length, age)
    for (const group of CURRICULUM.filter(g => g.age === age)) {
      assert.equal(group.entries.length, 9, `${age}/${group.category}`)
      assert.equal(games.filter(g => g.category === group.category).length, 9)
    }
  }
  for (const game of GAMES) assert.equal(totalOf(game), 10, game.id)
})

test('every choice is visually distinguishable and every match is unambiguous in its round', () => {
  for (const game of GAMES) {
    for (const q of game.questions) {
      const picture = o => JSON.stringify([o.emoji, o.photo, o.scale, o.x, o.y, game.engine === 'ALPHABET' ? o.label : ''])
      assert.equal(new Set(q.options.map(picture)).size, q.options.length, `${game.id}/${q.id}`)
      if (game.age === '24-36' && game.id.startsWith('plan-')) assert.ok(q.options.length <= 2, game.id)
      if (game.engine === 'ORDER') assert.equal(new Set(q.steps.map(s => s.emoji + (s.photo ?? ''))).size, q.steps.length, q.id)
    }
    for (const round of game.rounds ?? []) {
      for (const side of ['left', 'right']) {
        // Baby-animal legacy cards also use their labels to request the specific illustration.
        const identity = p => JSON.stringify([p[side].emoji, p[side].photo, p[side].label])
        assert.equal(new Set(round.map(identity)).size, round.length, `${game.id}/${side}`)
      }
      if (game.age === '24-36') assert.ok(round.length <= 2, game.id)
    }
  }
})

test('original nursery stories and riddles have meaningful narration labels', () => {
  for (const game of GAMES.filter(g => g.id.startsWith('plan-'))) for (const q of game.questions) {
    for (const option of q.options) assert.doesNotMatch(option.label, /^hình (đúng|khác)$/, q.id)
  }
})

test('number activities count individual objects and use valid sums, splits and missing numbers', () => {
  for (const game of GAMES.filter(g => g.id.startsWith('plan-') && g.category === 'math')) {
    for (const q of game.questions) {
      const answer = q.options.find(o => o.correct)
      if (game.id.endsWith('math-6') && game.age === '3-4' || game.id.endsWith('math-5') && game.age === '5-6') assert.equal(Number(answer.emoji), q.groups[0].length, q.id)
      if (/gộp/i.test(game.title)) assert.equal(Number(answer.emoji), q.groups.reduce((n, group) => n + group.length, 0), q.id)
      if (/tách|chia/i.test(game.title)) assert.equal(Number(answer.emoji), q.groups[0].length - q.groups[1].length, q.id)
      if (q.sequence) {
        const values = q.sequence.map(n => n ?? Number(answer.emoji))
        assert.ok(values.every((n, i) => i === 0 || n - values[i - 1] === (game.title.includes('ngược') ? -1 : 1)), q.id)
      }
    }
  }
})

test('before/after stories put the blank on the requested side; spatial answers match their coordinates', () => {
  const coords = { above: [50, 18], below: [50, 82], left: [18, 50], right: [82, 50] }
  for (const game of GAMES) for (const q of game.questions) {
    if (q.patternBlank) assert.equal(q.patternBlank, q.text.startsWith('Trước') ? 'start' : 'end', q.id)
    if (q.position) {
      const answer = q.options.find(o => o.correct)
      assert.deepEqual([answer.x, answer.y], coords[q.position], q.id)
    }
  }
})

test('letter lessons together cover all 29 Vietnamese letters', () => {
  const letters = new Set(GAMES.filter(g => g.age === '5-6' && g.engine === 'ALPHABET').flatMap(g => g.questions.flatMap(q => q.options.map(o => o.label))))
  assert.deepEqual([...letters].sort(), Array.from('AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY').sort())
})

test('spatial and size previews faithfully reproduce positions and relative sizes', () => {
  for (const game of GAMES.filter(g => g.id.startsWith('plan-'))) {
    const q = game.questions[0], cover = coverFor(game)
    if (game.engine === 'SPATIAL') {
      assert.deepEqual(cover.reference, q.reference)
      assert.deepEqual(cover.pictures.map(p => [p.x, p.y]), q.options.map(o => [o.x, o.y]), game.id)
    }
    if (q?.options.some(o => o.scale)) assert.deepEqual(cover.pictures.map(p => p.scale), q.options.map(o => o.scale), game.id)
  }
})

test('every learning picture is local and valid; counted objects never request a composite emoji file', () => {
  const assertImages = (html, id) => {
    for (const [, src] of html.matchAll(/src="([^"]+)"/g)) assert.ok(fs.existsSync('public' + src), `${id}: ${src}`)
  }
  for (const game of GAMES) {
    const cards = [...game.questions.flatMap(q => [...q.options, ...(q.steps ?? []), ...(q.pattern ?? []).map(emoji => ({ emoji })), ...(q.groups ?? []).flat().map(emoji => ({ emoji })), ...(q.show ? Array.from(q.show.replace(/[\s\uFE0F]/g, '')).map(emoji => ({ emoji })) : []), ...(q.reference ? [q.reference] : [])]),
      ...(game.pads ?? []), ...(game.items ?? []), ...(game.baskets ?? []), ...(game.rounds ?? []).flatMap(r => r.flatMap(p => [p.left, p.right]))]
    for (const card of cards) assertImages(renderToStaticMarkup(React.createElement(LearningPicture, card)), game.id)
  }
  for (const age of ['24-36', '3-4', '4-5', '5-6']) assertImages(renderToStaticMarkup(React.createElement(GameLibrary, { age, plays: {}, onAgeChange() {}, onPlayGame() {} })), age)
})

test('all 216 games can render their player; no newly added engine is missing its task data', () => {
  for (const game of GAMES) {
    const html = renderToStaticMarkup(React.createElement(Player, { game, settings: { sound: false, rewards: false, limit: 0 }, onExit() {}, onReplay() {}, onReward() {}, onFinish() {} }))
    assert.ok(html.includes(`0/${totalOf(prepareSessionGame(game))}`), game.id)
    if (game.engine === 'RHYTHM') assert.ok(html.includes('rhythm-pads'), game.id)
    if (game.engine === 'ORDER') assert.ok(html.includes('story-slots'), game.id)
    if (game.engine === 'SPATIAL') assert.ok(html.includes('spatial-board'), game.id)
  }
})
