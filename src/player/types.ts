import type { ReactNode } from 'react'
import type { Game } from '../types'
import type { Settings } from '../store'
import type { ModeId } from '../modes'
import type { CompanionKind } from '../motion/Companion'

export interface PlayerProps {
  game: Game
  visit?: number
  settings: Settings
  onExit: () => void
  onReplay: () => void
  onReward: (emoji: string, sessionId: string) => void
  /** Stickers already in the album (Save.collection), to choose and show the next one. */
  collection?: Record<string, number>
  /** Words on the button that leaves the victory screen (where it leads: the island, the friend's house…). */
  exitLabel?: string
  onFinish: () => void
  /** Which of the three worlds the game is played in; sets the look of the play and victory screens. */
  mode?: ModeId
  /** The friend who asks the questions (the child's chosen friend in the friend's house). */
  companion?: CompanionKind
  /** What the victory screen says about the place the game came from (station, episode…). */
  finale?: Finale
  onToggleSound?: () => void
  paused?: boolean
}

/** Giao diện/luật dùng chung cho mọi engine */
export interface Api {
  answer: (qid: string, ok: boolean) => Promise<boolean | null>
  sound: boolean
  finished: boolean
  paused: boolean
  /** Size of the play area in CSS pixels (0 before the first measurement). */
  stage: { width: number; height: number }
}

export type SessionProps = PlayerProps & { children: (api: Api) => ReactNode }

/** Victory screen details from the mode the game was opened in. */
export interface Finale {
  /** Big title, e.g. "Trạm 2 xong!" or "Hết tập 4!". */
  title?: string
  line?: string
  /** The island journey after this game: each station done, newly opened, or still locked. */
  map?: ('done' | 'new' | 'locked')[]
  /** What opens next (the next station or episode), shown as a big card that starts it. */
  next?: { kicker: string; title: string; icon: string; onGo: () => void }
  /** Words on the replay button, e.g. "Xem lại tập 4". */
  replayLabel?: string
}
