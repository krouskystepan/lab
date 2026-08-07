import type { GoalMode } from '../solver/types'

export type { GoalMode }

const WHY_MODE_KEY = 'helper:whyMode'
const GOAL_MODE_KEY = 'helper:goalMode'

export function loadWhyMode(): boolean {
  try {
    return localStorage.getItem(WHY_MODE_KEY) === '1'
  } catch {
    return false
  }
}

export function saveWhyMode(on: boolean): void {
  try {
    localStorage.setItem(WHY_MODE_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function loadGoalMode(): GoalMode {
  try {
    const v = localStorage.getItem(GOAL_MODE_KEY)
    if (v === 'hunt' || v === 'mines') return 'hunt'
    if (v === 'safe') return v
  } catch {
    /* ignore */
  }
  return 'safe'
}

export function saveGoalMode(mode: GoalMode): void {
  try {
    localStorage.setItem(GOAL_MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}
