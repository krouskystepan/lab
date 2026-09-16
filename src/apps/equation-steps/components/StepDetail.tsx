import { useI18n } from '../../../i18n'
import type { SolveStep } from '../solver/types'
import { whyDeep, whyText } from './why'

const panelShell =
  'flex w-full min-w-0 flex-col gap-2 rounded-sm border border-line bg-panel px-[0.7rem] py-2.5 min-[981px]:w-[22rem] min-[981px]:shrink-0'

export function StepDetail({
  step,
  index,
  from
}: {
  step: SolveStep
  index: number
  from: string | null
}) {
  const { t } = useI18n()
  const deep = whyDeep(step.why, t)
  const paras = deep.split('\n').filter(Boolean)

  return (
    <aside className={panelShell} aria-label={t('equationSteps.depth.aria')}>
      <h2 className="m-0 text-[0.95rem] font-bold tracking-[-0.02em]">
        {t('equationSteps.depth.title', { n: index })}
      </h2>
      <p className="m-0 font-mono text-[1.05rem] font-bold tracking-[-0.03em] wrap-break-word text-ink">
        {step.text}
      </p>
      <p className="m-0 text-[0.78rem] font-semibold leading-snug text-accent">
        {whyText(step.why, t)}
      </p>
      {from ? (
        <p className="m-0 text-[0.75rem] leading-snug text-muted">
          <span className="font-semibold tracking-[0.04em] uppercase">
            {t('equationSteps.depth.from')}
          </span>{' '}
          <span className="font-mono text-ink/85">{from}</span>
        </p>
      ) : null}
      {paras.map((p) => (
        <p
          key={p.slice(0, 24)}
          className="m-0 text-[0.8rem] font-medium leading-[1.45] text-muted"
        >
          {p}
        </p>
      ))}
    </aside>
  )
}
