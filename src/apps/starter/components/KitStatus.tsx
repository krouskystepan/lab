import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'

type Props = {
  durability: number
}

export function KitStatus({ durability }: Props) {
  const { t } = useI18n()
  const pct = Math.round(durability)
  const danger = pct <= 30
  const warn = pct <= 55

  return (
    <div className="w-full shrink-0 rounded-md border border-[#2a2a30] bg-[#121214] px-2.5 py-2">
      <div className="mb-1 font-mono text-[0.65rem] font-bold tracking-wide text-muted uppercase">
        {t('starter.kit')}
      </div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.7rem] text-ink">
          {t('starter.durability')}
        </span>
        <span
          className={cn(
            'font-mono text-[0.75rem] font-bold tabular-nums',
            danger ? 'text-[#e24a4a]' : warn ? 'text-[#e8c84a]' : 'text-ink'
          )}
        >
          {pct} %
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#2a2a30]">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-200',
            danger ? 'bg-[#e24a4a]' : warn ? 'bg-[#e8c84a]' : 'bg-accent'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
