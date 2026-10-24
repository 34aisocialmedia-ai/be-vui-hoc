import { useEffect, useMemo, useRef, useState } from 'react'
import { AGES, type AgeId, type Game } from '../types'
import { LearningPicture } from '../components/LearningPicture'
import { useStudioMedia, type DisplayAsset } from './media'
import {
  download, follow, newKey, preparePicture, submit, uploadReference,
  type Ai34Model, type FamilyGame, type GamePlan, type JobView, type Models, StudioError,
} from './ai34'
import { spokenLinesOf, toGame } from './familyGames'

/*
 * "Trò chơi có bé": the main studio workflow.
 * Parent adds photos of the child (and family) + picks a theme → one button →
 * AI writes the game, draws every scene with the child/family in it, records the teacher's voice,
 * and the finished game appears on the home page.
 */

type PersonId = 'be' | 'p1' | 'p2' | 'p3'
/** Several clear photos (front, slight side, smiling) give the AI a much better likeness. */
const MAX_PHOTOS: Record<PersonId, number> = { be: 3, p1: 2, p2: 2, p3: 2 }
interface Photo { id: string; blob: Blob; url: string }
interface Person { id: PersonId; label: string; photos: Photo[] }
interface Voice { id: string; name: string }
type State = 'wait' | 'run' | 'done' | 'fail' | 'skip'
interface Task { key: string; label: string; scene: string; people: PersonId[]; cover?: boolean; state: State; url?: string; blob?: Blob; note?: string; refs?: string }

