import { useI18n } from '../../../i18n'

const kbdCls =
  'inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-[0.25rem] border border-line bg-cell px-[0.28rem] font-mono text-[0.62rem] font-semibold leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.35)]'

type Hint = { chips: string[]; label: string }

export function HotkeysBar() {
  const { t } = useI18n()
  const hints: Hint[] = [
    {
      chips: [t('sudoku.hotkeys.chip.digits')],
      label: t('sudoku.hotkeys.digits')
    },
    {
      chips: [t('sudoku.hotkeys.chip.erase')],
      label: t('sudoku.hotkeys.erase')
    },
    {
      chips: [t('sudoku.hotkeys.chip.notes')],
      label: t('sudoku.hotkeys.notes')
    },
    {
      chips: [t('sudoku.hotkeys.chip.hint')],
      label: t('sudoku.hotkeys.hint')
    },
    {
      chips: [t('sudoku.hotkeys.chip.check')],
      label: t('sudoku.hotkeys.check')
    },
    {
      chips: [t('sudoku.hotkeys.chip.undo')],
      label: t('sudoku.hotkeys.undo')
    },
    {
      chips: [t('sudoku.hotkeys.chip.new')],
      label: t('sudoku.hotkeys.new')
    },
    {
      chips: [t('sudoku.hotkeys.chip.move')],
      label: t('sudoku.hotkeys.move')
    }
  ]

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted"
      aria-label={t('sudoku.hotkeys.title')}
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
