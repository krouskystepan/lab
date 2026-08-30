import { PRESETS } from '../game/generate'
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
  | 'lightsOut.diff.easy'
  | 'lightsOut.diff.medium'
  | 'lightsOut.diff.hard'
  | 'lightsOut.diff.expert'
  | 'lightsOut.diff.insane'
> = {
  easy: 'lightsOut.diff.easy',
  medium: 'lightsOut.diff.medium',
  hard: 'lightsOut.diff.hard',
  expert: 'lightsOut.diff.expert',
  insane: 'lightsOut.diff.insane'
}

type DiffBarProps = {
  diffId: DiffId
  onDiffChange: (id: DiffId) => void
}

export function DiffBar({ diffId, onDiffChange }: DiffBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('lightsOut.diff.title')}
      className="h-full"
      headerRight={
        <HelpTip title={t('lightsOut.diff.helpTitle')}>
          <p className="m-0">{t('lightsOut.diff.helpBody')}</p>
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
            title={t('lightsOut.diff.applyTitle')}
            onClick={() => onDiffChange(p.id)}
          >
            {t(DIFF_LABEL[p.id])}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
