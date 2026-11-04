import { useI18n } from '../../../i18n'

const chips = [
  ['1', 'starter.hotkeys.chip.probe', 'starter.hotkeys.probe'],
  ['2', 'starter.hotkeys.chip.jumper', 'starter.hotkeys.jumper'],
  ['V', 'starter.hotkeys.chip.volts', 'starter.hotkeys.volts'],
  ['O', 'starter.hotkeys.chip.ohms', 'starter.hotkeys.ohms'],
  ['N', 'starter.hotkeys.chip.new', 'starter.hotkeys.new']
] as const

export function HotkeysBar() {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.7rem] text-muted">
      <span className="font-bold tracking-wider uppercase">{t('starter.hotkeys.title')}</span>
      {chips.map(([, chipKey, labelKey]) => (
        <span key={chipKey} className="inline-flex items-center gap-1">
          <kbd className="rounded border border-line bg-cell px-1 py-0.5 text-[0.65rem] text-ink">
            {t(chipKey)}
          </kbd>
          <span>{t(labelKey)}</span>
        </span>
      ))}
    </div>
  )
}