const THEMES = [
  { id: 'self-care', icon: '🪥', title: 'Bé tự chăm sóc', idea: 'Bé {be} tự làm việc vừa sức: đánh răng, rửa tay, mặc áo, cất đồ chơi. Hỏi bé nên làm gì và làm thế nào cho đúng.' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Gia đình của bé', idea: 'Bé {be} và người thân ở nhà: nhận ra ai là ai, mỗi người đang làm gì, bé giúp đỡ người thân ra sao.' },
  { id: 'market', icon: '🛒', title: 'Bé đi chợ', idea: 'Bé {be} đi chợ cùng người thân: chọn rau, củ, quả đúng tên và màu, đếm số lượng nhỏ.' },
  { id: 'zoo', icon: '🦁', title: 'Bé đi sở thú', idea: 'Bé {be} đi thăm sở thú: gặp và gọi tên các con vật, con vật kêu thế nào, sống ở đâu.' },
  { id: 'traffic', icon: '🚦', title: 'An toàn giao thông', idea: 'Bé {be} đi đường cùng người lớn: đèn đỏ dừng lại, đèn xanh đi, nắm tay người lớn, đội mũ bảo hiểm.' },
  { id: 'jobs', icon: '👩‍⚕️', title: 'Bé làm nghề', idea: 'Bé {be} hóa thân thành bác sĩ, lính cứu hỏa, đầu bếp, nông dân: mỗi nghề dùng đồ vật gì, làm việc gì.' },
  { id: 'colors', icon: '🎨', title: 'Bé học màu sắc', idea: 'Bé {be} tìm đồ vật theo màu đỏ, vàng, xanh trong nhà và ngoài vườn.' },
  { id: 'feelings', icon: '😊', title: 'Cảm xúc của bé', idea: 'Bé {be} vui, buồn, ngạc nhiên, sợ hãi trong các tình huống hằng ngày; bé làm gì để thấy vui hơn.' },
] as const
const RELATIONS = ['Mẹ', 'Bố', 'Bà', 'Ông', 'Anh', 'Chị', 'Em', 'Cô giáo']
const QUALITY = [
  { id: 'fast', title: 'Nhanh', hint: 'tiết kiệm credit' },
  { id: 'normal', title: 'Cân bằng', hint: 'khuyên dùng' },
  { id: 'best', title: 'Giống bé nhất', hint: 'model Pro: giữ khuôn mặt tốt nhất, lâu hơn, nhiều credit hơn' },
] as const
type Quality = typeof QUALITY[number]['id']

/** Pick an image model that takes reference photos, by the quality the parent chose. */
export function pickImageModel(list: Ai34Model[], quality: Quality): Ai34Model | undefined {
  const withRefs = list.filter(m => (m.capabilities.max_reference_images ?? 0) > 0 || m.capabilities.reference_images === true)
  const pool = withRefs.length ? withRefs : list
  const by = (re: RegExp) => pool.find(m => re.test(`${m.id} ${m.name}`))
  if (quality === 'fast') return by(/lite|fast|mini|flash/i) ?? pool[0]
  if (quality === 'best') return by(/pro|ultra|max|hd/i) ?? pool[pool.length - 1]
  return pool.find(m => !/lite|fast|mini|pro|ultra|max/i.test(`${m.id} ${m.name}`)) ?? pool[0]
}
const pickRatio = (m: Ai34Model, wanted: string[]) => wanted.find(r => !m.capabilities.ratios?.length || m.capabilities.ratios.includes(r))
const pickResolution = (m: Ai34Model, quality: Quality) => {
  const list = m.capabilities.resolutions ?? []
  if (!list.length || quality === 'best') return undefined
  return list.find(r => /720|1k/i.test(r))
}

/** Who is in a picture and which reference images show them (1-based, in the order sent). */
export interface Cast { label: string; photos: number[]; design?: number }
const list = (n: number[]) => n.length === 1 ? `reference image ${n[0]}` : `reference images ${n.join(', ')}`

/** Features copied from the photos. Spelled out one by one: models keep a likeness far better that way. */
const LIKENESS = 'face shape and chin, cheek fullness, eye shape, eye size relative to the face, eye spacing and eye colour, eyelids, eyebrow shape and thickness, nose shape and size, lip shape and smile, ears, skin tone, hair colour, hairstyle, parting, hair length, fringe or bangs, hair accessories, freckles or moles, glasses if worn, apparent age and body build'
const STYLE = 'Art style: cute, high-quality 3D animated family-film look; smooth soft rendering, gentle subsurface skin, soft rounded forms, glossy expressive eyes with catchlights, slightly cartoon proportions (head a little larger); bright cheerful colours, warm soft lighting.'
const KEEP = 'Stylise ONLY the rendering. Do not beautify, slim, age up or down, lighten or darken the skin, change the ethnicity, enlarge the eyes into a different shape, or replace anyone with a generic cartoon face.'

/** Step 1: one approved-looking 3D design per person, made from their real photos only. */
export function characterPrompt(label: string, photos: number[], child: boolean) {
  return [
    `Create a 3D animated character portrait of the ${child ? 'young child' : 'person'} "${label}" shown in the real photos (${list(photos)}).`,
    `LIKENESS IS THE TOP PRIORITY: it must look like the SAME ${child ? 'child' : 'person'} turned into a cute 3D cartoon, instantly recognisable by their family.`,
    `Copy exactly from the photos: ${LIKENESS}.`,
    KEEP,
    STYLE,
    'Framing: head and shoulders, front view, looking at the viewer, natural happy smile, the whole face and hair clearly visible, nothing covering the face; plain soft pastel background; even soft studio light. Simple everyday clothes in colours similar to the photo. Only this one person. No text.',
  ].join('\n')
}

/** The character block every scene and the cover start with: the same faces in every picture. */
export function castBlock(cast: Cast[]) {
  if (!cast.length) return ''
  const lines = cast.map(c => {
    const parts = [c.photos.length ? `real photo${c.photos.length > 1 ? 's' : ''} = ${list(c.photos)}` : '', c.design ? `approved 3D character design = reference image ${c.design}` : ''].filter(Boolean).join('; ')
    const how = c.design
      ? `Draw "${c.label}" exactly as this approved character design (same face, eyes, nose, mouth, skin tone, hair colour, hairstyle and fringe), checked against the real photos.`
      : `Draw "${c.label}" as a cute 3D cartoon version of the real person in the photos, copying: ${LIKENESS}.`
    return `- "${c.label}": ${parts}. ${how}`
  })
  return [
    'CHARACTERS (keep them identical in every picture of this game):',
    ...lines,
    `Rules: likeness comes first, only the art style changes. ${KEEP} Never swap or merge faces between people. Each named person appears exactly once; do not add other people unless the scene asks for them.`,
  ].join('\n')
}

/** Prompt for one scene: characters first, then the scene, the style and the framing. */
export function scenePrompt(scene: string, cast: Cast[]) {
  return [
    castBlock(cast),
    `SCENE (a picture for a preschool learning game): ${scene}.`,
    STYLE,
    'Composition: square frame, one clear action in the centre, simple uncluttered background; the characters\' faces large enough and clearly visible (front or three-quarter view), not hidden by objects, hands or hair. No text, no logos.',
  ].filter(Boolean).join('\n')
}

/** Prompt for the cover: the characters, the game's title as playful layered 3D letters, the scene below. */
export function coverPrompt(name: string, scene: string, cast: Cast[]) {
  const title = name.replace(/["“”'‘’`]/g, '').trim()
  return [
    castBlock(cast),
    'COVER of a preschool learning game, landscape frame.',
    `TITLE: write exactly the Vietnamese text "${title}" (every letter and every tone mark exactly as given, nothing added, removed or changed), large in the upper third of the image.`,
    'Title lettering: playful multi-layer 3D letters, chunky rounded bubble / jelly-candy shapes, each letter a different bright colour (red, orange, yellow, green, blue, purple), a thick white outline and an outer darker outline, several stacked 3D layers giving depth, soft drop shadow, glossy highlights, letters bouncing slightly up and down, a few small sparkling stars around. Big, sharp, easy to read, fully inside the frame, not covered by anyone.',
    `SCENE in the lower half: ${scene}. The characters look happy and face the viewer, faces clear and true to their photos.`,
    STYLE,
    'No other text anywhere except the title.',
  ].filter(Boolean).join('\n')
}

/** Which reference images go with one picture (the model takes at most `max`): each person's design and first photo first, then more photos, the child first. */
export function allot(ids: string[], photos: Record<string, string[]>, designs: Record<string, string | undefined>, labels: Record<string, string>, max: number) {
  const order = [...ids].sort((x, y) => (x === 'be' ? -1 : y === 'be' ? 1 : 0))
  const pick: Record<string, { photos: string[]; design?: string }> = Object.fromEntries(order.map(id => [id, { photos: [] }]))
  let used = 0
  for (const id of order) if (designs[id] && used < max) { pick[id].design = designs[id]; used++ }
  for (let round = 0; round < 3; round++) for (const id of order) { const k = photos[id]?.[round]; if (k && used < max) { pick[id].photos.push(k); used++ } }
  const images: string[] = [], cast: Cast[] = []
  for (const id of order) {
    const p = pick[id]
    if (!p.photos.length && !p.design) continue
    const ph = p.photos.map(k => images.push(k))
    const design = p.design ? images.push(p.design) : undefined
    cast.push({ label: labels[id], photos: ph, ...(design ? { design } : {}) })
  }
  return { images, cast }
}

async function shrink(blob: Blob, max: number): Promise<Blob> {
  try {
    const url = URL.createObjectURL(blob)
    const img = new Image(); img.src = url; await img.decode(); URL.revokeObjectURL(url)
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    return await new Promise<Blob>((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error()), 'image/jpeg', .86))
  } catch { return blob }
}
async function pool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i) } }))
  return out
}
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

