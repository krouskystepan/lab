import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { gameDigitBtn, gameBtnActive } from './GamePanel'

const DEFAULT_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type DigitPadProps = {
  digits?: readonly number[]
  value: number | null
  onSelect: (n: number) => void
  /** When false, no digit looks selected (e.g. erase mode). Default true. */
  selectionActive?: boolean
  digitTitle?: (n: number) => string
  digitContent?: (n: number) => ReactNode
  digitClassName?: (n: number) => string | undefined
  /** Extra key after digits (erase, ?, …) - should be a <button> */
  trailing?: ReactNode
  className?: string
  /** Phone column count before wrapping. Default 5 (2-row pad for 10 keys). */
  mobileCols?: 5 | 3
  /** Keep focus on an input (equation pad). */
  keepFocus?: boolean
}

/**
 * Full-width digit strip.
 * Phone: wraps into rows of `mobileCols` with large tap targets.
 * Desktop: one compact equal-width row.
 */
export function DigitPad({
  digits = DEFAULT_DIGITS,
  value,
  onSelect,
  selectionActive = true,
  digitTitle,
  digitContent,
  digitClassName,
  trailing,
  className,
  mobileCols = 5,
  keepFocus = false
}: DigitPadProps) {
  const total = digits.length + (trailing ? 1 : 0)

  return (
    <div
      className={cn(
        'grid w-full min-w-0 gap-1.5',
        mobileCols === 3
          ? 'max-[980px]:grid-cols-3'
          : 'max-[980px]:grid-cols-5',
        total <= 9 ? 'min-[981px]:grid-cols-9' : 'min-[981px]:grid-cols-10',
        className
      )}
    >
      {digits.map((n) => {
        const active = selectionActive && value === n
        return (
          <button
            key={n}
            type="button"
            className={cn(
              gameDigitBtn,
              active && gameBtnActive,
              digitClassName?.(n)
            )}
            title={digitTitle?.(n)}
            aria-pressed={active}
            onMouseDown={keepFocus ? (e) => e.preventDefault() : undefined}
            onClick={() => onSelect(n)}
          >
            {digitContent ? digitContent(n) : n}
          </button>
        )
      })}
      {trailing}
    </div>
  )
}

export { gameDigitBtn, gameBtnActive }
