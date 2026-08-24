import { PRESETS } from '../game/puzzles'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  GamePanel,
  ToolRow,
  gameBtn,
  gameBtnActive
} from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const DIFF_LABEL: Record<
  DiffId,
  | 'rushHour.diff.easy'
  | 'rushHour.diff.medium'
  | 'rushHour.diff.hard'
  | 'rushHour.diff.expert'
  | 'rushHour.diff.insane'
> = {
  easy: 'rushHour.diff.easy',
  medium: 'rushHour.diff.medium',
  hard: 'rushHour.diff.hard',
  expert: 'rushHour.diff.expert',
  insane: 'rushHour.diff.insane'
}

type DiffBarProps = {
  diffId: DiffId
  busy?: boolean
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, busy, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('rushHour.diff.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('rushHour.diff.helpTitle')}>
          <p className="m-0">{t('rushHour.diff.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={5} desktopCols={5}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              gameBtn,
              'min-w-0 truncate px-1 py-[0.4rem] text-center text-[0.8rem] max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.9rem]',
              p.id === 'insane' &&
                'border-danger/45 text-[#ffb0b0] hover:border-danger/75 hover:bg-danger/20',
              diffId === p.id && gameBtnActive,
              diffId === p.id &&
                p.id === 'insane' &&
                'border-danger bg-danger/25 text-[#ffd0d0]'
            )}
            title={t('rushHour.diff.applyTitle')}
            aria-busy={busy && diffId === p.id}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
