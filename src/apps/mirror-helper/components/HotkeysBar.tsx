import { useI18n } from '../../../i18n'
import type { MessageKey } from '../../../i18n'

interface HintItem {
  chips: MessageKey[]
  labelKey: MessageKey
}

const HINTS: HintItem[] = [
  {
    chips: ['mirrorHelper.hotkeys.chip.again'],
    labelKey: 'mirrorHelper.hotkeys.toggleOff'
  },
  {
    chips: [
      'mirrorHelper.hotkeys.chip.rmb',
      'mirrorHelper.hotkeys.chip.hold'
    ],
    labelKey: 'mirrorHelper.hotkeys.clearCell'
  },
  {
    chips: [
      'mirrorHelper.hotkeys.chip.up',
      'mirrorHelper.hotkeys.chip.down',
      'mirrorHelper.hotkeys.chip.left',
      'mirrorHelper.hotkeys.chip.right'
    ],
    labelKey: 'mirrorHelper.hotkeys.move'
  },
  {
    chips: ['mirrorHelper.hotkeys.chip.enter'],
    labelKey: 'mirrorHelper.hotkeys.place'
  },
  {
    chips: ['mirrorHelper.hotkeys.chip.m'],
    labelKey: 'mirrorHelper.hotkeys.mine'
  },
  {
    chips: ['mirrorHelper.hotkeys.chip.x'],
    labelKey: 'mirrorHelper.hotkeys.not'
  },
  {
    chips: ['mirrorHelper.hotkeys.chip.s'],
    labelKey: 'mirrorHelper.hotkeys.solve'
  },
  {
    chips: ['mirrorHelper.hotkeys.chip.z'],
    labelKey: 'mirrorHelper.hotkeys.undo'
  }
]

const kbdCls =
  'inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-[0.25rem] border border-line bg-cell px-[0.28rem] font-mono text-[0.62rem] font-semibold leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.35)]'

export function HotkeysBar() {
  const { t } = useI18n()
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted"
      aria-label={t('mirrorHelper.hotkeys.title')}
    >
      {HINTS.map((item) => (
        <span
          key={item.labelKey}
          className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-muted"
        >
          <span className="inline-flex items-center gap-[0.2rem]">
            {item.chips.map((chip) => (
              <kbd key={chip} className={kbdCls}>
                {t(chip)}
              </kbd>
            ))}
          </span>
          <span>{t(item.labelKey)}</span>
        </span>
      ))}
    </div>
  )
}
