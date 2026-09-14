import type { AxisWhy } from './types'
import type { MessageKey } from '../../../i18n'
import type { Vars } from '../../../i18n/locale'

export function cellRef(index: number, width: number): string {
  const col = index % width
  const row = Math.floor(index / width)
  return `${String.fromCharCode(65 + (col % 26))}${row + 1}`
}

/** i18n key + vars for an impossible-axis reason. */
export function axisWhyMessage(
  why: AxisWhy,
  width: number
): { key: MessageKey; vars?: Vars } {
  if (why.kind === 'conflict') {
    return {
      key: 'mirrorHelper.axes.why.conflict',
      vars: {
        a: cellRef(why.a, width),
        b: cellRef(why.b, width)
      }
    }
  }
  if (why.kind === 'total_low') {
    return {
      key: 'mirrorHelper.axes.why.totalLow',
      vars: { max: why.max, total: why.total }
    }
  }
  return {
    key: 'mirrorHelper.axes.why.totalHigh',
    vars: { min: why.min, total: why.total }
  }
}
