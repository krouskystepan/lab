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
  | 'sudoku.diff.easy'
  | 'sudoku.diff.medium'
  | 'sudoku.diff.hard'
  | 'sudoku.diff.expert'
> = {
  easy: 'sudoku.diff.easy',
  medium: 'sudoku.diff.medium',
  hard: 'sudoku.diff.hard',
  expert: 'sudoku.diff.expert'
}

type DiffBarProps = {
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('sudoku.diff.title')}
      headerRight={
        <HelpTip title={t('sudoku.diff.helpTitle')}>
          <p className="m-0">{t('sudoku.diff.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={2} desktopCols={4}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              gameBtn,
              'min-w-0 overflow-hidden px-1.5 py-[0.45rem] text-center text-[0.8rem] max-[980px]:min-h-10',
              diffId === p.id && gameBtnActive
            )}
            title={t(DIFF_LABEL[p.id])}
            onClick={() => onDiffChange(p.id)}
          >
            <span className="min-w-0 truncate">{t(DIFF_LABEL[p.id])}</span>
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
