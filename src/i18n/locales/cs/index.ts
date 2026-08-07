import type { en } from '../en'
import { commonCs } from './common'
import { hubCs } from './hub'
import { mineHelperCs } from './mine-helper'
import { minesweeperCs } from './minesweeper'

/** Czech - must cover every English key. */
export const cs: Record<keyof typeof en, string> = {
  ...commonCs,
  ...hubCs,
  ...mineHelperCs,
  ...minesweeperCs
}
