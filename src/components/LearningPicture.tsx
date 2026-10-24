import { useEffect, useState } from 'react'
import { Icon3D } from './Icon3D'
import { ArtPicture, hasArt } from '../art/index'

/** Photos already bundled with the app; explicit photos always take priority. */
export const OBJECT_PHOTOS: Record<string, string> = {
  '🐱': 'cat', '🐈': 'cat', '🐶': 'dog', '🐕': 'dog', '🦆': 'duck_verified', '🐔': 'chicken',
  '🐄': 'cow', '🐮': 'cow', '🐘': 'elephant', '🐇': 'rabbit', '🐰': 'rabbit',
  '🍎': 'apple', '🍌': 'banana', '🍓': 'strawberry', '🍉': 'watermelon',
  // Car and bus photos were dropped: the car is tiny in a wide landscape and the bus is shot at night,
  // so children could not tell what they were in a small tile. The 3D icons read at once.
  '🚑': 'ambulance', '🚒': 'fire_truck_verified',
}
export const SINGLE_OBJECT_IMAGES: Record<string, string> = {
  '🍎': '/assets/objects/apple-single.webp', '🍓': '/assets/objects/strawberry-single.webp',
}
export function photoFor(emoji: string, photo?: string) {
  return photo || SINGLE_OBJECT_IMAGES[emoji] || (OBJECT_PHOTOS[emoji] ? `/assets/photos/${OBJECT_PHOTOS[emoji]}_real.webp` : undefined)
}

const FOOD_FRAMES: Record<string, number> = { '🥩': 0, '🐟': 1, '🥚': 2, '🥛': 3, '🥬': 4, '🥕': 5, '🍊': 6, '🍌': 7 }

export function LearningPicture({ emoji, photo, label = '', size = 90, className = '', food = false, icon = false }: {
  emoji: string; photo?: string; label?: string; size?: number; className?: string; food?: boolean
  /** Always draw the 3D icon, never a photo (games where children must tell small pictures apart at a glance). */
  icon?: boolean
}) {
  // Adult photos cannot teach baby animals or a specific color accurately.
  const needsSpecificPicture = /mẹ|(?:mèo|cún|vịt|bê|gà|heo|thỏ|ngựa|cừu|voi) con|đỏ|xanh/i.test(label)
  const src = icon ? undefined : photo || ((!needsSpecificPicture || SINGLE_OBJECT_IMAGES[emoji]) ? photoFor(emoji) : undefined)
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const group = Array.from(emoji.replace(/\uFE0F/g, ''))
  if (emoji.startsWith('solid:')) return <svg className={`learning-solid ${className}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
    <ellipse cx="50" cy="87" rx="32" ry="7" fill="#304f4522" />
    {emoji === 'solid:sphere' ? <><circle cx="50" cy="48" r="34" fill="#f4ac73" /><path d="M78 28a34 34 0 0 1-53 43a34 34 0 0 0 53-43" fill="#d87e54" /><ellipse cx="37" cy="33" rx="12" ry="8" fill="#ffe4bf" transform="rotate(-25 37 33)" /></>
      : emoji === 'solid:cylinder' ? <><path d="M20 25v49c0 16 60 16 60 0V25" fill="#6eadae" /><path d="M61 27v55c12-2 19-5 19-8V25" fill="#508b94" /><ellipse cx="50" cy="25" rx="30" ry="12" fill="#b1e3d9" /><path d="M28 34v34" stroke="#b2ddd8" strokeWidth="5" strokeLinecap="round" /></>
      : <g transform={emoji === 'solid:cuboid' ? 'translate(0 16) scale(1 .7)' : undefined}><path d="M18 29L50 12L84 29L50 48Z" fill="#b5b3f1" /><path d="M18 29L50 48V85L18 65Z" fill="#8588cf" /><path d="M50 48L84 29V65L50 85Z" fill="#6569ac" /><path d="M24 36L44 48" stroke="#c2bff1" strokeWidth="3" strokeLinecap="round" /></g>}
  </svg>
  if (group.length > 1 && group.every(symbol => symbol === group[0])) return <span className={`picture-group ${className}`} role="img" aria-label={label || `${group.length} hình`}>
    {group.map((symbol, i) => <LearningPicture key={i} emoji={symbol} size={Math.min(46, size)} />)}
  </span>
  if (['●', '■', '▲', '▰', '▬', '⚫', '⬛'].includes(emoji)) return <span className={`learning-shape shape-${({ '●': 0, '⚫': 0, '■': 1, '⬛': 1, '▲': 2, '▰': 3, '▬': 3 })[emoji]} ${className}`} role="img" aria-label={label} style={{ width: size, height: size }}><i /></span>
  if (['🔴', '🟡', '🔵', '🟢'].includes(emoji)) return <span className={`learning-color ${className}`} role="img" aria-label={label} style={{ width: size, height: size, backgroundColor: ({ '🔴': '#ee7770', '🟡': '#ffd56a', '🔵': '#71b5e8', '🟢': '#7bca98' })[emoji] }} />
  if (/^[A-Za-zĂÂÊÔƠƯĐăâêôơưđ?]$/.test(emoji)) return <span className={`learning-letter ${className}`} style={{ fontSize: size * .8 }} role="img" aria-label={label || emoji}>{emoji}</span>
  // The app's own drawings come first: one soft 3D look for every game. Photos stay only where a real place
  // or a drawn scene was chosen on purpose (Hà Nội landmarks, story scenes).
  const keepPhoto = !!photo && /hanoi_|\/assets\/covers\/|^blob:/.test(photo)
  if (!keepPhoto && hasArt(emoji)) return <ArtPicture emoji={emoji} label={label} size={size} className={className} />
  if (!icon && !photo && FOOD_FRAMES[emoji] !== undefined && (food || !['🐟', '🍌'].includes(emoji))) {
    const frame = FOOD_FRAMES[emoji]
    return <span role="img" aria-label={label} className={`learning-food ${className}`} style={{
      width: size, height: size, backgroundImage: 'url(/assets/images/food-realistic-atlas.webp)',
      backgroundSize: '400% 200%', backgroundPosition: `${frame % 4 * 100 / 3}% ${Math.floor(frame / 4) * 100}%`,
      clipPath: frame < 3 ? 'inset(0 0 14% 0)' : undefined,
    }} />
  }
  if (!icon && !src && group.length > 1 && group.every(symbol => OBJECT_PHOTOS[symbol])) {
    return <span className={`picture-group ${className}`} role="img" aria-label={label || `${group.length} hình`}>
      {group.map((symbol, i) => <img key={i} src={photoFor(symbol)} alt="" width={Math.min(46, size)} height={Math.min(46, size)} />)}
    </span>
  }
  const numeral = emoji.replace(/[\uFE0F\u20E3]/g, '')
  if (/^\d{1,2}$/.test(numeral)) return <span className={`picture-number ${className}`} style={{ fontSize: size * .8 }} aria-label={label}>{numeral}</span>
  if (src && !failed) return <img src={src} alt={label} width={size} height={size} loading="lazy"
    className={`learning-photo ${src.includes('/assets/objects/') ? 'single-object' : ''} ${className}`} onError={() => setFailed(true)} />
  return <Icon3D emoji={emoji} alt={label} size={size} className={className} />
}
