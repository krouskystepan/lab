import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cellRef } from '../solver/neighbors'
import type { CellExplanation } from '../solver/explain'
import type { GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

interface WhyPanelProps {
  explanation: CellExplanation | null
  /** True when a cell is selected but has no explanation yet / available. */
  hasSelection?: boolean
  width: number
  /** Step index, or -1 for “mark all”. */
  activeStep: number
  onStepChange: (step: number) => void
  goalMode?: GoalMode
}

const panelShell =
  'why-panel flex min-h-0 flex-col gap-2 overflow-hidden rounded-sm border border-line bg-panel px-[0.7rem] py-2.5'

const navBtn =
  'cursor-pointer appearance-none inline-flex items-center gap-1 rounded-sm border border-line bg-cell px-[0.55rem] py-[0.3rem] text-[0.75rem] font-semibold text-ink disabled:cursor-default disabled:opacity-40'

export function WhyPanel({
  explanation,
  hasSelection = false,
  width,
  activeStep,
  onStepChange,
  goalMode = 'safe'
}: WhyPanelProps) {
  const { t } = useI18n()
  const tipLabel = goalMode === 'hunt' ? t('why.surestTarget') : t('why.safest')

  if (!explanation) {
    return (
      <aside className={panelShell} aria-label={t('why.aria')}>
        <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.02em]">
          {t('why.title')}
        </h2>
        <p className="m-0 text-[0.8rem] font-medium leading-[1.4] text-muted">
          {hasSelection ? t('why.noExplain') : t('why.clickCell')}
        </p>
        <p className="m-0 mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.68rem] leading-[1.35] text-muted">
          <span className="inline-flex items-center gap-1">
            <i
              className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_#fff]"
              aria-hidden
            />
            {t('why.selected')}
          </span>
          <span className="inline-flex items-center gap-1">
            <i
              className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_var(--color-why-clue)]"
              aria-hidden
            />
            {t('why.clue')}
          </span>
          <span className="inline-flex items-center gap-1">
            <i
              className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_var(--color-why-peer)]"
              aria-hidden
            />
            {t('why.linked')}
          </span>
        </p>
      </aside>
    )
  }

  const steps = explanation.steps
  const showAll = activeStep < 0
  const clamped = showAll
    ? -1
    : Math.min(activeStep, Math.max(0, steps.length - 1))

  const focusRef = cellRef(explanation.cellIndex, width)

  const stepBtn = (active: boolean) =>
    cn(
      'flex w-full cursor-pointer appearance-none items-start gap-1.5 rounded-sm border border-transparent bg-transparent px-1.5 py-[0.35rem] text-left text-[0.75rem] font-medium leading-[1.35] text-muted hover:bg-cell hover:text-ink',
      active && 'border-accent/45 bg-accent/15 text-ink'
    )

  const stepNum = (active: boolean) =>
    cn(
      'inline-flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-full bg-cell font-mono text-[0.65rem] font-bold text-muted',
      active && 'bg-accent text-white'
    )

  return (
    <aside className={panelShell} aria-label={t('why.aria')}>
      <div className="flex shrink-0 items-start gap-[0.35rem]">
        <h2 className="m-0 flex flex-col gap-[0.15rem] text-[0.95rem] font-bold tracking-[-0.02em]">
          <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span>
              {/^\d+%$/.test(explanation.resultLabel)
                ? t('why.headingCell', { cell: focusRef })
                : t('why.heading', {
                    cell: focusRef,
                    label: explanation.resultLabel
                  })}
            </span>
            {explanation.safest ? (
              <span className="font-extrabold tracking-[0.02em] text-[color-mix(in_srgb,var(--color-safest)_88%,white)]">
                {tipLabel}
              </span>
            ) : explanation.best ? (
              <span className="font-extrabold tracking-[0.02em] text-[color-mix(in_srgb,var(--color-best)_88%,white)]">
                {t('why.best')}
              </span>
            ) : explanation.unclued ? (
              <span className="font-extrabold tracking-[0.02em] text-[color-mix(in_srgb,var(--color-unclued)_88%,white)]">
                {t('why.unclued')}
              </span>
            ) : null}
          </span>
          {explanation.meta ? (
            <span className="font-mono text-[0.72rem] font-semibold text-muted">
              {explanation.meta}
            </span>
          ) : null}
        </h2>
      </div>

      <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-[0.3rem] overflow-y-auto p-0">
        <li>
          <button
            type="button"
            className={stepBtn(showAll)}
            onClick={() => onStepChange(-1)}
          >
            <span className={stepNum(showAll)} aria-hidden>
              ∗
            </span>
            <span>{t('why.markAll')}</span>
          </button>
        </li>
        {steps.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              className={stepBtn(!showAll && i === clamped)}
              onClick={() => onStepChange(i)}
            >
              <span className={stepNum(!showAll && i === clamped)} aria-hidden>
                {i + 1}
              </span>
              <span>{s.text}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="flex shrink-0 items-center justify-between gap-[0.35rem]">
        <button
          type="button"
          className={navBtn}
          disabled={showAll}
          onClick={() => onStepChange(clamped <= 0 ? -1 : clamped - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          {t('why.prev')}
        </button>
        <span className="font-mono text-[0.7rem] text-muted">
          {showAll ? t('why.all') : `${clamped + 1} / ${steps.length}`}
        </span>
        <button
          type="button"
          className={navBtn}
          disabled={!showAll && clamped >= steps.length - 1}
          onClick={() => onStepChange(showAll ? 0 : clamped + 1)}
        >
          {t('why.next')}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <p className="m-0 mt-auto flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.68rem] leading-[1.35] text-muted">
        <span className="inline-flex items-center gap-1">
          <i
            className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_#fff]"
            aria-hidden
          />
          {t('why.selected')}
        </span>
        <span className="inline-flex items-center gap-1">
          <i
            className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_var(--color-why-clue)]"
            aria-hidden
          />
          {t('why.clue')}
        </span>
        <span className="inline-flex items-center gap-1">
          <i
            className="inline-block h-2.5 w-2.5 rounded-xs shadow-[0_0_0_2px_var(--color-why-peer)]"
            aria-hidden
          />
          {t('why.linked')}
        </span>
      </p>
    </aside>
  )
}
