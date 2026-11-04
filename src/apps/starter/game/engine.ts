import { generate, roleOf, wireById } from './generate'
import {
  DAMAGE_LIVE,
  DAMAGE_WRONG_JUMP,
  HOLD_MS_NEEDED,
  type BoardState,
  type MeterMode,
  type ToolId
} from './types'

export type Action =
  | { type: 'newGame'; seed?: number }
  | { type: 'setMeter'; mode: MeterMode }
  | { type: 'setTool'; tool: ToolId }
  | { type: 'probe'; wireId: string | null }
  | { type: 'jumperClick'; wireId: string }
  | { type: 'clearJumper' }
  | { type: 'holdStart'; wireId: string }
  | { type: 'holdTick'; dt: number }
  | { type: 'holdEnd' }
  | { type: 'setHint'; hint: string | null }

function damage(state: BoardState, amount: number): BoardState {
  const durability = Math.max(0, state.durability - amount)
  if (durability <= 0) {
    return {
      ...state,
      durability: 0,
      status: 'lost',
      probingId: null,
      holdingStarter: false,
      holdMs: 0,
      rpm: 0,
      hint: 'lost'
    }
  }
  return { ...state, durability }
}

function bridgeRoles(state: BoardState): { a: string | null; b: string | null } {
  return {
    a: roleOf(state, state.jumperA),
    b: roleOf(state, state.jumperB)
  }
}

function isBatIgnBridge(state: BoardState): boolean {
  const { a, b } = bridgeRoles(state)
  return (
    (a === 'battery' && b === 'ignition') ||
    (a === 'ignition' && b === 'battery')
  )
}

function applyBridge(state: BoardState): BoardState {
  if (!state.jumperA || !state.jumperB) {
    return { ...state, dashOn: false, rpm: 0, hint: state.hint === 'dash' ? null : state.hint }
  }

  if (isBatIgnBridge(state)) {
    return {
      ...state,
      dashOn: true,
      rpm: 0,
      hint: 'dash'
    }
  }

  const roles = bridgeRoles(state)
  const touchesLive = roles.a === 'battery' || roles.b === 'battery'
  let next = { ...state, dashOn: false, rpm: 0 }
  if (touchesLive) {
    next = damage(next, DAMAGE_LIVE)
    if (next.status === 'lost') return next
    next = {
      ...next,
      jumperA: null,
      jumperB: null,
      hint: 'live'
    }
  } else {
    next = damage(next, DAMAGE_WRONG_JUMP)
    if (next.status === 'lost') return next
    next = {
      ...next,
      jumperA: null,
      jumperB: null,
      hint: 'wrong'
    }
  }
  return next
}

export function reduce(state: BoardState, action: Action): BoardState {
  if (action.type === 'newGame') {
    return generate(action.seed ?? Date.now())
  }

  if (state.status !== 'playing') {
    if (action.type === 'setHint') return { ...state, hint: action.hint }
    return state
  }

  switch (action.type) {
    case 'setMeter':
      return {
        ...state,
        meterMode: action.mode,
        probingId: null
      }

    case 'setTool': {
      if (action.tool === state.tool) return state
      return {
        ...state,
        tool: action.tool,
        probingId: null,
        holdingStarter: false,
        holdMs: 0,
        // Keep jumper clips when switching to probe so you can measure mid-job
        jumperA: action.tool === 'probe' ? state.jumperA : state.jumperA,
        jumperB: action.tool === 'probe' ? state.jumperB : state.jumperB
      }
    }

    case 'probe': {
      if (state.tool !== 'probe') return { ...state, probingId: null }
      return { ...state, probingId: action.wireId }
    }

    case 'jumperClick': {
      if (state.tool !== 'jumper') return state
      const id = action.wireId

      // After dash is on, clicking starter starts a hold via holdStart — ignore here
      if (state.dashOn && roleOf(state, id) === 'starter') {
        return state
      }

      // Toggle off if clicking the same first clip with no second yet
      if (state.jumperA === id && !state.jumperB) {
        return { ...state, jumperA: null, hint: null }
      }

      // Reset bridge if already complete
      if (state.jumperA && state.jumperB) {
        const cleared: BoardState = {
          ...state,
          jumperA: id,
          jumperB: null,
          dashOn: false,
          rpm: 0,
          holdingStarter: false,
          holdMs: 0,
          hint: null
        }
        return cleared
      }

      if (!state.jumperA) {
        return { ...state, jumperA: id, hint: 'clipA' }
      }

      if (state.jumperA === id) return state

      return applyBridge({ ...state, jumperB: id })
    }

    case 'clearJumper':
      return {
        ...state,
        jumperA: null,
        jumperB: null,
        dashOn: false,
        rpm: 0,
        holdingStarter: false,
        holdMs: 0,
        hint: null
      }

    case 'holdStart': {
      if (state.tool !== 'jumper') return state
      if (!state.dashOn) {
        // Holding starter before dash: if free clip somehow — treat as wrong live risk
        if (roleOf(state, action.wireId) === 'starter' && state.jumperA) {
          // second clip onto starter without ignition bridge
          return applyBridge({ ...state, jumperB: action.wireId })
        }
        return state
      }
      if (roleOf(state, action.wireId) !== 'starter') {
        // Holding wrong wire after dash — damage if live involved via existing bridge
        if (roleOf(state, action.wireId) === 'battery') {
          return damage({ ...state, hint: 'live' }, DAMAGE_LIVE)
        }
        return { ...state, hint: 'needStarter' }
      }
      return {
        ...state,
        holdingStarter: true,
        holdMs: 0,
        rpm: 1,
        hint: 'holding'
      }
    }

    case 'holdTick': {
      if (!state.holdingStarter || state.status !== 'playing') return state
      const holdMs = state.holdMs + action.dt
      const progress = Math.min(1, holdMs / HOLD_MS_NEEDED)
      const rpm = 1 + progress * 28
      if (holdMs >= HOLD_MS_NEEDED) {
        return {
          ...state,
          holdMs,
          rpm: 35,
          status: 'won',
          holdingStarter: false,
          hint: 'won'
        }
      }
      return { ...state, holdMs, rpm }
    }

    case 'holdEnd': {
      if (!state.holdingStarter) return state
      return {
        ...state,
        holdingStarter: false,
        holdMs: 0,
        rpm: state.dashOn ? 0 : 0,
        hint: state.dashOn ? 'dash' : state.hint
      }
    }

    case 'setHint':
      return { ...state, hint: action.hint }

    default:
      return state
  }
}

/** LCD reading for the multimeter. */
export function meterReading(state: BoardState): string {
  const wire = wireById(state, state.probingId)
  if (!wire || state.tool !== 'probe') {
    return state.meterMode === 'V' ? '0.00 V DC' : 'OL OHM'
  }
  if (state.meterMode === 'V') {
    if (wire.volts == null) return '0.00 V DC'
    return `${wire.volts.toFixed(2)} V DC`
  }
  if (wire.ohms == null) return 'OL OHM'
  return `${wire.ohms.toFixed(2)} OHM`
}

export function createInitial(): BoardState {
  return generate()
}
