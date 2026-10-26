import type { CSSProperties } from 'react'
export type UiIconName = 'sound' | 'mute' | 'play' | 'back' | 'next' | 'gift' | 'parent' | 'check' | 'replay' | 'home'
const paths: Record<UiIconName, string> = {
  sound: 'M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
  mute: 'M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6',
  play: 'm9 5 11 7-11 7V5Z', back: 'm15 5-7 7 7 7', next: 'm9 5 7 7-7 7',
  gift: 'M4 11h16v10H4V11Zm-1-5h18v5H3V6Zm9 0v15M12 6C8 6 6 5 6 3s4-2 6 3Zm0 0c4 0 6-1 6-3s-4-2-6 3Z',
  parent: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m2-9a2.5 2.5 0 1 0 0-5m-1 8a5 5 0 0 1 5 6',
  check: 'm5 12 4 4L19 6', replay: 'M4 10a8 8 0 1 1 1 8M4 4v6h6', home: 'm3 11 9-8 9 8M5 9v12h5v-7h4v7h5V9',
}
export function UiIcon({ name, size = 24, style }: { name: UiIconName; size?: number; style?: CSSProperties }) {
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>
}
