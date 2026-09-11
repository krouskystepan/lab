import { Circle, Redo2, RotateCcw, Sparkles, Undo2, X } from 'lucide-react'
import type { EditMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { ctrl, ctrlIcon, ctrlInput } from './ctrl'

interface ToolbarProps {
  mode: EditMode
  onModeChange: (mode: EditMode) => void
  useTotal: boolean
  onUseTotalChange: (v: boolean) => void
  totalMines: number
  onTotalMinesChange: (n: number) => void
  knownMines: number
  autoSolve: boolean
  onAutoSolveChange: (v: boolean) => void
  onSolve: () => void
  onClearBoard: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function Toolbar({
  mode,
  onModeChange,
  useTotal,
  onUseTotalChange,
  totalMines,
  onTotalMinesChange,
  knownMines,
  autoSolve,
  onAutoSolveChange,
  onSolve,
  onClearBoard,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: ToolbarProps) {
  const { t } = useI18n()

  const foundLabel = (
    <span
      className="flex items-center gap-[0.3rem] whitespace-nowrap text-[0.72rem] font-semibold tracking-normal text-muted normal-case"
      title={t('mirrorHelper.tools.foundTip')}
      aria-label={
        useTotal
          ? t('mirrorHelper.tools.foundAriaOf', {
              found: knownMines,
              total: totalMines
            })
          : t('mirrorHelper.tools.foundAria', { n: knownMines })
      }
    >
      {t('mirrorHelper.tools.found')}
      <span
        className={cn(
          'font-mono text-[0.78rem] font-medium text-ink',
          useTotal && knownMines > totalMines && 'text-[#ffb0b0]'
        )}
      >
        {useTotal ? `${knownMines}/${totalMines}` : knownMines}
      </span>
    </span>
  )

  const checkLabel =
    'flex cursor-pointer items-center gap-[0.35rem] whitespace-nowrap text-sm font-semibold text-muted'

  return (
    <GamePanel
      title={t('mirrorHelper.tools.title')}
      headerRight={foundLabel}
      className="min-h-0"
    >
      <div className="flex flex-col gap-2 min-[640px]:flex-row min-[640px]:flex-wrap min-[640px]:items-center min-[640px]:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={cn(
              ctrl,
              mode === 'mine' &&
                'border-mine bg-[color-mix(in_srgb,var(--color-mine)_28%,var(--color-cell))] text-[#c8d6ff]'
            )}
            onClick={() => onModeChange('mine')}
            title={t('mirrorHelper.tools.mineTitle')}
          >
            <Circle className={ctrlIcon} fill="currentColor" strokeWidth={0} />
            {t('mirrorHelper.tools.mine')}
          </button>
          <button
            type="button"
            className={cn(
              ctrl,
              mode === 'not' &&
                'border-[color-mix(in_srgb,var(--color-flag)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,var(--color-cell))] text-flag'
            )}
            onClick={() => onModeChange('not')}
            title={t('mirrorHelper.tools.notTitle')}
          >
            <X className={ctrlIcon} strokeWidth={2.75} />
            {t('mirrorHelper.tools.not')}
          </button>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-[0.45rem] gap-y-1.5">
          <label className={checkLabel} title={t('mirrorHelper.tools.totalTip')}>
            <input
              type="checkbox"
              className="accent-accent"
              checked={useTotal}
              onChange={(e) => onUseTotalChange(e.target.checked)}
            />
            {t('mirrorHelper.tools.total')}
            <HelpTip title={t('mirrorHelper.tools.totalTip')}>
              {t('mirrorHelper.tools.totalTipBody')}
            </HelpTip>
          </label>
          <input
            type="number"
            min={0}
            max={999}
            value={totalMines}
            disabled={!useTotal}
            aria-label={t('mirrorHelper.tools.totalAria')}
            className={ctrlInput}
            onChange={(e) =>
              onTotalMinesChange(
                Math.max(0, Math.floor(Number(e.target.value) || 0))
              )
            }
          />
          <label className={checkLabel} title={t('mirrorHelper.tools.autoTitle')}>
            <input
              type="checkbox"
              className="accent-accent"
              checked={autoSolve}
              onChange={(e) => onAutoSolveChange(e.target.checked)}
            />
            {t('mirrorHelper.tools.auto')}
            <HelpTip title={t('mirrorHelper.tools.autoTitle')} alignEnd>
              {t('mirrorHelper.tools.autoTip')}
            </HelpTip>
          </label>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            className={ctrl}
            onClick={onUndo}
            disabled={!canUndo}
            title={t('mirrorHelper.tools.undoTitle')}
          >
            <Undo2 className={ctrlIcon} aria-hidden />
            {t('mirrorHelper.tools.undo')}
          </button>
          <button
            type="button"
            className={ctrl}
            onClick={onRedo}
            disabled={!canRedo}
            title={t('mirrorHelper.tools.redoTitle')}
          >
            <Redo2 className={ctrlIcon} aria-hidden />
            {t('mirrorHelper.tools.redo')}
          </button>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            className={cn(
              ctrl,
              'border-accent bg-accent px-[0.9rem] font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onSolve}
            title={t('mirrorHelper.tools.solveTitle')}
          >
            <Sparkles className={ctrlIcon} aria-hidden />
            {t('mirrorHelper.tools.solve')}
          </button>
          <button
            type="button"
            className={cn(
              ctrl,
              'border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
            )}
            onClick={onClearBoard}
            title={t('mirrorHelper.tools.clearTitle')}
          >
            <RotateCcw className={ctrlIcon} aria-hidden />
            {t('mirrorHelper.tools.clear')}
          </button>
        </div>
      </div>
    </GamePanel>
  )
}
