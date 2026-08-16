import { Eraser } from 'lucide-react'
import { Redo2, RotateCcw, Sparkles, StepForward, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell font-mono font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem]'

const btnActive = 'border-accent bg-accent/25 text-on-accent'

const toolBtn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:text-[0.9rem]'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type ControlsBarProps = {
  digit: number | null
  eraseMode: boolean
  onDigitChange: (d: number) => void
  onEraseMode: () => void
  autoSolve: boolean
  onAutoSolveChange: (v: boolean) => void
  canUndo: boolean
  canRedo: boolean
  canNext: boolean
  onUndo: () => void
  onRedo: () => void
  onSolve: () => void
  onNext: () => void
  onClear: () => void
}

/** One control strip: digits + tools (no stacked mismatched cards). */
export function ControlsBar({
  digit,
  eraseMode,
  onDigitChange,
  onEraseMode,
  autoSolve,
  onAutoSolveChange,
  canUndo,
  canRedo,
  canNext,
  onUndo,
  onRedo,
  onSolve,
  onNext,
  onClear
}: ControlsBarProps) {
  const { t } = useI18n()

  return (
    <section className="flex min-w-0 w-full flex-col gap-2 rounded-md border border-line bg-panel px-2.5 py-2 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-[0.45rem]">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1">
          {DIGITS.map((n) => {
            const active = !eraseMode && digit === n
            return (
              <button
                key={n}
                type="button"
                className={cn(
                  btn,
                  'min-w-0 flex-1 basis-0 px-1 py-[0.35rem] text-center text-[0.78rem] max-[720px]:text-[0.9rem]',
                  active && btnActive
                )}
                aria-pressed={active}
                title={
                  active
                    ? t('sudokuHelper.pad.digitOff', { n })
                    : t('sudokuHelper.pad.digitTitle', { n })
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
              'inline-flex min-w-0 flex-[0.9] basis-0 items-center justify-center px-1 py-[0.35rem]',
              eraseMode && btnActive
            )}
            aria-pressed={eraseMode}
            title={
              eraseMode
                ? t('sudokuHelper.pad.eraseOff')
                : t('sudokuHelper.pad.eraseTitle')
            }
            aria-label={t('sudokuHelper.pad.erase')}
            onClick={onEraseMode}
          >
            <Eraser
              className="h-[0.95em] w-[0.95em]"
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
        </div>

        <span
          className="hidden h-7 w-px shrink-0 bg-line sm:block"
          aria-hidden
        />

        <div className="flex shrink-0 flex-wrap items-center gap-[0.35rem]">
          <HelpTip title={t('sudokuHelper.help.title')}>
            <p className="m-0 mb-1.5">{t('sudokuHelper.help.body')}</p>
            <p className="m-0">{t('sudokuHelper.help.solve')}</p>
          </HelpTip>
          <label className="inline-flex cursor-pointer items-center gap-1.5 px-1 text-[0.78rem] font-semibold text-ink">
            <input
              type="checkbox"
              className="accent-accent"
              checked={autoSolve}
              onChange={(e) => onAutoSolveChange(e.target.checked)}
            />
            {t('sudokuHelper.tools.auto')}
          </label>
          <button
            type="button"
            className={cn(toolBtn, 'inline-flex items-center gap-1.5')}
            onClick={onUndo}
            disabled={!canUndo}
            title={t('sudokuHelper.tools.undoTitle')}
          >
            <Undo2 className={iconCls} aria-hidden />
            <span className="max-[560px]:hidden">
              {t('sudokuHelper.tools.undo')}
            </span>
          </button>
          <button
            type="button"
            className={cn(toolBtn, 'inline-flex items-center gap-1.5')}
            onClick={onRedo}
            disabled={!canRedo}
            title={t('sudokuHelper.tools.redoTitle')}
          >
            <Redo2 className={iconCls} aria-hidden />
            <span className="max-[560px]:hidden">
              {t('sudokuHelper.tools.redo')}
            </span>
          </button>
          <button
            type="button"
            className={cn(
              toolBtn,
              'inline-flex items-center gap-1.5 border-accent bg-accent px-3 font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onSolve}
            title={t('sudokuHelper.tools.solveTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            {t('sudokuHelper.tools.solve')}
          </button>
          <button
            type="button"
            className={cn(toolBtn, 'inline-flex items-center gap-1.5')}
            onClick={onNext}
            disabled={!canNext}
            title={t('sudokuHelper.tools.nextTitle')}
          >
            <StepForward className={iconCls} aria-hidden />
            <span className="max-[560px]:hidden">
              {t('sudokuHelper.tools.next')}
            </span>
          </button>
          <button
            type="button"
            className={cn(
              toolBtn,
              'inline-flex items-center gap-1.5 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
            )}
            onClick={onClear}
            title={t('sudokuHelper.tools.clearTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            <span className="max-[560px]:hidden">
              {t('sudokuHelper.tools.clear')}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
