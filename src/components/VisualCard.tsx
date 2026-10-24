import { LearningPicture } from './LearningPicture'
import { speak } from '../audio'
import { UiIcon } from './UiIcon'
interface Props {
 label: string; emoji: string; photo?: string; scale?: number; onClick: () => void
 disabled?: boolean; highlight?: boolean; hint?: boolean; sound?: boolean
 variant?: 'choice' | 'match' | 'puzzle'; spokenLabel?: string
}
export function VisualCard({label,emoji,photo,scale=1,onClick,disabled=false,highlight=false,hint=false,sound=true,variant='choice',spokenLabel=label}:Props) {
 return <div className={`visual-card-3d ${variant}-card ${disabled?'is-disabled':''} ${highlight?'card-highlighted':''} ${hint&&!highlight?'card-hint':''}`}>
  <button type="button" className="visual-card-answer" aria-label={label || 'Chọn hình'} onClick={onClick} disabled={disabled}>
   <div className="card-visual-media"><LearningPicture emoji={emoji} photo={photo} label={label} size={96*scale}/></div>
   {label && <span className="card-vietnamese-label">{label}</span>}
  </button>
  {sound && spokenLabel && <button type="button" className="card-audio-speaker-btn" aria-label={`Nghe phát âm ${spokenLabel}`} disabled={disabled} onClick={() => speak(spokenLabel)}><UiIcon name="sound" size={20}/></button>}
 </div>
}
