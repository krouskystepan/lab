import { Eraser, Redo2, RotateCcw, Sparkles, StepForward, Undo2 } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  DigitPad,
  GamePanel,
  ToolRow,
  gameBtnActive,
  gameDigitBtn,
  gameToolBtn
} from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

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
    <GamePanel>
      <DigitPad
        value={digit}
        selectionActive={!eraseMode}
        onSelect={onDigitChange}
        digitTitle={(n) =>
          !eraseMode && digit === n
            ? t('sudokuHelper.pad.digitOff', { n })
            : t('sudokuHelper.pad.digitTitle', { n })
        }
        trailing={
          <button
            type="button"
            className={cn(
              gameDigitBtn,
              'inline-flex items-center justify-center',
              eraseMode && gameBtnActive
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
            <Eraser className="h-[0.95em] w-[0.95em]" strokeWidth={2.25} aria-hidden />
          </button>
        }
      />

      <div className="flex w-full min-w-0 items-center gap-2">
        <HelpTip title={t('sudokuHelper.help.title')}>
          <p className="m-0 mb-1.5">{t('sudokuHelper.help.body')}</p>
          <p className="m-0">{t('sudokuHelper.help.solve')}</p>
        </HelpTip>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-[0.85rem] font-semibold text-ink">
          <input
            type="checkbox"
            className="accent-accent"
            checked={autoSolve}
            onChange={(e) => onAutoSolveChange(e.target.checked)}
          />
          {t('sudokuHelper.tools.auto')}
        </label>
      </div>

      {/* Same 5-column track as DigitPad — equal width, no col-span hacks */}
      <ToolRow mobileCols={5} desktopCols={5}>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onUndo}
          disabled={!canUndo}
          title={t('sudokuHelper.tools.undoTitle')}
        >
          <Undo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudokuHelper.tools.undo')}
          </span>
        </button>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onRedo}
          disabled={!canRedo}
          title={t('sudokuHelper.tools.redoTitle')}
        >
          <Redo2 className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudokuHelper.tools.redo')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            gameToolBtn,
            'border-accent bg-accent font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
          )}
          onClick={onSolve}
          title={t('sudokuHelper.tools.solveTitle')}
        >
          <Sparkles className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudokuHelper.tools.solve')}
          </span>
        </button>
        <button
          type="button"
          className={gameToolBtn}
          onClick={onNext}
          disabled={!canNext}
          title={t('sudokuHelper.tools.nextTitle')}
        >
          <StepForward className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudokuHelper.tools.next')}
          </span>
        </button>
        <button
          type="button"
          className={cn(
            gameToolBtn,
            'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
          )}
          onClick={onClear}
          title={t('sudokuHelper.tools.clearTitle')}
        >
          <RotateCcw className={iconCls} aria-hidden />
          <span className="truncate max-[980px]:hidden">
            {t('sudokuHelper.tools.clear')}
          </span>
        </button>
      </ToolRow>
    </GamePanel>
  )
}
