import { createContext, useContext } from 'react'

/**
 * How much bigger pictures can be drawn than on a phone, from the play area's size:
 * 1 on phones and short screens, up to 1.7 on large tablets.
 */
export function stageScale(stage: { width: number; height: number }) {
  if (!stage.width || !stage.height) return 1
  return Math.round(Math.max(1, Math.min(1.7, (stage.width - 40) / 480, (stage.height - 40) / 560)) * 100) / 100
}

export const StageScaleContext = createContext(1)
export const useStageScale = () => useContext(StageScaleContext)

/**
 * How much the play area is shrunk to fit a short screen (1 = not at all). Code that moves
 * things with the finger divides by it so a dragged item stays under the finger.
 */
export const FitScaleContext = createContext(1)
export const useFitScale = () => useContext(FitScaleContext)

/** Never shrink below this; past it the play area scrolls instead. */
export const MIN_FIT = .55
