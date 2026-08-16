import type { Cell as MineGameCell, BoardState as MineGameBoard } from '../../apps/minesweeper/game/types'
import type { UserCell } from '../../apps/mine-helper/solver/types'
import {
  BOARD_FORMAT,
  BOARD_VERSION,
  type MineTransferCell,
  type MinesweeperBoardFile
} from './types'

export function mineGameCellToTransfer(cell: MineGameCell): MineTransferCell {
  if (cell.view === 'flagged') return { type: 'flagged' }
  if (cell.view === 'hidden') return { type: 'empty' }
  if (cell.adjacent === 0) return { type: 'blank' }
  return { type: 'number', value: cell.adjacent }
}

export function mineHelperUserToTransfer(user: UserCell): MineTransferCell {
  if (user.type === 'empty') return { type: 'empty' }
  if (user.type === 'flagged') return { type: 'flagged' }
  if (user.type === 'blank') return { type: 'blank' }
  // Known target without count → treat as flagged for transfer
  if (user.value == null) return { type: 'flagged' }
  if (user.value === 0) return { type: 'blank' }
  return { type: 'number', value: user.value }
}

export function transferToMineHelperUser(cell: MineTransferCell): UserCell {
  if (cell.type === 'empty') return { type: 'empty' }
  if (cell.type === 'flagged') return { type: 'flagged' }
  if (cell.type === 'blank') return { type: 'blank' }
  return { type: 'number', value: cell.value, role: 'info' }
}

export function exportMinesweeperGame(
  board: MineGameBoard,
  seconds?: number
): MinesweeperBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'minesweeper',
    width: board.width,
    height: board.height,
    totalTargets: board.mines,
    cells: board.cells.map(mineGameCellToTransfer),
    game: {
      isMine: board.cells.map((c) => c.isMine),
      status: board.status,
      generated: board.generated,
      hitIndex: board.hitIndex,
      diffId: board.diffId,
      seconds
    }
  }
}

export function exportMineHelperBoard(input: {
  width: number
  height: number
  cells: UserCell[]
  totalTargets?: number
}): MinesweeperBoardFile {
  return {
    format: BOARD_FORMAT,
    version: BOARD_VERSION,
    family: 'minesweeper',
    width: input.width,
    height: input.height,
    totalTargets: input.totalTargets,
    cells: input.cells.map(mineHelperUserToTransfer)
  }
}

export function importMinesweeperToHelper(
  file: MinesweeperBoardFile
): {
  width: number
  height: number
  totalTargets?: number
  users: UserCell[]
} {
  const n = file.width * file.height
  if (
    !Number.isInteger(file.width) ||
    !Number.isInteger(file.height) ||
    file.width < 2 ||
    file.height < 2 ||
    file.width > 50 ||
    file.height > 50 ||
    file.cells.length !== n
  ) {
    throw new Error('invalid_board')
  }
  return {
    width: file.width,
    height: file.height,
    totalTargets: file.totalTargets,
    users: file.cells.map(transferToMineHelperUser)
  }
}

/** Rebuild a playable minesweeper board from a transfer file. */
export function importMinesweeperToGame(
  file: MinesweeperBoardFile,
  fallbackDiffId: MineGameBoard['diffId'] = 'beginner'
): { board: MineGameBoard; seconds: number } {
  const n = file.width * file.height
  if (
    !Number.isInteger(file.width) ||
    !Number.isInteger(file.height) ||
    file.width < 5 ||
    file.height < 5 ||
    file.width > 50 ||
    file.height > 50 ||
    file.cells.length !== n
  ) {
    throw new Error('invalid_board')
  }

  const seconds = file.game?.seconds ?? 0
  const mines =
    file.totalTargets ??
    file.cells.filter((c) => c.type === 'flagged').length

  if (file.game && file.game.isMine.length === n) {
    const cells: MineGameCell[] = file.cells.map((vis, i) => {
      const isMine = file.game!.isMine[i]
      if (vis.type === 'flagged') {
        return { view: 'flagged', isMine, adjacent: 0 }
      }
      if (vis.type === 'empty') {
        return { view: 'hidden', isMine, adjacent: 0 }
      }
      if (vis.type === 'blank') {
        return { view: 'revealed', isMine: false, adjacent: 0 }
      }
      return {
        view: 'revealed',
        isMine: false,
        adjacent: Math.max(0, Math.min(8, vis.value))
      }
    })
    // Recompute adjacent for consistency when generated
    const adjacent = computeAdjacent(
      file.game.isMine,
      file.width,
      file.height
    )
    for (let i = 0; i < n; i++) {
      if (cells[i].view === 'revealed') {
        cells[i] = { ...cells[i], adjacent: adjacent[i], isMine: false }
      } else {
        cells[i] = { ...cells[i], adjacent: adjacent[i] }
      }
    }
    let revealedSafe = 0
    let flagCount = 0
    for (const c of cells) {
      if (c.view === 'revealed' && !c.isMine) revealedSafe++
      if (c.view === 'flagged') flagCount++
    }
    return {
      board: {
        width: file.width,
        height: file.height,
        mines: Math.max(1, mines),
        diffId: file.game.diffId ?? fallbackDiffId,
        cells,
        status: file.game.status,
        generated: file.game.generated,
        hitIndex: file.game.hitIndex,
        revealedSafe,
        flagCount
      },
      seconds
    }
  }

  // Visible-only (from helper): flags as mines, numbers as revealed clues
  const isMine = file.cells.map((c) => c.type === 'flagged')
  const adjacent = computeAdjacent(isMine, file.width, file.height)
  const cells: MineGameCell[] = file.cells.map((vis, i) => {
    if (vis.type === 'flagged') {
      return { view: 'flagged', isMine: true, adjacent: adjacent[i] }
    }
    if (vis.type === 'empty') {
      return { view: 'hidden', isMine: false, adjacent: adjacent[i] }
    }
    if (vis.type === 'blank') {
      return { view: 'revealed', isMine: false, adjacent: 0 }
    }
    return {
      view: 'revealed',
      isMine: false,
      adjacent: Math.max(0, Math.min(8, vis.value))
    }
  })
  let revealedSafe = 0
  let flagCount = 0
  for (const c of cells) {
    if (c.view === 'revealed') revealedSafe++
    if (c.view === 'flagged') flagCount++
  }
  const mineCount = Math.max(
    1,
    file.totalTargets ?? (isMine.filter(Boolean).length || 1)
  )
  return {
    board: {
      width: file.width,
      height: file.height,
      mines: mineCount,
      diffId: fallbackDiffId,
      cells,
      status: revealedSafe > 0 ? 'playing' : 'ready',
      generated: true,
      hitIndex: null,
      revealedSafe,
      flagCount
    },
    seconds: 0
  }
}

function computeAdjacent(
  isMine: boolean[],
  width: number,
  height: number
): number[] {
  const out = new Array<number>(width * height).fill(0)
  for (let i = 0; i < out.length; i++) {
    if (isMine[i]) continue
    const r = Math.floor(i / width)
    const c = i % width
    let n = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const rr = r + dr
        const cc = c + dc
        if (rr < 0 || cc < 0 || rr >= height || cc >= width) continue
        if (isMine[rr * width + cc]) n++
      }
    }
    out[i] = n
  }
  return out
}
