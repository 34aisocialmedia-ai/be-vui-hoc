import { Fragment } from 'react'
import { useAssignedImage } from '../studio/media'
import type { Game } from '../types'
import { coverFor } from '../gameCovers'
import { DOT_LEVELS } from '../gameLogic'
import { AnimatedPet } from '../AnimatedPet'
import { LearningPicture } from './LearningPicture'

function ObjectGroup({ emoji, count, size = 30 }: { emoji: string; count: number; size?: number }) {
  return <span className="cover-object-group" data-object-count={count}>
    {Array.from({ length: count }, (_, i) => <LearningPicture key={i} emoji={emoji} size={size} />)}
  </span>
}

/** Draw only the reviewed illustration assigned to this particular game. */
export function GameArtwork({ game }: { game: Game }) {
  const customImage = useAssignedImage(`game:${game.id}`)
  if (customImage) return <img className="custom-game-art" src={customImage} alt={game.title}/>
  const cover = coverFor(game)
  let artwork
  switch (cover.kind) {
    case 'lesson':
      artwork = <div className={`cover-lesson cover-lesson-${cover.mode.toLowerCase()}`}>
        <span className="lesson-level" aria-label={`Mức ${cover.level}`}>{Array.from({ length: cover.level }, (_, i) => <i key={i} />)}</span>
        {['REVEAL','PATH','COLLECT'].includes(cover.mode) ? <div className={`adventure-cover adventure-cover-${cover.mode.toLowerCase()}`}><LearningPicture {...cover.target!} emoji={cover.mode==='COLLECT' ? cover.pictures[0]?.emoji ?? '🍎' : cover.target?.emoji ?? '🐰'} size={78}/>{cover.mode==='REVEAL' ? <div className="cover-mist"><i/><i/><i/></div> : cover.mode==='PATH' ? <><span className="cover-trail"/><img src="/assets/images/mascot_rabbit.webp" alt=""/></> : <b>{cover.target?.emoji}</b>}</div> : cover.mode === 'SPATIAL' ? <div className="cover-spatial-map">
          <span className="cover-map-reference"><LearningPicture {...cover.reference!} size={34} /></span>
          {cover.pictures.map((picture, i) => <span className="cover-map-object" key={i} style={{ left: `${picture.x}%`, top: `${picture.y}%` }}><LearningPicture {...picture} size={31} /></span>)}
        </div> : <div className="lesson-picture-row">{cover.pictures.map((picture, i) => <Fragment key={i}>
          {i > 0 && <b className="lesson-link">{['ORDER', 'RHYTHM'].includes(cover.mode) ? '›' : cover.mode === 'G02' ? '↔' : ''}</b>}
          <LearningPicture {...picture} size={(cover.pictures.length > 3 ? 39 : 57) * (picture.scale ?? 1)} />
        </Fragment>)}</div>}
        {cover.mode === 'MEMORY' && <span className="lesson-card-back">?</span>}
        {cover.cue && <span className="lesson-cue">{cover.cue}</span>}
      </div>
      break
    case 'image':
      artwork = <div className={`cover-scene ${cover.contain ? 'cover-contain' : ''}`}>
        <img src={cover.src} alt="" loading="lazy" />
        {cover.letters && <div className="cover-letters">{cover.letters.map(letter => <b key={letter}>{letter}</b>)}</div>}
        {game.engine === 'NUMBER_TRAIN' && <div className="cover-cargo"><ObjectGroup emoji="🍎" count={3} size={28} /></div>}
      </div>
      break
    case 'photos':
      artwork = <div className={`cover-photos cover-photos-${cover.layout} ${game.engine === 'TRAFFIC' ? 'cover-traffic' : ''}`}>
        {cover.photos.map((src, i) => <span className="cover-photo" key={i}><img src={src} alt="" loading="lazy" /></span>)}
        {cover.layout === 'sound' && <span className="cover-sound-waves"><i /><i /><i /></span>}
        {game.engine === 'TRAFFIC' && <span className="mini-traffic-light"><i /><i /><i /></span>}
      </div>
      break
    case 'pet':
      artwork = <div className="cover-pet">
        <AnimatedPet type={cover.pet} mood="idle" paused />
        <div className="cover-pet-objects">{cover.objects.map(emoji => <LearningPicture key={emoji} emoji={emoji} size={44} food={cover.pet === 'bear'} />)}</div>
      </div>
      break
    case 'colors':
      artwork = <div className={`cover-colors cover-colors-${cover.layout}`}>
        {cover.colors.map(color => <div key={color} className={cover.layout === 'sort' ? 'cover-basket' : 'cover-color-bubble'} style={{ '--object-color': color } as React.CSSProperties}>
          {cover.layout === 'sort' && <><i /><i /><span /></>}
        </div>)}
      </div>
      break
    case 'size':
      artwork = <div className="cover-size"><LearningPicture emoji={cover.emoji} size={92} /><LearningPicture emoji={cover.emoji} size={43} /></div>
      break
    case 'count':
      artwork = <div className={`cover-count ${cover.bubble ? 'cover-count-bubble' : ''}`}><ObjectGroup emoji={cover.emoji} count={cover.count} size={36} /><b className="cover-number">{cover.count}</b></div>
      break
    case 'compare':
      artwork = <div className={`cover-compare ${cover.scale ? 'cover-scale' : ''}`}>
        <div className="cover-compare-groups"><span><ObjectGroup emoji={cover.emoji} count={cover.left} size={25} /><b>{cover.left}</b></span><span><ObjectGroup emoji={cover.emoji} count={cover.right} size={25} /><b>{cover.right}</b></span></div>
        {cover.scale && <div className="cover-scale-base"><i /></div>}
      </div>
      break
    case 'shapes':
      artwork = <div className="cover-shapes"><i className="cover-shape-circle" /><i className="cover-shape-square" /><i className="cover-shape-triangle" /></div>
      break
    case 'pattern':
      artwork = <div className="cover-pattern">{cover.colors.map((color, i) => <i key={i} style={{ '--object-color': color } as React.CSSProperties} />)}<b>?</b></div>
      break
    case 'calendar':
      artwork = <div className="cover-calendar"><div className="calendar-binding"><i /><i /><i /></div><div>{['2', '3', '4', '5', '6', '7', 'CN'].map((day, i) => <b key={day} className={i === 0 ? 'today' : ''}>{day}</b>)}</div></div>
      break
    case 'number-match':
      artwork = <div className="cover-number-match">{cover.values.map((value, i) => <div key={value}><b>{value}</b><span className="cover-connector" /><ObjectGroup emoji={cover.emojis[i]} count={value} size={25} /></div>)}</div>
      break
    case 'food':
      artwork = <div className="cover-food">{cover.foods.map(emoji => <LearningPicture key={emoji} emoji={emoji} size={65} food />)}</div>
      break
    case 'number-memory':
      artwork = <div className="cover-number-memory">{cover.values.map((value, i) => <b key={i}>{value}</b>)}</div>
      break
    case 'sequence':
      artwork = <div className="cover-sequence">{cover.values.map((value, i) => <b key={i} className={value === null ? 'missing' : ''}>{value ?? '?'}</b>)}</div>
      break
    case 'object-pattern':
      artwork = <div className="cover-fruit-pattern">{cover.objects.map((emoji, i) => <LearningPicture key={i} emoji={emoji} size={36} />)}<b>?</b></div>
      break
    case 'dots': {
      const points = DOT_LEVELS[0].dots
      artwork = <svg className="cover-dots" viewBox="0 0 110 110">
        <polyline points={points.map(p => `${p.x + 5},${p.y + 8}`).join(' ')} fill="#ffdd9c" stroke="#dcaa62" strokeWidth="2" strokeDasharray="3 3" strokeLinejoin="round" />
        <polyline points={points.slice(0, 5).map(p => `${p.x + 5},${p.y + 8}`).join(' ')} fill="none" stroke="#65a987" strokeWidth="3" strokeLinejoin="round" />
        {points.map((point, i) => <Fragment key={i}><circle cx={point.x + 5} cy={point.y + 8} r="6.5" fill="white" stroke={i < 5 ? '#65a987' : '#d4b785'} strokeWidth="1.5" /><text x={point.x + 5} y={point.y + 10.5} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#45644e">{i + 1}</text></Fragment>)}
      </svg>
      break
    }
  }
  return <div className={`game-cover game-cover-${cover.kind}`} role="img" aria-label={cover.label} data-game-cover={game.id} data-cover-kind={cover.kind}>{artwork}</div>
}

