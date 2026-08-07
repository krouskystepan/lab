import type { EditMode, GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

interface NumberPadProps {
  mode: EditMode
  /** Selected digit, or null for mine/my-card without a known count (?) */
  numberValue: number | null
  onNumberValueChange: (n: number | null) => void
  onModeChange: (mode: EditMode) => void
  goalMode?: GoalMode
}

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-mono font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] max-[720px]:min-h-[2.35rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 0] as const

/** Mine / Info number picker - compact row beside board tools. */
export function NumberPad({
  mode,
  numberValue,
  onNumberValueChange,
  onModeChange,
  goalMode = 'safe'
}: NumberPadProps) {
  const { t } = useI18n()
  const numberModeActive = mode === 'number' || mode === 'info'
  const mineLabel = (n: number) =>
    goalMode === 'hunt'
      ? t('tools.numberNHunt', { n })
      : t('tools.numberNSafe', { n })
  const unknownTitle =
    goalMode === 'hunt'
      ? t('tools.numberUnknownHunt')
      : t('tools.numberUnknownSafe')

  return (
    <section className="flex h-full min-w-0 flex-1 flex-row items-center gap-2 overflow-hidden rounded-md border border-line bg-panel px-2.5 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:w-full max-[720px]:flex-none max-[720px]:px-2 max-[720px]:py-[0.45rem]">
      <h2 className="m-0 shrink-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
        {t('tools.numbers')}
      </h2>
      <div className="flex min-w-0 w-full flex-1 flex-nowrap items-center gap-1">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            className={cn(
              btn,
              'min-w-0 flex-1 basis-0 px-1 py-[0.28rem] text-[0.72rem] max-[720px]:text-[0.9rem]',
              numberValue === n && numberModeActive && btnActive
            )}
            title={
              mode === 'erase'
                ? t('tools.eraseAgain')
                : mode === 'info'
                  ? t('tools.infoN', { n })
                  : mineLabel(n)
            }
            onClick={() => {
              onNumberValueChange(n)
              onModeChange(mode === 'info' ? 'info' : 'number')
            }}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className={cn(
            btn,
            'min-w-0 flex-1 basis-0 px-1 py-[0.28rem] text-[0.72rem] max-[720px]:text-[0.9rem]',
            numberValue == null && mode === 'number' && btnActive
          )}
          title={unknownTitle}
          onClick={() => {
            onNumberValueChange(null)
            onModeChange('number')
          }}
        >
          ?
        </button>
      </div>
    </section>
  )
}
