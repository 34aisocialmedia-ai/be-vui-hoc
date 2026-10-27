import './adult.css'
import { useMemo, useState } from 'react'
import { AGES, totalOf, type AgeId } from '../types'
import { GAMES } from '../data/games'
import { speak } from '../audio'
import { TEACHER_INTRO } from '../teacherVoice'
import type { MotionLevel } from '../motion/motion'
import { UiIcon } from './UiIcon'
import { PlaytestPanel } from './PlaytestPanel'
import { DEFAULT_LIMIT, LIMIT_CHOICES, REST_MS } from '../playTime'

interface Settings { sound: boolean; rewards: boolean; limit: number; motion: MotionLevel }

/** Khu phụ huynh: Xưởng sáng tạo nổi bật ở trên, cài đặt gọn trong thẻ, các danh mục dài thu gọn lại. */
export function AdultPage({ settings, plays, onChange, onBack, onStudio }: {
  settings: Settings
  plays: Record<string, number>
  onChange: (patch: Partial<Settings>) => void
  onBack: () => void
  onStudio: () => void
}) {
  return <div className="screen scroll ap-page">
    <header className="ap-head">
      <button className="iconbtn ap-back" onClick={onBack} aria-label="Về trang chủ"><UiIcon name="back" /></button>
      <img className="ap-logo" src="/assets/brand/logo-duong-thuy-160.webp" alt="Logo Dương Thủy" width="160" height="160" />
      <div><span className="ap-eyebrow">DÀNH CHO BA MẸ & THẦY CÔ</span><h1>Khu phụ huynh</h1></div>
    </header>

    <button className="ap-studio" onClick={onStudio}>
      <span className="ap-studio-glow" aria-hidden="true" />
      <span className="ap-studio-badge">MỚI · AI 34AI</span>
      <span className="ap-studio-text">
        <strong>Xưởng sáng tạo AI</strong>
        <span>Tải ảnh của bé (và bố mẹ, ông bà), chọn chủ đề, bấm một nút: AI tạo trọn bộ trò chơi có chính bé trong từng bức tranh, cô giáo đọc câu hỏi.</span>
        <span className="ap-studio-chips">
          <i>🌟 Trò chơi có bé</i><i>👨‍👩‍👧 Cả nhà cùng vào</i><i>🎙️ Cô giáo đọc</i><i>✨ Bấm một nút</i>
        </span>
        <span className="ap-studio-cta">Tạo trò chơi có bé <UiIcon name="next" /></span>
      </span>
      <img className="ap-studio-art" src="/assets/images/mascot_rabbit.webp" alt="" />
    </button>

    <section className="ap-grid" aria-label="Cài đặt">
      <div className="ap-card">
        <h2>🔊 Âm thanh</h2>
        <Toggle checked={settings.sound} onChange={v => onChange({ sound: v })} label="Âm thanh và hướng dẫn tiếng Việt" />
        <div className="ap-voice">
          <span className="ap-voice-face" aria-hidden="true">👩‍🏫</span>
          <div><b>Giọng cô Thủy</b><small>Giọng nữ rõ ràng, ấm áp, vui tươi; đồng hành cùng con khi học và chơi.</small></div>
          <button className="ap-voice-play" disabled={!settings.sound} onClick={() => speak(TEACHER_INTRO)}>🔊 Nghe thử</button>
        </div>
      </div>
      <div className="ap-card">
        <h2>⏱️ Thời gian chơi</h2>
        <Toggle checked={settings.rewards} onChange={v => onChange({ rewards: v })} label="Phần thưởng sau mỗi lượt chơi" />
        <label className="ap-field"><span>Nhắc bé nghỉ sau khi chơi</span>
          <select value={settings.limit} onChange={e => onChange({ limit: Number(e.target.value) })}>
            {[...LIMIT_CHOICES, ...(LIMIT_CHOICES.includes(settings.limit as never) ? [] : [settings.limit])].map(m => <option key={m} value={m}>{m === 0 ? 'Không nhắc' : `${m} phút${m === DEFAULT_LIMIT ? ' (khuyên dùng)' : ''}`}</option>)}
          </select>
        </label>
        {settings.limit > 0 && <p className="ap-hint">Sau {settings.limit} phút chơi, app hiện lời nhắc và cho bé nghỉ {REST_MS / 60000} phút. Người lớn có thể cho chơi tiếp ngay.</p>}
        <label className="ap-field"><span>Hiệu ứng chuyển động</span>
          <select value={settings.motion} onChange={e => onChange({ motion: e.target.value as MotionLevel })}>
            <option value="full">Đầy đủ</option><option value="light">Nhẹ nhàng</option><option value="off">Tắt</option>
          </select>
        </label>
      </div>
    </section>

    <GameCatalog plays={plays} />

    <details className="ap-more">
      <summary><span>🧪 Chơi thử với bé (ghi lại lượt chơi để đánh giá)</span><UiIcon name="next" /></summary>
      <div className="ap-more-body"><PlaytestPanel /></div>
    </details>

    <p className="ap-note">Tiến độ chơi và thư viện của gia đình được lưu trên thiết bị này. Khi người lớn dùng Xưởng sáng tạo, mô tả và ảnh đã chọn được gửi đến 34AI để tạo nội dung, sau khi người lớn xác nhận trong xưởng.</p>
  </div>
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <label className="ap-toggle">
    <span>{label}</span>
    <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
    <i aria-hidden="true" />
  </label>
}

/** Danh mục trò chơi: thu gọn mặc định, có ô tìm và lọc theo tuổi; trên điện thoại mỗi trò là một dòng gọn. */
function GameCatalog({ plays }: { plays: Record<string, number> }) {
  const [query, setQuery] = useState(''), [age, setAge] = useState<AgeId | 'all'>('all')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GAMES.filter(g => (age === 'all' || g.age === age) && (!q || g.title.toLowerCase().includes(q) || g.mt.join(' ').toLowerCase().includes(q)))
  }, [query, age])
  const played = GAMES.filter(g => (plays[g.id] ?? 0) > 0).length
  return <details className="ap-more ap-catalog">
    <summary><span>📚 Danh mục {GAMES.length} trò chơi bám sát giáo án <small>· bé đã chơi {played} trò</small></span><UiIcon name="next" /></summary>
    <div className="ap-more-body">
      <div className="ap-filter">
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên trò hoặc mục tiêu (VD: MT30)" aria-label="Tìm trò chơi" />
        <div role="group" aria-label="Lọc theo tuổi">
          <button aria-pressed={age === 'all'} className={age === 'all' ? 'on' : ''} onClick={() => setAge('all')}>Tất cả</button>
          {AGES.map(a => <button key={a.id} aria-pressed={age === a.id} className={age === a.id ? 'on' : ''} onClick={() => setAge(a.id)}>{a.label}</button>)}
        </div>
      </div>
      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead><tr><th>Trò chơi</th><th>Dạng</th><th>Tuổi</th><th>Mục tiêu</th><th>Câu</th><th>Đã chơi</th></tr></thead>
          <tbody>{shown.map(g => <tr key={g.id}>
            <td className="ap-t-name">{g.icon} {g.title}</td>
            <td><span className="engine-pill">{g.engine}</span></td>
            <td className="ap-t-age">{g.age}</td>
            <td className="ap-t-mt">{g.mt.join(', ') || '—'}</td>
            <td className="ap-t-num">{totalOf(g)}</td>
            <td className="ap-t-num">{plays[g.id] ?? 0}</td>
          </tr>)}</tbody>
        </table>
        {!shown.length && <p className="ap-empty">Không có trò nào khớp.</p>}
      </div>
    </div>
  </details>
}
