export type WireColor =
  | 'red'
  | 'yellow'
  | 'blue'
  | 'black'
  | 'green'
  | 'white'
  | 'brown'

export type WireRole = 'battery' | 'ignition' | 'starter' | 'decoy'

export type MeterMode = 'V' | 'OHM'
export type ToolId = 'probe' | 'jumper'

export type GameStatus = 'playing' | 'won' | 'lost'

export type Wire = {
  id: string
  color: WireColor
  role: WireRole
  /** Voltage when dial is on V (null = 0.00 / no voltage). */
  volts: number | null
  /** Resistance when dial is on OHM (null = OL). */
  ohms: number | null
}

export type BoardState = {
  wires: Wire[]
  status: GameStatus
  meterMode: MeterMode
  tool: ToolId
  durability: number
  probingId: string | null
  jumperA: string | null
  jumperB: string | null
  holdingStarter: boolean
  holdMs: number
  /** Tach needle in “x1000” marks (release around 2). */
  rpm: number
  dashOn: boolean
  hint: string | null
  seed: number
}

export const WIRE_COLORS: WireColor[] = [
  'red',
  'yellow',
  'blue',
  'black',
  'green',
  'white',
  'brown'
]

export const WIRE_HEX: Record<WireColor, string> = {
  red: '#e23a3a',
  yellow: '#e8c84a',
  blue: '#3a7ae2',
  black: '#2a2a2e',
  green: '#3d9a4a',
  white: '#e8e8ec',
  brown: '#8a5a2a'
}

/** ~7 mistakes until the kit dies. */
export const MAX_MISTAKES = 7
export const START_DURABILITY = 100
export const DAMAGE_MISTAKE = Math.ceil(START_DURABILITY / MAX_MISTAKES)

/** ms per tach mark while cranking (mark 2 ≈ 1.6s). */
export const MS_PER_MARK = 800
/** Release when needle is around the 2 mark. */
export const RELEASE_MARK_MIN = 1.75
export const RELEASE_MARK_MAX = 2.35
/** Past this = short circuit. */
export const SHORT_MARK = 2.55

export function isWireColor(v: unknown): v is WireColor {
  return typeof v === 'string' && (WIRE_COLORS as string[]).includes(v)
}

export function isMeterMode(v: unknown): v is MeterMode {
  return v === 'V' || v === 'OHM'
}

export function isToolId(v: unknown): v is ToolId {
  return v === 'probe' || v === 'jumper'
}
