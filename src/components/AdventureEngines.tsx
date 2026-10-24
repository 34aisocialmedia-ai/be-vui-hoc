import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Host } from '../player/Host'
import { createPortal } from 'react-dom'
import type { Game, Question } from '../types'
import { LearningPicture } from './LearningPicture'
import { UiIcon } from './UiIcon'
import { playPop, speak, speakSeq, stopSpeech } from '../audio'
import { useGameTask } from '../useGameTask'
import { changeCollection, mazeFor, moveInMaze, revealCells } from '../adventureLogic'
import { centerOf, flyClone, floatNote, hop, hopFrom, play, sparkle } from '../motion/motion'
interface Props {game:Game; sound:boolean; paused:boolean; finished:boolean; onAnswer:(id:string,ok:boolean)=>Promise<boolean|null>}
interface RoundProps extends Props { q:Question; round:number; advance:()=>void }
export function AdventureEngine(props:Props) {
 const [round,setRound]=useState(0)
 const q=props.game.questions[round]
 const next=()=>{if(round+1<props.game.questions.length)setRound(i=>i+1)}
 const child={...props,q,round,advance:next}
 return <div className="adventure-engine">{props.game.engine==='REVEAL'?<RevealRound key={q.id} {...child}/>:props.game.engine==='COLLECT'?<CollectRound key={q.id} {...child}/>:<MazeRound key={q.id} {...child}/>}</div>
}
function Header({title,read,children}:{title:string;read:()=>void;children?:React.ReactNode}) {
 return <div className="qcard adventure-header"><Host /><button className="iconbtn speaker-btn" aria-label="Nghe hướng dẫn" onClick={read}><UiIcon name="sound"/></button><strong>{title}</strong>{children}</div>
}
function RevealRound({q,game,sound,paused,finished,onAnswer,advance}:RoundProps) {
 const task=useGameTask(), cleared=useRef(new Set<number>()), previous=useRef<{x:number;y:number}|null>(null), mist=useRef<HTMLDivElement>(null), picture=useRef<HTMLDivElement>(null)
 const [cells,setCells]=useState<number[]>([])
 const columns=game.age==='24-36'?3:4,rows=game.age==='24-36'?2:3,total=columns*rows
 const target=q.options.find(o=>o.correct)!
 const read=()=>{if(sound)void speak(q.text)}
 useEffect(()=>{read();return()=>stopSpeech()},[q.id,sound])
 async function clear(ids:number[]) {
  if(paused||finished||task.busy.current)return
  // Each patch of mist lifts away as a few drifting specks.
  ids.forEach(id=>{if(cleared.current.has(id))return;cleared.current.add(id);const tile=mist.current?.children[id];if(tile)sparkle(centerOf(tile),{colors:['#ffffff','#eef6e6','#d9ebe0'],count:5,distance:22,rise:40,size:12})})
  setCells([...cleared.current])
  if(cleared.current.size===total) {
   task.busy.current=true
   // The friend underneath wakes up: a hop, and Cô Thủy says who it is.
   void hop(picture.current?.firstElementChild,26)
   if(sound){if(!await Promise.race([speak(target.say||target.label).then(()=>true),task.delay(1600)]))return}
   else if(!await task.delay(450))return
   const accepted=await onAnswer(q.id,true)
   if(!task.alive.current)return
   if(accepted===true)advance()
   else {cleared.current=new Set();setCells([]);task.busy.current=false}
  }
 }
 function rub(e:React.PointerEvent<HTMLDivElement>,start=false) {
  if(!start&&!previous.current)return
  if(paused||finished)return
  const r=e.currentTarget.getBoundingClientRect(),point={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}
  void clear(revealCells(previous.current??point,point,columns,rows));previous.current=point
 }
 return <>
  <Header title="Vuốt mở hình" read={read}/>
  <div className="reveal-picture" ref={picture}>
   <LearningPicture {...target} size={260}/>
   <div className="reveal-mist" ref={mist} style={{gridTemplateColumns:`repeat(${columns},1fr)`}} onPointerDown={e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);previous.current=null;rub(e,true)}} onPointerMove={e=>rub(e)} onPointerUp={()=>{previous.current=null}} onPointerCancel={()=>{previous.current=null}}>
    {Array.from({length:total},(_,i)=><button key={i} className={`mist-tile ${cells.includes(i)?'cleared':''}`} disabled={paused||finished||cells.includes(i)} aria-label={`Mở mảnh ${i+1}`} onClick={()=>void clear([i])}><span/></button>)}
   </div>
  </div>
  <div className="gesture-demo" aria-hidden="true"><span className="gesture-dot"/><span className="gesture-track"/></div>
  <div className="activity-meter" role="progressbar" aria-label="Phần hình đã mở" aria-valuemin={0} aria-valuemax={total} aria-valuenow={cells.length}><i style={{width:`${cells.length/total*100}%`}}/></div>
 </>
}
function CollectRound({q,sound,paused,finished,onAnswer,advance}:RoundProps) {
 const target=Number(q.options.find(o=>o.correct)!.emoji),emoji=q.groups?.[0]?.[0]??'🍎'
 const [count,setCount]=useState(0),[checking,setChecking]=useState(false),[dragPoint,setDragPoint]=useState<{x:number;y:number}|null>(null)
 const countRef=useRef(0),task=useGameTask(),basket=useRef<HTMLDivElement>(null),drag=useRef<{x:number;y:number}|null>(null),suppress=useRef(false),[added,setAdded]=useState(-1)
 const read=()=>{if(sound)void speakSeq(['Con hãy bỏ vào đúng giỏ nhé!',String(target)])}
 useEffect(()=>{read();return()=>stopSpeech()},[q.id,sound])
 function change(delta:number,from?:Element|null) {
  if(paused||finished||task.busy.current)return
  const before=countRef.current
  countRef.current=changeCollection(countRef.current,delta);setCount(countRef.current);playPop();if(sound&&delta>0)void speak(String(countRef.current))
  setAdded(countRef.current>before?countRef.current-1:-1)
  // A tapped fruit shivers on the branch, then drops along an arc into the basket.
  if(from&&countRef.current>before)void play(from,[{transform:'rotate(0)'},{transform:'rotate(-12deg)'},{transform:'rotate(10deg)'},{transform:'rotate(0)'}],{duration:180}).then(()=>flyClone(from,basket.current?.querySelector('.collected-fruits'),{scale:.62,lift:70,duration:520}))
 }
 async function check() {
  if(paused||finished||task.busy.current)return
  task.busy.current=true;setChecking(true)
  const accepted=await onAnswer(q.id,countRef.current===target)
  if(!task.alive.current)return
  if(accepted===true)advance()
  else {task.busy.current=false;setChecking(false)}
 }
 return <>
  <Header title="Gom đủ vào giỏ" read={read}><span className="collect-target" aria-label={`Cần ${target} quả`}><b>{target}</b><LearningPicture emoji={emoji} size={38}/></span></Header>
  <div className="collect-source" aria-label="Vườn quả">{[0,1,2].map(i=><button key={i} disabled={checking||paused||finished||count>=10} className="pick-fruit" aria-label="Thêm một quả" onDragStart={e=>e.preventDefault()} onPointerDown={e=>{suppress.current=false;drag.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(drag.current&&Math.hypot(e.clientX-drag.current.x,e.clientY-drag.current.y)>10)setDragPoint({x:e.clientX,y:e.clientY})}} onPointerUp={e=>{setDragPoint(null);if(!drag.current)return;const moved=Math.hypot(e.clientX-drag.current.x,e.clientY-drag.current.y)>10;drag.current=null;if(moved){suppress.current=true;const r=basket.current?.getBoundingClientRect();if(r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)change(1)}}} onPointerCancel={()=>{drag.current=null;setDragPoint(null);suppress.current=true}} onClick={e=>{if(suppress.current){suppress.current=false;return}change(1,e.currentTarget.firstElementChild)}}><LearningPicture emoji={emoji} size={76}/></button>)}</div>
  {/* Drawn on the page itself: inside a play area shrunk to fit, a fixed element would not follow the finger. */}
  {dragPoint&&createPortal(<div className="drag-fruit-preview" aria-hidden="true" style={{left:dragPoint.x,top:dragPoint.y}}><LearningPicture emoji={emoji} size={72}/></div>,document.body)}
  <div className={`collection-basket ${dragPoint?'receiving-fruit':''}`} ref={basket} aria-label={`Trong giỏ có ${count} quả`}><div className="basket-rim"/><div className="collected-fruits">{Array.from({length:count},(_,i)=><button key={i} className={i===added?'just-added':''} disabled={checking||paused||finished} aria-label="Bỏ bớt một quả" onClick={()=>change(-1)}><LearningPicture emoji={emoji} size={48}/></button>)}</div><span className="basket-quantity" key={count}>{count}</span></div>
  <div className="adventure-actions"><button className="iconbtn" aria-label="Bỏ bớt một quả" disabled={!count||checking||paused||finished} onClick={()=>change(-1)}><UiIcon name="back"/></button><button className="btn adventure-submit" disabled={checking||paused||finished} aria-label="Kiểm tra giỏ" onClick={()=>void check()}><UiIcon name="check" size={30}/><span>Xong!</span></button></div>
 </>
}
function MazeRound({q,game,round,sound,paused,finished,onAnswer,advance}:RoundProps) {
 const maze=mazeFor(game.age,round+(game.sessionVisit??0)),[position,setPosition]=useState(maze.start),positionRef=useRef(maze.start),[bump,setBump]=useState(false),task=useGameTask(),touch=useRef<{x:number;y:number}|null>(null)
 const [trail,setTrail]=useState<number[]>([]),rabbit=useRef<HTMLImageElement>(null),board=useRef<HTMLDivElement>(null),from=useRef(maze.start)
 // Rabbit hops along an arc from the cell it left, leaving paw prints behind.
 useLayoutEffect(()=>{const old=from.current;from.current=position;if(old===position||!board.current)return;const cell=board.current.clientWidth/maze.size,cellH=board.current.clientHeight/maze.size
  void hopFrom(rabbit.current,(old%maze.size-position%maze.size)*cell,(Math.floor(old/maze.size)-Math.floor(position/maze.size))*cellH,cell*.35)},[position])
 const target=q.options.find(o=>o.correct)!
 const read=()=>{if(sound)void speak(q.text)}
 useEffect(()=>{read();return()=>stopSpeech()},[q.id,sound])
 async function move(to:number) {
  if(paused||finished||task.busy.current)return
  const next=moveInMaze(maze,positionRef.current,to)
  if(next===positionRef.current){setBump(true);await task.delay(220);if(task.alive.current)setBump(false);return}
  setTrail(t=>t.includes(positionRef.current)?t:[...t,positionRef.current])
  positionRef.current=next;setPosition(next);playPop()
  if(next===maze.goal){task.busy.current=true
   // A hug with the friend at the goal.
   if(await task.delay(320)){const goal=board.current?.children[maze.goal];void hop(rabbit.current,20);void hop(goal?.firstElementChild,20);floatNote(goal,'♥');void task.delay(250).then(ok=>ok&&floatNote(goal,'♥'))}else return
   const result=await onAnswer(q.id,true);if(!task.alive.current)return;if(result===true)advance();else{positionRef.current=maze.start;setPosition(maze.start);setTrail([]);task.busy.current=false}}
 }
 const direction=(dir:string)=>{const from=positionRef.current;void move(from+({up:-maze.size,down:maze.size,left:-1,right:1}[dir]??0))}
 return <>
  <Header title="Dẫn Thỏ tìm bạn" read={read}><LearningPicture {...target} size={44}/></Header>
  <div ref={board} className={`maze-board ${bump?'maze-bump':''}`} role="group" aria-label="Mê cung, dùng phím mũi tên hoặc vuốt để di chuyển" tabIndex={0} style={{gridTemplateColumns:`repeat(${maze.size},minmax(0,1fr))`,gridTemplateRows:`repeat(${maze.size},minmax(0,1fr))`}} onKeyDown={e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d){e.preventDefault();direction(d)}}} onPointerDown={e=>{touch.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={e=>{if(!touch.current)return;const dx=e.clientX-touch.current.x,dy=e.clientY-touch.current.y;touch.current=null;if(Math.max(Math.abs(dx),Math.abs(dy))>16)direction(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up')}} onPointerCancel={()=>{touch.current=null}}>
   {Array.from({length:maze.size*maze.size},(_,i)=><div key={i} className={`maze-cell ${maze.open.includes(i)?'path':'hedge'} ${i===maze.goal?'goal':''}`}>
    {i===maze.goal&&<LearningPicture {...target} size={44}/>}
    {trail.includes(i)&&i!==position&&<span className="maze-paw" aria-hidden="true"/>}
   </div>)}
   <img ref={rabbit} className="maze-rabbit" src="/assets/images/mascot_rabbit.webp" alt="Bạn Thỏ" style={{width:`${100/maze.size}%`,height:`${100/maze.size}%`,left:`${position%maze.size/maze.size*100}%`,top:`${Math.floor(position/maze.size)/maze.size*100}%`}}/>
  </div>
  <div className="maze-controls" aria-label="Điều khiển Thỏ">{(['up','left','down','right'] as const).map((dir,i)=><button key={dir} className={`iconbtn move-${dir}`} aria-label={['Đi lên','Sang trái','Đi xuống','Sang phải'][i]} disabled={paused||finished||task.busy.current} onClick={()=>direction(dir)}><UiIcon name={dir==='left'?'back':'next'} style={{transform:dir==='up'?'rotate(-90deg)':dir==='down'?'rotate(90deg)':undefined}}/></button>)}</div>
 </>
}
