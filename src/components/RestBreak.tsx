import { useEffect, useRef, useState } from 'react'
import { Mascot } from '../Mascot'
import { speak, playPop } from '../audio'
import { clock, REST_MS, restLeft, type PlayTime } from '../playTime'

const ACTIVITIES = [
  { icon: '💧', title: 'Uống nước', line: 'Uống vài ngụm nước nào!' },
  { icon: '🙆', title: 'Vươn vai', line: 'Giơ hai tay lên cao, vươn vai thật dài!' },
  { icon: '🌳', title: 'Nhìn ra xa', line: 'Nhìn ra cửa sổ, tìm một cái cây thật xa!' },
  { icon: '👀', title: 'Chớp mắt', line: 'Chớp mắt thật nhanh mười lần nào!' },
]

/** The rest popup after the play-time limit: a short countdown with things to do, then "play on". */
export function RestBreak({ time, limit, sound, blocked, onDone, onAdult }: {
  time: PlayTime; limit: number; sound: boolean; blocked: boolean
  onDone: () => void; onAdult: () => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id) }, [])
  const left = restLeft(time, now), done = left === 0
  const progress = 1 - left / REST_MS
  const said = useRef(false)
  useEffect(() => { if (done && !said.current) { said.current = true; if (sound) speak('Con nghỉ ngơi giỏi lắm! Giờ mình chơi tiếp nhé!') } }, [done])
  const ring = 2 * Math.PI * 52

  return <div className="overlay rest-break" role="dialog" aria-modal="true" aria-labelledby="rest-title" {...(blocked ? { inert: '' } : {})}>
    <div className="rest-card">
      <span className="rest-badge">⏰ {limit} phút</span>
      <h1 id="rest-title">Con đã chơi {limit} phút rồi!</h1>
      <p className="rest-lead">Mình nghỉ một chút cho mắt và cơ thể thật khỏe nhé.</p>
      <div className="rest-main">
        <div className="rest-timer" role="timer" aria-live="off" aria-label={done ? 'Đã nghỉ xong' : `Còn ${clock(left)}`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="rest-ring-bg" />
            <circle cx="60" cy="60" r="52" className="rest-ring" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} />
          </svg>
          <b>{done ? '✓' : clock(left)}</b>
          <small>{done ? 'Nghỉ xong!' : 'nghỉ ngơi'}</small>
        </div>
        <Mascot mood={done ? 'cheer' : 'encourage'} interactive={false} />
      </div>
      <div className="rest-activities">
        {ACTIVITIES.map(a => <button key={a.title} onClick={() => { playPop(); if (sound) speak(a.line) }}>
          <span aria-hidden="true">{a.icon}</span><b>{a.title}</b>
        </button>)}
      </div>
      <button className="btn juicy-btn rest-go" disabled={!done} onClick={() => { playPop(); onDone() }}>
        {done ? '▶ Chơi tiếp' : `Chơi tiếp sau ${clock(left)}`}
      </button>
      {!done && <button className="rest-adult" onClick={onAdult}>🔒 Người lớn cho chơi tiếp ngay</button>}
    </div>
  </div>
}
