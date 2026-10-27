import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createScoreTracker, DOT_LEVELS, nextDotCount, TRAIN_ROUNDS, SCALE_QUESTIONS, shuffle } from '../src/gameLogic.ts'
import { totalOf, AGES } from '../src/types.ts'
import { GAMES, gamesFor } from '../src/data/games.ts'
import { normalizeSave } from '../src/store.ts'
import { VisualCard } from '../src/components/VisualCard.tsx'

test('all game activities have valid goals, unique IDs and reachable totals', () => {
  assert.equal(new Set(GAMES.map(g => g.id)).size, GAMES.length)
  for (const game of GAMES) {
    assert.ok(totalOf(game) > 0, game.id)
    for (const q of game.questions) {
      if (game.engine === 'ORDER') assert.ok(q.steps.length >= 2, q.id)
      else if (game.engine === 'RHYTHM') assert.ok(q.notes.length > 0 && q.notes.every(n => n >= 0 && n < game.pads.length), q.id)
      else assert.equal(q.options.filter(o => o.correct).length, 1, q.id)
      assert.equal(new Set(q.options.map(o => o.id)).size, q.options.length, q.id)
    }
    for (const round of game.rounds || []) assert.equal(new Set(round.map(p => p.id)).size, round.length, game.id)
    if (game.engine === 'G03') for (const item of game.items) assert.ok(game.baskets.some(b => b.id === item.to), item.id)
  }
})

test('every dot drawing completes on its last numbered point', () => {
  for (const level of DOT_LEVELS) {
    let count = 0
    assert.equal(nextDotCount(count, 1, level.dots.length), 0, 'out-of-order tap ignored')
    for (let i = 0; i < level.dots.length; i++) count = nextDotCount(count, i, level.dots.length)
    assert.equal(count, level.dots.length)
    assert.equal(nextDotCount(count, 0, level.dots.length), count)
  }
})

test('same task cannot award twice and scoring cannot exceed total', () => {
  const tracker = createScoreTracker(3)
  assert.equal(tracker.add('first'), true)
  assert.equal(tracker.add('first'), false)
  tracker.add('second'); tracker.add('third')
  assert.equal(tracker.complete, true)
  assert.equal(tracker.add('extra'), false)
  assert.equal(tracker.points, 3)
})

test('repeated pair names in different rounds still have distinct score IDs', () => {
  const tracker = createScoreTracker(2)
  assert.equal(tracker.add('0-cat'), true)
  assert.equal(tracker.add('1-cat'), true)
  assert.equal(tracker.complete, true)
})

test('engine totals follow actual configured rounds', () => {
  const base = { questions: [], rounds: [], age: '3-4' }
  assert.equal(totalOf({ ...base, engine: 'DOTS' }), DOT_LEVELS.length)
  assert.equal(totalOf({ ...base, engine: 'NUMBER_TRAIN' }), TRAIN_ROUNDS.length)
  assert.equal(totalOf({ ...base, engine: 'SCALE' }), SCALE_QUESTIONS.length)
})

test('loading older or invalid saves preserves valid progress and merges defaults', () => {
  const save = normalizeSave({ collection: { '⭐': 2, invalid: -1 }, plays: { one: 3, bad: '4' }, settings: { sound: false } })
  assert.deepEqual(save.collection, { '⭐': 2 })
  assert.deepEqual(save.plays, { one: 3 })
  assert.equal(save.settings.sound, false)
  assert.equal(save.settings.rewards, true)
  assert.equal(save.settings.limit, 30)
  assert.ok(['full', 'light', 'off'].includes(save.settings.motion), 'motion setting falls back to a valid level')
  assert.equal(normalizeSave({ settings: { motion: 'off' } }).settings.motion, 'off')
  assert.equal(normalizeSave({ settings: { motion: 'wild' } }).settings.motion, 'full')
  assert.deepEqual(save.rewardedSessions, [])
  for (const value of [null, [], true, 'broken', { settings: null, collection: null }]) assert.equal(normalizeSave(value).preferredAge, '3-4')
})

test('shuffle never mutates the source or loses a card', () => {
  const original = [1, 2, 3, 4, 5]
  assert.deepEqual(shuffle(original).sort(), original)
  assert.deepEqual(original, [1, 2, 3, 4, 5])
})

test('answer and pronunciation controls are separate buttons', () => {
  const html = renderToStaticMarkup(createElement(VisualCard, { emoji: '🐱', label: 'Mèo', onClick() {} }))
  assert.equal((html.match(/<button\b/g) || []).length, 2)
  assert.equal(/<button[^>]*>[\s\S]*<button/.test(html.split('</button>')[0]), false)
})

