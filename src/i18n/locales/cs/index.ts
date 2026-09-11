import type { en } from '../en'
import { commonCs } from './common'
import { hubCs } from './hub'
import { mineHelperCs } from './mine-helper'
import { minesweeperCs } from './minesweeper'
import { sudokuCs } from './sudoku'
import { sudokuHelperCs } from './sudoku-helper'
import { wordleCs } from './wordle'
import { chessMateCs } from './chess-mate'
import { rushHourCs } from './rush-hour'
import { lightsOutCs } from './lights-out'
import { geoQuizCs } from './geo-quiz'
import { mentalMathCs } from './mental-math'
import { mirrorHelperCs } from './mirror-helper'

/** Czech - must cover every English key. */
export const cs: Record<keyof typeof en, string> = {
  ...commonCs,
  ...hubCs,
  ...mineHelperCs,
  ...minesweeperCs,
  ...sudokuCs,
  ...sudokuHelperCs,
  ...wordleCs,
  ...chessMateCs,
  ...rushHourCs,
  ...lightsOutCs,
  ...geoQuizCs,
  ...mentalMathCs,
  ...mirrorHelperCs
}
