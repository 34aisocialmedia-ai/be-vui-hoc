import test from 'node:test'
import assert from 'node:assert/strict'
import { GAMES } from '../src/data/games.ts'
import { totalOf } from '../src/types.ts'
import { AGE_PLAY_POLICY, prepareSessionGame, playStyleFor, PLAY_STYLES } from '../src/agePolicy.ts'

test('all age sessions have reachable totals without changing authored content', () => {
 for (const game of GAMES) {
  const before = JSON.stringify(game)
  for (const visit of [0,1,2,7]) {
   const session = prepareSessionGame(game,visit), policy = AGE_PLAY_POLICY[game.age]
   assert.equal(totalOf(session), policy.rounds, game.id)
   assert.ok(PLAY_STYLES[playStyleFor(game)],game.id)
   for (const q of session.questions) {
    if(q.options.length) assert.equal(q.options.filter(o=>o.correct).length,1,`${game.id}/${q.id}`)
    if(!['ALPHABET','SPATIAL'].includes(game.engine)) assert.ok(q.options.length <= policy.choices,game.id)
   }
   for(const round of session.rounds??[]) {
    assert.ok(round.length<=policy.pairs,game.id)
    for(const side of ['left','right']) assert.equal(new Set(round.map(p=>JSON.stringify(p[side]))).size,round.length,`${game.id}: ambiguous ${side}`)
   }
   const ids = session.rounds?.flat().map(p=>p.id) ?? session.items?.map(i=>i.id) ?? session.questions.map(q=>q.id)
   assert.equal(new Set(ids).size,ids.length,game.id)
  }
  assert.equal(JSON.stringify(game),before,game.id)
 }
})
test('repeat visits rotate shorter sessions and letter recognition belongs to ages 5–6',()=>{
 for(const game of GAMES) {
  if(game.engine==='ALPHABET') {assert.equal(game.age,'5-6'); assert.equal(game.category,'letters')}
  if(game.questions.length>AGE_PLAY_POLICY[game.age].rounds) assert.notEqual(prepareSessionGame(game,0).questions[0].id,prepareSessionGame(game,1).questions[0].id)
 }
})

test('specialist sessions share the progress total and expose all tasks across repeat visits',async()=>{
 const { sessionEntries } = await import('../src/agePolicy.ts')
 const { DOT_LEVELS, TRAIN_ROUNDS, SCALE_QUESTIONS } = await import('../src/gameLogic.ts')
 for(const [engine,pool] of [['DOTS',DOT_LEVELS],['NUMBER_TRAIN',TRAIN_ROUNDS],['SCALE',SCALE_QUESTIONS]]) {
  const game=GAMES.find(g=>g.engine===engine), seen=new Set()
  for(let visit=0;visit<pool.length;visit++) {
   const session=prepareSessionGame(game,visit), rows=sessionEntries(session,pool)
   assert.equal(rows.length,totalOf(session))
   rows.forEach(row=>seen.add(JSON.stringify(row)))
  }
  assert.equal(seen.size,pool.length)
 }
 assert.equal(DOT_LEVELS[0].dots.length,3)
})