test('game photos and Cô Thủy recordings exist locally', () => {
  for (const game of GAMES) for (const q of game.questions) for (const option of q.options) {
    if (option.photo) assert.ok(existsSync(new URL('../public' + option.photo, import.meta.url)), option.photo)
  }
  const manifest = JSON.parse(readFileSync(new URL('../public/audio/manifest.json', import.meta.url), 'utf8'))
  assert.equal(Object.keys(manifest).length, 1446)
  for (const hash of new Set(Object.values(manifest))) {
    assert.ok(existsSync(new URL(`../public/audio/co-thuy/${hash}.mp3`, import.meta.url)), `co-thuy/${hash}`)
  }
})

test('the 5–6 age group contains playable activities and survives loading a saved preference', () => {
  assert.ok(AGES.some(age => age.id === '5-6'))
  const games = gamesFor('5-6')
  assert.equal(games.length, 63)
  assert.ok(games.every(game => totalOf(game) >= 10))
  assert.equal(normalizeSave({ preferredAge: '5-6', collection: { '⭐': 3 }, plays: { example: 2 } }).preferredAge, '5-6')
})

test('weekday choices show their actual day number and have distinct pictures', () => {
  const days = ['hai', 'ba', 'tư', 'năm', 'sáu', 'bảy']
  for (const q of GAMES.find(game => game.id === 'c1-thu').questions) {
    assert.equal(new Set(q.options.map(o => o.emoji)).size, q.options.length)
    for (const o of q.options) {
      assert.equal(o.emoji, String(days.indexOf(o.label.replace('thứ ', '')) + 2))
      const html = renderToStaticMarkup(createElement(VisualCard, { ...o, onClick() {} }))
      assert.match(html, /picture-number/)
      assert.doesNotMatch(html, /1f4c5/)
    }
  }
})

test('new number sequences and fruit patterns have mathematically correct answers', () => {
  const sequence = GAMES.find(g => g.id === 'd1-so-thutu')
  for (const q of sequence.questions) {
    const answer = Number(q.options.find(o => o.correct).emoji)
    const completed = q.sequence.map(n => n ?? answer)
    assert.equal(completed[1], completed[0] + 1)
    assert.equal(completed[2], completed[1] + 1)
  }
  for (const q of GAMES.find(g => g.id === 'd1-quyluat-qua').questions) {
    assert.deepEqual(q.pattern.slice(0, 2), q.pattern.slice(3, 5))
    assert.equal(q.options.find(o => o.correct).emoji, q.pattern[2])
  }
  const pairs = GAMES.find(g => g.id === 'd1-ghepdoi-so').rounds.flat()
  assert.deepEqual(pairs.map(p => Number(p.left.emoji)), [1,2,3,4,5,6,7,8,9,10])
  for (const p of pairs) assert.equal(Array.from(p.right.emoji).length, Number(p.left.emoji))
})

test('sticker album keeps old prizes, picks a known next sticker and only speaks recorded lines', async () => {
  const { ALL_STICKERS, STICKER_PAGES, nextSticker, stickerCheer, stickerHello } = await import('../src/stickers.ts')
  assert.equal(new Set(ALL_STICKERS.map(s => s.emoji)).size, ALL_STICKERS.length)
  // The ten prizes of the old gift box stay in the album, so counts already saved still show.
  for (const emoji of ['🪙', '💎', '🥇', '🧸', '🐥', '🏅', '🌻', '🦄', '👑', '🎀']) assert.ok(ALL_STICKERS.some(s => s.emoji === emoji && s.legacy), emoji)
  // First empty slot of the game's own world, then the first empty slot anywhere, then the least collected.
  assert.equal(nextSticker({}, 'pond').sticker.emoji, '🐸')
  const pond = Object.fromEntries(STICKER_PAGES.find(p => p.id === 'pond').stickers.map(s => [s.emoji, 1]))
  assert.equal(nextSticker(pond, 'pond').sticker.emoji, '🐥')
  const full = Object.fromEntries(ALL_STICKERS.map(s => [s.emoji, 2]))
  full['🦀'] = 1
  assert.equal(nextSticker(full, 'pond').sticker.emoji, '🦀')
  const manifest = 'public/audio/manifest.json'
  if (existsSync(manifest)) {
    const recorded = JSON.parse(readFileSync(manifest, 'utf8'))
    const said = text => text.trim().toLowerCase().replace(/\s+/g, ' ')
    for (const s of ALL_STICKERS) for (const line of [...stickerCheer(s), stickerHello(s)]) assert.ok(recorded[said(line)], line)
  }
})
test('playtest summary and CSV export match the Đợt D measures', async () => {
  const { summarize, toCsv, CSV_COLUMNS, cleanTesterCode } = await import('../src/playtest.ts')
  const base = { tester: 'B01', testerAge: '3-4', gameId: 'g', title: 'Trò, "vui"', engine: 'G01', gameAge: '3-4', motion: 'full', startedAt: '2026-10-21T04:00:00.000Z',
    taps: 10, deadTaps: 2, deadZones: { 'ban-dong-hanh': 2 }, lockedTaps: 1, correct: 5, wrong: 1, tasksDone: 5, tasksTotal: 6, idle: 0, durationMs: 61000 }
  const sessions = [
    { ...base, id: 'a', firstTouchMs: 2000, status: 'finished' },
    { ...base, id: 'b', firstTouchMs: 4000, status: 'quit', tester: 'B02' },
    { ...base, id: 'c', firstTouchMs: null, status: 'closed' },
    { ...base, id: 'd', firstTouchMs: 9000, status: 'playing' },
  ]
  const sum = summarize(sessions)
  assert.equal(sum.sessions, 3)
  assert.equal(sum.testers, 2)
  assert.equal(Math.round(sum.finishedRate * 100), 33)
  assert.equal(Math.round(sum.quitRate * 100), 67)
  assert.equal(sum.medianFirstTouchS, 3)
  assert.equal(sum.deadTapsPerSession, 2)
  const csv = toCsv(sessions)
  assert.ok(csv.startsWith('﻿' + CSV_COLUMNS.join(',')))
  const lines = csv.trim().split('\r\n')
  assert.equal(lines.length, 5)
  assert.ok(lines[1].includes('"Trò, ""vui"""'))
  assert.ok(lines[1].endsWith(',choi_het,61'))
  assert.equal(cleanTesterCode('Bé An <3>'), 'BéAn3')
})

