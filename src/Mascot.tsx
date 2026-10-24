import { speak, playPop } from './audio'

export type MascotMood = 'idle' | 'cheer' | 'encourage' | 'thinking'
interface MascotProps { mood?: MascotMood; message?: string; interactive?: boolean }

export function Mascot({ mood = 'idle', message, interactive = true }: MascotProps) {
  if (!interactive) return <div className={`mascot-wrap ${mood} mascot-rabbit-3d`} aria-hidden="true"><img src="/assets/images/mascot_rabbit.webp" alt="" width={90} height={110}/></div>
  return <button type="button" className={`mascot-wrap ${mood} mascot-rabbit-3d`} disabled={!interactive}
    aria-label="Nghe bạn Thỏ động viên" onClick={() => { playPop(); speak(message || (mood === 'cheer' ? 'Bé làm rất tốt! Thỏ vui quá!' : 'Bé ơi cố lên nhé! Cùng chơi thật vui nào!')) }}>
    <img src="/assets/images/mascot_rabbit.webp" alt="Bạn Thỏ" width={90} height={110} />
    {mood === 'cheer' && <span aria-hidden="true" className="mascot-sparkles">✨</span>}
  </button>
}
