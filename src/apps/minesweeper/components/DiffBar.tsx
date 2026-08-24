import { PRESETS, matchingDiff } from '../game/presets'
import type { DiffId } from '../game/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, ToolRow, gameBtnActive, gameToolBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'

const DIFF_LABEL: Record<
  DiffId,
  | 'minesweeper.diff.beginner'
  | 'minesweeper.diff.intermediate'
  | 'minesweeper.diff.expert'
  | 'minesweeper.diff.crazy'
> = {
  beginner: 'minesweeper.diff.beginner',
  intermediate: 'minesweeper.diff.intermediate',
  expert: 'minesweeper.diff.expert',
  crazy: 'minesweeper.diff.crazy'
}

type DiffBarProps = {
  width: number
  height: number
  mines: number
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({
  width,
  height,
  mines,
  diffId,
  onDiffChange
}: DiffBarProps) {
  const { t } = useI18n()
  const activeDiff = matchingDiff(width, height, mines) ?? diffId
  const densityMatches = matchingDiff(width, height, mines) != null

  return (
    <GamePanel
      title={t('minesweeper.diff.title')}
      headerRight={
        <HelpTip title={t('minesweeper.diff.helpTitle')}>
          <p className="m-0">{t('minesweeper.diff.helpBody')}</p>
        </HelpTip>
      }
    >
      {/* 2×2 on phone so “Začátečník” fits; 1×4 on desktop */}
      <ToolRow mobileCols={2} desktopCols={4}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(
              gameToolBtn,
              'px-1.5 font-mono text-[0.8rem]',
              p.id === 'crazy' && 'uppercase tracking-[0.04em]',
              densityMatches && activeDiff === p.id && gameBtnActive
            )}
            title={t('minesweeper.diff.applyTitle')}
            onClick={() => onDiffChange(p.id)}
          >
            <span className="min-w-0 truncate">{t(DIFF_LABEL[p.id])}</span>
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
