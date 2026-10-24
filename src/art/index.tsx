/*
 * All drawn pictures, by emoji. Games keep using emoji in their data; the screen shows the drawing.
 * <ArtPicture/> draws one in an <svg>; the gradients it uses come from <ArtDefs/> mounted once in App.
 */
import { ANIMALS } from './animals'
import { CORE } from './core'
import { FEELINGS } from './feelings'
import { FOOD } from './food'
import { NATURE } from './nature'
import { PEOPLE } from './people'
import { PLACES } from './places'
import { THINGS } from './things'
import { colorFromLabel, type Draw, type Hue } from './kit'

export { ArtDefs } from './kit'

export const ART: Record<string, Draw> = { ...FOOD, ...ANIMALS, ...PLACES, ...THINGS, ...NATURE, ...FEELINGS, ...PEOPLE, ...CORE }

/** Emoji that mean the same picture. */
const ALIASES: Record<string, string> = { '🐈': '🐱', '🐕': '🐶', '🐄': '🐮', '🐖': '🐷', '🐇': '🐰', '🐎': '🐴', '😃': '😀', '😄': '😀', '🙂': '😊', '😭': '😢', '😡': '😠' }

const key = (emoji: string) => { const k = emoji.replace(/️/g, ''); return ALIASES[k] ?? k }
export const hasArt = (emoji: string) => !!ART[key(emoji)]

/** For fruit, plants and animals "xanh" means green (táo xanh, lá xanh); for objects it usually means blue. */
const GREEN_WORLD = new Set([...Object.keys(FOOD), ...Object.keys(NATURE), '🍎', '🍓', '🌸'])
const BABY = /(mèo|cún|chó|vịt|bê|bò|gà|heo|lợn|thỏ|ngựa|cừu|voi|hổ|khỉ|gấu|cá|chim) con/i

export function ArtPicture({ emoji, label = '', size = 90, className = '' }: { emoji: string; label?: string; size?: number; className?: string }) {
  const k = key(emoji)
  const draw = ART[k]
  if (!draw) return null
  let c: Hue | undefined = colorFromLabel(label)
  if (c === 'blue' && /xanh(?! dương| da trời| lam| nước biển)/i.test(label) && GREEN_WORLD.has(k)) c = 'green'
  return <svg className={`art-picture ${className}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label || undefined} aria-hidden={label ? undefined : true} focusable="false">
    {draw({ c, baby: BABY.test(label) })}
  </svg>
}
