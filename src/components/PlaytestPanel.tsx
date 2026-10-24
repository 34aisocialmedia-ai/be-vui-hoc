import { useState } from 'react'
import { AGES, type AgeId } from '../types'
import { cleanTesterCode, closeStale, loadPlaytest, savePlaytest, summarize, toCsv, type PlaytestStore } from '../playtest'

const percent = (v: number | null) => v === null ? '–' : `${Math.round(v * 100)}%`

/** Parent-area controls for the Đợt D playtest: turn logging on, name the child by a code, export, clear. */
export function PlaytestPanel() {
  const [store, setStore] = useState<PlaytestStore>(() => { const fresh = closeStale(loadPlaytest()); savePlaytest(fresh); return fresh })
  const [confirmClear, setConfirmClear] = useState(false)
  const change = (next: Partial<PlaytestStore>) => {
    // Re-read first so sessions recorded since this page opened are kept.
    const merged = { ...loadPlaytest(), ...next }
    savePlaytest(merged)
    setStore(merged)
  }
  const all = summarize(store.sessions)
  const mine = store.tester ? store.sessions.filter(s => s.tester === store.tester && s.status !== 'playing').length : 0

  function download() {
    const blob = new Blob([toCsv(store.sessions)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `be-vui-hoc-choi-thu-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return <div className="panel panel-3d playtest-panel">
    <h2>Chơi thử với bé (Đợt D)</h2>
    <p className="playtest-help">Bật mục này khi cho bé tự chơi để thử game. Máy ghi lại số giây tới lần chạm đầu, những lần chạm không có phản hồi, bé chơi hết hay bỏ dở. Chỉ lưu trên máy này, không gửi đi đâu.</p>
    <label>
      <input type="checkbox" checked={store.enabled} onChange={e => change({ enabled: e.target.checked })} />
      <b>Ghi lại các lượt chơi trên máy này</b>
    </label>
    <div className="playtest-row">
      <label>
        <b>Mã bé:</b>
        <input className="playtest-code" value={store.tester} maxLength={12} placeholder="VD: B01" aria-describedby="playtest-code-note"
          onChange={e => change({ tester: cleanTesterCode(e.target.value) })} />
      </label>
      <label>
        <b>Bé thuộc nhóm:</b>
        <select value={store.testerAge} onChange={e => change({ testerAge: e.target.value as AgeId })}>
          {AGES.map(age => <option key={age.id} value={age.id}>{age.label}</option>)}
        </select>
      </label>
    </div>
    <small id="playtest-code-note" className="playtest-help">Dùng mã, không nhập tên bé. Đổi mã mỗi khi đổi bé.</small>
    {store.enabled && !store.tester && <p className="playtest-warn">Nhập mã bé thì máy mới bắt đầu ghi.</p>}
    {store.enabled && store.tester && <p className="playtest-on">Đang ghi cho bé <b>{store.tester}</b> · đã có {mine} lượt.</p>}
    <dl className="playtest-summary">
      <div><dt>Lượt chơi</dt><dd>{all.sessions}</dd></div>
      <div><dt>Số bé</dt><dd>{all.testers}</dd></div>
      <div><dt>Chơi hết</dt><dd>{percent(all.finishedRate)}</dd></div>
      <div><dt>Bỏ dở</dt><dd>{percent(all.quitRate)}</dd></div>
      <div><dt>Tới lần chạm đầu (trung vị)</dt><dd>{all.medianFirstTouchS === null ? '–' : `${all.medianFirstTouchS} giây`}</dd></div>
      <div><dt>Chạm không phản hồi / lượt</dt><dd>{all.deadTapsPerSession ?? '–'}</dd></div>
    </dl>
    <div className="playtest-actions">
      <button type="button" className="btn juicy-btn" disabled={!store.sessions.length} onClick={download}>Tải kết quả (CSV)</button>
      {!confirmClear
        ? <button type="button" className="btn alt" disabled={!store.sessions.length} onClick={() => setConfirmClear(true)}>Xóa dữ liệu chơi thử</button>
        : <span className="playtest-confirm">Xóa hết {store.sessions.length} lượt? <button type="button" className="btn alt" onClick={() => { change({ sessions: [] }); setConfirmClear(false) }}>Xóa</button> <button type="button" className="btn alt" onClick={() => setConfirmClear(false)}>Không</button></span>}
    </div>
  </div>
}
