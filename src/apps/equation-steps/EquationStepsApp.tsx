import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator } from 'lucide-react'
import { CharsTable } from './components/CharsTable'
import { ControlsBar } from './components/ControlsBar'
import { HotkeysBar } from './components/HotkeysBar'
import { SetupBar } from './components/SetupBar'
import { Stage } from './components/Stage'
import { solve } from './solver/solve'
import type { EqPreset } from './solver/presets'
import type { SolveResult } from './solver/types'
import { loadInput, saveInput } from './storage/prefs'
import { useI18n } from '../../i18n'
import { LangSwitch } from '../../shell/LangSwitch'
import { showToast } from '../../shared/toast'
import { MobileHelpCard, boardStage, gameShell, gameStickyControls } from '../../shared/gameUi'

function insertText(value: string, start: number, end: number, text: string) {
  return {
    next: value.slice(0, start) + text + value.slice(end),
    caret: start + text.length
  }
}

export default function EquationStepsApp() {
  const { t, locale } = useI18n()
  const initial = useRef(loadInput()).current
  const initialResult = useRef(solve(initial)).current
  const [input, setInput] = useState(initial)
  const [result, setResult] = useState<SolveResult | null>(initialResult)
  const [viewStep, setViewStep] = useState(() =>
    initialResult.ok ? Math.max(0, initialResult.steps.length - 1) : 0
  )
  const [hydrated, setHydrated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputValueRef = useRef(input)
  inputValueRef.current = input
  const resultRef = useRef(result)
  resultRef.current = result
  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveInput(input)
  }, [hydrated, input])

  useEffect(() => {
    document.title = `${t('equationSteps.appName')} · ${t('hub.brand')}`
  }, [t, locale])

  const applySolve = useCallback(
    (raw: string, opts?: { silent?: boolean }) => {
      const next = solve(raw)
      setResult(next)
      setViewStep(next.ok ? Math.max(0, next.steps.length - 1) : 0)
      if (opts?.silent) return
      const tr = tRef.current
      if (!next.ok) {
        showToast(
          next.reason === 'empty'
            ? tr('equationSteps.result.empty')
            : next.reason === 'parse'
              ? tr('equationSteps.result.parse')
              : next.reason === 'multiVar'
                ? tr('equationSteps.result.multiVar')
                : next.reason === 'varInDenom'
                  ? tr('equationSteps.result.varInDenom')
                  : next.reason === 'highDegree'
                    ? tr('equationSteps.result.highDegree')
                    : next.reason === 'radical'
                      ? tr('equationSteps.result.radical')
                    : tr('equationSteps.result.badPower'),
          'error'
        )
        return
      }
      if (next.outcome === 'identity') {
        showToast(tr('equationSteps.result.identity'), 'info')
      } else if (next.outcome === 'none') {
        showToast(tr('equationSteps.result.none'), 'warn')
      } else {
        showToast(tr('equationSteps.toast.solved'), 'success')
      }
    },
    []
  )

  const onSolve = useCallback(() => {
    applySolve(inputValueRef.current)
  }, [applySolve])

  const onPreset = useCallback(
    (preset: EqPreset) => {
      setInput(preset.input)
      caretRef.current = {
        start: preset.input.length,
        end: preset.input.length
      }
      applySolve(preset.input, { silent: true })
    },
    [applySolve]
  )

  const caretRef = useRef({ start: initial.length, end: initial.length })

  const rememberCaret = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start == null || end == null) return
    caretRef.current = { start, end }
  }, [])

  const onInsert = useCallback((text: string) => {
    const el = inputRef.current
    const value = inputValueRef.current
    if (el && document.activeElement === el && el.selectionStart != null) {
      caretRef.current = {
        start: el.selectionStart,
        end: el.selectionEnd ?? el.selectionStart
      }
    }
    let start = caretRef.current.start
    let end = caretRef.current.end
    start = Math.min(start, value.length)
    end = Math.min(Math.max(end, start), value.length)
    let piece = text
    let caretOffset = text.length
    const selected = value.slice(start, end)
    if (text === '|' && selected) {
      piece = `|${selected}|`
      caretOffset = piece.length
    } else if (
      (text === '√(' ||
        text === 'sqrt(' ||
        text === 'abs(' ||
        text === 'sin(' ||
        text === 'cos(') &&
      selected
    ) {
      piece = `${text}${selected})`
      caretOffset = piece.length
    } else if (
      text === '√(' ||
      text === 'sqrt(' ||
      text === 'abs(' ||
      text === 'sin(' ||
      text === 'cos('
    ) {
      piece = `${text})`
      caretOffset = text.length
    } else if (text === '=' && start > 0 && value[start - 1] === '|') {
      piece = ' ='
      caretOffset = 2
    } else if (text === '|' && !selected) {
      piece = '||'
      caretOffset = 1
    }
    const { next } = insertText(value, start, end, piece)
    const caret = start + caretOffset
    setInput(next)
    caretRef.current = { start: caret, end: caret }
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(caret, caret)
    })
  }, [])

  const onBackspace = useCallback(() => {
    const el = inputRef.current
    const value = inputValueRef.current
    if (el && document.activeElement === el && el.selectionStart != null) {
      caretRef.current = {
        start: el.selectionStart,
        end: el.selectionEnd ?? el.selectionStart
      }
    }
    let start = Math.min(caretRef.current.start, value.length)
    let end = Math.min(Math.max(caretRef.current.end, start), value.length)
    let next: string
    let caret: number
    if (start !== end) {
      next = value.slice(0, start) + value.slice(end)
      caret = start
    } else if (start <= 0) {
      return
    } else {
      next = value.slice(0, start - 1) + value.slice(start)
      caret = start - 1
    }
    setInput(next)
    caretRef.current = { start: caret, end: caret }
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(caret, caret)
    })
  }, [])

  const onStepNext = useCallback(() => {
    const r = resultRef.current
    if (!r?.ok) return
    setViewStep((s) => Math.min(s + 1, r.steps.length - 1))
  }, [])

  const onStepPrev = useCallback(() => {
    setViewStep((s) => Math.max(s - 1, 0))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      if (typing) {
        if (e.key === 'Enter' && e.target === inputRef.current) {
          e.preventDefault()
          onSolve()
        }
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod) return
      if (e.key === 's' || e.key === 'S' || e.key === 'Enter') {
        e.preventDefault()
        onSolve()
        return
      }
      if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        e.preventDefault()
        onStepNext()
        return
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        e.preventDefault()
        onStepPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSolve, onStepNext, onStepPrev])

  return (
    <div className={gameShell}>
      <header className="order-0 flex shrink-0 flex-col gap-1.5">
        <div className="flex min-h-8 w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex shrink-0 items-center gap-[0.55rem]">
            <Link
              to="/"
              className="inline-flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full bg-accent text-ink no-underline shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              aria-label={t('hub.backHome')}
              title={t('hub.backHome')}
            >
              <Calculator className="h-[0.85rem] w-[0.85rem]" strokeWidth={2.25} />
            </Link>
            <h1 className="m-0 text-[1.15rem] font-bold tracking-[-0.03em] max-[720px]:text-base [@media(max-height:700px)]:text-base">
              {t('equationSteps.appName')}
            </h1>
          </div>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-[0.45rem]">
            <LangSwitch />
          </div>
        </div>
        <div className="hidden w-full flex-wrap items-center justify-start gap-2.5 [@media(min-width:960px)_and_(min-height:780px)]:flex">
          <HotkeysBar />
        </div>
      </header>

      <MobileHelpCard
        sections={[
          {
            title: t('equationSteps.help.title'),
            body: (
              <>
                <p className="m-0 mb-1.5">{t('equationSteps.help.body')}</p>
                <p className="m-0">{t('equationSteps.help.steps')}</p>
              </>
            )
          },
          {
            title: t('equationSteps.input.helpTitle'),
            body: (
              <>
                <p className="m-0 mb-2">{t('equationSteps.input.helpBody')}</p>
                <CharsTable />
              </>
            )
          },
          {
            title: t('equationSteps.preset.helpTitle'),
            body: <p className="m-0">{t('equationSteps.preset.helpBody')}</p>
          }
        ]}
      />

      <div className="order-1 w-full shrink-0">
        <SetupBar input={input} onPreset={onPreset} />
      </div>

      <div
        className={`${gameStickyControls} order-2 max-[980px]:order-3`}
      >
        <ControlsBar
          input={input}
          onInput={setInput}
          onInsert={onInsert}
          onBackspace={onBackspace}
          onSolve={onSolve}
          onCaret={rememberCaret}
          inputRef={inputRef}
        />
      </div>

      <div className="board-frame order-3 min-h-0 flex-1 [--board-pad:0.25rem] rounded-md border border-line bg-elevated max-[980px]:order-2">
        <div
          className={`${boardStage} min-h-0 flex-1 items-start justify-center overflow-auto`}
        >
          <Stage result={result} viewStep={viewStep} onViewStep={setViewStep} />
        </div>
      </div>
    </div>
  )
}
