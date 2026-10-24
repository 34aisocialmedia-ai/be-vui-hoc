import test from 'node:test'
import assert from 'node:assert/strict'
import { mazeFor, moveInMaze, revealCells, changeCollection } from '../src/adventureLogic.ts'
import { GAMES } from '../src/data/games.ts'
import { prepareSessionGame } from '../src/agePolicy.ts'

test('every maze variant has a reachable destination without crossing walls or wrapping rows',()=>{
 for(const age of ['3-4','4-5','5-6']) for(let round=0;round<30;round++) {
  const maze=mazeFor(age,round),visited=new Set([maze.start]),queue=[maze.start]
  while(queue.length) {
   const from=queue.shift()
   for(const to of [from-1,from+1,from-maze.size,from+maze.size]) {
    const next=moveInMaze(maze,from,to)
    if(next!==from) {
     assert.equal(Math.abs(from%maze.size-next%maze.size)+Math.abs(Math.floor(from/maze.size)-Math.floor(next/maze.size)),1)
     assert.ok(maze.open.includes(next))
     if(!visited.has(next)){visited.add(next);queue.push(next)}
    }
   }
  }
  assert.ok(visited.has(maze.goal),`${age}/${round}: unreachable goal`)
  assert.equal(visited.size,maze.open.length,`${age}/${round}: isolated path`)
  for(let to=-1;to<=maze.size*maze.size;to++) if(!maze.open.includes(to)) assert.equal(moveInMaze(maze,maze.start,to),maze.start)
 }
})

test('fast swipes reveal all crossed tiles and ignore coordinates outside the board',()=>{
 assert.deepEqual(revealCells({x:.01,y:.2},{x:.99,y:.2},4,3),[0,1,2,3])
 assert.deepEqual(revealCells({x:.8,y:.01},{x:.8,y:.99},4,3),[3,7,11])
 assert.deepEqual(revealCells({x:-1,y:-1},{x:-.1,y:-.1},4,3),[])
 assert.deepEqual(revealCells({x:.5,y:.5},{x:.5,y:.5},3,2),[4])
 const cells=revealCells({x:-.5,y:.2},{x:1.5,y:.2},3,2)
 assert.deepEqual(cells,[0,1,2])
})

test('collection permits correcting excess fruit and never exceeds the visible basket capacity',()=>{
 let count=0
 for(let i=0;i<15;i++)count=changeCollection(count,1)
 assert.equal(count,10)
 count=changeCollection(count,-1)
 assert.equal(count,9)
 for(let i=0;i<15;i++)count=changeCollection(count,-1)
 assert.equal(count,0)
})

test('new activities span all four ages and collection targets remain valid after session rotation',()=>{
 const games=GAMES.filter(g=>['REVEAL','COLLECT','PATH'].includes(g.engine))
 assert.equal(games.length,10)
 assert.equal(new Set(games.map(g=>g.age)).size,4)
 for(const game of games) for(const visit of [0,1,5]) for(const q of prepareSessionGame(game,visit).questions) {
  const correct=q.options.filter(o=>o.correct)
  assert.equal(correct.length,1)
  if(game.engine==='COLLECT') {
   const target=Number(correct[0].emoji)
   assert.ok(target>=1&&target<=10)
   assert.equal(q.groups[0].length,target)
   assert.equal(new Set(q.groups[0]).size,1)
  }
 }
})
