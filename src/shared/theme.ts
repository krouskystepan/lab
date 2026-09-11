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

/** Warm amber - Sudoku playable board. */
export const sudokuTheme: AppTheme = {
  accent: '#c47a3a',
  accentHover: '#d48c4e',
  onAccent: '#fff0e0',
  glow: '#c47a3a'
}

/** Wordle green. */
export const wordleTheme: AppTheme = {
  accent: '#4cbe6a',
  accentHover: '#5ed07c',
  onAccent: '#f4fff6',
  glow: '#4cbe6a'
}

/** Chess Mate - cool slate. */
export const chessMateTheme: AppTheme = {
  accent: '#4a5568',
  accentHover: '#5a6678',
  onAccent: '#e8ecf2',
  glow: '#6b7c90'
}

/** Rush Hour - traffic red. */
export const rushHourTheme: AppTheme = {
  accent: '#e24a4a',
  accentHover: '#ed6060',
  onAccent: '#ffe8e8',
  glow: '#e24a4a'
}

/** Lights Out - warm bulb. */
export const lightsOutTheme: AppTheme = {
  accent: '#e8c84a',
  accentHover: '#f0d45e',
  onAccent: '#fff6dc',
  glow: '#e8c84a'
}

/** Geo Quiz - atlas teal. */
export const geoQuizTheme: AppTheme = {
  accent: '#2e6b8a',
  accentHover: '#3f7c9b',
  onAccent: '#e3f1f8',
  glow: '#2e6b8a'
}

/** Mental Math - cool slate teal. */
export const mentalMathTheme: AppTheme = {
  accent: '#3d7a9a',
  accentHover: '#4e8bab',
  onAccent: '#e5f2f8',
  glow: '#3d7a9a'
}

/** Mirror Helper - cool cyan-steel (distinct from mine green / geo teal). */
export const mirrorHelperTheme: AppTheme = {
  accent: '#3a8a9a',
  accentHover: '#4b9bab',
  onAccent: '#e2f4f7',
  glow: '#3a8a9a'
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
