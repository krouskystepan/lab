import { useI18n } from '../../../i18n'
import type { MessageKey } from '../../../i18n'
import type { GoalMode } from '../solver/types'

interface HintItem {
  chips: MessageKey[]
  labelKey: MessageKey
}

/** Pointer / mouse hints shown first - easy to miss if only in tooltips. */
const POINTER: HintItem[] = [
  { chips: ['hotkeys.chip.again'], labelKey: 'hotkeys.toggleOff' },
  {
    chips: ['hotkeys.chip.rmb', 'hotkeys.chip.hold'],
    labelKey: 'hotkeys.clearCell'
  }
]

function keyboardHints(goalMode: GoalMode): HintItem[] {
  const move: HintItem = {
    chips: [
      'hotkeys.chip.up',
      'hotkeys.chip.down',
      'hotkeys.chip.left',
      'hotkeys.chip.right'
    ],
    labelKey: 'hotkeys.move'
  }
  const sharedTail: HintItem[] = [
    { chips: ['hotkeys.chip.x'], labelKey: 'hotkeys.clear' },
    { chips: ['hotkeys.chip.enter'], labelKey: 'hotkeys.place' },
    { chips: ['hotkeys.chip.s'], labelKey: 'hotkeys.solve' },
    { chips: ['hotkeys.chip.w'], labelKey: 'hotkeys.why' }
  ]

  if (goalMode === 'safe') {
    // Classic Minesweeper: Safe # + Flag + Safe (blank)
    return [
      move,
      { chips: ['hotkeys.chip.digits'], labelKey: 'hotkeys.numberSafe' },
      { chips: ['hotkeys.chip.f'], labelKey: 'hotkeys.flag' },
      { chips: ['hotkeys.chip.b'], labelKey: 'hotkeys.safe' },
      ...sharedTail
    ]
  }

  return [
    move,
    { chips: ['hotkeys.chip.digits'], labelKey: 'hotkeys.numberHunt' },
    {
      chips: ['hotkeys.chip.shift', 'hotkeys.chip.digits'],
      labelKey: 'hotkeys.infoDigit'
    },
    { chips: ['hotkeys.chip.b'], labelKey: 'hotkeys.safeHunt' },
    { chips: ['hotkeys.chip.i'], labelKey: 'hotkeys.infoMode' },
    ...sharedTail
  ]
}

const kbdCls =
  'inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-[0.25rem] border border-line bg-cell px-[0.28rem] font-mono text-[0.62rem] font-semibold leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.35)]'

function HintRow({ item }: { item: HintItem }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-muted">
      <span className="inline-flex items-center gap-[0.2rem]">
        {item.chips.map((chip) => (
          <kbd key={chip} className={kbdCls}>
            {t(chip)}
          </kbd>
        ))}
      </span>
      <span>{t(item.labelKey)}</span>
    </span>
  )
}

interface HotkeysBarProps {
  goalMode?: GoalMode
}

export function HotkeysBar({ goalMode = 'safe' }: HotkeysBarProps) {
  const { t } = useI18n()
  const hints = [...POINTER, ...keyboardHints(goalMode)]
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted"
      aria-label={t('hotkeys.title')}
    >
      {hints.map((item) => (
        <HintRow key={item.labelKey} item={item} />
      ))}
    </div>
  )
}
