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
  /** Voltage reading when dial is on V (null = open / 0). */
  volts: number | null
  /** Resistance reading when dial is on OHM (null = OL). */
  ohms: number | null
}

export type BoardState = {
  wires: Wire[]
  status: GameStatus
  meterMode: MeterMode
  tool: ToolId
  durability: number
  /** Wire currently under the probe tip (hover / press). */
  probingId: string | null
  /** First jumper clip attached. */
  jumperA: string | null
  /** Second jumper clip attached (bridge complete). */
  jumperB: string | null
  /** Holding the free end on starter after battery↔ignition bridge. */
  holdingStarter: boolean
  holdMs: number
  /** Dashboard ignition powered (battery bridged to ignition). */
  dashOn: boolean
  rpm: number
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

export const HOLD_MS_NEEDED = 1400
export const DAMAGE_LIVE = 12
export const DAMAGE_WRONG_JUMP = 8
export const START_DURABILITY = 100

export function isWireColor(v: unknown): v is WireColor {
  return typeof v === 'string' && (WIRE_COLORS as string[]).includes(v)
}

export function isMeterMode(v: unknown): v is MeterMode {
  return v === 'V' || v === 'OHM'
}

export function isToolId(v: unknown): v is ToolId {
  return v === 'probe' || v === 'jumper'
}
