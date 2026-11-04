import { generate, roleOf, wireById } from './generate'
import {
  DAMAGE_MISTAKE,
  MS_PER_MARK,
  RELEASE_MARK_MAX,
  RELEASE_MARK_MIN,
  SHORT_MARK,
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

function damage(state: BoardState, amount: number, hint: string): BoardState {
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
      jumperA: null,
      jumperB: null,
      dashOn: false,
      hint: 'lost'
    }
  }
  return { ...state, durability, hint }
}

function bridgeRoles(state: BoardState): {
  a: ReturnType<typeof roleOf>
  b: ReturnType<typeof roleOf>
} {
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

function dropClips(state: BoardState, hint: string): BoardState {
  return {
    ...state,
    jumperA: null,
    jumperB: null,
    dashOn: false,
    holdingStarter: false,
    holdMs: 0,
    rpm: 0,
    hint
  }
}

function applyBridge(state: BoardState): BoardState {
  if (!state.jumperA || !state.jumperB) {
    return {
      ...state,
      dashOn: false,
      rpm: 0,
      hint: state.hint === 'dash' ? null : state.hint
    }
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
  const hint = touchesLive ? 'live' : 'wrong'
  let next = damage(state, DAMAGE_MISTAKE, hint)
  if (next.status === 'lost') return next
  return dropClips(next, hint)
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
        rpm: state.dashOn ? 0 : state.rpm
      }
    }

    case 'probe': {
      if (state.tool !== 'probe') return { ...state, probingId: null }
      const id = action.wireId
      // Clear reading
      if (!id) return { ...state, probingId: null }
      // Same wire again — already handled by UI toggle; ignore re-shock
      if (id === state.probingId) return { ...state, probingId: null }

      let next: BoardState = { ...state, probingId: id }
      // Click-measure ohms on a live (voltage) wire burns the kit
      if (state.meterMode === 'OHM') {
        const w = wireById(state, id)
        if (w && w.volts != null) {
          next = damage(next, DAMAGE_MISTAKE, 'ohmLive')
        }
      }
      return next
    }

    case 'jumperClick': {
      if (state.tool !== 'jumper') return state
      const id = action.wireId

      if (state.dashOn && roleOf(state, id) === 'starter') {
        return state
      }

      if (state.jumperA === id && !state.jumperB) {
        return { ...state, jumperA: null, hint: null }
      }

      if (state.jumperA && state.jumperB) {
        return {
          ...state,
          jumperA: id,
          jumperB: null,
          dashOn: false,
          rpm: 0,
          holdingStarter: false,
          holdMs: 0,
          hint: null
        }
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
        holdingStarter: false,
        holdMs: 0,
        rpm: 0,
        hint: null
      }

    case 'holdStart': {
      if (state.tool !== 'jumper') return state
      if (!state.dashOn) {
        if (roleOf(state, action.wireId) === 'starter' && state.jumperA) {
          return applyBridge({ ...state, jumperB: action.wireId })
        }
        return state
      }
      if (roleOf(state, action.wireId) !== 'starter') {
        if (roleOf(state, action.wireId) === 'battery') {
          let next = damage(state, DAMAGE_MISTAKE, 'live')
          if (next.status === 'lost') return next
          return dropClips(next, 'live')
        }
        return { ...state, hint: 'needStarter' }
      }
      return {
        ...state,
        holdingStarter: true,
        holdMs: 0,
        rpm: 0,
        hint: 'holding'
      }
    }

    case 'holdTick': {
      if (!state.holdingStarter || state.status !== 'playing') return state
      const holdMs = state.holdMs + action.dt
      const rpm = holdMs / MS_PER_MARK

      // Needle past the window → short
      if (rpm >= SHORT_MARK) {
        let next = damage(
          { ...state, holdMs, rpm, holdingStarter: false },
          DAMAGE_MISTAKE,
          'overhold'
        )
        if (next.status === 'lost') return next
        return dropClips(next, 'overhold')
      }

      const inWindow = rpm >= RELEASE_MARK_MIN && rpm <= RELEASE_MARK_MAX
      return {
        ...state,
        holdMs,
        rpm,
        hint: inWindow ? 'release' : 'holding'
      }
    }

    case 'holdEnd': {
      if (!state.holdingStarter) return state
      const { rpm } = state

      if (rpm >= RELEASE_MARK_MIN && rpm <= RELEASE_MARK_MAX) {
        return {
          ...state,
          holdingStarter: false,
          rpm: 2.1,
          status: 'won',
          hint: 'won'
        }
      }

      // Released too early (or somehow past window without tick catch)
      if (rpm > RELEASE_MARK_MAX) {
        let next = damage(
          { ...state, holdingStarter: false },
          DAMAGE_MISTAKE,
          'overhold'
        )
        if (next.status === 'lost') return next
        return dropClips(next, 'overhold')
      }

      return {
        ...state,
        holdingStarter: false,
        holdMs: 0,
        rpm: 0,
        hint: 'dash'
      }
    }

    case 'setHint':
      return { ...state, hint: action.hint }

    default:
      return state
  }
}

export function meterReading(state: BoardState): string {
  const wire = wireById(state, state.probingId)
  if (!wire || state.tool !== 'probe') {
    return state.meterMode === 'V' ? '0.00 V DC' : 'OL OHM'
  }
  if (state.meterMode === 'V') {
    if (wire.volts == null) return '0.00 V DC'
    return `${wire.volts.toFixed(2)} V DC`
  }
  // OHM on a live wire still shows OL-ish after the shock
  if (wire.volts != null) return 'OL OHM'
  if (wire.ohms == null) return 'OL OHM'
  return `${wire.ohms.toFixed(2)} OHM`
}

export function createInitial(): BoardState {
  return generate()
}
