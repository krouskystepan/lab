import { PRESETS } from '../game/presets'
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
  | 'wordle.diff.easy'
  | 'wordle.diff.medium'
  | 'wordle.diff.hard'
  | 'wordle.diff.expert'
  | 'wordle.diff.random'
> = {
  easy: 'wordle.diff.easy',
  medium: 'wordle.diff.medium',
  hard: 'wordle.diff.hard',
  expert: 'wordle.diff.expert',
  random: 'wordle.diff.random'
}

type DiffBarProps = {
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('wordle.diff.title')}
      headerRight={
        <HelpTip title={t('wordle.diff.helpTitle')}>
          <p className="m-0">{t('wordle.diff.helpBody')}</p>
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
              diffId === p.id && gameBtnActive
            )}
            title={t('wordle.diff.applyTitle')}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
