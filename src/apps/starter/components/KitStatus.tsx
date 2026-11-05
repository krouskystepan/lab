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
    <div className="w-full shrink-0 rounded-md border border-[#2a2a30] bg-[#121214] px-2 py-1.5 min-[900px]:px-2.5 min-[900px]:py-2">
      <div className="mb-0.5 flex items-baseline justify-between gap-2 min-[900px]:mb-1">
        <span className="font-mono text-[0.6rem] font-bold tracking-wide text-muted uppercase min-[900px]:text-[0.65rem]">
          {t('starter.kit')}
        </span>
        <span
          className={cn(
            'font-mono text-[0.7rem] font-bold tabular-nums min-[900px]:text-[0.75rem]',
            danger ? 'text-[#e24a4a]' : warn ? 'text-[#e8c84a]' : 'text-ink'
          )}
        >
          {t('starter.durability')} {pct}%
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#2a2a30] min-[900px]:h-1.5">
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
