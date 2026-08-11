import { Eraser } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-mono font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type NumberPadProps = {
  /** Active digit, or null when none / erase selected. */
  digit: number | null
  eraseMode: boolean
  /** How many times each digit 1–9 still appears empty on the board. */
  remaining: number[]
  onDigitChange: (d: number) => void
  onEraseMode: () => void
}

export function NumberPad({
  digit,
  eraseMode,
  remaining,
  onDigitChange,
  onEraseMode
}: NumberPadProps) {
  const { t } = useI18n()

  return (
    <section className="flex min-w-0 w-full flex-col gap-2 overflow-visible rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-2">
      <h2 className="m-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
        {t('sudoku.pad.title')}
      </h2>
      {/* 9 equal digits + fixed erase slot — same total width in every locale */}
      <div className="grid w-full grid-cols-[repeat(9,minmax(0,1fr))_2.75rem] gap-1.5">
        {DIGITS.map((n) => {
          const left = remaining[n] ?? 0
          const done = left <= 0
          const active = !eraseMode && digit === n
          return (
            <button
              key={n}
              type="button"
              className={cn(
                btn,
                'min-w-0 px-0 py-[0.4rem] text-center text-[0.85rem] max-[720px]:text-[0.95rem]',
                active && btnActive,
                done && 'opacity-40'
              )}
              aria-pressed={active}
              title={
                active
                  ? t('sudoku.pad.digitClearTitle', { n })
                  : t('sudoku.pad.digitTitle', { n, left })
              }
              onClick={() => onDigitChange(n)}
            >
              {n}
            </button>
          )
        })}
        <button
          type="button"
          className={cn(
            btn,
            'inline-flex items-center justify-center px-0 py-[0.4rem]',
            eraseMode && btnActive
          )}
          aria-pressed={eraseMode}
          title={
            eraseMode
              ? t('sudoku.pad.eraseOffTitle')
              : t('sudoku.pad.eraseTitle')
          }
          aria-label={t('sudoku.pad.erase')}
          onClick={onEraseMode}
        >
          <Eraser className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </section>
  )
}
