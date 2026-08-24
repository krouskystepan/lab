import type { EditMode, GoalMode } from '../solver/types'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  DigitPad,
  GamePanel,
  gameBtnActive,
  gameDigitBtn
} from '../../../shared/gameUi'

interface NumberPadProps {
  mode: EditMode
  numberValue: number | null
  onNumberValueChange: (n: number | null) => void
  onModeChange: (mode: EditMode) => void
  goalMode?: GoalMode
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 0] as const

export function NumberPad({
  mode,
  numberValue,
  onNumberValueChange,
  onModeChange,
  goalMode = 'safe'
}: NumberPadProps) {
  const { t } = useI18n()
  const hunt = goalMode === 'hunt'
  const numberModeActive = mode === 'number' || mode === 'info'
  const digitLabel = (n: number) =>
    hunt
      ? mode === 'info'
        ? t('tools.infoN', { n })
        : t('tools.numberNHunt', { n })
      : t('tools.numberNSafe', { n })

  return (
    <GamePanel title={t('tools.numbers')}>
      <DigitPad
        digits={NUMBERS}
        value={numberValue}
        selectionActive={numberModeActive}
        onSelect={(n) => {
          onNumberValueChange(n)
          onModeChange(!hunt || mode !== 'info' ? 'number' : 'info')
        }}
        digitTitle={(n) =>
          mode === 'erase' ? t('tools.eraseAgain') : digitLabel(n)
        }
        trailing={
          hunt ? (
            <button
              type="button"
              className={cn(
                gameDigitBtn,
                numberValue == null && mode === 'number' && gameBtnActive
              )}
              title={t('tools.numberUnknownHunt')}
              onClick={() => {
                onNumberValueChange(null)
                onModeChange('number')
              }}
            >
              ?
            </button>
          ) : null
        }
      />
    </GamePanel>
  )
}
