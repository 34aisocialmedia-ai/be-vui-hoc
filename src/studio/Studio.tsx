import { useEffect, useMemo, useRef, useState } from 'react'
import { GAMES } from '../data/games'
import { AGES, type AgeId, type Game } from '../types'
import { UiIcon } from '../components/UiIcon'
import { LearningPicture } from '../components/LearningPicture'
import { useStudioMedia, type AssetKind, type DisplayAsset, type StudioAsset } from './media'
import {
  call, callBlob, download, follow, newKey, preparePicture, readPending, status, submit, toBase64, uploadReference, writePending,
  PROVIDER_LABEL, type Ai34Model, type FamilyGame, type JobKind, type JobView, type KeysState, type KeysView, type Models,
  type PendingJob, type Provider, StudioError,
} from './ai34'
import { GAME_TEMPLATES, IMAGE_TEMPLATES, VIDEO_TEMPLATES, VOICE_TEMPLATES, fill, type Template } from './templates'
import { readSpec, spokenLinesOf, toGame } from './familyGames'

type Tab = 'image' | 'video' | 'audio' | 'game'
const TABS: { id: Tab; icon: string; title: string; hint: string }[] = [
  { id: 'image', icon: '🖼️', title: 'Tạo ảnh', hint: 'Đưa bé vào trò chơi, banner, bìa' },
  { id: 'video', icon: '🎬', title: 'Tạo video', hint: 'Bé chuyển động, hoạt cảnh ngắn' },
  { id: 'audio', icon: '🎙️', title: 'Giọng nói', hint: 'Lời chào, lời khen có tên bé' },
  { id: 'game', icon: '🎲', title: 'Tạo trò chơi', hint: 'Nhập ý tưởng, có ngay trò mới' },
]
const RATIO_LABEL: Record<string, string> = { '16:9': 'Ngang 16:9', '9:16': 'Dọc 9:16', '1:1': 'Vuông 1:1', '4:3': '4:3', '3:4': '3:4' }
const INPUT_MODE: Record<string, string> = { auto: 'Tự động', text: 'Chỉ theo mô tả', first_frame: 'Ảnh là khung hình đầu', first_last: 'Ảnh đầu và ảnh cuối', ingredients: 'Ghép nhân vật từ ảnh' }
const KIND_LABEL: Record<AssetKind, string> = { image: 'Ảnh', video: 'Video', audio: 'Giọng nói', game: 'Trò chơi' }

interface Ref { id: string; blob: Blob; url: string; name: string; key?: string }
interface Draft { kind: AssetKind; blob: Blob; url: string; title: string; prompt: string; jobId?: string; spec?: FamilyGame; provider?: Provider }
type GeminiModels = Models & { audio: { models: { id: string; name: string }[]; voices: Voice[] } }
type Run = (a: () => Promise<void>) => Promise<void>
type Started = (v: JobView, k: JobKind, title: string, prompt: string, provider?: Provider) => void
type Result = (kind: AssetKind, blob: Blob, title: string, prompt: string, provider: Provider) => void
/** What each AI source costs, in the words the consent boxes use. */
const COST: Record<Provider, string> = { ai34: 'Tôi đồng ý dùng credit của tài khoản 34AI cho lần tạo này.', gemini: 'Tôi đồng ý dùng hạn mức (hoặc chi phí) của khóa Gemini cho lần tạo này.' }
const SENT_TO: Record<Provider, string> = { ai34: '34AI', gemini: 'Google Gemini' }
interface Voice { id: string; name: string; note?: string }
interface Catalog { models: { id: string; name: string }[]; voices: Voice[]; raw: unknown }

/** Read the audio catalog whatever its exact field names are (models, voices, prices). */
function readCatalog(raw: unknown): Catalog {
  const r = (raw ?? {}) as Record<string, unknown>
  const list = (v: unknown) => Array.isArray(v) ? v as Record<string, unknown>[] : []
  const models = list(r.models ?? r.data).map(m => ({ id: String(m.id ?? m.model ?? ''), name: String(m.name ?? m.display_name ?? m.id ?? '') })).filter(m => m.id)
  const voices = list(r.voices).map(v => ({ id: String(v.id ?? v.voice_id ?? v.name ?? ''), name: String(v.name ?? v.id ?? ''), note: [v.gender, v.description ?? v.style].filter(Boolean).join(' · ') || undefined })).filter(v => v.id)
  return { models, voices, raw }
}
/** The credit total in a quote, whatever the field is called. */
function creditsOf(quote: unknown): string {
  const q = (quote ?? {}) as Record<string, unknown>
  for (const k of ['total_credits', 'credits', 'total', 'credits_estimated', 'estimated_credits']) if (typeof q[k] === 'number') return `${q[k]} credit`
  const found = Object.entries(q).find(([k, v]) => /credit/i.test(k) && typeof v === 'number')
  return found ? `${found[1]} credit` : 'Xem chi tiết trong tài khoản 34AI'
}
const ext = (blob: Blob, kind: AssetKind) => kind === 'video' ? 'mp4' : kind === 'audio' ? 'wav' : kind === 'game' ? 'json' : blob.type === 'image/jpeg' ? 'jpg' : 'png'

