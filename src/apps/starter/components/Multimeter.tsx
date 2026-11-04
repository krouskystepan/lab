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
  // Dial angle: V ≈ -40°, OHM ≈ 40°
  const angle = mode === 'V' ? -42 : 42

  return (
    <div className="relative w-full select-none">
      <div
        className="relative overflow-hidden rounded-[1.25rem] border border-[#b8962a] bg-gradient-to-b from-[#e8c84a] to-[#c4a030] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        {/* LCD */}
        <div className="mb-3 rounded-md border border-[#1a2a1a] bg-[#0d1a0d] px-3 py-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)]">
          <div className="font-mono text-[1.35rem] font-bold tracking-wider text-[#5dff7a] tabular-nums drop-shadow-[0_0_6px_rgba(60,255,100,0.35)]">
            {reading}
          </div>
        </div>

        <div className="flex items-start gap-3">
          {/* Dial */}
          <div className="relative h-[5.5rem] w-[5.5rem] shrink-0">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#2a2a2e] bg-gradient-to-b from-[#3a3a42] to-[#1a1a1e] shadow-inner" />
            <button
              type="button"
              disabled={disabled}
              aria-label={t('starter.meter.dialAria')}
              title={t('starter.meter.dialTitle')}
              onClick={() => onMode(mode === 'V' ? 'OHM' : 'V')}
              className="absolute inset-[0.55rem] cursor-pointer rounded-full border border-[#555] bg-gradient-to-b from-[#4a4a52] to-[#222] disabled:cursor-default"
            >
              <span
                className="absolute top-1/2 left-1/2 block h-[1.85rem] w-[0.28rem] origin-bottom rounded-full bg-[#e24a4a] shadow"
                style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
              />
              <span className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#888]" />
            </button>
            <span className="absolute top-2 left-2 font-mono text-[0.7rem] font-bold text-[#1a1a1e]">
              V
            </span>
            <span className="absolute top-2 right-1.5 font-mono text-[0.65rem] font-bold text-[#1a1a1e]">
              OHM
            </span>
          </div>

          {/* Sticky note */}
          <div className="relative min-w-0 flex-1 rotate-[1.5deg] rounded-sm border border-[#d4c48a] bg-[#f3e6b0] px-2 py-1.5 shadow-md">
            <p className="m-0 font-mono text-[0.62rem] leading-snug text-[#3a3420]">
              {t('starter.note.battery')}
            </p>
            <p className="m-0 font-mono text-[0.62rem] leading-snug text-[#3a3420]">
              {t('starter.note.ignition')}
            </p>
            <p className="m-0 font-mono text-[0.62rem] leading-snug text-[#3a3420]">
              {t('starter.note.starter')}
            </p>
            <p className="m-0 mt-1 font-mono text-[0.58rem] leading-snug text-[#3a3420]">
              {t('starter.note.connect')}
            </p>
            <p className="m-0 mt-1 font-mono text-[0.58rem] font-bold leading-snug text-[#a01818]">
              {t('starter.note.live')}
            </p>
            <span className="absolute -top-1.5 left-1/2 h-3 w-8 -translate-x-1/2 rounded-[1px] bg-[#d8d0b0]/80" />
          </div>
        </div>

        {/* Mode chips */}
        <div className="mt-3 flex gap-1.5">
          {(['V', 'OHM'] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onMode(m)}
              className={cn(
                'flex-1 rounded-md border px-2 py-1 font-mono text-[0.7rem] font-bold transition-colors',
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
