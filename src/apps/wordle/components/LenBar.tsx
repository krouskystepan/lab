import type { WordLen } from '../game/words'
import { WORD_LENS } from '../game/words'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { GamePanel, ToolRow, gameBtn, gameBtnActive } from '../../../shared/gameUi'

type LenBarProps = {
  wordLen: number
  onWordLenChange: (len: WordLen) => void
}

export function LenBar({ wordLen, onWordLenChange }: LenBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel title={t('wordle.len.title')} className="h-full">
      <ToolRow mobileCols={4} desktopCols={4}>
        {WORD_LENS.map((n) => (
          <button
            key={n}
            type="button"
            className={cn(
              gameBtn,
              'min-w-0 truncate px-1 py-[0.45rem] text-center font-mono text-[0.85rem] max-[980px]:min-h-[2.35rem]',
              wordLen === n && gameBtnActive
            )}
            title={t('wordle.len.applyTitle', { n })}
            onClick={() => onWordLenChange(n)}
          >
            {t('wordle.len.option', { n })}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
