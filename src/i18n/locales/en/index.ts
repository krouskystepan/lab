import { commonEn } from './common'
import { hubEn } from './hub'
import { mineHelperEn } from './mine-helper'
import { minesweeperEn } from './minesweeper'
import { sudokuEn } from './sudoku'
import { sudokuHelperEn } from './sudoku-helper'
import { wordleEn } from './wordle'
import { chessMateEn } from './chess-mate'

/** Merged English catalog (source of truth for message keys). */
export const en = {
  ...commonEn,
  ...hubEn,
  ...mineHelperEn,
  ...minesweeperEn,
  ...sudokuEn,
  ...sudokuHelperEn,
  ...wordleEn,
  ...chessMateEn
}
