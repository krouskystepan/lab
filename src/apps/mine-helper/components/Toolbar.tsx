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
  /** User-placed My cards (hunt) or flags (avoid). Shown even when Total is off. */
  knownFound: number
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
  'game-panel-btn cursor-pointer appearance-none border border-line bg-cell px-2 py-1.5 text-sm font-semibold transition-[background,border-color,color,transform] duration-100 hover:bg-cell-hover active:scale-[0.97] disabled:cursor-default disabled:opacity-40 max-[980px]:min-h-[2.45rem] max-[980px]:justify-center max-[720px]:text-[0.9rem]'

const modeBtn =
  'inline-flex min-w-0 flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 text-center leading-tight sm:flex-row sm:gap-1.5 sm:px-2'

const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'

export function Toolbar({
  mode,
  onModeChange,
  useTotal,
  onUseTotalChange,
  totalTargets,
  onTotalTargetsChange,
  knownFound,
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

  const foundLabel = (
    <span
      className="flex items-center gap-[0.3rem] whitespace-nowrap text-[0.72rem] font-semibold tracking-normal text-muted normal-case"
      title={t(hunt ? 'tools.foundTipHunt' : 'tools.foundTipSafe')}
      aria-label={
        useTotal
          ? t(hunt ? 'tools.foundAriaOfHunt' : 'tools.foundAriaOfSafe', {
              found: knownFound,
              total: totalTargets
            })
          : t(hunt ? 'tools.foundAriaHunt' : 'tools.foundAriaSafe', {
              n: knownFound
            })
      }
    >
      {t(hunt ? 'tools.foundHunt' : 'tools.foundSafe')}
      <span
        className={cn(
          'font-mono text-[0.78rem] font-medium text-ink',
          useTotal &&
            knownFound > totalTargets &&
            'text-[#ffb0b0]'
        )}
      >
        {useTotal ? `${knownFound}/${totalTargets}` : knownFound}
      </span>
    </span>
  )

  return (
    <section className="game-panel flex min-h-0 min-w-0 flex-col gap-2 overflow-visible border border-line bg-panel shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_24px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className="m-0 text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase max-[720px]:hidden [@media(max-height:700px)]:hidden">
          {t('tools.title')}
        </h2>
        <div className="ml-auto">{foundLabel}</div>
      </div>

      {/* Row 1: mark modes + Total/Auto — wraps on narrow panels */}
      <div className="flex flex-col gap-2 min-[640px]:flex-row min-[640px]:flex-wrap min-[640px]:items-center min-[640px]:justify-between">
        <div className="grid w-full grid-cols-3 gap-[0.35rem] min-[640px]:flex min-[640px]:w-auto min-[640px]:flex-wrap">
          <button
            type="button"
            className={cn(
              btn,
              modeBtn,
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
            <span className="max-w-full whitespace-normal break-words">
              {numberLabel}
            </span>
          </button>

          {showInfoTool ? (
            <button
              type="button"
              className={cn(
                btn,
                modeBtn,
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
              <span className="max-w-full whitespace-normal break-words">
                {t('tools.info')}
              </span>
            </button>
          ) : null}

          {showFlagTool ? (
            <button
              type="button"
              className={cn(
                btn,
                modeBtn,
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
              <span className="max-w-full whitespace-normal break-words">
                {t('tools.flag')}
              </span>
            </button>
          ) : null}

          {showSafeTool ? (
            <button
              type="button"
              className={cn(
                btn,
                modeBtn,
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
              <span className="max-w-full whitespace-normal break-words">
                {safeLabel}
              </span>
            </button>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-[0.45rem] gap-y-1.5">
          <label className="flex cursor-pointer items-center gap-[0.35rem] whitespace-nowrap text-sm font-semibold text-muted max-[720px]:text-[0.9rem]">
            <input
              type="checkbox"
              className="accent-accent"
              checked={useTotal}
              onChange={(e) => onUseTotalChange(e.target.checked)}
            />
            {t('tools.total')}
            <HelpTip
              title={t(hunt ? 'tools.totalTipTitleHunt' : 'tools.totalTipTitle')}
            >
              {t(hunt ? 'tools.totalTipBodyHunt' : 'tools.totalTipBody')}
            </HelpTip>
          </label>
          <input
            type="number"
            className="w-[3.4rem] rounded-md border border-line bg-cell px-[0.35rem] py-[0.3rem] font-mono text-[0.82rem] font-medium focus:outline focus:outline-offset-1 focus:outline-accent/70 disabled:opacity-40 max-[720px]:min-h-[2.35rem] max-[720px]:w-13 max-[720px]:text-[0.95rem]"
            min={0}
            value={totalTargets}
            disabled={!useTotal}
            aria-label={t(hunt ? 'tools.totalAriaHunt' : 'tools.totalAria')}
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

      {/* History left · actions right — one row with space between */}
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-[0.35rem]">
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
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-[0.35rem]">
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