test('every game belongs to exactly one of the three modes, each with enough games for every age', async () => {
  const { modeOf, poolFor, journeyFor, nextJourney, wishesFor, episodesFor } = await import('../src/modes.ts')
  for (const game of GAMES) assert.ok(['island', 'friend', 'movies'].includes(modeOf(game)), game.id)
  for (const age of AGES.map(a => a.id)) {
    const sizes = ['island', 'friend', 'movies'].map(mode => poolFor(mode, age).length)
    assert.equal(sizes.reduce((a, b) => a + b, 0), gamesFor(age).length, age)
    for (const size of sizes) assert.ok(size >= 8, `${age}: ${sizes}`)
  }
  assert.equal(modeOf({ engine: 'ORDER', category: 'discovery', domain: 'nhan_thuc' }), 'movies')
  assert.equal(modeOf({ engine: 'RHYTHM', category: 'music', domain: 'tham_my' }), 'friend')
  assert.equal(modeOf({ engine: 'G01', category: 'math', domain: 'nhan_thuc' }), 'island')
  // A journey is kept for the day, renewed the next day, and a new round avoids the stations just played.
  const first = journeyFor(undefined, '3-4', {}, '2026-10-21')
  assert.equal(first.stations.length, 3)
  assert.equal(journeyFor(first, '3-4', {}, '2026-10-21'), first)
  assert.notEqual(journeyFor(first, '3-4', {}, '2026-10-22'), first)
  const second = nextJourney({ ...first, done: first.stations }, {})
  assert.equal(second.round, 2)
  assert.ok(second.stations.every(id => !first.stations.includes(id)))
  // Least played first.
  const plays = Object.fromEntries(poolFor('friend', '3-4').slice(0, 5).map(g => [g.id, 3]))
  assert.ok(wishesFor('3-4', plays, '2026-10-21').every(g => !plays[g.id]))
  const eps = episodesFor('4-5', { [poolFor('movies', '4-5')[0].id]: 1 })
  assert.equal(eps.next, 1)
})

test('saved journey and chosen friend survive loading, broken values are dropped', () => {
  const save = normalizeSave({ journey: { day: '2026-10-21', age: '3-4', stations: ['a', 'b', 1], done: ['a'], round: 2 }, friend: 'monkey' })
  assert.deepEqual(save.journey, { day: '2026-10-21', age: '3-4', stations: ['a', 'b'], done: ['a'], round: 2 })
  assert.equal(save.friend, 'monkey')
  const broken = normalizeSave({ journey: { day: 5 }, friend: 'dragon' })
  assert.equal(broken.journey, undefined)
  assert.equal(broken.friend, undefined)
})

test('the mode screens only reuse lines Cô Thủy has recorded', async () => {
  const { MODE_LINES } = await import('../src/components/Modes.tsx')
  const manifest = 'public/audio/manifest.json'
  if (!existsSync(manifest)) return
  const recorded = JSON.parse(readFileSync(manifest, 'utf8'))
  for (const line of Object.values(MODE_LINES)) assert.ok(recorded[line.trim().toLowerCase().replace(/\s+/g, ' ')], line)
})

test('every game tile says how to play and sits in one of the three worlds', async () => {
  const { ACTIONS } = await import('../src/components/CoverStage.tsx')
  const { GAMES } = await import('../src/data/games.ts')
  const { MODES, modeOf } = await import('../src/modes.ts')
  for (const game of GAMES) {
    assert.ok(ACTIONS[game.engine], `${game.id}: ${game.engine}`)
    assert.ok(MODES[modeOf(game)], game.id)
  }
})
