import { PRIMARY, type Vehicle } from '../game/types'

const PALETTE: Record<string, string> = {
  A: '#ef5350',
  B: '#e0b84d',
  C: '#5b9cf6',
  D: '#3dba8a',
  E: '#e08945',
  F: '#a78bfa',
  G: '#2dd4c4',
  H: '#f472b6',
  I: '#8ba0b5',
  J: '#b8c95a',
  K: '#818cf8',
  L: '#e57373',
  M: '#4db6ac',
  N: '#d0894a',
  O: '#9575cd',
  P: '#66bb8a',
  Q: '#c48a78',
  R: '#6b8ab8',
  S: '#c4b06a',
  T: '#7ab87a',
  U: '#c47ab0',
  V: '#5aa8a8'
}

export function vehicleColor(id: string): string {
  return PALETTE[id] ?? '#7a8fa8'
}

export function isPrimary(v: Vehicle): boolean {
  return v.id === PRIMARY
}
