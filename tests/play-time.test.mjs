// The rest reminder after the play-time limit (30 minutes by default).
import test from 'node:test'
import assert from 'node:assert/strict'
import { afterRest, BREAK_MS, DEFAULT_LIMIT, fresh, REST_MS, restLeft, resume, tick } from '../src/playTime.ts'
import { normalizeSave } from '../src/store.ts'

const MIN = 60_000
const play = (t, minutes, { counting = true, limit = 30, start = t.lastActive } = {}) => {
  let s = t, now = start
  for (let i = 0; i < minutes * 30; i++) { now += 2000; s = tick(s, { now, delta: 2000, counting, limitMinutes: limit }) }
  return s
}

test('time counts only after the first game, on child screens, and the popup comes at the limit', () => {
  const t0 = fresh(0)
  assert.equal(play(t0, 40).elapsed, 0, 'browsing before the first game does not count')
  const started = { ...t0, started: true }
  const almost = play(started, 29)
  assert.equal(almost.restUntil, undefined)
  assert.ok(Math.abs(almost.elapsed - 29 * MIN) < 1000)
  const due = play(almost, 1.1)
  assert.ok(due.restUntil !== undefined, 'the rest popup is due after 30 minutes')
  assert.equal(restLeft(due, due.restUntil - REST_MS), REST_MS)
  // The parents' area / studio / hidden app do not count.
  assert.equal(play(started, 40, { counting: false }).elapsed, 0)
  // Off when the parent chose "no reminder".
  assert.equal(play(started, 90, { limit: 0 }).restUntil, undefined)
})

test('a reload keeps the time; a real break starts again; a rest in progress stays', () => {
  const mid = { ...fresh(0), started: true, elapsed: 20 * MIN, lastActive: 1000 }
  assert.equal(resume(mid, 1000 + 2 * MIN).elapsed, 20 * MIN)
  assert.equal(resume(mid, 1000 + BREAK_MS + 1).elapsed, 0)
  const resting = { ...mid, restUntil: 5000 }
  assert.equal(resume(resting, 1000 + BREAK_MS * 3).restUntil, 5000)
  const after = afterRest(9000)
  assert.deepEqual(after, { elapsed: 0, lastActive: 9000, started: true })
})

test('old saves with the former 15-minute default move to 30 minutes; other choices stay', () => {
  assert.equal(DEFAULT_LIMIT, 30)
  assert.equal(normalizeSave(null).settings.limit, 30)
  assert.equal(normalizeSave({ settings: { limit: 15 } }).settings.limit, 30)
  assert.equal(normalizeSave({ settings: { limit: 15, limitV: 2 } }).settings.limit, 15)
  assert.equal(normalizeSave({ settings: { limit: 0 } }).settings.limit, 0)
  assert.equal(normalizeSave({ settings: { limit: 45 } }).settings.limit, 45)
  assert.equal(normalizeSave({ settings: { limit: 7 } }).settings.limit, 30)
})