export function GameWizard({ code, unlocked, models, voices, voiceModel, childName, setChildName, onPlayGame, setMessage, setError }: {
  code: string; unlocked: boolean; models: Models | null; voices: Voice[]; voiceModel?: string
  childName: string; setChildName: (v: string) => void
  onPlayGame?: (game: Game) => void; setMessage: (m: string) => void; setError: (m: string) => void
}) {
  const media = useStudioMedia()
  const [people, setPeople] = useState<Person[]>([{ id: 'be', label: '', photos: [] }])
  const [theme, setTheme] = useState<string>('self-care'), [idea, setIdea] = useState(''), [age, setAge] = useState<AgeId>(() => {
    try { const v = JSON.parse(localStorage.getItem('be-vui-hoc-v1') || '{}').preferredAge; return AGES.some(a => a.id === v) ? v : '3-4' } catch { return '3-4' }
  })
  const [quality, setQuality] = useState<Quality>('normal'), [withVoice, setWithVoice] = useState(true), [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<'form' | 'run' | 'done'>('form')
  const [steps, setSteps] = useState<Record<'plan' | 'refs' | 'char' | 'draw' | 'voice' | 'save', State>>({ plan: 'wait', refs: 'wait', char: 'wait', draw: 'wait', voice: 'wait', save: 'wait' })
  const [tasks, setTasks] = useState<Task[]>([]), [plan, setPlan] = useState<GamePlan | null>(null), [status, setStatus] = useState('')
  const [result, setResult] = useState<{ id: string; spec: FamilyGame } | null>(null)
  const stop = useRef(false)

  // Photos saved from an earlier game come back, so parents do not upload them again.
  const saved = useMemo(() => media.assets.filter(a => a.kind === 'image' && a.target?.startsWith('person:')), [media.assets])
  useEffect(() => {
    if (!saved.length || people.some(p => p.photos.length)) return
    const byId = new Map<string, DisplayAsset[]>()
    for (const a of saved) { const id = a.target!.slice(7); byId.set(id, [...(byId.get(id) ?? []), a]) }
    const restored: Person[] = (['be', 'p1', 'p2', 'p3'] as PersonId[]).filter(id => byId.has(id)).map(id => ({
      id, label: id === 'be' ? '' : byId.get(id)![0].title, photos: byId.get(id)!.slice(0, MAX_PHOTOS[id]).map(a => ({ id: a.id, blob: a.blob, url: URL.createObjectURL(a.blob) })),
    }))
    if (restored.some(p => p.id === 'be')) setPeople(restored)
  }, [saved.length])
  // No automatic app update while a parent is in the studio (a reload would lose the photos or stop a game being made).
  useEffect(() => {
    const flag = window as unknown as { __bvhBusy?: boolean }
    flag.__bvhBusy = true
    return () => { flag.__bvhBusy = false }
  }, [])
  useEffect(() => {
    if (phase !== 'run') return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [phase])

  const child = people.find(p => p.id === 'be')!
  const name = childName.trim() || 'bé'
  const chosenTheme = THEMES.find(t => t.id === theme)
  const imageModel = pickImageModel(models?.image ?? [], quality)
  const ready = unlocked && !!imageModel && child.photos.length > 0 && people.every(p => p.id === 'be' || (p.label.trim() && p.photos.length)) && (theme || idea.trim().length >= 8) && consent

  async function addPhotos(id: PersonId, files: FileList | null) {
    if (!files?.length) return
    try {
      const max = MAX_PHOTOS[id]
      const prepared = await Promise.all([...files].slice(0, max).map(preparePicture))
      setPeople(list => list.map(p => p.id === id ? { ...p, photos: [...p.photos, ...prepared.map(x => ({ id: newKey(), blob: x.blob, url: x.url }))].slice(-max) } : p))
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đọc được ảnh.') }
  }
  function addPerson() {
    const free = (['p1', 'p2', 'p3'] as PersonId[]).find(id => !people.some(p => p.id === id))
    if (free) setPeople(list => [...list, { id: free, label: RELATIONS.find(r => !list.some(p => p.label === r)) ?? '', photos: [] }])
  }

  async function create() {
    if (!imageModel) return
    stop.current = false
    setPhase('run'); setError(''); setMessage(''); setResult(null); setPlan(null); setTasks([])
    setTimeout(() => document.querySelector('.gw')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    setSteps({ plan: 'run', refs: 'wait', char: 'wait', draw: 'wait', voice: withVoice ? 'wait' : 'skip', save: 'wait' })
    const mark = (k: keyof typeof steps, s: State) => setSteps(old => ({ ...old, [k]: s }))
    const childLabel = /^bé(\s|$)/i.test(name) ? `Bé${name.slice(2)}` : `Bé ${name}`
    const crew = people.map(p => ({ ...p, label: p.id === 'be' ? childLabel : p.label.trim() }))
    try {
      // 1. The script.
      setStatus('AI đang soạn kịch bản trò chơi…')
      const idea2 = [chosenTheme?.idea.replace(/\{be\}/g, name), idea.trim()].filter(Boolean).join(' ')
      const { plan } = await submit<{ plan: GamePlan }>('game-plan', code, {
        idea: idea2, age, childName: name, theme: chosenTheme?.title ?? '', costAccepted: true,
        people: crew.map(p => ({ id: p.id, label: p.label })),
      })
      setPlan(plan); mark('plan', 'done')
      if (stop.current) throw new StudioError('Đã dừng.')

      // 2. Reference photos (each uploaded once).
      mark('refs', 'run'); setStatus('Đang gửi ảnh của bé và người thân…')
      const refs: Record<string, string[]> = {}
      for (const p of crew) refs[p.id] = await Promise.all(p.photos.map(ph => uploadReference(code, ph.blob, `${p.id}.jpg`)))
      mark('refs', 'done')

      const maxRefs = Math.max(1, Math.min(imageModel.capabilities.max_reference_images ?? 4, 7))
      const labels = Object.fromEntries(crew.map(p => [p.id, p.label]))
      const update = (key: string, patch: Partial<Task>) => setTasks(old => old.map(t => t.key === key ? { ...t, ...patch } : t))
      /** Draw one picture (one retry); returns null when it could not be drawn. */
      async function draw(key: string, body: Record<string, unknown>, max: number): Promise<Blob | null> {
        update(key, { state: 'run' })
        for (let attempt = 0; attempt < 2 && !stop.current; attempt++) {
          try {
            const view = await submit<JobView>('generate', code, { model: imageModel!.id, consent: true, costAccepted: true, ...body })
            const fin = await follow(code, view.id, 'image', v => update(key, { note: v.label ?? undefined }))
            if (fin.status !== 'completed') throw new StudioError(fin.error?.message ?? 'Không vẽ được tranh này.')
            const blob = await shrink(await download(code, view.id, 0), max)
            update(key, { state: 'done', blob, url: URL.createObjectURL(blob), note: undefined })
            return blob
          } catch (e) {
            const credits = (e as StudioError).code === 'insufficient_credits'
            if (attempt === 1 || credits) { update(key, { state: 'fail', note: e instanceof Error ? e.message : 'Lỗi' }); if (credits) stop.current = true; return null }
            await wait(1500)
          }
        }
        return null
      }
      // Sharper pictures for the characters and the cover (faces and the title) unless the parent chose "fast".
      const sharp = quality === 'fast' ? pickResolution(imageModel, quality) : undefined
      const square = pickRatio(imageModel, ['1:1', '4:3'])

      // 3. One 3D character per person from their real photos: every picture then uses the same faces.
      const list: Task[] = [
        { key: 'cover', label: 'Bìa trò chơi', scene: plan.cover.scene, people: plan.cover.people as PersonId[], cover: true, state: 'wait' },
        ...plan.scenes.map(s => ({ key: s.id, label: s.scene, scene: s.scene, people: s.people as PersonId[], state: 'wait' as State })),
      ]
      const inGame = crew.filter(p => list.some(t => t.people.includes(p.id)) && refs[p.id]?.length)
      const chars: Task[] = inGame.map(p => ({ key: `char-${p.id}`, label: `Nhân vật: ${p.label}`, scene: '', people: [p.id], state: 'wait', refs: `${p.label}: ${Math.min(refs[p.id].length, maxRefs)} ảnh thật` }))
      setTasks([...chars, ...list])
      mark('char', 'run'); setStatus(`AI đang tạo nhân vật 3D giống ${name}…`)
      const designs: Record<string, string | undefined> = {}
      await pool(inGame, 3, async p => {
        if (stop.current) return
        const photos = refs[p.id].slice(0, maxRefs)
        const blob = await draw(`char-${p.id}`, { prompt: characterPrompt(p.label, photos.map((_, i) => i + 1), p.id === 'be'), images: photos, ...(square ? { ratio: square } : {}), ...(sharp ? { resolution: sharp } : {}) }, 1024)
        if (blob) designs[p.id] = await uploadReference(code, blob, `nhan-vat-${p.id}.jpg`).catch(() => undefined)
      })
      if (stop.current) throw new StudioError('Đã dừng. Các tranh đã vẽ vẫn còn trên màn hình.')
      mark('char', inGame.every(p => designs[p.id]) ? 'done' : 'fail')

      // 4. The cover and every scene (3 at a time), each with the characters and the real photos.
      mark('draw', 'run')
      const finished = new Map<string, Blob>()
      let done = 0
      setStatus(`AI đang vẽ ${list.length} bức tranh có ${name}…`)
      await pool(list, 3, async task => {
        if (stop.current) return
        const { images, cast } = allot(task.people, refs, designs, labels, maxRefs)
        update(task.key, { refs: cast.map(c => `${c.label}: ${c.photos.length} ảnh${c.design ? ' + nhân vật 3D' : ''}`).join(', ') || 'không có người' })
        const ratio = pickRatio(imageModel, task.cover ? ['16:9', '4:3', '1:1'] : ['1:1', '4:3'])
        const resolution = task.cover ? sharp : pickResolution(imageModel, quality)
        const blob = await draw(task.key, {
          prompt: task.cover ? coverPrompt(plan.title, task.scene, cast) : scenePrompt(task.scene, cast), ...(task.cover ? { title: plan.title } : {}),
          images, ...(ratio ? { ratio } : {}), ...(resolution ? { resolution } : {}),
        }, task.cover ? 1280 : 768)
        if (blob) { finished.set(task.key, blob); done++; setStatus(`Đã vẽ ${done}/${list.length} bức tranh…`) }
      })
      if (stop.current) throw new StudioError('Đã dừng. Các tranh đã vẽ vẫn còn trên màn hình.')
      if (!plan.scenes.some(s => finished.has(s.id))) throw new StudioError('Chưa vẽ được bức tranh nào. Hãy kiểm tra credit 34AI rồi thử lại.')
      mark('draw', finished.size === list.length ? 'done' : 'fail')

      // 4. Save: pictures first, then the game (its id ties the pictures and voice to it).
      mark('save', 'run'); setStatus('Đang lưu trò chơi vào thiết bị…')
      const gameId = newKey(), assetOf: Record<string, string> = {}
      for (const t of list) {
        const blob = finished.get(t.key)
        if (!blob) continue
        const id = newKey(); assetOf[t.key] = id
        await media.add({ id, kind: 'image', title: `${plan.title} · ${t.cover ? 'bìa' : 'cảnh'}`, prompt: t.scene, source: 'ai34', created: Date.now(), blob, target: `scene:${gameId}` })
      }
      const fallback = new Map(plan.scenes.map(s => [s.id, s.fallback]))
      const spec: FamilyGame = {
        title: plan.title, intro: plan.intro, icon: plan.icon, age: plan.age, cover: assetOf.cover, people: crew.map(p => p.label),
        questions: plan.questions.map(q => ({
          text: q.text, ...(q.show && assetOf[q.show] ? { show: assetOf[q.show] } : {}),
          options: q.options.map(o => ({ label: o.label, correct: o.correct, emoji: o.emoji ?? fallback.get(o.scene ?? '') ?? '⭐', ...(o.scene && assetOf[o.scene] ? { asset: assetOf[o.scene] } : {}) })),
        })),
      }
      await media.add({ id: gameId, kind: 'game', title: spec.title, prompt: 'Trò chơi có bé, tạo bằng AI', source: 'ai34', created: Date.now(), blob: new Blob([JSON.stringify(spec)], { type: 'application/json' }), target: 'home' })
      // Keep the people's photos (on this device only) for the next game; forget ones no longer used.
      const keep = new Set(crew.flatMap(p => p.photos.map(ph => ph.id)))
      for (const old of saved) if (!keep.has(old.id)) await media.remove(old.id).catch(() => {})
      for (const p of crew) for (const ph of p.photos) if (!saved.some(a => a.id === ph.id)) {
        await media.add({ id: ph.id, kind: 'image', title: p.label, prompt: 'Ảnh người thân dùng để tạo trò chơi (chỉ lưu trên thiết bị này).', source: 'upload', created: Date.now(), blob: ph.blob, target: `person:${p.id}` }).catch(() => {})
      }
      mark('save', 'done')
      setResult({ id: gameId, spec })

      // 5. The teacher reads the questions (the game is already playable without it).
      if (withVoice && voices.length) {
        mark('voice', 'run'); setStatus('Cô giáo AI đang đọc các câu hỏi…')
        const voice = voices.find(v => /kore|nữ|female/i.test(`${v.id} ${v.name}`)) ?? voices[0]
        const lines = spokenLinesOf(spec)
        let ok = 0
        await pool(lines, 2, async line => {
          try {
            const view = await submit<JobView>('audio-generate', code, { model: voiceModel, text: line, voiceId: voice.id, instruction: 'Giọng cô giáo mầm non, ấm áp, vui tươi, đọc chậm và rõ.', languageCode: 'vi-VN', costAccepted: true })
            const fin = await follow(code, view.id, 'audio', () => {})
            if (fin.status !== 'completed') return
            await media.add({ id: newKey(), kind: 'audio', title: `Giọng · ${spec.title}`, prompt: line, source: 'ai34', created: Date.now(), blob: await download(code, view.id), target: `voice:${gameId}`, jobId: view.id })
            ok++
          } catch { /* the game still plays with on-screen text */ }
        })
        mark('voice', ok === lines.length ? 'done' : 'fail')
      }
      setPhase('done'); setStatus('')
      setMessage(`Đã tạo xong “${spec.title}”. Trò chơi đã có trên trang chủ, mục “Trò chơi của nhà mình”.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa tạo được trò chơi.')
      setSteps(old => Object.fromEntries(Object.entries(old).map(([k, v]) => [k, v === 'run' ? 'fail' : v])) as typeof old)
      setStatus('')
      setPhase(p => (p === 'run' ? 'done' : p))
    }
  }

  const play = () => { if (result && onPlayGame) onPlayGame(toGame({ id: result.id }, result.spec, media.assets)) }

  if (phase !== 'form') return <section className="gw gw-run" aria-live="polite">
    <div className="gw-run-head">
      <span className="gw-spark" aria-hidden="true">{phase === 'run' ? '✨' : result ? '🎉' : '⚠️'}</span>
      <div><h2>{phase === 'run' ? `Đang tạo trò chơi có ${name}` : result ? 'Trò chơi mới đã sẵn sàng!' : 'Chưa tạo xong'}</h2>
        <p>{status || (result ? `“${result.spec.title}” đã có trên trang chủ.` : 'Xem các bước bên dưới, rồi bấm tạo lại.')}</p></div>
    </div>
    <ol className="gw-steps">
      {([['plan', 'Soạn kịch bản theo giáo án'], ['refs', 'Gửi ảnh của bé và người thân'], ['char', 'Tạo nhân vật 3D giống ảnh thật'], ['draw', `Vẽ tranh có ${name}`], ['save', 'Lưu trò chơi, đưa ra trang chủ'], ['voice', 'Cô giáo đọc câu hỏi']] as const).map(([k, t]) =>
        <li key={k} className={`gw-step ${steps[k]}`}><i aria-hidden="true">{steps[k] === 'done' ? '✓' : steps[k] === 'fail' ? '!' : steps[k] === 'skip' ? '–' : steps[k] === 'run' ? '' : '•'}</i><span>{t}</span></li>)}
    </ol>
    {tasks.length > 0 && <div className="gw-gallery">{tasks.map(t => <figure key={t.key} className={`gw-tile ${t.state}${t.cover ? ' cover' : ''}`}>
      {t.url ? <img src={t.url} alt={t.scene} /> : <span className="gw-tile-wait">{t.state === 'fail' ? '😕' : <span className="xs-spinner" />}</span>}
      <figcaption>{t.cover ? 'Bìa' : t.label}{t.refs ? <small className="gw-refs">📎 Ảnh tham chiếu đã gửi · {t.refs}</small> : null}{t.note ? <small>{t.note}</small> : null}</figcaption>
    </figure>)}</div>}
    {plan && <details className="gw-plan"><summary>Xem kịch bản: {plan.questions.length} câu hỏi</summary>
      <ol>{plan.questions.map((q, i) => <li key={i}>{q.text}</li>)}</ol></details>}
    <div className="gw-actions">
      {phase === 'run' && <button className="btn alt" onClick={() => { stop.current = true; setStatus('Đang dừng sau bước hiện tại…') }}>Dừng</button>}
      {result && onPlayGame && <button className="btn gw-play" onClick={play}>▶ Chơi ngay</button>}
      {phase === 'done' && <button className="btn alt" onClick={() => { tasks.forEach(t => t.url && URL.revokeObjectURL(t.url)); setTasks([]); setPhase('form'); setConsent(false) }}>{result ? 'Tạo trò chơi khác' : 'Quay lại và thử lại'}</button>}
    </div>
    {phase === 'run' && <p className="gw-note">Thường mất 2–5 phút. Hãy giữ trang này mở; có thể xem trước các tranh đã vẽ xong.</p>}
  </section>

  return <section className="gw">
    <div className="gw-intro">
      <h2>🌟 Tạo trò chơi có bé</h2>
      <p>Tải ảnh của bé (và người thân), chọn chủ đề rồi bấm tạo. AI soạn câu hỏi theo giáo án, vẽ từng cảnh có chính bé trong đó, cô giáo đọc câu hỏi — trò chơi mới tự xuất hiện trên trang chủ.</p>
    </div>

    <div className="gw-block">
      <h3><b>1</b> Ai có mặt trong trò chơi?</h3>
      <p className="gw-tips">📸 Để tranh <b>giống bé</b>: dùng 2–3 ảnh chụp gần, rõ mặt, đủ sáng (một ảnh chính diện, một ảnh hơi nghiêng); mỗi ảnh chỉ có một người; không đeo kính, khẩu trang, mũ che tóc; không dùng ảnh đã qua bộ lọc làm đẹp.</p>
      <div className="gw-people">
        {people.map(p => <div key={p.id} className={`gw-person${p.id === 'be' ? ' main' : ''}`}>
          <div className="gw-person-head">
            {p.id === 'be' ? <label>Tên gọi của bé<input value={childName} maxLength={30} onChange={e => setChildName(e.target.value)} placeholder="Ví dụ: Na, Bin, Su" /></label>
              : <label>Người thân<input list="gw-relations" value={p.label} maxLength={20} onChange={e => setPeople(list => list.map(x => x.id === p.id ? { ...x, label: e.target.value } : x))} placeholder="Mẹ, Bố, Bà…" /></label>}
            {p.id !== 'be' && <button className="gw-x" aria-label={`Bỏ ${p.label || 'người này'}`} onClick={() => setPeople(list => list.filter(x => x.id !== p.id))}>✕</button>}
          </div>
          <div className="gw-photos">
            {p.photos.map(ph => <figure key={ph.id}><img src={ph.url} alt="" /><button aria-label="Bỏ ảnh" onClick={() => setPeople(list => list.map(x => x.id === p.id ? { ...x, photos: x.photos.filter(y => y.id !== ph.id) } : x))}>✕</button></figure>)}
            {p.photos.length < MAX_PHOTOS[p.id] && <label className="gw-drop"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { void addPhotos(p.id, e.target.files); e.target.value = '' }} /><span aria-hidden="true">📷</span><small>{p.photos.length ? 'Thêm góc khác' : p.id === 'be' ? 'Ảnh rõ mặt bé' : 'Ảnh rõ mặt'}</small></label>}
          </div>
        </div>)}
        {people.length < 4 && <button className="gw-add" onClick={addPerson}><span aria-hidden="true">＋</span>Thêm người thân<small>Mẹ, bố, ông bà… cùng vào trò chơi</small></button>}
      </div>
      <datalist id="gw-relations">{RELATIONS.map(r => <option key={r} value={r} />)}</datalist>
    </div>

    <div className="gw-block">
      <h3><b>2</b> Trò chơi về điều gì?</h3>
      <div className="gw-themes">{THEMES.map(t => <button key={t.id} aria-pressed={theme === t.id} className={theme === t.id ? 'on' : ''} onClick={() => setTheme(theme === t.id ? '' : t.id)}>
        <LearningPicture emoji={t.icon} size={40} /><span>{t.title}</span></button>)}</div>
      <label className="gw-idea">Thêm ý tưởng của gia đình (không bắt buộc)<textarea rows={2} maxLength={600} value={idea} onChange={e => setIdea(e.target.value)} placeholder={`Ví dụ: ${name} rất thích con mèo và màu hồng, sắp đi học mẫu giáo.`} /></label>
      <div className="gw-row" role="group" aria-label="Lứa tuổi"><span>Lứa tuổi:</span>{AGES.map(a => <button key={a.id} aria-pressed={age === a.id} className={age === a.id ? 'on' : ''} onClick={() => setAge(a.id)}>{a.label}</button>)}</div>
    </div>

    <div className="gw-block">
      <h3><b>3</b> Bấm tạo và chờ AI</h3>
      <div className="gw-row" role="group" aria-label="Chất lượng tranh"><span>Tranh:</span>{QUALITY.map(q => <button key={q.id} aria-pressed={quality === q.id} className={quality === q.id ? 'on' : ''} onClick={() => setQuality(q.id)} title={q.hint}>{q.title}</button>)}
        {imageModel && <small className="gw-model">{imageModel.name}</small>}</div>
      <label className="studio-check"><input type="checkbox" checked={withVoice} onChange={e => setWithVoice(e.target.checked)} /><span>Cô giáo AI đọc câu hỏi cho bé nghe</span></label>
      <label className="studio-check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Tôi là người lớn có quyền dùng các ảnh này, đồng ý gửi ảnh và mô tả sang 34AI để tạo trò chơi, và dùng credit của tài khoản 34AI (khoảng 1 lượt soạn, mỗi người 1 tranh nhân vật 3D, tối đa 7 tranh trò chơi và các câu giọng đọc).</span></label>
      <button className="btn gw-go" disabled={!ready} onClick={() => void create()}>✨ Tạo trò chơi có {name}</button>
      {!unlocked && <small>Xưởng chưa kết nối 34AI. Kiểm tra mục Khóa API 34AI ở trên.</small>}
      {unlocked && !child.photos.length && <small>Thêm ít nhất một ảnh rõ mặt của bé để bắt đầu.</small>}
    </div>
  </section>
}
