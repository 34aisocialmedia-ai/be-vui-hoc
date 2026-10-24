import { useEffect, useState } from 'react'
import type { Game } from '../types'
import type { FamilyGame } from './ai34'
import { useStudioMedia, type DisplayAsset } from './media'

/** Turn a game made in the studio into a game the app's player can run (choose the right picture). */
export function toGame(asset: { id: string }, spec: FamilyGame, assets: DisplayAsset[]): Game {
  const photo = (i?: number) => {
    if (i === undefined) return undefined
    const id = spec.photos?.[i]
    return assets.find(a => a.id === id && a.kind === 'image')?.url
  }
  return {
    id: `fam-${asset.id}`,
    title: spec.title,
    icon: spec.icon || '⭐',
    age: spec.age,
    domain: 'nhan_thuc',
    category: 'recognition',
    mt: [],
    engine: 'G01',
    scene: 'room',
    prompt: spec.intro,
    questions: spec.questions.map((q, n) => ({
      id: `fam-${asset.id}-${n}`,
      text: q.text,
      options: q.options.map((o, k) => ({ id: `o${n}-${k}`, label: o.label, emoji: o.emoji ?? '⭐', photo: photo(o.family), correct: o.correct })),
    })),
  }
}

export async function readSpec(asset: { blob: Blob }): Promise<FamilyGame | null> {
  try { return JSON.parse(await asset.blob.text()) as FamilyGame } catch { return null }
}

export interface FamilyEntry { asset: DisplayAsset; spec: FamilyGame; game: Game }

/** All games made in the studio, ready to play. */
export function useFamilyGames(): FamilyEntry[] {
  const { assets } = useStudioMedia()
  const [list, setList] = useState<FamilyEntry[]>([])
  useEffect(() => {
    let active = true
    const games = assets.filter(a => a.kind === 'game')
    Promise.all(games.map(async asset => { const spec = await readSpec(asset); return spec ? { asset, spec, game: toGame(asset, spec, assets) } : null }))
      .then(rows => { if (active) setList(rows.filter((r): r is FamilyEntry => !!r)) })
    return () => { active = false }
  }, [assets])
  return list
}

/** Lines read aloud in a family game (for making its voice clips). */
export const spokenLinesOf = (spec: FamilyGame) => [...new Set([spec.intro, ...spec.questions.map(q => q.text)].map(s => s.trim()).filter(Boolean))]
