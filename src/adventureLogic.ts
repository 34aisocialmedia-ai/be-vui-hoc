import type { AgeId } from './types'
export interface Maze { size:number; open:number[]; start:number; goal:number }
/** Hand-authored connected routes; mirroring creates variety without unreachable goals. */
export function mazeFor(age:AgeId, round:number):Maze {
 const size=age==='3-4'?4:5
 const routes=size===4 ? [[0,1,5,9,10,14,15],[0,4,8,9,10,6,7,11,15]] : [[0,1,6,11,12,13,18,23,24],[0,5,10,11,12,7,8,13,14,19,24],[0,1,2,7,12,11,16,21,22,23,24]]
 const route=routes[round%routes.length]
 const branches=size===4?[2,6,12]:[3,4,9,15,20]
 const mirror=(n:number)=>round%2 ? Math.floor(n/size)*size+(size-1-n%size) : n
 const open = new Set(route)
 for(const cell of branches) if([...open].some(n=>Math.abs(Math.floor(n/size)-Math.floor(cell/size))+Math.abs(n%size-cell%size)===1)) open.add(cell)
 return {size,open:[...open].map(mirror),start:mirror(route[0]),goal:mirror(route[route.length-1])}
}
export function moveInMaze(maze:Maze,from:number,to:number):number {
 if(to<0||to>=maze.size*maze.size||!maze.open.includes(to)) return from
 const distance=Math.abs(Math.floor(from/maze.size)-Math.floor(to/maze.size))+Math.abs(from%maze.size-to%maze.size)
 return distance===1?to:from
}
export function revealCells(from:{x:number;y:number},to:{x:number;y:number},columns:number,rows:number):number[] {
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(to.x-from.x)*columns,Math.abs(to.y-from.y)*rows)*3))
 const cells=new Set<number>()
 for(let i=0;i<=steps;i++) {const x=from.x+(to.x-from.x)*i/steps,y=from.y+(to.y-from.y)*i/steps;if(x>=0&&x<1&&y>=0&&y<1)cells.add(Math.floor(y*rows)*columns+Math.floor(x*columns))}
 return [...cells]
}
export function changeCollection(count:number,delta:number,limit=10):number {return Math.max(0,Math.min(limit,count+delta))}
