import { Circle, X } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { LegendTip } from './LegendTip'

/** Mark meanings with Mine Helper–style tip popovers (desktop). */
export function LegendStrip({ className }: { className?: string }) {
  const { t } = useI18n()

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] font-medium text-muted',
        className
      )}
      aria-label={t('mirrorHelper.legend.title')}
    >
      <LegendTip
        label={t('mirrorHelper.legend.mine')}
        swatchClass="mine"
        swatchContent={
          <Circle className="h-2 w-2" fill="currentColor" strokeWidth={0} />
        }
        title={t('mirrorHelper.legend.mineTitle')}
      >
        {t('mirrorHelper.legend.mineBody')}
      </LegendTip>
      <LegendTip
        label={t('mirrorHelper.legend.not')}
        swatchClass="flag"
        swatchContent={<X className="h-2.5 w-2.5" strokeWidth={3} />}
        title={t('mirrorHelper.legend.notTitle')}
      >
        {t('mirrorHelper.legend.notBody')}
      </LegendTip>
      <LegendTip
        label={t('mirrorHelper.legend.certain')}
        swatchClass="sure"
        title={t('mirrorHelper.legend.certainTitle')}
      >
        {t('mirrorHelper.legend.certainBody')}
      </LegendTip>
      <LegendTip
        label={t('mirrorHelper.legend.unclued')}
        swatchClass="unclued"
        title={t('mirrorHelper.legend.uncluedTitle')}
      >
        {t('mirrorHelper.legend.uncluedBody')}
      </LegendTip>
      <LegendTip
        label={t('mirrorHelper.legend.hint')}
        swatchClass="hint"
        swatchContent={
          <Circle className="h-1.5 w-1.5 opacity-80" fill="currentColor" strokeWidth={0} />
        }
        title={t('mirrorHelper.legend.hintTitle')}
      >
        {t('mirrorHelper.legend.hintBody')}
      </LegendTip>
      <LegendTip
        label={t('mirrorHelper.legend.probe')}
        swatchClass="best"
        title={t('mirrorHelper.legend.probeTitle')}
      >
        {t('mirrorHelper.legend.probeBody')}
      </LegendTip>
    </div>
  )
}
