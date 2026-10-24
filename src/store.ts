import { useEffect, useState } from 'react'
import type { AgeId } from './types'
import { defaultMotionLevel, type MotionLevel } from './motion/motion'
import type { Journey } from './modes'
import type { CompanionKind } from './motion/Companion'

export interface Settings {
  sound: boolean
  rewards: boolean
  /** Số phút chơi tối đa mỗi lần trước khi nhắc nghỉ; 0 = tắt */
  limit: number
  /** Hiệu ứng chuyển động do phụ huynh chọn; mặc định theo cài đặt giảm chuyển động của máy */
  motion: MotionLevel
}

export interface Save {
  preferredAge: AgeId
  collection: Record<string, number>
  plays: Record<string, number>
  rewardedSessions: string[]
  settings: Settings
  /** Today's three stations on the adventure island. */
  journey?: Journey
  /** The friend the child chose for the friend's house. */
  friend?: CompanionKind
}

const KEY = 'be-vui-hoc-v1'
const DEFAULT: Save = {
  preferredAge: '3-4',
  collection: {},
  plays: {},
  rewardedSessions: [],
  settings: { sound: true, rewards: true, limit: 15, motion: 'full' },
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export function normalizeSave(value: unknown): Save {
  const raw = isRecord(value) ? value : {}
  const settings = isRecord(raw.settings) ? raw.settings : {}
  const counts = (value: unknown): Record<string, number> => Object.fromEntries(
    Object.entries(isRecord(value) ? value : {}).filter(([, n]) =>
      typeof n === 'number' && Number.isSafeInteger(n) && n >= 0),
  ) as Record<string, number>
  const journey = isRecord(raw.journey) ? raw.journey : null
  const ids = (value: unknown) => Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string').slice(0, 6) : []
  return {
    preferredAge: raw.preferredAge === '24-36' || raw.preferredAge === '4-5' || raw.preferredAge === '5-6' ? raw.preferredAge : '3-4',
    collection: counts(raw.collection),
    plays: counts(raw.plays),
    rewardedSessions: Array.isArray(raw.rewardedSessions)
      ? raw.rewardedSessions.filter((id): id is string => typeof id === 'string').slice(-200) : [],
    journey: journey && typeof journey.day === 'string' && ['24-36', '3-4', '4-5', '5-6'].includes(journey.age as string)
      ? { day: journey.day, age: journey.age as AgeId, stations: ids(journey.stations), done: ids(journey.done), round: typeof journey.round === 'number' && journey.round > 0 ? journey.round : 1 }
      : undefined,
    friend: raw.friend === 'rabbit' || raw.friend === 'bear' || raw.friend === 'monkey' || raw.friend === 'turtle' ? raw.friend : undefined,
    settings: {
      sound: typeof settings.sound === 'boolean' ? settings.sound : DEFAULT.settings.sound,
      rewards: typeof settings.rewards === 'boolean' ? settings.rewards : DEFAULT.settings.rewards,
      limit: typeof settings.limit === 'number' && [0, 5, 10, 15, 20].includes(settings.limit)
        ? settings.limit : DEFAULT.settings.limit,
      motion: settings.motion === 'full' || settings.motion === 'light' || settings.motion === 'off'
        ? settings.motion : defaultMotionLevel(),
    },
  }
}

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalizeSave(JSON.parse(raw))
  } catch {
    /* bỏ qua dữ liệu lỗi */
  }
  return normalizeSave(null)
}

export function useSave(): [Save, (fn: (s: Save) => Save) => void] {
  const [save, setSave] = useState<Save>(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(save)) } catch { /* Keep playing if storage is unavailable. */ }
  }, [save])
  return [save, (fn) => setSave((s) => fn(s))]
}

export const REWARDS: { emoji: string; name: string }[] = [
  { emoji: '🪙', name: 'Đồng xu' },
  { emoji: '💎', name: 'Kim cương' },
  { emoji: '🥇', name: 'Huy chương vàng' },
  { emoji: '🧸', name: 'Gấu bông' },
  { emoji: '🐥', name: 'Gà con' },
  { emoji: '🏅', name: 'Huy hiệu' },
  { emoji: '🌻', name: 'Hoa hướng dương' },
  { emoji: '🦄', name: 'Ngựa một sừng' },
  { emoji: '👑', name: 'Vương miện' },
  { emoji: '🎀', name: 'Nơ xinh' },
]
