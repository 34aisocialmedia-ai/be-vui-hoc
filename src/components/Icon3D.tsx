import { useState, useMemo, useEffect } from 'react'
import { ArtPicture, hasArt } from '../art/index'

interface Props {
  emoji: string
  alt?: string
  size?: number | string
  className?: string
  style?: React.CSSProperties
}

/** Chuyển emoji thành mã hex chuẩn Fluent 3D */
export function emojiToHex(e: string): string {
  if (!e) return ''
  // Loại bỏ FE0F (variation selector)
  const clean = e.replace(/\uFE0F/g, '')
  const codes: string[] = []
  for (let i = 0; i < clean.length; i++) {
    const cp = clean.codePointAt(i)
    if (cp !== undefined) {
      codes.push(cp.toString(16).toLowerCase())
      if (cp > 0xffff) i++ // Bỏ qua surrogate thứ 2
    }
  }
  return codes.join('-')
}

export function Icon3D({ emoji, alt, size, className = '', style }: Props) {
  const [hasError, setHasError] = useState(false)
  useEffect(() => setHasError(false), [emoji])

  const hex = useMemo(() => emojiToHex(emoji), [emoji])
  const src = useMemo(() => `/assets/3d/${hex}.webp`, [hex])

  const dim = size ? (typeof size === 'number' ? `${size}px` : size) : undefined

  // Anything the app has its own drawing for uses it, so rewards and game pictures share one look.
  if (hasArt(emoji)) return <ArtPicture emoji={emoji} label={alt} size={typeof size === 'number' ? size : 90} className={`icon-3d-render ${className}`} />

  if (!hex || hasError) {
    // Fallback về emoji ký tự nếu chưa có ảnh 3D
    return (
      <span
        className={`icon-emoji-fallback ${className}`}
        style={{ fontSize: dim, lineHeight: 1, display: 'inline-block', ...style }}
        role="img"
        aria-label={alt || emoji}
      >
        {emoji}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt || emoji}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`icon-3d-render ${className}`}
      style={{
        width: dim,
        height: dim,
        objectFit: 'contain',
        verticalAlign: 'middle',
        display: 'inline-block',
        ...style,
      }}
    />
  )
}
