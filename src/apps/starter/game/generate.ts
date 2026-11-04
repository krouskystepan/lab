import {
  START_DURABILITY,
  WIRE_COLORS,
  type BoardState,
  type Wire,
  type WireColor,
  type WireRole
} from './types'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function range(rand: () => number, lo: number, hi: number): number {
  return Math.round((lo + rand() * (hi - lo)) * 100) / 100
}

function makeWire(
  color: WireColor,
  role: WireRole,
  volts: number | null,
  ohms: number | null
): Wire {
  return { id: color, color, role, volts, ohms }
}

/**
 * 7 wires:
 * - 4 under voltage (one is battery ~12 V, others any V)
 * - 3 with resistance (starter 0.5–1 Ω, ignition 2.5–3 Ω, one any Ω)
 */
export function generate(seed = Date.now()): BoardState {
  const rand = mulberry32(seed >>> 0)
  const colors = shuffle(WIRE_COLORS, rand)
  const voltCs = colors.slice(0, 4)
  const ohmCs = colors.slice(4)

  const [batC, ...voltDecoys] = voltCs
  const [strC, ignC, ohmDecoyC] = ohmCs

  const wires: Wire[] = [
    makeWire(batC, 'battery', range(rand, 11.7, 12.6), null),
    makeWire(strC, 'starter', null, range(rand, 0.5, 1.0)),
    makeWire(ignC, 'ignition', null, range(rand, 2.5, 3.0)),
    makeWire(ohmDecoyC, 'decoy', null, range(rand, 4, 120))
  ]

  for (const c of voltDecoys) {
    // Any voltage except near the battery reading
    const pick = rand()
    const volts =
      pick < 0.34
        ? range(rand, 0.4, 4.5)
        : pick < 0.67
          ? range(rand, 5, 9.5)
          : range(rand, 13.5, 18)
    wires.push(makeWire(c, 'decoy', volts, null))
  }

  return {
    wires: shuffle(wires, rand),
    status: 'playing',
    meterMode: 'V',
    tool: 'probe',
    durability: START_DURABILITY,
    probingId: null,
    jumperA: null,
    jumperB: null,
    holdingStarter: false,
    holdMs: 0,
    dashOn: false,
    rpm: 0,
    hint: null,
    seed: seed >>> 0
  }
}

export function wireById(state: BoardState, id: string | null): Wire | undefined {
  if (!id) return undefined
  return state.wires.find((w) => w.id === id)
}

export function roleOf(state: BoardState, id: string | null): WireRole | null {
  return wireById(state, id)?.role ?? null
}