export default function Studio({ onBack, onPlayGame }: { onBack: () => void; onPlayGame?: (game: Game) => void }) {
  const media = useStudioMedia()
  const [keys, setKeys] = useState<KeysState | null>(null)
  const [keyView, setKeyView] = useState<KeysView | null>(null)
  // No access code: the studio sits behind the parents' area; the keys themselves stay on the server.
  const code = ''
  const unlocked = !!keyView
  const [models, setModels] = useState<Models | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [gemini, setGemini] = useState<GeminiModels | null>(null)
  const [chosen, setChosen] = useState<Provider>(() => { try { return localStorage.getItem('be-vui-hoc-ai-provider') === 'gemini' ? 'gemini' : 'ai34' } catch { return 'ai34' } })
  // Everything runs on 34AI (its catalog already includes Gemini image, voice and chat models).
  const available = { ai34: !!(keyView?.providers ?? keys?.providers)?.ai34, gemini: false }
  const provider: Provider = available[chosen] || !available[chosen === 'ai34' ? 'gemini' : 'ai34'] ? chosen : chosen === 'ai34' ? 'gemini' : 'ai34'
  const activeModels = provider === 'gemini' ? gemini : models
  const activeCatalog = provider === 'gemini' ? (gemini ? { ...gemini.audio, raw: null } : null) : catalog
  const [tab, setTab] = useState<Tab>('image')
  const [childName, setChildName] = useState(() => { try { return localStorage.getItem('be-vui-hoc-child-name') ?? '' } catch { return '' } })
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('')
  const [pending, setPending] = useState<PendingJob[]>(readPending)
  const [draft, setDraft] = useState<Draft | null>(null)
  const following = useRef(new Set<string>())
  const alive = useRef(true)
  useEffect(() => () => { alive.current = false }, [])

  useEffect(() => { status().then(state => { setKeys(state); void open() }).catch(() => setError('Chưa kết nối được máy chủ AI. Bạn vẫn có thể thêm ảnh có sẵn vào thư viện.')) }, [])
  useEffect(() => { try { localStorage.setItem('be-vui-hoc-ai-provider', chosen) } catch { /* ignore */ } }, [chosen])
  useEffect(() => { try { localStorage.setItem('be-vui-hoc-child-name', childName) } catch { /* ignore */ } }, [childName])
  useEffect(() => { writePending(pending) }, [pending])
  useEffect(() => () => { if (draft) URL.revokeObjectURL(draft.url) }, [draft])

  async function run(action: () => Promise<void>) {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await action() } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'Không thực hiện được thao tác.') } finally { if (alive.current) setBusy(false) }
  }
  /** Load the model lists of every AI source that has a key. */
  async function loadModels(view: KeysView) {
    const problems: string[] = []
    await Promise.all([
      view.providers.ai34 ? Promise.all([call<Models>('models', code), call<unknown>('audio-catalog', code).catch(() => null)])
        .then(([m, c]) => { setModels(m); if (c) setCatalog(readCatalog(c)) }).catch(e => problems.push(`34AI: ${e.message}`)) : Promise.resolve(setModels(null)),
      Promise.resolve(setGemini(null)),
    ])
    if (problems.length) setError(problems.join(' '))
  }
  /** Ask 34AI for its current model list now (instead of the 5-minute cache). */
  async function refreshModels() {
    await run(async () => {
      const [m, c] = await Promise.all([call<Models>('models', code, { refresh: true }), call<unknown>('audio-catalog', code).catch(() => null)])
      setModels(m); if (c) setCatalog(readCatalog(c))
      setMessage(`Đã cập nhật từ 34AI: ${m.image.length} model ảnh, ${m.video.length} model video, ${m.chat.length} model chat${c ? `, ${readCatalog(c).voices.length} giọng đọc` : ''}.`)
    })
  }
  async function open() {
    await run(async () => {
      const view = await call<KeysView>('keys/view', code)
      setKeyView(view)
      await loadModels(view)
      if (!view.providers.ai34) setMessage('App chưa có khóa 34AI mặc định. Hãy dán khóa 34AI ở mục “Khóa API 34AI” để bắt đầu tạo.')
    })
  }

  /** Follow a job (also one left over from an earlier visit), then fetch its file into a draft. */
  async function track(job: PendingJob) {
    if (following.current.has(job.id)) return
    following.current.add(job.id)
    try {
      const done = await follow(code, job.id, job.kind, view => { if (alive.current) setPending(list => list.map(p => p.id === job.id ? { ...p, label: view.label ?? p.label } : p)) }, undefined, job.created, job.provider)
      if (done.status !== 'completed') throw new StudioError(done.error?.message ?? 'Tác vụ đã dừng. Hãy tạo lại bằng lệnh mới.')
      const out = done.output[0]
      const blob = await download(code, job.id, 0, job.provider)
      const kind: AssetKind = out?.media_type === 'video' ? 'video' : out?.media_type === 'audio' || job.kind === 'audio' ? 'audio' : 'image'
      if (!alive.current) return
      setDraft(d => { if (d) URL.revokeObjectURL(d.url); return { kind, blob, url: URL.createObjectURL(blob), title: job.title, prompt: job.prompt, jobId: job.id, provider: job.provider ?? 'ai34' } })
      setMessage('Đã có kết quả. Xem kỹ rồi lưu vào thư viện hoặc dùng ngay trong app.')
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : 'Không nhận được kết quả.')
    } finally {
      following.current.delete(job.id)
      if (alive.current) setPending(list => list.filter(p => p.id !== job.id))
    }
  }
  useEffect(() => { if (unlocked) pending.forEach(p => void track(p)) }, [unlocked])

  const started: Started = (view, kind, title, prompt, from = 'ai34') => {
    const job: PendingJob = { id: view.id, kind, title, prompt, created: Date.now(), label: view.label ?? 'Đang gửi', provider: from }
    setPending(list => [...list.filter(p => p.id !== job.id), job])
    void track(job)
    reveal()
    setMessage(kind === 'video' ? `${PROVIDER_LABEL[from]} đã nhận yêu cầu. Video thường mất vài phút, bạn có thể tiếp tục làm việc khác.` : `${PROVIDER_LABEL[from]} đã nhận yêu cầu, đang tạo…`)
  }
  /** Gemini pictures and voice come back at once: show them as the result straight away. */
  const finished: Result = (kind, blob, title, prompt, from) => {
    reveal()
    setDraft(d => { if (d) URL.revokeObjectURL(d.url); return { kind, blob, url: URL.createObjectURL(blob), title, prompt, provider: from } })
    setMessage('Đã có kết quả. Xem kỹ rồi lưu vào thư viện hoặc dùng ngay trong app.')
  }

  /** On narrow screens the result panel sits below the form: bring it into view. */
  function reveal() { if (window.innerWidth < 860) setTimeout(() => document.querySelector('.xs-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60) }

  async function saveDraft(target?: string) {
    if (!draft) return
    await run(async () => {
      const asset: StudioAsset = { id: newKey(), kind: draft.kind, title: draft.title, prompt: draft.prompt, created: Date.now(), blob: draft.blob, source: draft.provider === 'gemini' ? 'gemini' : 'ai34', jobId: draft.jobId }
      await media.add(asset)
      if (target) await media.assign(asset.id, target)
      setDraft(null)
      setMessage(target ? 'Đã lưu và áp dụng trong app trên thiết bị này.' : 'Đã lưu vào thư viện của gia đình.')
    })
  }

  const sources = (['gemini', 'ai34'] as const).filter(p => available[p])
  return <main className="studio-page xs-page">
    <header className="studio-top"><button className="iconbtn" onClick={onBack} disabled={busy} aria-label="Về khu phụ huynh"><UiIcon name="back" /></button>
      <img className="studio-logo" src="/assets/brand/logo-duong-thuy-160.webp" alt="Logo Dương Thủy" width="160" height="160" />
      <div><span className="studio-eyebrow">DÀNH CHO PHỤ HUYNH & GIÁO VIÊN</span><h1>Xưởng sáng tạo AI</h1></div>
      <span className={`studio-status ${unlocked && sources.length ? 'is-on' : ''}`}>{!keys || !unlocked ? 'Đang kiểm tra…' : sources.length ? `Sẵn sàng: ${sources.map(p => PROVIDER_LABEL[p]).join(' · ')}` : 'Chưa có khóa API'}</span>
    </header>
    <p className="studio-lead">Tải ảnh của bé, chọn một mẫu có sẵn, AI tạo ảnh, video, giọng nói hoặc cả một trò chơi mới. Kết quả lưu trên thiết bị này và dùng được ngay trong app.</p>

    {keyView && <KeyPanel view={keyView} code={code} busy={busy} run={run} setMessage={setMessage} onSaved={view => { setKeyView(view); void loadModels(view) }} />}

    <label className="xs-child">Tên gọi của bé (dùng trong mẫu)<input value={childName} maxLength={30} onChange={e => setChildName(e.target.value)} placeholder="Ví dụ: Na, Bin, Su" /></label>

    {sources.length > 1 && <div className="xs-chips xs-provider" role="group" aria-label="Nguồn AI"><b>Dùng AI của:</b>{sources.map(p => <button key={p} aria-pressed={provider === p} className={provider === p ? 'selected' : ''} onClick={() => setChosen(p)}>{PROVIDER_LABEL[p]}</button>)}</div>}

    {models && <div className="xs-models-bar"><span>Model lấy trực tiếp từ 34AI{models.fetchedAt ? ` lúc ${new Date(models.fetchedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}: <b>{models.image.length}</b> ảnh · <b>{models.video.length}</b> video · <b>{models.chat.length}</b> chat{catalog ? <> · <b>{catalog.voices.length}</b> giọng</> : null}. Model mới bật trên 34AI tự hiện ở đây.</span><button className="studio-text-button" disabled={busy} onClick={() => void refreshModels()}>↻ Cập nhật ngay</button></div>}

    <nav className="xs-tabs" aria-label="Loại nội dung">
      {TABS.map(t => <button key={t.id} aria-pressed={tab === t.id} className={tab === t.id ? 'selected' : ''} onClick={() => setTab(t.id)}><span aria-hidden="true">{t.icon}</span><b>{t.title}</b><small>{t.hint}</small></button>)}
    </nav>

    <div className="xs-layout">
      <section className="xs-editor">
        {(tab === 'image' || tab === 'video') && <MediaMaker key={`${tab}-${provider}`} kind={tab} provider={provider} code={code} unlocked={unlocked && available[provider]} models={activeModels} childName={childName} busy={busy} run={run} onStarted={started} onResult={finished} library={media.assets} />}
        {tab === 'audio' && <VoiceMaker key={provider} provider={provider} code={code} unlocked={unlocked && available[provider]} catalog={activeCatalog} childName={childName} busy={busy} run={run} onStarted={started} onResult={finished} />}
        {tab === 'game' && <GameMaker key={provider} provider={provider} code={code} unlocked={unlocked && available[provider]} models={activeModels} childName={childName} busy={busy} run={run} library={media.assets}
          onReady={(spec, credits) => { reveal(); const blob = new Blob([JSON.stringify(spec)], { type: 'application/json' }); setDraft(d => { if (d) URL.revokeObjectURL(d.url); return { kind: 'game', blob, url: URL.createObjectURL(blob), title: spec.title, prompt: `Trò chơi tạo từ ý tưởng${credits ? ` · ${credits} credit` : ''}`, spec } }); setMessage('Trò chơi đã sẵn sàng. Xem thử các câu hỏi rồi lưu.') }} />}
      </section>

      <section className="xs-result" aria-label="Kết quả">
        <h2>Kết quả</h2>
        {pending.length > 0 && <ul className="xs-pending" aria-live="polite">{pending.map(p => <li key={p.id}><span className="xs-spinner" aria-hidden="true" /><div><b>{p.title}</b><small>{p.label ?? 'Đang chờ'} · {KIND_LABEL[p.kind as AssetKind]}</small></div></li>)}</ul>}
        {draft ? <DraftView draft={draft} busy={busy} onSave={saveDraft} onDiscard={() => setDraft(null)} onPlay={draft.spec && onPlayGame ? () => onPlayGame(toGame({ id: 'thu' }, draft.spec!, media.assets)) : undefined} />
          : !pending.length && <div className="studio-empty"><img src="/assets/images/mascot_rabbit.webp" alt="" /><h3>Một ý tưởng nhỏ,<br />một thế giới mới</h3><p>Kết quả sẽ hiện ở đây. Có thể rời trang trong lúc chờ video; quay lại sẽ nhận tiếp.</p></div>}
      </section>
    </div>

    <div aria-live="polite" className="studio-feedback">{busy && <p role="status">Đang xử lý…</p>}{message && <p className="studio-success">{message}</p>}{(error || media.error) && <p role="alert" className="studio-error">{error || media.error}</p>}</div>

    <Library code={code} provider={provider} unlocked={unlocked && available[provider]} catalog={activeCatalog} busy={busy} run={run} onPlayGame={onPlayGame} setMessage={setMessage} />
  </main>
}

/* ============================== Ảnh và video ============================== */

function MediaMaker({ kind, provider, code, unlocked, models, childName, busy, run, onStarted, onResult, library }: {
  kind: 'image' | 'video'; provider: Provider; code: string; unlocked: boolean; models: Models | null; childName: string; busy: boolean
  run: Run; onStarted: Started; onResult: Result; library: DisplayAsset[]
}) {
  const list = (kind === 'image' ? models?.image : models?.video) ?? []
  const [modelId, setModelId] = useState('')
  const model: Ai34Model | undefined = list.find(m => m.id === modelId) ?? list[0]
  const caps = model?.capabilities ?? {}
  const templates = kind === 'image' ? IMAGE_TEMPLATES : VIDEO_TEMPLATES
  const [template, setTemplate] = useState<Template | null>(null)
  const [prompt, setPrompt] = useState('')
  const [refs, setRefs] = useState<Ref[]>([])
  const [ratio, setRatio] = useState(kind === 'video' ? '16:9' : '1:1')
  const [duration, setDuration] = useState<number | undefined>()
  const [resolution, setResolution] = useState(''), [quality, setQuality] = useState(''), [inputMode, setInputMode] = useState(''), [pro, setPro] = useState(false)
  const [consent, setConsent] = useState(false), [cost, setCost] = useState(false)
  const maxRefs = Math.min(10, typeof caps.max_reference_images === 'number' ? caps.max_reference_images : kind === 'video' ? 2 : 4)
  const ratios = caps.ratios?.length ? caps.ratios : ['16:9', '9:16', '1:1', '4:3', '3:4']
  const durations = caps.durations ?? []
  const proAllowed = kind === 'video' && (caps.generation_modes?.includes('pro_skill') ?? ['seedance-2.0', 'seedance-2.5'].includes(model?.id ?? ''))
  useEffect(() => { if (!ratios.includes(ratio)) setRatio(ratios[0]) }, [model?.id])
  useEffect(() => { if (durations.length && (duration === undefined || !durations.includes(duration))) setDuration(durations[0]) }, [model?.id])
  useEffect(() => () => refs.forEach(r => URL.revokeObjectURL(r.url)), [])

  function pick(t: Template) {
    setTemplate(t); setPrompt(fill(t.text, childName))
    if (t.ratio && ratios.includes(t.ratio)) setRatio(t.ratio)
  }
  async function addFiles(files: FileList | null) {
    if (!files) return
    await run(async () => {
      if (refs.length + files.length > maxRefs) throw new StudioError(maxRefs ? `Model này nhận tối đa ${maxRefs} ảnh tham chiếu.` : 'Model này không nhận ảnh tham chiếu.')
      const prepared = await Promise.all([...files].map(preparePicture))
      setRefs(r => [...r, ...prepared.map(p => ({ id: newKey(), ...p }))]); setConsent(false)
    })
  }
  function addFromLibrary(asset: DisplayAsset) {
    if (refs.length >= maxRefs) return
    setRefs(r => [...r, { id: newKey(), blob: asset.blob, url: URL.createObjectURL(asset.blob), name: asset.title }]); setConsent(false)
  }
  async function create() {
    await run(async () => {
      if (!model) throw new StudioError('Chưa có model phù hợp đang bật.')
      const title = template?.title ?? (kind === 'video' ? 'Video mới' : 'Ảnh mới')
      if (provider === 'gemini') {
        // Gemini takes the pictures inside the request; pictures come back at once, videos are followed.
        const images = await Promise.all(refs.map(async r => ({ data: await toBase64(r.blob) })))
        const body = { model: model.id, prompt: prompt.trim(), images, ratio, ...(resolution ? { resolution } : {}), consent: refs.length ? consent : true, costAccepted: cost }
        if (kind === 'image') onResult('image', await callBlob('gemini/image', code, body), title, prompt.trim(), 'gemini')
        else onStarted(await submit<JobView>('gemini/video', code, body), 'video', title, prompt.trim(), 'gemini')
        setCost(false)
        return
      }
      // Upload each reference once; reuse its key on later attempts.
      const keys: string[] = []
      for (const r of refs) {
        if (!r.key) r.key = await uploadReference(code, r.blob, r.name)
        keys.push(r.key)
      }
      const view = await submit<JobView>('generate', code, {
        model: model.id, prompt: prompt.trim(), images: keys, ratio,
        ...(kind === 'video' && duration !== undefined ? { duration } : {}),
        ...(resolution ? { resolution } : {}), ...(quality ? { quality } : {}), ...(inputMode ? { inputMode } : {}), ...(pro ? { pro: true } : {}),
        consent: refs.length ? consent : true, costAccepted: cost,
      })
      onStarted(view, kind, title, prompt.trim())
      setCost(false)
    })
  }
  const images = library.filter(a => a.kind === 'image').slice(0, 8)
  const groups = [...new Set(templates.map(t => t.group))]
  const canCreate = unlocked && !!model && prompt.trim().length >= 10 && cost && (!refs.length || consent) && !busy

  return <>
    <Step n={1} title="Chọn mẫu có sẵn" note="Bấm một mẫu, mô tả sẽ được điền sẵn với tên bé. Có thể sửa lại tùy ý.">
      {groups.map(g => <div key={g} className="xs-template-group"><h4>{g}</h4><div className="xs-templates">
        {templates.filter(t => t.group === g).map(t => <button key={t.id} className={template?.id === t.id ? 'selected' : ''} onClick={() => pick(t)}>
          <span className="xs-t-icon" aria-hidden="true"><LearningPicture emoji={t.icon} size={34} /></span><b>{t.title}</b>{t.refs && <small>{t.refs === 'child' ? 'Cần ảnh bé' : 'Cần ảnh gia đình'}</small>}{t.use && <small className="xs-use">Dùng cho: {t.use}</small>}
        </button>)}
      </div></div>)}
      <label>Mô tả<textarea rows={5} maxLength={3000} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={kind === 'video' ? 'Ví dụ: Bé vẫy tay chào trên đồi cỏ, máy quay đứng yên…' : 'Ví dụ: Bé hái táo trong vườn, phong cách hoạt hình 3D…'} /></label>
    </Step>

    <Step n={2} title={kind === 'video' ? 'Ảnh tham chiếu (bé, nhân vật)' : 'Ảnh tham chiếu (ảnh bé, gia đình)'} note={maxRefs ? `Tối đa ${maxRefs} ảnh JPG, PNG, WebP, GIF. Ảnh được thu nhỏ và bỏ thông tin vị trí trên thiết bị trước khi gửi.` : 'Model đang chọn chỉ tạo theo mô tả.'}>
      {maxRefs > 0 && <>
        <label className="xs-drop"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={busy || refs.length >= maxRefs} onChange={e => { void addFiles(e.target.files); e.target.value = '' }} /><span aria-hidden="true">📷</span><b>Tải ảnh lên</b><small>Chụp hoặc chọn ảnh rõ mặt bé, đủ sáng</small></label>
        {images.length > 0 && <div className="xs-from-library"><small>Hoặc lấy ảnh trong thư viện:</small><div>{images.map(a => <button key={a.id} onClick={() => addFromLibrary(a)} disabled={refs.length >= maxRefs} aria-label={`Dùng ảnh ${a.title}`}><img src={a.url} alt="" /></button>)}</div></div>}
        {refs.length > 0 && <div className="xs-refs">{refs.map((r, i) => <figure key={r.id}><img src={r.url} alt={`Ảnh tham chiếu ${i + 1}`} /><button onClick={() => { URL.revokeObjectURL(r.url); setRefs(refs.filter(x => x.id !== r.id)); setConsent(false) }} aria-label={`Bỏ ảnh ${i + 1}`}>✕</button></figure>)}</div>}
        {refs.length > 0 && <label className="studio-check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Tôi là người lớn có quyền dùng các ảnh này và đồng ý gửi ảnh, mô tả sang {SENT_TO[provider]} để tạo nội dung cho bé.</span></label>}
      </>}
    </Step>

    <Step n={3} title="Tùy chỉnh">
      <label>Model {kind === 'video' ? 'video' : 'ảnh'}<select value={model?.id ?? ''} onChange={e => setModelId(e.target.value)} disabled={!list.length}>{list.length ? list.map(m => <option key={m.id} value={m.id}>{m.name}</option>) : <option>{unlocked ? 'Chưa có model nào đang bật' : 'Chưa có khóa ở mục Khóa API'}</option>}</select></label>
      <div className="xs-chips" role="group" aria-label="Khung hình">{ratios.map(r => <button key={r} aria-pressed={ratio === r} className={ratio === r ? 'selected' : ''} onClick={() => setRatio(r)}>{RATIO_LABEL[r] ?? r}</button>)}</div>
      {kind === 'video' && durations.length > 0 && <div className="xs-chips" role="group" aria-label="Độ dài">{durations.map(d => <button key={d} aria-pressed={duration === d} className={duration === d ? 'selected' : ''} onClick={() => setDuration(d)}>{d} giây</button>)}</div>}
      <div className="studio-fields">
        {!!caps.resolutions?.length && <label>Độ phân giải<select value={resolution} onChange={e => setResolution(e.target.value)}><option value="">Mặc định</option>{caps.resolutions.map(r => <option key={r} value={r}>{r}</option>)}</select></label>}
        {kind === 'image' && !!caps.qualities?.length && <label>Chất lượng<select value={quality} onChange={e => setQuality(e.target.value)}><option value="">Mặc định</option>{caps.qualities.map(q => <option key={q} value={q}>{({ low: 'Thấp', medium: 'Vừa', high: 'Cao' } as Record<string, string>)[q] ?? q}</option>)}</select></label>}
        {!!caps.input_modes?.length && <label>Cách dùng ảnh<select value={inputMode} onChange={e => setInputMode(e.target.value)}><option value="">Mặc định</option>{caps.input_modes.map(m => <option key={m} value={m}>{INPUT_MODE[m] ?? m}</option>)}</select></label>}
      </div>
      {proAllowed && provider === 'ai34' && <label className="studio-check"><input type="checkbox" checked={pro} onChange={e => setPro(e.target.checked)} /><span>Chế độ Pro (34AI tự cấu hình, đẹp hơn, tốn nhiều credit hơn)</span></label>}
    </Step>

    <Step n={4} title="Tạo">
      <label className="studio-check"><input type="checkbox" checked={cost} onChange={e => setCost(e.target.checked)} /><span>{COST[provider]}</span></label>
      <button className="btn studio-generate" disabled={!canCreate} onClick={() => void create()}>{kind === 'video' ? '🎬 Tạo video' : '🖼️ Tạo ảnh'} bằng {PROVIDER_LABEL[provider]}</button>
      {!unlocked && <small>Dán khóa {PROVIDER_LABEL[provider]} ở mục “Khóa API 34AI” để tạo.</small>}
    </Step>
  </>
}

/* ============================== Giọng nói ============================== */

function VoiceMaker({ provider, code, unlocked, catalog, childName, busy, run, onStarted, onResult }: {
  provider: Provider; code: string; unlocked: boolean; catalog: Catalog | null; childName: string; busy: boolean
  run: Run; onStarted: Started; onResult: Result
}) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [text, setText] = useState(''), [instruction, setInstruction] = useState('')
  const [modelId, setModelId] = useState(''), [voiceId, setVoiceId] = useState('')
  const [quote, setQuote] = useState(''), [cost, setCost] = useState(false)
  const model = catalog?.models.find(m => m.id === modelId) ?? catalog?.models[0]
  const voice = voiceId || catalog?.voices[0]?.id || 'Kore'
  const body = { model: model?.id ?? 'gemini-2.5-flash-preview-tts', text: text.trim(), voiceId: voice, instruction: instruction.trim(), languageCode: 'vi-VN' }
  useEffect(() => setQuote(''), [text, instruction, modelId, voiceId])
  const groups = [...new Set(VOICE_TEMPLATES.map(t => t.group))]
  return <>
    <Step n={1} title="Chọn lời mẫu" note="Lời được điền sẵn tên bé. Sửa lại cho đúng giọng nhà mình.">
      {groups.map(g => <div key={g} className="xs-template-group"><h4>{g}</h4><div className="xs-templates">{VOICE_TEMPLATES.filter(t => t.group === g).map(t => <button key={t.id} className={template?.id === t.id ? 'selected' : ''} onClick={() => { setTemplate(t); setText(fill(t.text, childName)); setInstruction(t.instruction ?? '') }}><span className="xs-t-icon" aria-hidden="true"><LearningPicture emoji={t.icon} size={34} /></span><b>{t.title}</b>{t.use && <small className="xs-use">Dùng cho: {t.use}</small>}</button>)}</div></div>)}
      <label>Lời đọc<textarea rows={4} maxLength={12000} value={text} onChange={e => setText(e.target.value)} placeholder="Ví dụ: Chào bé Na! Hôm nay mình cùng chơi nhé!" /></label>
      <label>Phong cách giọng đọc<textarea rows={2} maxLength={4000} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="Ví dụ: Giọng cô giáo mầm non, ấm áp, vui tươi, đọc chậm" /></label>
    </Step>
    <Step n={2} title="Chọn giọng">
      <div className="studio-fields">
        <label>Model giọng<select value={model?.id ?? ''} onChange={e => setModelId(e.target.value)} disabled={!catalog?.models.length}>{catalog?.models.length ? catalog.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>) : <option>{unlocked ? 'Mặc định' : 'Chưa có khóa'}</option>}</select></label>
        <label>Giọng đọc<select value={voice} onChange={e => setVoiceId(e.target.value)} disabled={!catalog?.voices.length}>{catalog?.voices.length ? catalog.voices.map(v => <option key={v.id} value={v.id}>{v.name}{v.note ? ` · ${v.note}` : ''}</option>) : <option>Kore</option>}</select></label>
      </div>
      {provider === 'ai34' && <button className="btn alt" disabled={!unlocked || busy || !text.trim()} onClick={() => void run(async () => setQuote(creditsOf(await call('audio-quote', code, body))))}>Xem chi phí dự kiến</button>}
      {quote && <p className="xs-quote">Dự kiến: <b>{quote}</b></p>}
    </Step>
    <Step n={3} title="Tạo giọng nói">
      <label className="studio-check"><input type="checkbox" checked={cost} onChange={e => setCost(e.target.checked)} /><span>{COST[provider]}</span></label>
      <button className="btn studio-generate" disabled={!unlocked || busy || !text.trim() || !cost} onClick={() => void run(async () => {
        const title = template?.title ?? 'Giọng nói mới'
        if (provider === 'gemini') onResult('audio', await callBlob('gemini/audio', code, { ...body, costAccepted: true }), title, body.text, 'gemini')
        else onStarted(await submit<JobView>('audio-generate', code, { ...body, costAccepted: true }), 'audio', title, body.text)
        setCost(false)
      })}>🎙️ Tạo giọng nói bằng {PROVIDER_LABEL[provider]}</button>
    </Step>
  </>
}

/* ============================== Tạo trò chơi từ ý tưởng ============================== */

function GameMaker({ provider, code, unlocked, models, childName, busy, run, library, onReady }: {
  provider: Provider; code: string; unlocked: boolean; models: Models | null; childName: string; busy: boolean
  run: Run; library: DisplayAsset[]; onReady: (spec: FamilyGame, credits: number | null) => void
}) {
  const [idea, setIdea] = useState(''), [age, setAge] = useState<AgeId>('3-4'), [modelId, setModelId] = useState('')
  const [template, setTemplate] = useState<Template | null>(null), [cost, setCost] = useState(false)
  const [photos, setPhotos] = useState<{ id: string; label: string }[]>([])
  const images = library.filter(a => a.kind === 'image')
  const groups = [...new Set(GAME_TEMPLATES.map(t => t.group))]
  function toggle(asset: DisplayAsset) {
    setPhotos(p => p.some(x => x.id === asset.id) ? p.filter(x => x.id !== asset.id) : p.length >= 6 ? p : [...p, { id: asset.id, label: asset.title.slice(0, 30) }])
  }
  return <>
    <Step n={1} title="Nhập ý tưởng" note="Viết như đang kể cho cô giáo: bé thích gì, muốn bé học gì. AI soạn câu hỏi theo giáo án mầm non và chỉ dùng hình có sẵn trong app.">
      {groups.map(g => <div key={g} className="xs-template-group"><h4>{g}</h4><div className="xs-templates">{GAME_TEMPLATES.filter(t => t.group === g).map(t => <button key={t.id} className={template?.id === t.id ? 'selected' : ''} onClick={() => { setTemplate(t); setIdea(fill(t.text, childName)) }}><span className="xs-t-icon" aria-hidden="true"><LearningPicture emoji={t.icon} size={34} /></span><b>{t.title}</b>{t.refs && <small>Dùng ảnh gia đình</small>}</button>)}</div></div>)}
      <label>Ý tưởng<textarea rows={5} maxLength={1500} value={idea} onChange={e => setIdea(e.target.value)} placeholder="Ví dụ: Bé Na thích con mèo và màu hồng. Làm trò nhận biết con vật nuôi trong nhà." /></label>
      <label>Lứa tuổi<select value={age} onChange={e => setAge(e.target.value as AgeId)}>{AGES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select></label>
    </Step>
    <Step n={2} title="Ảnh gia đình làm hình đáp án (không bắt buộc)" note="Chọn ảnh đã lưu trong thư viện và ghi tên, ví dụ “Mẹ”, “Bé Na”. Ảnh không gửi đi, chỉ tên được gửi để AI soạn câu hỏi.">
      {images.length ? <div className="xs-photo-picks">{images.slice(0, 12).map(a => { const chosen = photos.find(p => p.id === a.id); return <div key={a.id} className={chosen ? 'selected' : ''}>
        <button onClick={() => toggle(a)} aria-pressed={!!chosen} aria-label={`Chọn ảnh ${a.title}`}><img src={a.url} alt="" /></button>
        {chosen && <input value={chosen.label} maxLength={30} aria-label="Tên người hoặc vật trong ảnh" onChange={e => setPhotos(p => p.map(x => x.id === a.id ? { ...x, label: e.target.value } : x))} />}
      </div> })}</div> : <small>Thư viện chưa có ảnh. Tạo hoặc thêm ảnh ở mục khác trước.</small>}
    </Step>
    <Step n={3} title="Tạo trò chơi">
      {!!models?.chat.length && <label>Model soạn trò<select value={modelId || models.chat[0].id} onChange={e => setModelId(e.target.value)}>{models.chat.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>}
      <label className="studio-check"><input type="checkbox" checked={cost} onChange={e => setCost(e.target.checked)} /><span>{provider === 'gemini' ? 'Tôi đồng ý dùng hạn mức (hoặc chi phí) của khóa Gemini (tính theo số chữ AI viết).' : 'Tôi đồng ý dùng credit của tài khoản 34AI (tính theo số chữ AI viết).'}</span></label>
      <button className="btn studio-generate" disabled={!unlocked || busy || idea.trim().length < 8 || !cost} onClick={() => void run(async () => {
        const named = photos.filter(p => p.label.trim())
        const result = await call<{ game: FamilyGame; credits: number | null }>(provider === 'gemini' ? 'gemini/game' : 'game', code, { idea: idea.trim(), age, childName, photos: named.map(p => p.label.trim()), model: modelId || undefined, costAccepted: true })
        onReady({ ...result.game, photos: named.map(p => p.id) }, result.credits); setCost(false)
      })}>🎲 Tạo trò chơi bằng {PROVIDER_LABEL[provider]}</button>
    </Step>
  </>
}

/* ============================== Kết quả và thư viện ============================== */

function DraftView({ draft, busy, onSave, onDiscard, onPlay }: { draft: Draft; busy: boolean; onSave: (target?: string) => void; onDiscard: () => void; onPlay?: () => void }) {
  const [cover, setCover] = useState('')
  return <div className="xs-draft">
    <div className="studio-preview-art">{draft.kind === 'video' ? <video src={draft.url} controls playsInline autoPlay muted loop /> : draft.kind === 'audio' ? <audio src={draft.url} controls autoPlay /> : draft.kind === 'game' && draft.spec ? <GamePreview spec={draft.spec} /> : <img src={draft.url} alt={draft.title} />}</div>
    <h3>{draft.title}</h3>
    <p className="studio-note">{draft.kind === 'game' ? 'Đọc lại từng câu hỏi trước khi cho bé chơi.' : 'Kiểm tra khuôn mặt, số lượng đồ vật và lời đọc trước khi cho bé xem.'}</p>
    <div className="studio-actions">
      {draft.kind === 'image' && <><button className="btn" disabled={busy} onClick={() => onSave('banner')}>Lưu và dùng làm banner</button>
        <select aria-label="Dùng làm bìa trò chơi" value={cover} onChange={e => setCover(e.target.value)}><option value="">Dùng làm bìa trò…</option>{GAMES.map(g => <option key={g.id} value={`game:${g.id}`}>{g.title}</option>)}</select>
        {cover && <button className="btn" disabled={busy} onClick={() => onSave(cover)}>Lưu và đặt làm bìa</button>}</>}
      {draft.kind === 'video' && <button className="btn" disabled={busy} onClick={() => onSave('banner')}>Lưu và dùng làm banner video</button>}
      {draft.kind === 'audio' && <button className="btn" disabled={busy} onClick={() => onSave('hello')}>Lưu và dùng làm lời chào trang chủ</button>}
      {draft.kind === 'game' && <><button className="btn" disabled={busy} onClick={() => onSave('home')}>Lưu và đưa ra trang chủ</button>{onPlay && <button className="btn alt" onClick={onPlay}>Chơi thử ngay</button>}</>}
      <button className="btn alt" disabled={busy} onClick={() => onSave()}>Chỉ lưu vào thư viện</button>
      {draft.kind !== 'game' && <a className="btn alt" href={draft.url} download={`be-vui-hoc.${ext(draft.blob, draft.kind)}`}>Tải xuống</a>}
      <button className="studio-text-button" disabled={busy} onClick={onDiscard}>Bỏ kết quả này</button>
    </div>
  </div>
}

function GamePreview({ spec }: { spec: FamilyGame }) {
  return <div className="xs-game-preview">
    <div className="xs-game-head"><LearningPicture emoji={spec.icon} size={56} /><div><b>{spec.title}</b><small>{spec.intro} · {AGES.find(a => a.id === spec.age)?.label} · {spec.questions.length} câu</small></div></div>
    <ol>{spec.questions.map((q, i) => <li key={i}><p>{q.text}</p><div>{q.options.map((o, k) => <span key={k} className={o.correct ? 'is-right' : ''}>{o.emoji ? <LearningPicture emoji={o.emoji} size={40} /> : <i aria-hidden="true">🖼️</i>}<small>{o.label}{o.correct ? ' ✓' : ''}</small></span>)}</div></li>)}</ol>
  </div>
}

function Library({ code, provider, unlocked, catalog, busy, run, onPlayGame, setMessage }: {
  code: string; provider: Provider; unlocked: boolean; catalog: Catalog | null; busy: boolean; run: Run
  onPlayGame?: (game: Game) => void; setMessage: (m: string) => void
}) {
  const media = useStudioMedia()
  const [filter, setFilter] = useState<AssetKind | 'all'>('all'), [selected, setSelected] = useState(''), [deleting, setDeleting] = useState(''), [cover, setCover] = useState('')
  const [spec, setSpec] = useState<FamilyGame | null>(null), [voice, setVoice] = useState('')
  const shown = media.assets.filter(a => !a.target?.startsWith('voice:') && (filter === 'all' || a.kind === filter))
  const item = media.assets.find(a => a.id === selected)
  useEffect(() => { setSpec(null); if (item?.kind === 'game') void readSpec(item).then(setSpec) }, [item?.id])
  const voiceClips = useMemo(() => item ? media.assets.filter(a => a.target === `voice:${item.id}`) : [], [media.assets, item?.id])
  async function importFile(file?: File) {
    if (!file) return
    await run(async () => { const p = await preparePicture(file); URL.revokeObjectURL(p.url); await media.add({ id: newKey(), kind: 'image', title: p.name, prompt: 'Ảnh người lớn thêm từ thiết bị.', source: 'upload', created: Date.now(), blob: p.blob }); setMessage('Đã thêm ảnh vào thư viện (chưa gửi đi đâu).') })
  }
  /** One voice clip per line of the game (intro and each question), saved for that game. */
  async function voiceGame() {
    if (!item || !spec) return
    await run(async () => {
      const lines = spokenLinesOf(spec).filter(l => !voiceClips.some(c => c.prompt === l))
      const model = catalog?.models[0]?.id ?? 'gemini-2.5-flash-preview-tts'
      for (const line of lines) {
        const body = { model, text: line, voiceId: voice || catalog?.voices[0]?.id || 'Kore', instruction: 'Giọng cô giáo mầm non, ấm áp, vui tươi, đọc chậm và rõ.', languageCode: 'vi-VN', costAccepted: true }
        if (provider === 'gemini') {
          const blob = await callBlob('gemini/audio', code, body)
          await media.add({ id: newKey(), kind: 'audio', title: `Giọng · ${spec.title}`, prompt: line, source: 'gemini', created: Date.now(), blob, target: `voice:${item.id}` })
          continue
        }
        const view = await submit<JobView>('audio-generate', code, body)
        const done = await follow(code, view.id, 'audio', () => {})
        if (done.status !== 'completed') throw new StudioError(done.error?.message ?? 'Có câu chưa tạo được giọng.')
        const blob = await download(code, view.id)
        await media.add({ id: newKey(), kind: 'audio', title: `Giọng · ${spec.title}`, prompt: line, source: 'ai34', created: Date.now(), blob, target: `voice:${item.id}`, jobId: view.id })
      }
      setMessage(lines.length ? `Đã tạo giọng đọc cho ${lines.length} câu.` : 'Trò này đã có đủ giọng đọc.')
    })
  }
  return <section className="studio-library">
    <div className="studio-library-heading"><h2>Thư viện của gia đình</h2><span>{media.assets.length}/60 nội dung</span></div>
    <p>Chỉ lưu trên thiết bị này. Ảnh, video, giọng nói và trò chơi ở đây dùng được ngay trong app.</p>
    <div className="xs-chips" role="group" aria-label="Lọc thư viện">{(['all', 'image', 'video', 'audio', 'game'] as const).map(k => <button key={k} aria-pressed={filter === k} className={filter === k ? 'selected' : ''} onClick={() => setFilter(k)}>{k === 'all' ? 'Tất cả' : KIND_LABEL[k]}</button>)}
      <label className="xs-import">＋ Thêm ảnh có sẵn<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={e => { void importFile(e.target.files?.[0]); e.target.value = '' }} /></label></div>
    {!shown.length && <p className="studio-note">{media.loading ? 'Đang mở thư viện…' : 'Chưa có nội dung.'}</p>}
    <div className="studio-gallery">{shown.map(a => <button key={a.id} className={selected === a.id ? 'selected' : ''} aria-pressed={selected === a.id} onClick={() => { setSelected(a.id); setDeleting(''); setCover('') }}>
      {a.kind === 'image' ? <img src={a.url} alt={a.title} loading="lazy" /> : a.kind === 'video' ? <video src={a.url} preload="metadata" muted /> : <span className="xs-tile-icon" aria-hidden="true">{a.kind === 'audio' ? '🎙️' : '🎲'}</span>}
      <span>{a.title}</span><small>{KIND_LABEL[a.kind]}{a.target ? ' · Đang dùng' : ''}</small>
    </button>)}</div>
    {item && <div className="studio-asset-detail">
      <h3>{item.title}</h3>
      {item.kind === 'video' && <video src={item.url} controls playsInline />}
      {item.kind === 'audio' && <audio src={item.url} controls />}
      {item.kind === 'game' && spec && <GamePreview spec={spec} />}
      {item.kind !== 'game' && <p>{item.prompt}</p>}
      <div className="studio-actions">
        {item.kind === 'image' && <><button className="btn" disabled={busy} onClick={() => void run(async () => { await media.assign(item.id, 'banner'); setMessage('Đã đặt làm banner trang chủ.') })}>Dùng làm banner</button>
          <select aria-label="Đặt làm bìa trò chơi" value={cover} onChange={e => setCover(e.target.value)}><option value="">Đặt làm bìa trò…</option>{GAMES.map(g => <option key={g.id} value={`game:${g.id}`}>{g.title}</option>)}</select>
          {cover && <button className="btn" disabled={busy} onClick={() => void run(async () => { await media.assign(item.id, cover); setMessage('Đã đặt làm bìa trò chơi.') })}>Đặt làm bìa</button>}</>}
        {item.kind === 'video' && <button className="btn" disabled={busy} onClick={() => void run(async () => { await media.assign(item.id, 'banner'); setMessage('Đã đặt làm banner video.') })}>Dùng làm banner video</button>}
        {item.kind === 'audio' && <button className="btn" disabled={busy} onClick={() => void run(async () => { await media.assign(item.id, 'hello'); setMessage('Đã đặt làm lời chào trang chủ.') })}>Dùng làm lời chào trang chủ</button>}
        {item.kind === 'game' && spec && <>
          {onPlayGame && <button className="btn" onClick={() => onPlayGame(toGame(item, spec, media.assets))}>Chơi thử</button>}
          {item.target === 'home' ? <button className="btn alt" disabled={busy} onClick={() => void run(async () => { await media.unassign(item.id); setMessage('Đã ẩn khỏi trang chủ.') })}>Ẩn khỏi trang chủ</button>
            : <button className="btn alt" disabled={busy} onClick={() => void run(async () => { await media.assign(item.id, 'home'); setMessage('Đã đưa trò ra trang chủ.') })}>Đưa ra trang chủ</button>}
        </>}
        {item.target && item.target !== 'home' && <button className="studio-text-button" disabled={busy} onClick={() => void run(async () => { await media.unassign(item.id); setMessage('Đã thôi dùng, app trở về mặc định.') })}>Thôi dùng ở vị trí này</button>}
        {item.kind !== 'game' && <a className="btn alt" href={item.url} download={`be-vui-hoc-${item.id}.${ext(item.blob, item.kind)}`}>Tải xuống</a>}
      </div>
      {item.kind === 'game' && spec && <div className="xs-voice-game">
        <b>Giọng đọc cho trò này</b><small>{voiceClips.length ? `Đã có giọng cho ${voiceClips.length}/${spokenLinesOf(spec).length} câu.` : 'Chưa có giọng: câu hỏi sẽ hiện bằng chữ kèm tiếng nhạc.'}</small>
        {!!catalog?.voices.length && <select aria-label="Giọng đọc" value={voice} onChange={e => setVoice(e.target.value)}>{catalog.voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select>}
        <button className="btn alt" disabled={!unlocked || busy} onClick={() => void voiceGame()}>🎙️ Tạo giọng đọc cho các câu bằng {PROVIDER_LABEL[provider]}</button>
      </div>}
      {deleting === item.id ? <div className="studio-delete-confirm">Xóa khỏi thiết bị{item.kind === 'game' ? ' (kèm giọng đọc của trò)' : ''} và bỏ các vị trí đang dùng?<button disabled={busy} onClick={() => void run(async () => { await media.remove(item.id); setSelected(''); setDeleting('') })}>Xóa</button><button onClick={() => setDeleting('')}>Giữ lại</button></div>
        : <button className="studio-text-button" disabled={busy} onClick={() => setDeleting(item.id)}>Xóa khỏi thư viện</button>}
    </div>}
  </section>
}

function Step({ n, title, note, children }: { n: number; title: string; note?: string; children: React.ReactNode }) {
  return <fieldset className="xs-step"><legend><span>{n}</span>{title}</legend>{note && <small className="xs-step-note">{note}</small>}{children}</fieldset>
}

/* ============================== Cài đặt lần đầu và khóa API ============================== */

function KeyPanel({ view, code, busy, run, onSaved, setMessage }: {
  view: KeysView; code: string; busy: boolean; run: Run; onSaved: (view: KeysView) => void; setMessage: (m: string) => void
}) {
  const [open, setOpen] = useState(!view.providers.ai34 || !!view.broken?.ai34)
  const [typed, setTyped] = useState('')
  const own = view.source.ai34 === 'device'
  async function save(value: string, done: string) {
    await run(async () => {
      const next = await call<KeysView>('keys/save', code, { ai34: value })
      setTyped('')
      onSaved(next)
      setMessage([done, ...(next.notes ?? [])].join(' '))
    })
  }
  const status = own ? `Khóa riêng của thiết bị này (${view.hints.ai34})` : view.source.ai34 === 'default' ? 'Đang dùng khóa mặc định của app' : 'Chưa có khóa'
  return <section className={`xs-keys ${open ? 'open' : ''}`}>
    <button className="xs-keys-head" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span aria-hidden="true">🔑</span><b>Khóa API 34AI</b><small>{status}</small>
      <i aria-hidden="true">{open ? '▴' : '▾'}</i>
    </button>
    {open && <div className="xs-keys-body">
      {view.source.ai34 === 'default' && <p className="xs-key-ok">✓ Đang dùng <b>khóa 34AI mặc định của app</b> ({view.hints.ai34}). Không cần nhập gì, mọi thiết bị đều tạo được.</p>}
      {own && <p className="xs-key-ok">✓ Thiết bị này đang dùng <b>khóa 34AI riêng</b> ({view.hints.ai34}).</p>}
      {!view.providers.ai34 && !view.broken?.ai34 && <p className="studio-error">App chưa có khóa 34AI mặc định. Chủ app cần đặt biến <code>AI34_API_KEY</code> trên Netlify, hoặc dán khóa riêng bên dưới.</p>}
      {view.broken?.ai34 && <p className="studio-error"><b>Khóa 34AI mặc định trên máy chủ bị sai định dạng.</b> Chủ app cần sửa biến <code>AI34_API_KEY</code> trên Netlify.</p>}
      <div className="studio-actions">
        {view.providers.ai34 && <button className="btn" disabled={busy} onClick={() => void run(async () => {
          const result = await call<{ ok: boolean; message: string }>('keys/test', code, { provider: 'ai34' })
          if (result.ok) setMessage(result.message); else throw new StudioError(result.message)
        })}>Thử kết nối</button>}
        {own && <button className="studio-text-button" disabled={busy} onClick={() => void save('', view.defaults.ai34 ? 'Đã bỏ khóa riêng, thiết bị này dùng lại khóa mặc định của app.' : 'Đã bỏ khóa riêng của thiết bị này.')}>{view.defaults.ai34 ? 'Dùng lại khóa mặc định' : 'Xóa khóa riêng'}</button>}
      </div>
      <details className="xs-key-more" open={!view.providers.ai34 || undefined}>
        <summary>{own ? 'Thay khóa 34AI riêng' : 'Dùng khóa 34AI của riêng tôi (không bắt buộc)'}</summary>
        <div className="xs-key-row">
          <small>Khóa riêng chỉ áp dụng trên thiết bị này, được giữ trên máy chủ của app (trình duyệt không lưu khóa). Lấy khóa ở 34AI → Cài đặt → API key.</small>
          <input type="password" aria-label="Khóa 34AI riêng" autoComplete="off" spellCheck={false} maxLength={220} value={typed} onChange={e => setTyped(e.target.value)} placeholder="34ai_live_…" />
          {!view.store && <small className="studio-error">Máy chủ chưa có kho lưu khóa, nên chưa lưu được khóa riêng.</small>}
          <div className="studio-actions"><button className="btn alt" disabled={busy || !view.store || !typed.trim()} onClick={() => void save(typed.trim(), 'Đã lưu khóa riêng cho thiết bị này.')}>Kiểm tra và lưu</button></div>
        </div>
      </details>
    </div>}
  </section>
}
