import { placeMines } from './generate'
import {
  clampGrid,
  clampMines,
  minesForDensity,
  presetById
} from './presets'
import { neighborsOf } from './neighbors'
import { revealAllMines, revealFlood } from './reveal'
import type { Action, BoardConfig, BoardState, Cell, DiffId } from './types'

function emptyCells(n: number): Cell[] {
  return Array.from({ length: n }, () => ({
    view: 'hidden' as const,
    isMine: false,
    adjacent: 0
  }))
}

export function createBoard(config: BoardConfig): BoardState {
  const width = clampGrid(config.width)
  const height = clampGrid(config.height)
  const mines = clampMines(config.mines, width, height)
  return {
    width,
    height,
    mines,
    diffId: config.diffId,
    cells: emptyCells(width * height),
    status: 'ready',
    generated: false,
    hitIndex: null,
    revealedSafe: 0,
    flagCount: 0
  }
}

export function createFromDiff(diffId: DiffId): BoardState {
  const p = presetById(diffId)
  return createBoard({
    width: p.width,
    height: p.height,
    mines: p.mines,
    diffId: p.id
  })
}

function safeTotal(state: BoardState): number {
  return state.width * state.height - state.mines
}

function withWinCheck(state: BoardState): BoardState {
  if (state.status !== 'playing' && state.status !== 'ready') return state
  if (state.revealedSafe >= safeTotal(state)) {
    const cells = state.cells.map((c) =>
      c.isMine && c.view === 'hidden' ? { ...c, view: 'flagged' as const } : c
    )
    return {
      ...state,
      cells,
      status: 'won',
      flagCount: state.mines
    }
  }
  return state
}

/** Reveal one cell (and flood if 0). Assumes board already generated. */
function revealOne(state: BoardState, idx: number): BoardState {
  const cell = state.cells[idx]
  if (!cell || cell.view === 'flagged' || cell.view === 'revealed') {
    return state
  }

  const after = revealFlood(state.cells, state.width, state.height, idx)

  if (after.cells[idx]?.isMine && after.cells[idx].view === 'revealed') {
    return {
      ...state,
      cells: revealAllMines(after.cells),
      status: 'lost',
      hitIndex: idx
    }
  }

  return withWinCheck({
    ...state,
    cells: after.cells,
    status: state.status === 'ready' ? 'playing' : state.status,
    revealedSafe: state.revealedSafe + after.revealed
  })
}

export function reduce(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'setDiff': {
      const mines = minesForDensity(state.width, state.height, action.id)
      return createBoard({
        width: state.width,
        height: state.height,
        mines,
        diffId: action.id
      })
    }
    case 'setSize': {
      const width = clampGrid(action.width)
      const height = clampGrid(action.height)
      const mines = minesForDensity(width, height, state.diffId)
      return createBoard({
        width,
        height,
        mines,
        diffId: state.diffId
      })
    }
    case 'setMines': {
      const mines = clampMines(action.mines, state.width, state.height)
      return createBoard({
        width: state.width,
        height: state.height,
        mines,
        diffId: state.diffId
      })
    }
    case 'applyClassic':
      return createFromDiff(action.id)
    case 'newGame':
      return createBoard({
        width: state.width,
        height: state.height,
        mines: state.mines,
        diffId: state.diffId
      })
    case 'restore':
      return {
        ...state,
        cells: action.cells.map((c) => ({ ...c })),
        status: action.status,
        generated: action.generated,
        hitIndex: action.hitIndex,
        revealedSafe: action.revealedSafe,
        flagCount: action.flagCount
      }
    case 'clearFlags': {
      if (state.status === 'won' || state.status === 'lost') return state
      let flags = 0
      const cells = state.cells.map((c) => {
        if (c.view === 'flagged') {
          flags++
          return { ...c, view: 'hidden' as const }
        }
        return c
      })
      if (flags === 0) return state
      return { ...state, cells, flagCount: 0 }
    }
    case 'toggleFlag': {
      if (state.status === 'won' || state.status === 'lost') return state
      const cell = state.cells[action.index]
      if (!cell || cell.view === 'revealed') return state
      const cells = state.cells.slice()
      if (cell.view === 'flagged') {
        cells[action.index] = { ...cell, view: 'hidden' }
        return { ...state, cells, flagCount: state.flagCount - 1 }
      }
      cells[action.index] = { ...cell, view: 'flagged' }
      return { ...state, cells, flagCount: state.flagCount + 1 }
    }
    case 'chord': {
      if (state.status === 'won' || state.status === 'lost') return state
      const cell = state.cells[action.index]
      if (
        !cell ||
        cell.view !== 'revealed' ||
        cell.isMine ||
        cell.adjacent === 0
      ) {
        return state
      }

      const ns = neighborsOf(action.index, state.width, state.height)
      let flags = 0
      const toOpen: number[] = []
      for (const ni of ns) {
        const n = state.cells[ni]
        if (n.view === 'flagged') flags++
        else if (n.view === 'hidden') toOpen.push(ni)
      }
      if (flags !== cell.adjacent || toOpen.length === 0) return state

      let working = state
      for (const idx of toOpen) {
        if (working.status === 'lost' || working.status === 'won') break
        // Skip if already opened by a prior flood in this chord
        if (working.cells[idx].view !== 'hidden') continue
        working = revealOne(working, idx)
      }
      return working
    }
    case 'reveal': {
      if (state.status === 'won' || state.status === 'lost') return state
      const idx = action.index
      const cell = state.cells[idx]
      if (!cell || cell.view === 'flagged' || cell.view === 'revealed') {
        return state
      }

      let working = state
      if (!working.generated) {
        const cells = placeMines(
          working.cells,
          working.width,
          working.height,
          working.mines,
          idx
        )
        working = {
          ...working,
          cells,
          generated: true,
          status: 'playing'
        }
      } else if (working.status === 'ready') {
        working = { ...working, status: 'playing' }
      }

      return revealOne(working, idx)
    }
    default:
      return state
  }
}

export function minesRemaining(state: BoardState): number {
  return Math.max(0, state.mines - state.flagCount)
}
