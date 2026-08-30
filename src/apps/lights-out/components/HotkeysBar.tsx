import { useI18n } from '../../../i18n'

const kbdCls =
  'inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-[0.25rem] border border-line bg-cell px-[0.28rem] font-mono text-[0.62rem] font-semibold leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.35)]'

type Hint = { chips: string[]; label: string }

export function HotkeysBar() {
  const { t } = useI18n()
  const hints: Hint[] = [
    {
      chips: [t('lightsOut.hotkeys.chip.click')],
      label: t('lightsOut.hotkeys.click')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.move')],
      label: t('lightsOut.hotkeys.move')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.press')],
      label: t('lightsOut.hotkeys.press')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.hint')],
      label: t('lightsOut.hotkeys.hint')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.undo')],
      label: t('lightsOut.hotkeys.undo')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.reset')],
      label: t('lightsOut.hotkeys.reset')
    },
    {
      chips: [t('lightsOut.hotkeys.chip.new')],
      label: t('lightsOut.hotkeys.new')
    }
  ]

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted"
      aria-label={t('lightsOut.hotkeys.title')}
    >
      {hints.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-muted"
        >
          <span className="inline-flex items-center gap-[0.2rem]">
            {item.chips.map((chip) => (
              <kbd key={chip} className={kbdCls}>
                {chip}
              </kbd>
            ))}
          </span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  )
}
