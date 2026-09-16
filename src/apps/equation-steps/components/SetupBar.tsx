import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import {
  GamePanel,
  ToolRow,
  gameBtn,
  gameBtnActive
} from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { PRESETS, type EqPreset } from '../solver/presets'

const chip = cn(
  gameBtn,
  'inline-flex min-w-0 items-center justify-center px-2 py-[0.4rem] text-center font-mono text-[0.78rem] leading-tight max-[980px]:min-h-[2.35rem] max-[980px]:text-[0.82rem]'
)

const PRESET_LABEL: Record<
  EqPreset['id'],
  | 'equationSteps.preset.twoStep'
  | 'equationSteps.preset.distribute'
  | 'equationSteps.preset.fractions'
  | 'equationSteps.preset.bothSides'
  | 'equationSteps.preset.quadratic'
  | 'equationSteps.preset.circle'
> = {
  twoStep: 'equationSteps.preset.twoStep',
  distribute: 'equationSteps.preset.distribute',
  fractions: 'equationSteps.preset.fractions',
  bothSides: 'equationSteps.preset.bothSides',
  quadratic: 'equationSteps.preset.quadratic',
  circle: 'equationSteps.preset.circle'
}

function compactEq(input: string): string {
  return input.replace(/\^2/g, '²').replace(/-/g, '−').replace(/\s+/g, ' ')
}

function norm(s: string): string {
  return s.replace(/\s+/g, '')
}

type SetupBarProps = {
  input: string
  onPreset: (preset: EqPreset) => void
}

export function SetupBar({ input, onPreset }: SetupBarProps) {
  const { t } = useI18n()
  const current = norm(input)

  return (
    <GamePanel
      title={t('equationSteps.setup.title')}
      headerRight={
        <HelpTip title={t('equationSteps.preset.helpTitle')}>
          <p className="m-0">{t('equationSteps.preset.helpBody')}</p>
        </HelpTip>
      }
    >
      <ToolRow mobileCols={3} desktopCols={6}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={cn(chip, current === norm(p.input) && gameBtnActive)}
            title={`${t(PRESET_LABEL[p.id])} · ${p.input}`}
            onClick={() => onPreset(p)}
          >
            {p.id === 'circle' ? t(PRESET_LABEL[p.id]) : compactEq(p.input)}
          </button>
        ))}
      </ToolRow>
    </GamePanel>
  )
}
