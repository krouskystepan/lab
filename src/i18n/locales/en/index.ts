import { commonEn } from './common'
import { hubEn } from './hub'
import { mineHelperEn } from './mine-helper'
import { minesweeperEn } from './minesweeper'
import { sudokuEn } from './sudoku'
import { sudokuHelperEn } from './sudoku-helper'
import { wordleEn } from './wordle'
import { chessMateEn } from './chess-mate'
import { rushHourEn } from './rush-hour'
import { lightsOutEn } from './lights-out'
import { geoQuizEn } from './geo-quiz'
import { mentalMathEn } from './mental-math'
import { mirrorHelperEn } from './mirror-helper'
import { equationStepsEn } from './equation-steps'

/** Merged English catalog (source of truth for message keys). */
export const en = {
  ...commonEn,
  ...hubEn,
  ...mineHelperEn,
  ...minesweeperEn,
  ...sudokuEn,
  ...sudokuHelperEn,
  ...wordleEn,
  ...chessMateEn,
  ...rushHourEn,
  ...lightsOutEn,
  ...geoQuizEn,
  ...mentalMathEn,
  ...mirrorHelperEn,
  ...equationStepsEn
}
