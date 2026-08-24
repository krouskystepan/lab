import { Eraser } from 'lucide-react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  DigitPad,
  GamePanel,
  gameBtnActive,
  gameDigitBtn
} from '../../../shared/gameUi'

type NumberPadProps = {
  digit: number | null
  eraseMode: boolean
  remaining: number[]
  onDigitChange: (d: number) => void
  onEraseMode: () => void
}

export function NumberPad({
  digit,
  eraseMode,
  remaining,
  onDigitChange,
  onEraseMode
}: NumberPadProps) {
  const { t } = useI18n()

  return (
    <GamePanel title={t('sudoku.pad.title')}>
      <DigitPad
        value={digit}
        selectionActive={!eraseMode}
        onSelect={onDigitChange}
        digitTitle={(n) => {
          const left = remaining[n] ?? 0
          return digit === n && !eraseMode
            ? t('sudoku.pad.digitClearTitle', { n })
            : t('sudoku.pad.digitTitle', { n, left })
        }}
        digitClassName={(n) =>
          (remaining[n] ?? 0) <= 0 ? 'opacity-40' : undefined
        }
        trailing={
          <button
            type="button"
            className={cn(
              gameDigitBtn,
              'inline-flex items-center justify-center',
              eraseMode && gameBtnActive
            )}
            aria-pressed={eraseMode}
            title={
              eraseMode
                ? t('sudoku.pad.eraseOffTitle')
                : t('sudoku.pad.eraseTitle')
            }
            aria-label={t('sudoku.pad.erase')}
            onClick={onEraseMode}
          >
            <Eraser className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
          </button>
        }
      />
    </GamePanel>
  )
}
