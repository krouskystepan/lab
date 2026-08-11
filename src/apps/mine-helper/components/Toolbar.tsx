import type { EditMode, GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { HelpTip } from './HelpTip'
import {
  Flag,
  HelpCircle,
  Redo2,
  RotateCcw,
  Shield,
  Sparkles,
  Undo2
} from 'lucide-react'

interface ToolbarProps {
  mode: EditMode
  onModeChange: (mode: EditMode) => void
  useTotal: boolean
  onUseTotalChange: (v: boolean) => void
  totalTargets: number
  onTotalTargetsChange: (n: number) => void
  autoSolve: boolean
  onAutoSolveChange: (v: boolean) => void
  onSolve: () => void
  onClearBoard: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  whyMode: boolean
  onWhyMode: () => void
  goalMode?: GoalMode
}

const btn =
  'cursor-pointer appearance-none rounded-sm border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:text-[0.9rem]'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

export function Toolbar({
  mode,
  onModeChange,
  useTotal,
  onUseTotalChange,
  totalTargets,
  onTotalTargetsChange,
  autoSolve,
  onAutoSolveChange,
  onSolve,
  onClearBoard,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  whyMode,
  onWhyMode,
  goalMode = 'safe'
}: ToolbarProps) {
  const { t } = useI18n()
  const hunt = goalMode === 'hunt'
  const numberTitle = hunt
    ? t('tools.numberTitleHunt')
    : t('tools.numberTitleSafe')
  const numberLabel = hunt ? t('tools.numberHunt') : t('tools.numberSafe')
  const flagTitle =
    mode === 'flag' ? t('tools.flagErase') : t('tools.flagTitle')
  /** Avoid: Safe # + Flag + Safe (blank). Hunt: Moje # + Info # + Vyřazené. */
  const showFlagTool = !hunt
  const showInfoTool = hunt
  const showSafeTool = true
  const safeTitle =
    mode === 'blank'
      ? t('tools.safeErase')
      : hunt
        ? t('tools.safeTitleHunt')
        : t('tools.safeTitle')
  const safeLabel = hunt ? t('tools.safeHunt') : t('tools.safe')

  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-md border border-line bg-panel px-3 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)] max-[720px]:px-2 max-[720px]:py-[0.45rem]">
      <h2 className="m-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
        {t('tools.title')}
      </h2>

      {/* Row 1: mark modes left, solver options right */}
      <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
        <div className="flex shrink-0 flex-nowrap items-center gap-[0.35rem]">
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex items-center gap-1.5',
              mode === 'number' &&
                'border-mine bg-[color-mix(in_srgb,var(--color-mine)_28%,var(--color-cell))] text-[#c8d6ff]'
            )}
            onClick={() => onModeChange(mode === 'number' ? 'erase' : 'number')}
            title={numberTitle}
          >
            <span
              className={cn(
                iconCls,
                'inline-flex items-center justify-center font-mono text-[0.85em] font-bold leading-none'
              )}
              aria-hidden
            >
              #
            </span>
            {numberLabel}
          </button>

          {showInfoTool ? (
            <button
              type="button"
              className={cn(
                btn,
                'inline-flex items-center gap-1.5',
                mode === 'info' &&
                  'border-info bg-[color-mix(in_srgb,var(--color-info)_28%,var(--color-cell))] text-[#bffaf5]'
              )}
              onClick={() => onModeChange(mode === 'info' ? 'erase' : 'info')}
              title={t('tools.infoTitleHunt')}
            >
              <span
                className={cn(
                  iconCls,
                  'inline-flex items-center justify-center font-mono text-[0.85em] font-bold leading-none'
                )}
                aria-hidden
              >
                #
              </span>
              {t('tools.info')}
            </button>
          ) : null}

          {showFlagTool ? (
            <button
              type="button"
              className={cn(
                btn,
                'inline-flex items-center gap-1.5',
                mode === 'flag' &&
                  'border-[color-mix(in_srgb,var(--color-flag)_65%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-flag)_22%,var(--color-cell))] text-flag'
              )}
              onClick={() => onModeChange(mode === 'flag' ? 'erase' : 'flag')}
              title={flagTitle}
            >
              <Flag
                className={iconCls}
                fill="currentColor"
                strokeWidth={1.5}
                aria-hidden
              />
              {t('tools.flag')}
            </button>
          ) : null}

          {showSafeTool ? (
            <button
              type="button"
              className={cn(
                btn,
                'inline-flex items-center gap-1.5',
                mode === 'blank' &&
                  'border-[#6a7585] bg-[color-mix(in_srgb,#4a5360_55%,var(--color-cell))] text-[#c5ced8]'
              )}
              onClick={() => onModeChange(mode === 'blank' ? 'erase' : 'blank')}
              title={safeTitle}
            >
              {hunt ? (
                <span
                  className={cn(
                    iconCls,
                    'inline-flex items-center justify-center text-[1.05em] font-bold leading-none'
                  )}
                  aria-hidden
                >
                  ?
                </span>
              ) : (
                <Shield className={iconCls} aria-hidden />
              )}
              {safeLabel}
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-[0.45rem]">
          <label className="flex cursor-pointer items-center gap-[0.35rem] whitespace-nowrap text-sm font-semibold text-muted max-[720px]:text-[0.9rem]">
            <input
              type="checkbox"
              className="accent-accent"
              checked={useTotal}
              onChange={(e) => onUseTotalChange(e.target.checked)}
            />
            {t('tools.total')}
            <HelpTip title={t('tools.totalTipTitle')}>
              {t('tools.totalTipBody')}
            </HelpTip>
          </label>
          <input
            type="number"
            className="w-[3.4rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70 disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:w-13 max-[720px]:text-[0.95rem]"
            min={0}
            value={totalTargets}
            disabled={!useTotal}
            aria-label={t('tools.totalAria')}
            onChange={(e) =>
              onTotalTargetsChange(Math.max(0, Number(e.target.value) || 0))
            }
          />
          <label className="flex cursor-pointer items-center gap-[0.35rem] whitespace-nowrap text-sm font-semibold text-muted max-[720px]:text-[0.9rem]">
            <input
              type="checkbox"
              className="accent-accent"
              checked={autoSolve}
              onChange={(e) => onAutoSolveChange(e.target.checked)}
            />
            {t('tools.auto')}
            <HelpTip title={t('tools.autoTipTitle')} alignEnd>
              {t('tools.autoTipBody')}
            </HelpTip>
          </label>
        </div>
      </div>

      {/* Row 2: history left, actions right */}
      <div className="flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-[0.35rem]">
          <button
            type="button"
            className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')}
            onClick={onUndo}
            disabled={!canUndo}
            title={t('tools.undoTitle')}
          >
            <Undo2 className={iconCls} aria-hidden />
            {t('tools.undo')}
          </button>
          <button
            type="button"
            className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')}
            onClick={onRedo}
            disabled={!canRedo}
            title={t('tools.redoTitle')}
          >
            <Redo2 className={iconCls} aria-hidden />
            {t('tools.redo')}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-[0.35rem]">
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex shrink-0 items-center gap-1.5 border-accent bg-accent px-[0.9rem] font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
            )}
            onClick={onSolve}
            title={t('tools.solveTitle')}
          >
            <Sparkles className={iconCls} aria-hidden />
            {t('tools.solve')}
          </button>
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex shrink-0 items-center gap-1.5 border-[color-mix(in_srgb,var(--color-best)_55%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-best)_16%,var(--color-cell))] font-bold text-[color-mix(in_srgb,var(--color-best)_80%,var(--color-ink))] hover:bg-[color-mix(in_srgb,var(--color-best)_28%,var(--color-cell))]',
              whyMode &&
                'border-best bg-[color-mix(in_srgb,var(--color-best)_38%,var(--color-cell))] text-white'
            )}
            onClick={onWhyMode}
            title={whyMode ? t('tools.exitWhyTitle') : t('tools.whyTitle')}
          >
            <HelpCircle className={iconCls} aria-hidden />
            {whyMode ? t('tools.exitWhy') : t('tools.why')}
          </button>
          <button
            type="button"
            className={cn(
              btn,
              'inline-flex shrink-0 items-center gap-1.5 border-danger/45 bg-danger/10 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/30'
            )}
            onClick={onClearBoard}
            title={t('tools.resetTitle')}
          >
            <RotateCcw className={iconCls} aria-hidden />
            {t('tools.reset')}
          </button>
        </div>
      </div>
    </section>
  )
}
