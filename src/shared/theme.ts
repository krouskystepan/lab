import type { CSSProperties } from 'react'

/** UI accent + page atmosphere glow (hub = white, each app = its color). */
export type AppTheme = {
  accent: string
  accentHover: string
  onAccent: string
  /** Soft page wash; defaults to accent when omitted. */
  glow?: string
}

/** Hub: slate UI chrome, white page glow. */
export const hubTheme: AppTheme = {
  accent: '#7a8fa8',
  accentHover: '#8fa3ba',
  onAccent: '#e8eef5',
  glow: '#ffffff'
}

export const mineHelperTheme: AppTheme = {
  accent: '#3d9a74',
  accentHover: '#4aad84',
  onAccent: '#d8f5e8',
  glow: '#2db46e'
}

/** Same green family as Mine Helper - playable Minesweeper. */
export const minesweeperTheme: AppTheme = {
  accent: '#3d9a74',
  accentHover: '#4aad84',
  onAccent: '#d8f5e8',
  glow: '#2db46e'
}

export function themeGlow(theme: AppTheme): string {
  return theme.glow ?? theme.accent
}

export function themeCssVars(theme: AppTheme): CSSProperties {
  return {
    ['--color-accent' as string]: theme.accent,
    ['--color-accent-hover' as string]: theme.accentHover,
    ['--color-on-accent' as string]: theme.onAccent,
    ['--theme-glow' as string]: themeGlow(theme)
  }
}
