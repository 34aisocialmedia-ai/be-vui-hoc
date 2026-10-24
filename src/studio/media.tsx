import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The family library, kept only on this device (IndexedDB): pictures, videos, voice clips and
 * games made in the studio. `target` says where an item is used in the app:
 *   banner          home banner (picture or video)
 *   game:<id>       cover of a game (picture)
 *   hello           the greeting played by the banner's speaker button (voice)
 *   home            a family game shown on the home page (game)
 *   voice:<gameId>  a voice clip read in a family game (voice; `prompt` holds the line)
 *   scene:<gameId>  a picture drawn for a family game (its cover, answers and question pictures)
 *   person:<id>     a photo of the child (be) or a relative (p1–p3), kept for the next "game with my child"
 */
export type AssetKind = 'image' | 'video' | 'audio' | 'game'
export interface StudioAsset { id: string; title: string; prompt: string; kind: AssetKind; source: 'google' | 'upload' | 'ai34' | 'gemini'; created: number; blob: Blob; target?: string; jobId?: string }
export interface DisplayAsset extends StudioAsset { url: string }

const MAX_ITEMS = 400
const MAX_BYTES = 500 * 1024 * 1024

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('be-vui-hoc-studio', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('assets', { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error('Thiết bị không cho phép lưu ảnh. Hãy bật lưu trữ cho trang web.'))
  })
}
async function readAssets(): Promise<StudioAsset[]> {
  const db = await database()
  return new Promise((resolve, reject) => { const tx = db.transaction('assets'); const req = tx.objectStore('assets').getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); tx.oncomplete = () => db.close() })
}
async function mutate(fn: (store: IDBObjectStore) => void) {
  const db = await database()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('assets', 'readwrite')
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = tx.onabort = () => { db.close(); reject(new Error('Không lưu được. Bộ nhớ có thể đã đầy. Hãy tải kết quả xuống thiết bị.')) }
    fn(tx.objectStore('assets'))
  })
}

/** Which kinds may be used at a target. */
export function fits(kind: AssetKind, target: string) {
  if (target === 'banner') return kind === 'image' || kind === 'video'
  if (target.startsWith('game:') || target.startsWith('scene:')) return kind === 'image'
  if (target === 'hello' || target.startsWith('voice:')) return kind === 'audio'
  if (target === 'home') return kind === 'game'
  return false
}
/** Targets that hold one item at a time (a new one replaces the old one). */
const single = (target: string) => target === 'banner' || target === 'hello' || target.startsWith('game:')

interface MediaState {
  assets: DisplayAsset[]; error: string; loading: boolean
  add: (asset: StudioAsset) => Promise<void>; remove: (id: string) => Promise<void>
  assign: (id: string, target: string) => Promise<void>; unassign: (id: string) => Promise<void>
}
const MediaContext = createContext<MediaState>({ assets: [], error: '', loading: false, add: async () => {}, remove: async () => {}, assign: async () => {}, unassign: async () => {} })

export function MediaProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<DisplayAsset[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('')
  // Object URLs are kept for items that stay (a game being played keeps its pictures while new items are saved).
  const urls = useRef(new Map<string, string>())
  const show = (rows: StudioAsset[]) => {
    const next = new Map<string, string>()
    const list = rows.sort((a, b) => b.created - a.created).map(a => { const url = urls.current.get(a.id) ?? URL.createObjectURL(a.blob); next.set(a.id, url); return { ...a, url } })
    for (const [id, url] of urls.current) if (!next.has(id)) URL.revokeObjectURL(url)
    urls.current = next
    return list
  }
  async function refresh() { const rows = await readAssets(); setAssets(show(rows)) }
  useEffect(() => {
    let active = true
    readAssets().then(rows => { if (active) setAssets(show(rows)) }).catch(e => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current = new Map() }
  }, [])
  const value: MediaState = {
    assets, error, loading,
    add: async asset => {
      if (assets.length >= MAX_ITEMS || assets.reduce((s, a) => s + a.blob.size, 0) + asset.blob.size > MAX_BYTES) throw new Error('Thư viện đã đầy (400 nội dung hoặc 500 MB). Hãy xóa bớt trò chơi hoặc ảnh cũ.')
      await mutate(s => s.put(asset)); await refresh()
    },
    remove: async id => {
      // Removing a game also removes the voice clips and pictures made for it.
      await mutate(s => { const req = s.getAll(); req.onsuccess = () => { for (const a of req.result as StudioAsset[]) if (a.id === id || a.target === `voice:${id}` || a.target === `scene:${id}`) s.delete(a.id) } })
      await refresh()
    },
    assign: async (id, target) => {
      await mutate(s => {
        const req = s.getAll()
        req.onsuccess = () => {
          const rows = req.result as StudioAsset[], chosen = rows.find(a => a.id === id)
          if (!chosen || !fits(chosen.kind, target)) return
          if (single(target)) rows.filter(a => a.target === target && a.id !== id).forEach(a => s.put({ ...a, target: undefined }))
          s.put({ ...chosen, target })
        }
      })
      await refresh()
    },
    unassign: async id => { await mutate(s => { const req = s.get(id); req.onsuccess = () => { if (req.result) s.put({ ...req.result, target: undefined }) } }); await refresh() },
  }
  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}
export const useStudioMedia = () => useContext(MediaContext)
export function useAssigned(target: string) { return useStudioMedia().assets.find(a => a.target === target) }
export function useAssignedImage(target: string) { return useStudioMedia().assets.find(a => a.kind === 'image' && a.target === target)?.url }

/** Decode and re-encode locally to bound dimensions and remove EXIF/location metadata. */
export async function preparePhoto(file: File): Promise<{ mimeType: string; data: string; url: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP dưới 12 MB. Ảnh HEIC cần đổi sang JPG trước.')
  const url = URL.createObjectURL(file)
  try {
    const img = new Image(); img.src = url; await img.decode()
    if (img.naturalWidth * img.naturalHeight > 60000000) throw new Error('Ảnh quá lớn. Hãy chọn bản nhỏ hơn.')
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const context = canvas.getContext('2d'); if (!context) throw new Error('Không xử lý được ảnh trên thiết bị này.')
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', .88)
    return { mimeType: 'image/jpeg', data: dataUrl.split(',')[1], url: dataUrl }
  } finally { URL.revokeObjectURL(url) }
}
export function imageBlob(data: string, mimeType: string) { const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0)); return new Blob([bytes], { type: mimeType }) }
