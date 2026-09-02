import { useMemo } from 'react'
import { Flag, X } from 'lucide-react'
import type { GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { LegendTip } from './LegendTip'
import { LegendMark } from './LegendMark'
import { legendRichText } from './legendRichText'

type LegendStripProps = {
  goalMode: GoalMode
  className?: string
}

/** Mark meanings - inline tips (desktop) or inside the legend dialog. */
export function LegendStrip({ goalMode, className }: LegendStripProps) {
  const { t } = useI18n()
  const huntGoal = goalMode === 'hunt'
  const tipLabel = huntGoal ? t('legend.surestTarget') : t('legend.safest')

  const legendMarks = useMemo(
    () => ({
      sure: <LegendMark kind="sure">{t('legend.sure')}</LegendMark>,
      best: <LegendMark kind="best">{t('legend.best')}</LegendMark>,
      safest: (
        <LegendMark kind="safest">
          {huntGoal ? t('legend.surestTarget') : t('legend.safest')}
        </LegendMark>
      ),
      surestTarget: (
        <LegendMark kind="surestTarget">{t('legend.surestTarget')}</LegendMark>
      ),
      unclued: <LegendMark kind="unclued">{t('legend.unclued')}</LegendMark>,
      chance: <LegendMark kind="chance">{t('legend.chance')}</LegendMark>,
      flag: (
        <LegendMark kind="flag">
          {huntGoal ? t('legend.flagHunt') : t('legend.flag')}
        </LegendMark>
      ),
      safe: (
        <LegendMark kind="safe">
          {huntGoal ? t('legend.safeTitleHunt') : t('legend.safe')}
        </LegendMark>
      ),
      mine: (
        <LegendMark kind="mine">
          {huntGoal ? t('legend.numberHunt') : t('legend.numberSafe')}
        </LegendMark>
      ),
      info: <LegendMark kind="info">{t('legend.info')}</LegendMark>,
      entropy: (
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(t('legend.entropySearch'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent underline decoration-accent/55 underline-offset-2 hover:decoration-accent"
        >
          {t('legend.entropy')}
        </a>
      )
    }),
    [t, huntGoal]
  )

  const legendSureFirstSection = (
    <div className="flex flex-col gap-1">
      <strong className="text-[0.78rem] font-bold leading-[1.3]">
        <LegendMark kind="sure">{t('legend.pickWhenSureTitle')}</LegendMark>
      </strong>
      <p className="m-0">
        {legendRichText(
          t(
            huntGoal
              ? 'legend.pickWhenSureBodyHunt'
              : 'legend.pickWhenSureBodySafe'
          ),
          legendMarks
        )}
      </p>
    </div>
  )

  const legendPickPrioSection = (
    <div className="flex flex-col gap-1.5">
      <p className="m-0">
        {t(huntGoal ? 'legend.pickWhenIntroHunt' : 'legend.pickWhenIntroSafe')}
      </p>
      <p className="m-0">
        {legendRichText(
          t(huntGoal ? 'legend.pickWhenPrio1Hunt' : 'legend.pickWhenPrio1Safe'),
          legendMarks
        )}
      </p>
      <p className="m-0">
        {legendRichText(
          t(huntGoal ? 'legend.pickWhenPrio2Hunt' : 'legend.pickWhenPrio2Safe'),
          legendMarks
        )}
      </p>
      <p className="m-0">
        {legendRichText(t('legend.pickWhenPrio3'), legendMarks)}
      </p>
      <p className="m-0">
        {legendRichText(
          t(huntGoal ? 'legend.pickWhenPrio4Hunt' : 'legend.pickWhenPrio4Safe'),
          legendMarks
        )}
      </p>
    </div>
  )

  return (
    <div
      className={cn(
        'flex flex-wrap justify-start gap-x-[0.85rem] gap-y-[0.55rem] text-[0.75rem] font-medium text-muted',
        className
      )}
    >
      <LegendTip
        label={t(huntGoal ? 'legend.numberHunt' : 'legend.numberSafe')}
        swatchClass="mine"
        swatchContent="3"
        title={t(
          huntGoal ? 'legend.numberTitleHunt' : 'legend.numberTitleSafe'
        )}
      >
        {t(huntGoal ? 'legend.numberBodyHunt' : 'legend.numberBodySafe')}
      </LegendTip>
      {huntGoal ? (
        <LegendTip
          label={t('legend.info')}
          swatchClass="info"
          swatchContent="3"
          title={t('legend.infoTitleHunt')}
        >
          {t('legend.infoBodyHunt')}
        </LegendTip>
      ) : null}
      <LegendTip
        label={t(huntGoal ? 'legend.flagHunt' : 'legend.flag')}
        swatchClass="flag"
        swatchContent={
          huntGoal ? (
            <X
              className="h-[0.7rem] w-[0.7rem] text-flag"
              strokeWidth={3}
              aria-hidden
            />
          ) : (
            <Flag
              className="h-[0.7rem] w-[0.7rem] text-flag"
              fill="currentColor"
              strokeWidth={1.5}
              aria-hidden
            />
          )
        }
        title={t(huntGoal ? 'legend.flagTitleHunt' : 'legend.flagTitle')}
      >
        {legendRichText(
          t(huntGoal ? 'legend.flagBodyHunt' : 'legend.flagBodySafe'),
          legendMarks
        )}
      </LegendTip>
      {huntGoal ? (
        <LegendTip
          label={t('legend.safeTitleHunt')}
          swatchClass="blank"
          swatchContent={
            <span
              className="flex h-[0.7rem] w-[0.7rem] items-center justify-center text-[0.7rem] font-bold leading-none text-[#c5ced8]"
              aria-hidden
            >
              ?
            </span>
          }
          title={t('legend.safeTitleHunt')}
        >
          {legendRichText(t('legend.safeBodyHunt'), legendMarks)}
        </LegendTip>
      ) : (
        <LegendTip
          label={t('legend.safe')}
          swatchClass="blank"
          title={t('legend.safeTitle')}
        >
          {legendRichText(t('legend.safeBody'), legendMarks)}
        </LegendTip>
      )}
      <span
        className="mx-[0.15rem] min-h-[0.9rem] w-px shrink-0 self-stretch bg-line"
        aria-hidden
      />
      <LegendTip
        label={t('legend.sure')}
        swatchClass="sure"
        title={t(huntGoal ? 'legend.sureTitleHunt' : 'legend.sureTitleSafe')}
      >
        {legendRichText(
          t(huntGoal ? 'legend.sureBodyHunt' : 'legend.sureBodySafe'),
          legendMarks
        )}
      </LegendTip>
      <LegendTip
        label={t('legend.chance')}
        swatchClass="chance"
        title={t(
          huntGoal ? 'legend.chanceTitleHunt' : 'legend.chanceTitleSafe'
        )}
      >
        {legendRichText(
          t(huntGoal ? 'legend.chanceBodyHunt' : 'legend.chanceBodySafe'),
          legendMarks
        )}
      </LegendTip>
      <LegendTip
        label={t('legend.pickWhen')}
        swatchClass="vs"
        title={t('legend.pickWhenTitle')}
        titleClassName="text-ink"
        wide
        stacked
      >
        {legendPickPrioSection}
        {legendSureFirstSection}
        <div className="flex flex-col gap-1">
          <strong className="text-[0.78rem] font-bold leading-[1.3]">
            <LegendMark kind="safest">{tipLabel}</LegendMark>
          </strong>
          <p className="m-0">
            {legendRichText(
              t(
                huntGoal
                  ? 'legend.pickWhenSafestBodyHunt'
                  : 'legend.pickWhenSafestBodySafe'
              ),
              legendMarks
            )}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <strong className="text-[0.78rem] font-bold leading-[1.3]">
            <LegendMark kind="best">{t('legend.best')}</LegendMark>
          </strong>
          <p className="m-0">
            {legendRichText(
              t(
                huntGoal
                  ? 'legend.pickWhenBestBodyHunt'
                  : 'legend.pickWhenBestBodySafe'
              ),
              legendMarks
            )}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <strong className="text-[0.78rem] font-bold leading-[1.3]">
            <LegendMark kind="unclued">{t('legend.unclued')}</LegendMark>
          </strong>
          <p className="m-0">
            {legendRichText(
              t(
                huntGoal
                  ? 'legend.pickWhenUncluedBodyHunt'
                  : 'legend.pickWhenUncluedBodySafe'
              ),
              legendMarks
            )}
          </p>
        </div>
      </LegendTip>
      <LegendTip
        label={tipLabel}
        swatchClass="safest"
        title={t(
          huntGoal ? 'legend.safestTitleHunt' : 'legend.safestTitleSafe'
        )}
      >
        {legendRichText(
          t(huntGoal ? 'legend.safestBodyHunt' : 'legend.safestBodySafe'),
          legendMarks
        )}
      </LegendTip>
      <LegendTip
        label={t('legend.best')}
        swatchClass="best"
        title={t(huntGoal ? 'legend.bestTitleHunt' : 'legend.bestTitleSafe')}
      >
        {legendRichText(
          t(huntGoal ? 'legend.bestBodyHunt' : 'legend.bestBodySafe'),
          legendMarks
        )}
      </LegendTip>
      <LegendTip
        label={t('legend.unclued')}
        swatchClass="unclued"
        title={t(
          huntGoal ? 'legend.uncluedTitleHunt' : 'legend.uncluedTitleSafe'
        )}
      >
        {legendRichText(
          t(huntGoal ? 'legend.uncluedBodyHunt' : 'legend.uncluedBodySafe'),
          legendMarks
        )}
      </LegendTip>
    </div>
  )
}
