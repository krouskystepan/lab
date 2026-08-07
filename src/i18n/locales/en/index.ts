import { commonEn } from './common'
import { hubEn } from './hub'
import { mineHelperEn } from './mine-helper'
import { minesweeperEn } from './minesweeper'

/** Merged English catalog (source of truth for message keys). */
export const en = {
  ...commonEn,
  ...hubEn,
  ...mineHelperEn,
  ...minesweeperEn
}
