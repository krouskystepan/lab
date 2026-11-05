import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import type { MeterMode } from '../game/types'

type Props = {
  reading: string
  mode: MeterMode
  onMode: (mode: MeterMode) => void
  disabled?: boolean
}

export function Multimeter({ reading, mode, onMode, disabled }: Props) {
  const { t } = useI18n()
  const angle = mode === 'V' ? -42 : 42

  return (
    <div className="relative w-full select-none">
      <div className="relative overflow-hidden rounded-xl border border-[#b8962a] bg-gradient-to-b from-[#e8c84a] to-[#c4a030] p-2 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] min-[900px]:rounded-[1.25rem] min-[900px]:p-3 min-[900px]:shadow-[0_12px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]">
        {/* LCD */}
        <div className="mb-2 rounded-md border border-[#1a2a1a] bg-[#0d1a0d] px-2.5 py-1.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)] min-[900px]:mb-3 min-[900px]:px-3 min-[900px]:py-2.5">
          <div className="font-mono text-[1.05rem] font-bold tracking-wider text-[#5dff7a] tabular-nums drop-shadow-[0_0_6px_rgba(60,255,100,0.35)] min-[900px]:text-[1.35rem]">
            {reading}
          </div>
        </div>

        <div className="flex items-start gap-2 min-[900px]:gap-3">
          {/* Dial — smaller on phones */}
          <div className="relative h-[3.75rem] w-[3.75rem] shrink-0 min-[900px]:h-[5.5rem] min-[900px]:w-[5.5rem]">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#2a2a2e] bg-gradient-to-b from-[#3a3a42] to-[#1a1a1e] shadow-inner" />
            <button
              type="button"
              disabled={disabled}
              aria-label={t('starter.meter.dialAria')}
              title={t('starter.meter.dialTitle')}
              onClick={() => onMode(mode === 'V' ? 'OHM' : 'V')}
              className="absolute inset-[0.4rem] cursor-pointer rounded-full border border-[#555] bg-gradient-to-b from-[#4a4a52] to-[#222] disabled:cursor-default min-[900px]:inset-[0.55rem]"
            >
              <span
                className="absolute top-1/2 left-1/2 block h-[1.25rem] w-[0.22rem] origin-bottom rounded-full bg-[#e24a4a] shadow min-[900px]:h-[1.85rem] min-[900px]:w-[0.28rem]"
                style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
              />
              <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#888] min-[900px]:h-2.5 min-[900px]:w-2.5" />
            </button>
            <span
              className={cn(
                'pointer-events-none absolute top-1 left-1 z-10 font-mono text-[0.58rem] font-bold tracking-wide min-[900px]:top-1.5 min-[900px]:left-1.5 min-[900px]:text-[0.72rem]',
                mode === 'V' ? 'text-[#f0d878]' : 'text-[#9a9aa8]'
              )}
            >
              V
            </span>
            <span
              className={cn(
                'pointer-events-none absolute top-1 right-0.5 z-10 font-mono text-[0.55rem] font-bold tracking-wide min-[900px]:top-1.5 min-[900px]:right-1 min-[900px]:text-[0.68rem]',
                mode === 'OHM' ? 'text-[#f0d878]' : 'text-[#9a9aa8]'
              )}
            >
              OHM
            </span>
          </div>

          {/* Sticky note */}
          <div className="relative min-w-0 flex-1 rotate-[1deg] rounded-sm border border-[#d4c48a] bg-[#f3e6b0] px-1.5 py-1 shadow-md min-[900px]:rotate-[1.5deg] min-[900px]:px-2 min-[900px]:py-1.5">
            <p className="m-0 font-mono text-[0.55rem] leading-snug text-[#3a3420] min-[900px]:text-[0.62rem]">
              {t('starter.note.battery')}
            </p>
            <p className="m-0 font-mono text-[0.55rem] leading-snug text-[#3a3420] min-[900px]:text-[0.62rem]">
              {t('starter.note.ignition')}
            </p>
            <p className="m-0 font-mono text-[0.55rem] leading-snug text-[#3a3420] min-[900px]:text-[0.62rem]">
              {t('starter.note.starter')}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[0.5rem] leading-snug text-[#3a3420] min-[900px]:mt-1 min-[900px]:text-[0.58rem]">
              {t('starter.note.connect')}
            </p>
            <p className="m-0 mt-0.5 font-mono text-[0.5rem] font-bold leading-snug text-[#a01818] min-[900px]:mt-1 min-[900px]:text-[0.58rem]">
              {t('starter.note.live')}
            </p>
            <span className="absolute -top-1 left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-[1px] bg-[#d8d0b0]/80 min-[900px]:-top-1.5 min-[900px]:h-3 min-[900px]:w-8" />
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 min-[900px]:mt-3">
          {(['V', 'OHM'] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onMode(m)}
              className={cn(
                'min-h-9 flex-1 rounded-md border px-2 py-1.5 font-mono text-[0.7rem] font-bold transition-colors min-[900px]:min-h-0 min-[900px]:py-1',
                mode === m
                  ? 'border-[#1a1a1e] bg-[#1a1a1e] text-[#e8c84a]'
                  : 'border-[#8a7020]/50 bg-[#e8c84a]/30 text-[#3a3010] hover:bg-[#e8c84a]/55',
                disabled && 'opacity-50'
              )}
            >
              {m === 'V' ? t('starter.meter.volts') : t('starter.meter.ohms')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
