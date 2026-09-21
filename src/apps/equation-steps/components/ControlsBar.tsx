import { Delete, Sparkles } from 'lucide-react'
import type { RefObject } from 'react'
import { useI18n } from '../../../i18n'
import { cn } from '../../../shared/lib/cn'
import { DigitPad, GamePanel, gameBtn, gameDigitBtn } from '../../../shared/gameUi'
import { HelpTip } from './HelpTip'
import { CharsTable } from './CharsTable'

const toolBtn = cn(gameBtn, 'text-sm')
const iconCls = 'h-[0.95em] w-[0.95em] shrink-0'
const iconBtn = 'inline-flex size-9 shrink-0 items-center justify-center p-0'

const SYMBOLS: {
  label: string
  insert: string
  titleKey:
    | 'equationSteps.pad.x'
    | 'equationSteps.pad.plus'
    | 'equationSteps.pad.minus'
    | 'equationSteps.pad.times'
    | 'equationSteps.pad.div'
    | 'equationSteps.pad.lparen'
    | 'equationSteps.pad.rparen'
    | 'equationSteps.pad.eq'
    | 'equationSteps.pad.pow'
    | 'equationSteps.pad.abs'
    | 'equationSteps.pad.sqrt'
    | 'equationSteps.pad.sin'
    | 'equationSteps.pad.cos'
    | 'equationSteps.pad.pi'
}[] = [
  { label: 'x', insert: 'x', titleKey: 'equationSteps.pad.x' },
  { label: '+', insert: '+', titleKey: 'equationSteps.pad.plus' },
  { label: '−', insert: '−', titleKey: 'equationSteps.pad.minus' },
  { label: '×', insert: '×', titleKey: 'equationSteps.pad.times' },
  { label: '÷', insert: '÷', titleKey: 'equationSteps.pad.div' },
  { label: '(', insert: '(', titleKey: 'equationSteps.pad.lparen' },
  { label: ')', insert: ')', titleKey: 'equationSteps.pad.rparen' },
  { label: '=', insert: '=', titleKey: 'equationSteps.pad.eq' },
  { label: '²', insert: '²', titleKey: 'equationSteps.pad.pow' },
  { label: 'abs', insert: 'abs(', titleKey: 'equationSteps.pad.abs' },
  { label: 'sqrt', insert: 'sqrt(', titleKey: 'equationSteps.pad.sqrt' },
  { label: 'sin', insert: 'sin(', titleKey: 'equationSteps.pad.sin' },
  { label: 'cos', insert: 'cos(', titleKey: 'equationSteps.pad.cos' },
  { label: 'π', insert: 'π', titleKey: 'equationSteps.pad.pi' }
]

type ControlsBarProps = {
  input: string
  onInput: (v: string) => void
  onInsert: (text: string) => void
  onBackspace: () => void
  onSolve: () => void
  onCaret: () => void
  inputRef: RefObject<HTMLInputElement | null>
}

export function ControlsBar({
  input,
  onInput,
  onInsert,
  onBackspace,
  onSolve,
  onCaret,
  inputRef
}: ControlsBarProps) {
  const { t } = useI18n()

  return (
    <GamePanel
      title={t('equationSteps.input.label')}
      className="w-full"
      headerRight={
        <HelpTip title={t('equationSteps.help.title')}>
          <p className="m-0 mb-1.5">{t('equationSteps.help.body')}</p>
          <p className="m-0 mb-2">{t('equationSteps.help.steps')}</p>
          <CharsTable />
        </HelpTip>
      }
    >
      <form
        className="flex min-w-0 items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault()
          onSolve()
        }}
      >
        <span className="inline-flex shrink-0 items-center text-[0.68rem] font-semibold tracking-[0.08em] text-muted uppercase min-[981px]:hidden">
          {t('equationSteps.input.label')}
        </span>
        <input
          ref={inputRef}
          id="equation-input"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onSelect={onCaret}
          onKeyUp={onCaret}
          onClick={onCaret}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          placeholder={t('equationSteps.input.placeholder')}
          aria-label={t('equationSteps.input.label')}
          className="h-9 min-w-0 flex-1 rounded-(--panel-btn-r) border border-line bg-cell px-2.5 font-mono text-[0.92rem] leading-none text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          className={cn(
            toolBtn,
            'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 border-accent bg-accent px-3 font-bold text-white hover:border-accent-hover hover:bg-accent-hover'
          )}
          title={t('equationSteps.tools.solveTitle')}
        >
          <Sparkles className={iconCls} aria-hidden />
          {t('equationSteps.tools.solve')}
        </button>
      </form>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {SYMBOLS.map((s) => (
            <button
              key={s.insert + s.label}
              type="button"
              className={cn(
                gameDigitBtn,
                'min-w-8 flex-1 px-1 font-mono text-[0.95rem]'
              )}
              title={t(s.titleKey)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onInsert(s.insert)}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            className={cn(gameDigitBtn, iconBtn, 'min-w-8 flex-1')}
            title={t('equationSteps.pad.back')}
            aria-label={t('equationSteps.pad.back')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onBackspace}
          >
            <Delete className={iconCls} aria-hidden />
          </button>
        </div>
        <div className="min-[981px]:hidden">
          <DigitPad
            digits={[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]}
            value={null}
            selectionActive={false}
            keepFocus
            onSelect={(n) => onInsert(String(n))}
          />
        </div>
      </div>
    </GamePanel>
  )
}
