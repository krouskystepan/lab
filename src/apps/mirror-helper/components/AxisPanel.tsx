import type { AxisId, AxisInfo, EnabledFamilies } from '../solver/types'
import { useI18n, type MessageKey } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { ctrl, ctrlActive } from './ctrl'
import { axisWhyMessage } from '../solver/explainAxis'

interface AxisPanelProps {
  width: number
  height: number
  enabled: EnabledFamilies
  onEnabledChange: (next: EnabledFamilies) => void
  axes: AxisInfo[]
  onExplainAxis: (id: AxisId) => void
  possibleCount: number
}

const AXIS_SHORT: Record<AxisId, MessageKey> = {
  v: 'mirrorHelper.axes.v',
  h: 'mirrorHelper.axes.h',
  'd-main': 'mirrorHelper.axes.dMain',
  'd-anti': 'mirrorHelper.axes.dAnti'
}

const AXIS_LABEL: Record<AxisId, MessageKey> = {
  v: 'mirrorHelper.axes.vLabel',
  h: 'mirrorHelper.axes.hLabel',
  'd-main': 'mirrorHelper.axes.dMainLabel',
  'd-anti': 'mirrorHelper.axes.dAntiLabel'
}

export function AxisPanel({
  width,
  height,
  enabled,
  onEnabledChange,
  axes,
  onExplainAxis,
  possibleCount
}: AxisPanelProps) {
  const { t } = useI18n()
  const square = width === height
  const diagonalOn = enabled.diagonal && square

  const countLabel =
    axes.length === 0
      ? t('mirrorHelper.axes.none')
      : t('mirrorHelper.axes.count', { n: possibleCount })

  return (
    <GamePanel
      title={t('mirrorHelper.axes.title')}
      headerRight={
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] font-semibold text-muted normal-case tracking-normal">
            {countLabel}
          </span>
          <HelpTip title={t('mirrorHelper.axes.helpTitle')}>
            <p className="m-0 mb-1.5">{t('mirrorHelper.axes.helpBody')}</p>
            <p className="m-0">{t('mirrorHelper.axes.tapWhy')}</p>
          </HelpTip>
        </div>
      }
      className="h-full"
    >
      <div className="flex flex-wrap items-center gap-1.5" role="group">
        <button
          type="button"
          className={cn(ctrl, enabled.vertical && ctrlActive)}
          aria-pressed={enabled.vertical}
          onClick={() =>
            onEnabledChange({ ...enabled, vertical: !enabled.vertical })
          }
        >
          {t('mirrorHelper.axes.vertical')}
        </button>
        <button
          type="button"
          className={cn(ctrl, enabled.horizontal && ctrlActive)}
          aria-pressed={enabled.horizontal}
          onClick={() =>
            onEnabledChange({ ...enabled, horizontal: !enabled.horizontal })
          }
        >
          {t('mirrorHelper.axes.horizontal')}
        </button>
        <button
          type="button"
          className={cn(ctrl, diagonalOn && ctrlActive)}
          aria-pressed={diagonalOn}
          disabled={!square}
          title={square ? undefined : t('mirrorHelper.axes.diagonalDisabled')}
          onClick={() =>
            onEnabledChange({ ...enabled, diagonal: !enabled.diagonal })
          }
        >
          {t('mirrorHelper.axes.diagonal')}
        </button>

        <span
          className="mx-0.5 hidden h-5 w-px bg-line sm:inline"
          aria-hidden
        />

        {axes.map((a) => {
          const possible = a.status === 'possible'
          const alone = possible && possibleCount === 1
          const whyMsg =
            !possible && a.why ? axisWhyMessage(a.why, width) : null
          const whyTitle = whyMsg ? t(whyMsg.key, whyMsg.vars) : null
          const title =
            whyTitle ??
            `${t(AXIS_LABEL[a.id])} - ${
              possible
                ? t('mirrorHelper.axes.possiblePct', {
                    pct: Math.round(a.percent)
                  })
                : t('mirrorHelper.axes.impossible')
            }`

          if (possible) {
            return (
              <span
                key={a.id}
                className={cn(
                  ctrl,
                  'min-w-9 cursor-default font-mono',
                  alone
                    ? ctrlActive
                    : 'border-[color-mix(in_srgb,var(--color-accent)_55%,var(--color-line))]'
                )}
                title={title}
              >
                {t(AXIS_SHORT[a.id])}
                {!alone && (
                  <span className="text-[0.7rem] font-semibold text-muted normal-case tracking-normal">
                    {Math.round(a.percent)}%
                  </span>
                )}
              </span>
            )
          }

          return (
            <button
              key={a.id}
              type="button"
              className={cn(
                ctrl,
                'min-w-9 cursor-help font-mono border-danger/60 bg-[color-mix(in_srgb,var(--color-danger)_18%,var(--color-cell))] text-[#ffb0b0] line-through opacity-80'
              )}
              title={title}
              onClick={() => onExplainAxis(a.id)}
            >
              {t(AXIS_SHORT[a.id])}
            </button>
          )
        })}
      </div>
    </GamePanel>
  )
}
