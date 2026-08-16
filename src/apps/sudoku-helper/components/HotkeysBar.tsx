import { useI18n } from '../../../i18n'

const kbdCls =
  'inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-[0.25rem] border border-line bg-cell px-[0.28rem] font-mono text-[0.62rem] font-semibold leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.35)]'

type Hint = { chips: string[]; label: string }

export function HotkeysBar() {
  const { t } = useI18n()
  const hints: Hint[] = [
    {
      chips: [t('sudokuHelper.hotkeys.chip.digits')],
      label: t('sudokuHelper.hotkeys.digits')
    },
    {
      chips: [t('sudokuHelper.hotkeys.chip.erase')],
      label: t('sudokuHelper.hotkeys.erase')
    },
    {
      chips: [t('sudokuHelper.hotkeys.chip.solve')],
      label: t('sudokuHelper.hotkeys.solve')
    },
    {
      chips: [t('sudokuHelper.hotkeys.chip.next')],
      label: t('sudokuHelper.hotkeys.next')
    },
    {
      chips: [t('sudokuHelper.hotkeys.chip.undo')],
      label: t('sudokuHelper.hotkeys.undo')
    },
    {
      chips: [t('sudokuHelper.hotkeys.chip.reset')],
      label: t('sudokuHelper.hotkeys.reset')
    }
  ]

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted"
      aria-label={t('sudokuHelper.hotkeys.title')}
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
