import { useEffect } from 'react'
import type { MessageKey } from '../../../i18n'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import type { FailReason, SolveResult } from '../solver/types'
import { EqGraph } from './EqGraph'
import { StepDetail } from './StepDetail'
import { whyText } from './why'

const FAIL_KEY: Record<FailReason, MessageKey> = {
  empty: 'equationSteps.result.empty',
  parse: 'equationSteps.result.parse',
  multiVar: 'equationSteps.result.multiVar',
  varInDenom: 'equationSteps.result.varInDenom',
  highDegree: 'equationSteps.result.highDegree',
  badPower: 'equationSteps.result.badPower',
  radical: 'equationSteps.result.radical'
}

export function Stage({
  result,
  viewStep,
  onViewStep
}: {
  result: SolveResult | null
  viewStep: number
  onViewStep: (step: number) => void
}) {
  const { t } = useI18n()
  const i =
    result?.ok === true
      ? Math.min(Math.max(0, viewStep), result.steps.length - 1)
      : 0

  useEffect(() => {
    const el = document.querySelector(`[data-eq-step="${i}"]`)
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' })
  }, [i, result])

  if (!result) {
    return (
      <div
        className="flex w-full max-w-xl flex-col gap-2 px-3 py-6"
        role="status"
        aria-label={t('equationSteps.stageAria')}
      >
        <p className="m-0 text-[0.95rem] font-semibold text-muted">
          {t('equationSteps.result.idle')}
        </p>
      </div>
    )
  }

  if (!result.ok) {
    return (
      <div
        className="flex w-full max-w-xl flex-col gap-2 px-3 py-6"
        role="alert"
        aria-label={t('equationSteps.stageAria')}
      >
        <p className="m-0 text-[1.05rem] font-bold tracking-[-0.03em] text-danger">
          {t(FAIL_KEY[result.reason])}
        </p>
      </div>
    )
  }

  const status =
    result.outcome === 'identity'
      ? t('equationSteps.result.identity')
      : result.outcome === 'none'
        ? t('equationSteps.result.none')
        : t('equationSteps.result.solved')
  const tone = result.outcome === 'none' ? 'text-danger' : 'text-accent'
  const step = result.steps[i]
  const from = i > 0 ? (result.steps[i - 1]?.text ?? null) : null

  return (
    <div className="flex w-full min-w-0 max-w-5xl flex-col items-stretch">
    <div
      className="flex w-full min-w-0 flex-col items-stretch gap-3 px-2 py-4 min-[720px]:px-3 min-[720px]:py-5 min-[981px]:flex-row min-[981px]:items-start min-[981px]:gap-4"
      role="group"
      aria-label={t('equationSteps.stageAria')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p
          className={cn(
            'm-0 text-[0.8rem] font-semibold tracking-[0.06em] uppercase',
            tone
          )}
          role="status"
        >
          {status}
        </p>
        <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
          {result.steps.map((s, n) => {
            const active = n === i
            return (
              <li key={`${n}-${s.text}`}>
                <button
                  type="button"
                  data-eq-step={n}
                  className={cn(
                    'flex w-full cursor-pointer appearance-none flex-col items-stretch gap-0.5 rounded-none border-0 bg-transparent py-1.5 pr-2 pl-2.5 text-left transition-[box-shadow,color] duration-100',
                    active
                      ? 'shadow-[inset_2px_0_0_var(--color-accent)]'
                      : 'shadow-[inset_2px_0_0_transparent] hover:shadow-[inset_2px_0_0_var(--color-line)]'
                  )}
                  aria-current={active ? 'step' : undefined}
                  aria-pressed={active}
                  title={t('equationSteps.steps.item', { n, label: s.text })}
                  onClick={() => onViewStep(n)}
                >
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <span
                      className={cn(
                        'w-4 shrink-0 font-mono text-[0.72rem] tabular-nums',
                        active ? 'font-bold text-accent' : 'text-muted'
                      )}
                    >
                      {n}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 font-mono text-[1.02rem] font-bold tracking-[-0.03em] wrap-break-word min-[720px]:text-[1.08rem]',
                        active ? 'text-ink' : 'text-ink/75'
                      )}
                    >
                      {s.text}
                    </span>
                  </span>
                  <span className="m-0 pl-[1.65rem] text-[0.8rem] leading-snug text-muted">
                    {whyText(s.why, t)}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      {step ? <StepDetail step={step} index={i} from={from} /> : null}
    </div>
    {result.plot ? (
      <div className="w-full min-w-0 px-2 pb-3 min-[720px]:px-3">
        <EqGraph plot={result.plot} />
      </div>
    ) : null}
    </div>
  )
}
