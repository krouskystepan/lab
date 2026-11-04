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

function jitter(rand: () => number, base: number, spread: number): number {
  return Math.round((base + (rand() * 2 - 1) * spread) * 100) / 100
}

function makeWire(
  color: WireColor,
  role: WireRole,
  volts: number | null,
  ohms: number | null
): Wire {
  return {
    id: color,
    color,
    role,
    volts,
    ohms
  }
}

/** Build a fresh loom: battery ~12 V, ignition ~3 Ω, starter <1 Ω, rest decoys. */
export function generate(seed = Date.now()): BoardState {
  const rand = mulberry32(seed >>> 0)
  const colors = shuffle(WIRE_COLORS, rand)
  const [batC, ignC, strC, ...decoyCs] = colors

  const wires: Wire[] = [
    makeWire(batC, 'battery', jitter(rand, 12.2, 0.35), null),
    makeWire(ignC, 'ignition', null, jitter(rand, 3.05, 0.25)),
    makeWire(strC, 'starter', null, jitter(rand, 0.55, 0.25))
  ]

  for (const c of decoyCs) {
    const kind = Math.floor(rand() * 4)
    if (kind === 0) {
      // faint voltage decoy (not ~12)
      wires.push(makeWire(c, 'decoy', jitter(rand, 1.4, 0.9), null))
    } else if (kind === 1) {
      // random mid resistance
      wires.push(makeWire(c, 'decoy', null, jitter(rand, 12, 6)))
    } else if (kind === 2) {
      // high resistance
      wires.push(makeWire(c, 'decoy', null, jitter(rand, 80, 40)))
    } else {
      // dead / open
      wires.push(makeWire(c, 'decoy', null, null))
    }
  }

  return {
    // Shuffle left→right loom order every round (roles already on random colors)
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
