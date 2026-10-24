import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GAMES } from '../src/data/games.ts'
import { GAME_COVERS, GAME_TILE_NAMES, coverFor } from '../src/gameCovers.ts'
import { GameArtwork } from '../src/components/GameArtwork.tsx'
import { LearningPicture, photoFor } from '../src/components/LearningPicture.tsx'
import { DOT_LEVELS, SCALE_QUESTIONS } from '../src/gameLogic.ts'

const find = id => GAMES.find(g => g.id === id)
const htmlFor = id => renderToStaticMarkup(createElement(GameArtwork, { game: find(id) }))

test('every game has a reviewed cover and no two games share a generic cover', () => {
  assert.deepEqual(Object.keys(GAME_COVERS).sort(), GAMES.map(g => g.id).sort())
  const illustrations = new Set()
  for (const game of GAMES) {
    const { label, ...content } = coverFor(game)
    assert.ok(label, game.id)
    const identity = JSON.stringify(content)
    assert.equal(illustrations.has(identity), false, game.id + ' repeats another game cover')
    illustrations.add(identity)
    const html = htmlFor(game.id)
    assert.equal(html.includes('play-garden-3d.webp'), false, game.id)
    for (const src of html.matchAll(/src="([^"]+)"/g)) {
      assert.ok(existsSync(new URL('../public' + src[1], import.meta.url)), game.id + ': ' + src[1])
    }
  }
  assert.throws(() => coverFor({ id: 'unknown-game' }), /unknown-game/)
})

test('reported wrong previews show professions, habitats and silhouettes instead of garden or cats', () => {
  assert.match(htmlFor('c1-ghepdoi-nghe'), /jobs-match\.webp/)
  assert.doesNotMatch(htmlFor('c1-ghepdoi-nghe'), /cat_real|dog_real/)
  assert.match(htmlFor('c1-phanloai-dongvat'), /animal-habitats\.webp/)
  assert.match(htmlFor('c1-khopbong'), /animal-shadow\.webp/)
  assert.equal(GAME_TILE_NAMES['c1-khopbong'], 'Khớp bóng muông thú')
  assert.match(htmlFor('c1-khancap'), /ask-help\.webp/)
  assert.match(htmlFor('c1-ungxu'), /help-friend\.webp/)
  assert.match(htmlFor('c1-moitruong'), /environment\.webp/)
})

test('count and comparison covers show numbers and objects from actual game activities', () => {
  for (const id of ['b1-dem5', 'c1-dem10']) {
    const cover = coverFor(find(id))
    assert.ok(find(id).questions.some(q => q.show === cover.emoji.repeat(cover.count)), id)
    const html = htmlFor(id)
    assert.match(html, new RegExp('data-object-count="' + cover.count + '"'))
    // Each counted object is its own drawn picture.
    assert.equal((html.match(/class="art-picture /g) || []).length, cover.count)
  }
  for (const id of ['b1-sosanh', 'c1-sosanh']) {
    const cover = coverFor(find(id))
    assert.ok(find(id).questions.some(q => q.options.some(o => o.emoji === cover.emoji.repeat(cover.left)) && q.options.some(o => o.emoji === cover.emoji.repeat(cover.right))), id)
  }
  for (const id of ['b1-can-thangbang', 'c1-can-thangbang']) {
    const cover = coverFor(find(id))
    assert.ok(SCALE_QUESTIONS.some(q => q.itemEmoji === cover.emoji && q.leftCount === cover.left && q.rightCount === cover.right), id)
  }
  const match = coverFor(find('b1-ghepdoi-so'))
  find('b1-ghepdoi-so').rounds[0].forEach((pair, i) => assert.equal(pair.right.emoji, match.emojis[i].repeat(match.values[i])))
  assert.equal((htmlFor('c1-dots').match(/<circle /g) || []).length, DOT_LEVELS[0].dots.length)
})

test('counted fruit images depict individual fruit instead of a photograph of a pile', () => {
  for (const emoji of ['🍎', '🍓']) {
    const group = renderToStaticMarkup(createElement(LearningPicture, { emoji: emoji.repeat(4), label: 'Bốn quả' }))
    assert.equal((group.match(/<svg class="art-picture /g) || []).length, 4)
    assert.doesNotMatch(group, /apple_real|strawberry_real|<img /)
  }
})

test('removed feeding games are absent and firefighter portraits do not use truck photos', () => {
  for (const id of ['a1-qua', 'a1-hanoi', 'b1-thucpham']) {
    assert.equal(find(id), undefined)
    assert.equal(GAME_COVERS[id], undefined)
  }
  for (const game of GAMES) for (const question of game.questions) for (const option of question.options) {
    if (option.emoji === '🧑‍🚒') assert.notEqual(option.photo, '/assets/photos/fire_truck_real.webp')
  }
})

test('mislabeled duck and fire truck files are no longer used by covers or game data', () => {
  assert.match(photoFor('🦆'), /duck_verified_real\.webp$/)
  assert.match(photoFor('🚒'), /fire_truck_verified_real\.webp$/)
  assert.doesNotMatch(JSON.stringify(GAMES), /\/duck_real\.webp|\/fire_truck_real\.webp/)
  for (const game of GAMES) assert.doesNotMatch(htmlFor(game.id), /\/duck_real\.webp|\/fire_truck_real\.webp/)
})

